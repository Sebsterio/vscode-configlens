import * as vscode from 'vscode';
import type { ConfigKey, ConfigValueTypes } from './constants';

type Handler<K extends ConfigKey> = (value: ConfigValueTypes[K] | undefined) => void;
type Binding = { [K in keyof ConfigValueTypes]: [configKey: K, handler: Handler<K>] }[ConfigKey];
type Resolver = (binding: Binding) => void;

export const createConfigChangeHandler = (...bindings: Binding[]) => {
	return function handleConfigChange(e: vscode.ConfigurationChangeEvent) {
		const config = vscode.workspace.getConfiguration();
		const resolve: Resolver = ([key, handler]) => {
			e.affectsConfiguration(key) && handler(config.get(key));
		};
		bindings.forEach(resolve);
	};
};

export const createActiveDocSaveHandler = (docSelector: vscode.DocumentSelector, handler: () => void) => {
	return function handleActiveDocSave(document: vscode.TextDocument) {
		const isActiveDocument = document === vscode.window.activeTextEditor?.document;
		const isSettingsDocument = vscode.languages.match(docSelector, document) > 0;
		if (isActiveDocument && isSettingsDocument) handler();
	};
};
