import * as vscode from 'vscode';

type Binding = [configKey: string, configValueChangeHandler: (value: unknown) => void];
type Resolver = (binding: Binding) => void;

export const createConfigChangeHandler = (...bindings: Binding[]) => {
	return function handleConfigChange(e: vscode.ConfigurationChangeEvent) {
		const config = vscode.workspace.getConfiguration();
		const resolve: Resolver = ([key, handler]) => e.affectsConfiguration(key) && handler(config.get(key));

		bindings.forEach(resolve);
	};
};
