import electron, { ipcMain } from "electron";
import Store from "electron-store";

export class Config {

	private store = new Store;

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
		this.store.set(key, value);
		const wins = electron.BrowserWindow.getAllWindows();
		wins.map(win => win.webContents.send("config-updated", key, value));
	}

	public get(key: string) {
		return this.store.get(key);
	}
	
}