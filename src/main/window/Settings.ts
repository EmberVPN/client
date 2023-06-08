import { BrowserWindow, app, ipcMain } from "electron";
import { Auth } from "../class/Auth";
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

		// Wait for app ready
		app.on("browser-window-created", () => {

			// Get all windows
			BrowserWindow.getAllWindows()
				.map(win => win.webContents
					.removeAllListeners("before-input-event")
					.on("before-input-event", async(event, input) => {

						// Make sure the user is authorized
						if (!await Auth.isAuthorized()) return;

						// Make sure the user is pressing control and comma
						if (!input.control || input.key !== ",") return;

						// Prevent the default action
						event.preventDefault();

						// Open the settings window
						this.open();

					}));
		});

		// Observe for menu click
		ipcMain.on("open-settings", () => this.open());

	}
}

export const Settings = new $Settings;