import { BrowserWindow, app, ipcMain } from "electron";
import { gt } from "semver";
import { Window } from "../class/Window";
import { update } from "../updater";
import { install } from "../vpnutils";

class $Update extends Window {
	public open() {
		this.createWindow({
			title: "Check for Updates • Ember VPN"
		});
	}

	// On init
	constructor() {
		super();

		// Check for updates when a new window is created
		app.once("browser-window-created", () => this.checkForUpdates());

		// Check for updates every hour
		setInterval(() => this.checkForUpdates(), 1000 * 60 * 60);
		
		// Listen for update events
		ipcMain.on("update", async(_event, data: string[]) => {
			
			if (data.includes("openvpn")) await install();
			if (data.includes("embervpn")) await update();

			// Send update complete event
			BrowserWindow.getAllWindows()
				.map(win => win.webContents.send("update-finished"));
		});
			
	}

	public async checkForUpdates() {

		// Get current version
		const version = app.getVersion();
		
		// Get latest version
		fetch("https://api.embervpn.org/v2/ember/downloads")
			.then(res => res.json() as Promise<REST.APIResponse<EmberAPI.ClientDownloads>>)
			.then(res => {
			
				// Make sure the request was successful
				if (!res.success) return;
			
				// Get latest version
				const latest = res.version.substring(1);
				
				// Compare versions
				if (!gt(latest, version)) return;

				// await for main window to load
				this.open();
				
			});
		
	}

}

export const Update = new $Update;