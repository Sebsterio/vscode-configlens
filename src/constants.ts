export const copy = {
	codeLensDisabled: "Code lenses are disabled. This extension won't work unless you enable 'editor.codeLens' in your vscode settings", // prettier-ignore
	optionAlreadySet: 'Option is already set to the desired state',
	mainDocIsDirty: 'Command unavailable due to unsaved changes in settings.json (default profile)', // ....
};

export const extensionID = 'Sebster.vscode-configlens';

export const extensionPrefix = 'vscode-configlens';

export const enum Commands {
	SetIsSharedOption = 'vscode-configlens.setIsSharedOption',
}

export const enum ConfigKeys {
	SharedSettings = 'workbench.settings.applyToAllProfiles',
	CodeLens = 'editor.codeLens',
	ConfigLens = 'configLens.enabled',
}

export type ConfigKey = keyof ConfigValueTypes;

export type ConfigValueTypes = {
	[ConfigKeys.SharedSettings]: string[];
	[ConfigKeys.CodeLens]: boolean;
	[ConfigKeys.ConfigLens]: boolean;
};
