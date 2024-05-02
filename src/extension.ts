import * as vscode from 'vscode';
import { ConfigLensProvider } from './ConfigLensProvider';
import { SharedSettingsService } from './SharedSettingsService';
import { ConfigKeys, Commands, copy } from './constants';
import { createConfigChangeHandler } from './helpers';

const lensDocSelector = {
	language: 'jsonc',
	pattern: '**/settings.json',
};

export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration();
	const codeLensEnabled = config.get<boolean>(ConfigKeys.CodeLens);
	const configLensEnabled = config.get<boolean>(ConfigKeys.ConfigLens);

	if (!codeLensEnabled) return vscode.window.showWarningMessage(copy.codeLensDisabled);

	const sharedSettingsService = new SharedSettingsService();
	const configLensProvider = new ConfigLensProvider(configLensEnabled, sharedSettingsService.getIsSharedOption);

	const handleConfigChange = createConfigChangeHandler(
		[ConfigKeys.ConfigLens, configLensProvider.toggleFeature],
		[ConfigKeys.SharedSettings, sharedSettingsService.handleConfigChange]
	);

	const disposables = [
		sharedSettingsService.onSharedSettingsChange(configLensProvider.refresh),
		vscode.commands.registerCommand(Commands.SetIsSharedOption, sharedSettingsService.setIsSharedOption),
		vscode.workspace.onDidChangeConfiguration(handleConfigChange),
		vscode.languages.registerCodeLensProvider(lensDocSelector, configLensProvider),
	];

	disposables.forEach((item) => context.subscriptions.push(item));
}
