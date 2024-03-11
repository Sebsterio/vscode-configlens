import * as vscode from 'vscode';
import { ConfigKeys, copy } from './constants';

type SharedSettingsConfig = readonly string[];
type SharedSettingsCache = Set<string> | null;

const [section, key] = ConfigKeys.SharedSettings.split(/\.(?=[^.]+$)/);
const configTarget = vscode.ConfigurationTarget.Global;
const fallback = [] as SharedSettingsConfig;

const getConfigSection = () => vscode.workspace.getConfiguration(section);
const getValue = () => getConfigSection().get<SharedSettingsConfig>(key, fallback);
const setValue = (val?: SharedSettingsConfig) => getConfigSection().update(key, val, configTarget);

export class SharedSettingsService {
	private cache: SharedSettingsCache = null;

	private invalidateCache = () => (this.cache = null);

	private get settings(): Exclude<SharedSettingsCache, null> {
		return this.cache ?? (this.cache = new Set(getValue()));
	}
	private set settings(val: SharedSettingsCache) {
		const value = val ? Array.from(val) : undefined;
		setValue(value).then(this.invalidateCache, console.error);
	}

	handleSettingsChange = (e: vscode.ConfigurationChangeEvent) => {
		if (e.affectsConfiguration(ConfigKeys.SharedSettings)) this.invalidateCache();
	};

	getIsSharedOption = (key: string) => this.settings.has(key);

	setIsSharedOption = (key: string, shouldBeShared: boolean) => {
		const isShared = this.getIsSharedOption(key);
		if (shouldBeShared === isShared) console.error(copy.optionAlreadySet); //temp
		const settings = this.settings;
		shouldBeShared ? settings.add(key) : settings.delete(key);
		this.settings = settings;
	};
}
export const settingsManager = new SharedSettingsService();
