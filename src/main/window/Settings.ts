import { BrowserWindow, app, ipcMain } from "electron";
import { AuthMan } from "../class/AuthMan";
import { Window } from "../class/Window";

export class Settings extends Window {
	public static open() {
		this.win = this.createWindow({
			title: "Settings • Ember VPN"
		});
	}

	constructor() {
		super();

		// Wait for app ready
		app.once("browser-window-created", () => {

			// Get all windows
			BrowserWindow.getAllWindows()
				.map(win => win.webContents
					.removeAllListeners("before-input-event")
					.on("before-input-event", async(event, input) => {

						// Make sure the user is authorized
						if (!await AuthMan.isAuthorized()) return;

						// Make sure the user is pressing control and comma
						if (!input.control || input.key !== ",") return;

						// Prevent the default action
						event.preventDefault();

						// Open the settings window
						Settings.open();

					}));
		});

		// Observe for menu click
		ipcMain.on("open-settings", () => Settings.open());

	}
}