import { ipcMain } from "electron";
import { Window } from "../class/Window";

export class Settings extends Window {

	// Attach event listeners
	static {
		ipcMain.on("open", (_event, state: string) => {
			if (state === "settings") this.open();
		});
	}

	// Open the window
	public static open() {
		this.configure({
			title: "Settings • Ember VPN"
		});
	}
}