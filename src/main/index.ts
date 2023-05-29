import { is } from "@electron-toolkit/utils";
import { BrowserWindow, app, ipcMain } from "electron";
import { resolve } from "path";
import { Config } from "./class/Config";
import { IPManager } from "./class/IPManager";
import { OpenVPNManager } from "./class/OpenVPNManager";
import SettingsManager from "./class/SettingsManager";
import { TrayManager } from "./class/TrayManager";
import UpdateManager from "./class/UpdateManager";
import { Window } from "./class/Window";
import "./handlers";

// Get app resource path
export const resources = is.dev ? resolve(".") : resolve(app.getPath("exe"), "../resources");

// Popup windows
export const UpdateWindow = new UpdateManager;
export const SettingsWindow = new SettingsManager;

// App state managers
export const IPv4 = new IPManager;
export const OpenVPN = new OpenVPNManager;
export const Tray = new TrayManager;

// Export config manager
new Config;

// Create the app window
class App extends Window {

	// Authorization token
	protected authorization?: string;

	constructor() {
		super();

		// Await app ready
		app.whenReady().then(() => {
			
			// Create the window
			this.win = this.createWindow();

		});

		// Listen for authorization token changes
		ipcMain.on("authorization", async(_, authorization: string | null) => {
			if (!this.win) throw new Error("Main window not set up");

			// If the authorization token is null, disconnect and cleanup
			if (authorization === null && this.authorization !== undefined) {

				// Set authorization token
				this.authorization = undefined;

				// Close all windows that aren't the main window
				BrowserWindow.getAllWindows()
					.filter(window => !this.is(window))
					.map(window => window.close());
		
				// Set locked size
				this.win.setResizable(false);

			}

			if (typeof authorization === "string" && authorization !== this.authorization) {
				
				// Set authorization token
				this.authorization = authorization;

				// Set normal size
				this.win.setResizable(true);
				this.win.setMinimumSize(600, 400);

				// Center window around the delta
				const size = this.win.getSize();
				this.win.setSize(800, 600);
				const dw = size[0] - this.win.getSize()[0];
				const dh = size[1] - this.win.getSize()[1];
				const pos = this.win.getPosition();
				this.win.setPosition(pos[0] + dw / 2, pos[1] + dh / 2);

			}

		});

	}

	// Get authorization token
	public getAuthorization() {
		return this.authorization;
	}
	
}

// Export the app
export default new App;