import * as vscode from 'vscode';
import * as jsonc from './json-utils';
import { ConfigKeys, Commands } from './constants';

type GetIsShared = (key: string) => boolean;

class OptionCodeLens extends vscode.CodeLens {
	public key: string;
	constructor(range: vscode.Range, key: string) {
		super(range);
		this.key = key;
	}
}

const getLensCommand = (key: string, isShared: boolean) => ({
	command: Commands.SetIsSharedOption,
	arguments: [key, !isShared],
	title: isShared ? 'shared' : 'private',
	tooltip: isShared
		? `Remove "${key}" from "${ConfigKeys.SharedSettings}"`
		: `Add "${key}" to "${ConfigKeys.SharedSettings}"`,
});

export class ConfigLensProvider implements vscode.CodeLensProvider {
	private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
	private isEnabled: boolean;
	private getIsShared: GetIsShared;

	constructor(isEnabled: boolean, getIsShared: GetIsShared) {
		this.isEnabled = !!isEnabled;
		this.getIsShared = getIsShared;
	}

	provideConfigLens(key: string, keyOffset: number, document: vscode.TextDocument) {
		const start = document.positionAt(keyOffset);
		const end = document.positionAt(keyOffset + key.length);
		const range = new vscode.Range(start, end);
		const lens = new OptionCodeLens(range, key);
		return lens;
	}

	provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken) {
		if (!this.isEnabled || document.isDirty) return [];
		const docText = document.getText();
		const docProps = jsonc.getRootProperties(docText);
		const validProps = docProps.filter(({ key }) => key !== ConfigKeys.SharedSettings);
		const lenses = validProps.map(({ key, keyOffset }) => this.provideConfigLens(key, keyOffset, document));
		return lenses;
	}

	resolveCodeLens(lens: vscode.CodeLens, _token: vscode.CancellationToken) {
		if (lens instanceof OptionCodeLens) lens.command = getLensCommand(lens.key, this.getIsShared(lens.key));
		return lens.command ? lens : null;
	}

	refresh = (): void => this._onDidChangeCodeLenses.fire();

	toggleFeature = (isEnabled: boolean | undefined) => {
		this.isEnabled = !!isEnabled;
		this.refresh();
	};

	dispose = (): void => this._onDidChangeCodeLenses.dispose();
}
