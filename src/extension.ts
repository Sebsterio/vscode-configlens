import * as vscode from 'vscode';
import { copy, Commands } from './constants';
import { ConfigLensProvider } from './ConfigLensProvider';
import { SharedSettingsService } from './SharedSettingsService';

const lensDocSelector = { language: 'jsonc', pattern: '**/settings.json' };

export function activate(context: vscode.ExtensionContext) {
	const codeLensEnabled = vscode.workspace.getConfiguration().get('editor.codeLens');
	if (!codeLensEnabled) return vscode.window.showWarningMessage(copy.codeLensDisabled);

	const settingsManager = new SharedSettingsService();
	const configLensProvider = new ConfigLensProvider(settingsManager.getIsSharedOption);

	const disposables = [
		vscode.commands.registerCommand(Commands.SetIsSharedOption, settingsManager.setIsSharedOption),
		vscode.workspace.onDidChangeConfiguration(settingsManager.handleSettingsChange),
		vscode.languages.registerCodeLensProvider(lensDocSelector, configLensProvider),
	];

	disposables.forEach((item) => context.subscriptions.push(item));
}
