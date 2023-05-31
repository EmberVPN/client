import { is } from "@electron-toolkit/utils";
import electron, { ipcMain } from "electron";
import Store from "electron-store";

export const Config = new class Config {

	private static store = new Store({
		accessPropertiesByDotNotation: false,
		encryptionKey: is.dev ? undefined : "embervpn"

	});

	constructor() {

		// Listen for config events
		ipcMain.on("config", async(event, key: string, value) => {
			if (!key) throw new Error("No key provided");

			// If were getting a value
			if (value === undefined) return event.returnValue = this.get(key);

			// If were setting a value
			this.set(key, value);
			
		});

	}

	public set(key: string, value: any) {
		Config.store.set(key, value);
		const wins = electron.BrowserWindow.getAllWindows();
		wins.map(win => win.webContents.send("config-updated", key, value));
	}

	public get<T = string | unknown>(key: string) {
		return Config.store.get(key) as T;
	}
	
};