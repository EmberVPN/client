import { ipcMain } from "electron";
import { Window } from "../class/Window";

export class Settings extends Window {
	
	public static open() {
		this.createWindow({
			title: "Settings • Ember VPN",
			immediate: true,
		});
	}

	static {

		// Observe for menu click
		ipcMain.on("open-settings", () => this.open());

	}
}