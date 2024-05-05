import * as vscode from 'vscode';
import type { ConfigKey, ConfigValueTypes } from './constants';

type Handler<K extends ConfigKey> = (value: ConfigValueTypes[K] | undefined) => void;
type Binding = { [K in keyof ConfigValueTypes]: [configKey: K, handler: Handler<K>] }[ConfigKey];

export const createConfigChangeHandler = (...[key, handler]: Binding) => {
	const configRef = vscode.workspace.getConfiguration();
	const runHandler = () => handler(configRef.get(key));
	const handleChange = (e: vscode.ConfigurationChangeEvent) => e.affectsConfiguration(key) && runHandler();
	return handleChange;
};

const getIsActiveDoc = (doc: vscode.TextDocument) => doc === vscode.window.activeTextEditor?.document;

type ExtendedSelector = vscode.DocumentSelector & { active?: boolean };

export const createDocSaveHandler = (docSelector: ExtendedSelector, handler: () => void) => {
	const getIsEditorMatch = (doc: vscode.TextDocument) => !docSelector.active || getIsActiveDoc(doc);
	const getIsDocMatch = (doc: vscode.TextDocument) => vscode.languages.match(docSelector, doc) > 0;
	const handleSave = (doc: vscode.TextDocument) => getIsEditorMatch(doc) && getIsDocMatch(doc) && handler();
	return handleSave;
};
