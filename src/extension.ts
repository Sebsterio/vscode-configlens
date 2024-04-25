import * as vscode from 'vscode';
import { ConfigLensProvider } from './ConfigLensProvider';
import { SharedSettingsService } from './SharedSettingsService';
import { Commands, copy } from './constants';

const lensDocSelector = {
	language: 'jsonc',
	pattern: '**/settings.json',
};

export function activate(context: vscode.ExtensionContext) {
	const codeLensEnabled = vscode.workspace.getConfiguration().get('editor.codeLens');
	if (!codeLensEnabled) return vscode.window.showWarningMessage(copy.codeLensDisabled);

	const sharedSettingsService = new SharedSettingsService();
	const configLensProvider = new ConfigLensProvider(sharedSettingsService.getIsSharedOption);

	const disposables = [
		sharedSettingsService.onSharedSettingsChange(configLensProvider.refresh),
		vscode.commands.registerCommand(Commands.SetIsSharedOption, sharedSettingsService.setIsSharedOption),
		vscode.workspace.onDidChangeConfiguration(sharedSettingsService.handleConfigChange),
		vscode.languages.registerCodeLensProvider(lensDocSelector, configLensProvider),
	];

	disposables.forEach((item) => context.subscriptions.push(item));
}
