import { BrowserWindow, app, ipcMain } from "electron";
import EmberVPN from "..";
import { Window } from "./Window";

export default class SettingsManager extends Window {

	constructor() {
		super();

		// Wait for app ready
		app.once("browser-window-created", () => {

			// For all windows
			BrowserWindow.getAllWindows()
				.map(win => win.webContents.on("before-input-event", (event, input) => {
					if (!input.control || input.key !== "," || !EmberVPN.getAuthorization()) return;
					event.preventDefault();
					this.open();
				}));
			
		});

		// Observe for menu click
		ipcMain.on("open-settings", () => this.open());

	}
	
	public open(): void {

		// Create the window
		this.win = this.createWindow({
			title: "Settings • Ember VPN",
			resizable: false
		});

	}

}