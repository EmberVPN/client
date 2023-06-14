import { BrowserWindow, ipcMain } from "electron";
import Store from "electron-store";

// The interface for the config file
export interface ConfigType {
	"auth.token": string;
	"updater.last-remind-me-later": number;
	"settings.units.distance": "IMPERIAL" | "METRIC";
	"settings.appearance.theme": "SYSTEM (DEFAULT)" | "LIGHT" | "DARK";
	"settings.security.use-ssh": boolean;
}

export class Config {

	// The electron-store instance
	private static store = new Store({
		accessPropertiesByDotNotation: false,
		clearInvalidConfig: true,
		encryptionKey: "embervpn",
		migrations: {
			">=1.3.162": function() {
				Config.migrate("units.distance", "settings.units.distance");
				Config.migrate("theme", "settings.appearance.theme");
				Config.migrate("authorization", "auth.token");
			}
		}
	});

	/**
	 * Migrates a config key from one key to another
	 * @param fromKey The key to migrate from
	 * @param toKey The key to migrate to
	 * @returns boolean
	 */
	private static migrate(fromKey: string, toKey: string) {
		try {
			
			// If we already migrated this key, return
			if (this.store.has(toKey)) return false;

			// If the key exists, migrate it
			if (this.store.has(fromKey)) {
				const value = this.store.get(fromKey);
				this.store.delete(fromKey);
				this.store.set(toKey, value);
				return true;
			}
		
		} catch (e) {
			console.error(e);
		}

		return false;
		
	}
	
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
		this.store.set(key, value);
		BrowserWindow.getAllWindows()
			.map(win => win.webContents.send("config-updated", key, value));
	}

	/**
	 * Gets a config value
	 * @param key The config key
	 * @returns string | unknown
	 */
	public static get<T extends keyof ConfigType>(key: T) {
		return this.store.get(key) as ConfigType[T];
	}

	/**
	 * Deletes a config value
	 * @param key The config key
	 * @returns void
	 */
	public static delete(key: keyof ConfigType) {
		this.store.delete(key);
	}
	
}