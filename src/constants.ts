export const copy = {
	codeLensDisabled: "Code lenses are disabled. This extension won't work unless you enable 'editor.codeLens' in your vscode settings", // prettier-ignore
	optionAlreadySet: 'Option is already set to the desired state',
};

export const enum ConfigKeys {
	SharedSettings = 'workbench.settings.applyToAllProfiles',
}

export const enum Commands {
	SetIsSharedOption = 'vscode-configlens.setIsSharedOption',
}
