import { is } from "@electron-toolkit/utils";
import electron, { ipcMain } from "electron";
import Store from "electron-store";

export class Config {

	private static store = new Store({
		accessPropertiesByDotNotation: false,
		encryptionKey: is.dev ? undefined : "embervpn"
	});
	
	// Listen for config events
	static {
		ipcMain.on("config", async(event, key: string, value) => {
			if (!key) throw new Error("No key provided");

			// If were getting a value
			if (value === undefined) return event.returnValue = Config.get(key);

			// If were setting a value
			Config.set(key, value);
			
		});

	}

	public static set(key: string, value: any) {
		if (value === undefined) Config.store.delete(key);
		else Config.store.set(key, value);
		const wins = electron.BrowserWindow.getAllWindows();
		wins.map(win => win.webContents.send("config-updated", key, value));
	}

	public static get<T = string | unknown>(key: string) {
		return Config.store.get(key) as T;
	}
	
}