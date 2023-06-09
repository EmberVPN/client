import { ipcMain } from "electron";
import { Window } from "../class/Window";

class $Settings extends Window {
	public open() {
		this.createWindow({
			title: "Settings • Ember VPN",
			immediate: true,
		});
	}

	constructor() {
		super();

		// Observe for menu click
		ipcMain.on("open-settings", () => this.open());

	}
}

export const Settings = new $Settings;