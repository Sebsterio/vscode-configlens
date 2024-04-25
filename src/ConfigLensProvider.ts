import * as vscode from 'vscode';
import * as jsonc from 'jsonc-parser';
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
		this.codeLenses = [];
		const text = document.getText();
		const rootNode = jsonc.parseTree(text);

		rootNode?.children?.forEach((node) => {
			const isTopLevelProperty = node.type === 'property' && node.parent === rootNode;
			if (!isTopLevelProperty) return;

			const [keyNode, _valueNode] = node.children ?? [];
			const { value: key, offset, length } = keyNode;
			if (key === ConfigKeys.SharedSettings) return;

			const start = document.positionAt(offset);
			const end = document.positionAt(offset + length);
			const range = new vscode.Range(start, end);
			const codeLens = new OptionCodeLens(range, key);
			this.codeLenses.push(codeLens);
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
