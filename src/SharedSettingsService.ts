import * as vscode from 'vscode';
import { ConfigKeys } from './constants';

type SharedSettingsConfig = readonly string[];
type SharedSettingsCache = Set<string> | null;
type GetIsShared = (key: string) => boolean;
type SetIsShared = (key: string, shouldBeShared: boolean) => void;

const [section, key] = ConfigKeys.SharedSettings.split(/\.(?=[^.]+$)/);
const configTarget = vscode.ConfigurationTarget.Global;
const fallback = [] as SharedSettingsConfig;

const getSection = () => vscode.workspace.getConfiguration(section /*, scope */);
const getValue = () => getSection().get<SharedSettingsConfig>(key, fallback);
const setValue = async (val?: SharedSettingsConfig) => await getSection().update(key, val, configTarget);

export class SharedSettingsService {
	private _sharedSettingsCache: SharedSettingsCache = null;

	private get _sharedSettings(): Exclude<SharedSettingsCache, null> {
		if (!this._sharedSettingsCache) this._sharedSettingsCache = new Set(getValue());
		return this._sharedSettingsCache;
	}
	private set _sharedSettings(v: SharedSettingsCache) {
		const newSettings = v ? Array.from(v) : undefined;
		setValue(newSettings).catch(console.error); // eslint-disable-line no-console
	}

	getIsSharedOption: GetIsShared = (key) => this._sharedSettings.has(key);

	setIsSharedOption: SetIsShared = (key, shouldBeShared) => {
		const sharedSettingsAux = this._sharedSettings;
		shouldBeShared ? sharedSettingsAux.add(key) : sharedSettingsAux.delete(key);
		this._sharedSettings = sharedSettingsAux;
	};

	private _onSharedSettingsChange = new vscode.EventEmitter<void>();

	onSharedSettingsChange = this._onSharedSettingsChange.event;

	handleConfigChange = () => {
		this._sharedSettingsCache = null;
		this._onSharedSettingsChange.fire();
	};
}
