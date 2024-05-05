import * as vscode from 'vscode';
import { ConfigLensProvider } from './ConfigLensProvider';
import { SharedSettingsService } from './SharedSettingsService';
import { ConfigKeys, Commands, copy } from './constants';
import { createConfigChangeHandler, createActiveDocSaveHandler } from './helpers';

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

	const handleConfigChange = createConfigChangeHandler(
		[ConfigKeys.ConfigLens, configLensProvider.toggleFeature],
		[ConfigKeys.SharedSettings, sharedSettingsService.handleConfigChange]
	);

	const disposables = [
		sharedSettingsService.onSharedSettingsChange(configLensProvider.refresh),
		vscode.commands.registerCommand(Commands.SetIsSharedOption, sharedSettingsService.setIsSharedOption),
		vscode.workspace.onDidChangeConfiguration(handleConfigChange),
		vscode.workspace.onDidSaveTextDocument(createActiveDocSaveHandler(lensDocSelector, configLensProvider.refresh)),
		vscode.languages.registerCodeLensProvider(lensDocSelector, configLensProvider),
	];

	disposables.forEach((item) => context.subscriptions.push(item));
}
