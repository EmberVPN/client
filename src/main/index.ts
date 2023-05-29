import { is } from "@electron-toolkit/utils";
import { BrowserWindow, app, ipcMain } from "electron";
import { resolve } from "path";
import { inetLatency } from "systeminformation";
import { Config } from "./class/Config";
import { IPManager } from "./class/IPManager";
import { OpenVPNManager } from "./class/OpenVPNManager";
import SettingsManager from "./class/SettingsManager";
import { TrayManager } from "./class/TrayManager";
import UpdateManager from "./class/UpdateManager";
import { Window } from "./class/Window";

// Get app resource path
export const resources = is.dev ? resolve(".") : resolve(app.getPath("exe"), "../resources");

// Export app state managers
export let tray: TrayManager;
export let ovpn: OpenVPNManager;
export let setm: SettingsManager;

export const updater = new UpdateManager;
export const config = new Config;
export const IPv4 = new IPManager;

class App extends Window {

	private authorization?: string;

	constructor() {
		super();

		// Await app ready
		app.whenReady().then(() => this.win = this.createWindow());

		// Listen for authorization token changes
		ipcMain.on("authorization", async(_, authorization: string | null) => {
			if (!this.win) throw new Error("Main window not set up");

			// If the authorization token is null, disconnect and cleanup
			if (authorization === null) {

				// Set authorization token
				this.authorization = undefined;

				// Close all windows that aren't the main window
				BrowserWindow.getAllWindows()
					.filter(window => this.is(window))
					.map(window => window.close());
		
				// Set locked size
				this.win.setResizable(false);

			}

			if (typeof authorization === "string") {
				
				// Set authorization token
				this.authorization = authorization;

				// Set normal size
				this.win.setResizable(true);
				this.win.setMinimumSize(600, 400);

				// Center window around the delta
				const size = this.win.getSize();
				const dw = size[0] - 600;
				const dh = size[1] - 400;
				const pos = this.win.getPosition();
				this.win.setPosition(pos[0] + dw / 2, pos[1] + dh / 2);

			}

		});

	}

	public getAuth() {
		return this.authorization;
	}
}

const _app = new App;
export default _app;

// Handle window size requests
ipcMain.handle("window-size", (event, width: number, height: number, resizable?: boolean) => {

	// Get the window that sent the request
	const win = BrowserWindow.fromWebContents(event.sender);
	if (!win) return;

	// Get the current size
	const size = win.getSize();

	// Calculate the difference
	const dw = size[0] - width;
	const dh = size[1] - height;

	// Get the current position
	const pos = win.getPosition();

	// Set the new position
	win.setPosition(pos[0] + dw / 2, pos[1] + dh / 2);

	// Set the window size
	win.setResizable(resizable === true);
	win.setMinimumSize(width, height);

});

// Handle titlebar events
ipcMain.on("titlebar", (event, key: string, val?: boolean) => {

	// Get the window that sent the request
	const win = BrowserWindow.fromWebContents(event.sender);
	if (!win) return;

	// Handle events
	if (key === "minimize") win.minimize();
	if (key === "resizeable" && val !== undefined) win.setResizable(val);
	if (key === "minimizeable" && val !== undefined) win.setMinimizable(val);
	if (key === "restore") win.isMaximized() ? win.restore() : win.maximize();
	if (key === "hide") win.close();

});

// Ping server handler
ipcMain.handle("ping-server", async function(_, server: Ember.Server) {
	return await Promise.race([
		new Promise(resolve => setTimeout(() => resolve(-1), 4000)),
		inetLatency(server.ip)
	]);
});