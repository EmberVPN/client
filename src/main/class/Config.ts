import electron, { ipcMain } from "electron";
import Store from "electron-store";

export interface ConfigType {
	"auth.token": string;
	"updater.last-remind-me-later": number;
	"settings.units.distance": "IMPERIAL" | "METRIC";
	"settings.appearance.theme": "SYSTEM (DEFAULT)" | "LIGHT" | "DARK";
}

export class Config {

	// The electron-store instance
	private static store = new Store({
		accessPropertiesByDotNotation: false,
		clearInvalidConfig: true,
		encryptionKey: "embervpn",
		migrations: {
			"1.3.162": function(store) {
				store.set("settings.units.distance", store.get("units.distance"));
				store.set("settings.appearance.theme", store.get("theme"));
				store.set("auth.token", store.get("authorization"));
				store.delete("units.distance");
				store.delete("authorization");
				store.delete("theme");
			}
		}
	});
	
	// Listen for config events
	static {
		ipcMain.on("config", async(event, key: keyof ConfigType, value) => {
			
			// Ensure key is provided
			if (!key) throw new Error("No key provided");

			// If were getting a value
			if (value === undefined) return event.returnValue = Config.get(key);

			// If were setting a value
			return Config.set(key, value);
			
		});
	}

	/**
	 * Sets a config value
	 * @param key The config key
	 * @param value The config value
	 * @returns void
	 */
	public static set<T extends keyof ConfigType>(key: T, value: ConfigType[T]) {
		Config.store.set(key, value);
		const wins = electron.BrowserWindow.getAllWindows();
		wins.map(win => win.webContents.send("config-updated", key, value));
	}

	/**
	 * Gets a config value
	 * @param key The config key
	 * @returns string | unknown
	 */
	public static get<T extends keyof ConfigType>(key: T) {
		return Config.store.get(key) as ConfigType[T];
	}

	/**
	 * Deletes a config value
	 * @param key The config key
	 * @returns void
	 */
	public static delete(key: keyof ConfigType) {
		Config.store.delete(key);
	}
	
}