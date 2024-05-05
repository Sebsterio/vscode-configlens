import * as vscode from 'vscode';
import { ConfigLensProvider } from './ConfigLensProvider';
import { SharedSettingsService } from './SharedSettingsService';
import { ConfigKeys, Commands, copy } from './constants';
import { createConfigChangeHandler, createDocSaveHandler } from './helpers';

const lensDocSelector = {
	language: 'jsonc',
	pattern: '**/User/**/settings.json',
};

export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration();
	const codeLensEnabled = config.get<boolean>(ConfigKeys.CodeLens);
	const configLensEnabled = config.get<boolean>(ConfigKeys.ConfigLens);
	const isEnabled = configLensEnabled && codeLensEnabled;
	const isInvalid = configLensEnabled && !codeLensEnabled;

	if (isInvalid) vscode.window.showWarningMessage(copy.codeLensDisabled);

	const sharedSettingsService = new SharedSettingsService();
	const configLensProvider = new ConfigLensProvider(!!isEnabled, sharedSettingsService.getIsSharedOption);

	const disposables = [
		sharedSettingsService.onSharedSettingsChange(configLensProvider.refresh),
		vscode.commands.registerCommand(Commands.SetIsSharedOption, sharedSettingsService.setIsSharedOption),
		vscode.workspace.onDidChangeConfiguration(createConfigChangeHandler(ConfigKeys.ConfigLens, configLensProvider.toggleFeature)), // prettier-ignore
		vscode.workspace.onDidChangeConfiguration(createConfigChangeHandler(ConfigKeys.SharedSettings, sharedSettingsService.handleConfigChange)), // prettier-ignore
		vscode.workspace.onDidSaveTextDocument(createDocSaveHandler({...lensDocSelector, active: true}, configLensProvider.refresh)), // prettier-ignore
		vscode.languages.registerCodeLensProvider(lensDocSelector, configLensProvider),
	];

	disposables.forEach((item) => context.subscriptions.push(item));
}
