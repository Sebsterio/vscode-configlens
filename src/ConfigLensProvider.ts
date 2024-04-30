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

export class ConfigLensProvider implements vscode.CodeLensProvider {
	private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
	private codeLenses: vscode.CodeLens[] = [];
	private getIsShared: GetIsShared;

	constructor(getIsShared: GetIsShared) {
		this.getIsShared = getIsShared;
	}

	provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken) {
		const docText = document.getText();
		const docProps = jsonc.getRootProperties(docText);
		this.codeLenses = [];

		docProps.forEach(({ key, keyOffset }) => {
			if (key === ConfigKeys.SharedSettings) return;

			const start = document.positionAt(keyOffset);
			const end = document.positionAt(keyOffset + key.length);
			const range = new vscode.Range(start, end);
			const lens = new OptionCodeLens(range, key);

			this.codeLenses.push(lens);
		});

		return this.codeLenses;
	}

	resolveCodeLens(codeLens: vscode.CodeLens, _token: vscode.CancellationToken) {
		if (codeLens instanceof OptionCodeLens) {
			const { key } = codeLens;
			const isShared = this.getIsShared(key);
			codeLens.command = {
				command: Commands.SetIsSharedOption,
				arguments: [key, !isShared],
				title: isShared ? 'shared' : 'private',
				tooltip: isShared
					? `Remove "${key}" from "${ConfigKeys.SharedSettings}"`
					: `Add "${key}" to "${ConfigKeys.SharedSettings}"`,
			};
		}
		return codeLens;
	}

	onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

	refresh = (): void => this._onDidChangeCodeLenses.fire();

	dispose = (): void => this._onDidChangeCodeLenses.dispose();
}
