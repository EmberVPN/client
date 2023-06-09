import { BrowserWindow, app, ipcMain } from "electron";
import { gt } from "semver";
import { Auth } from "../class/Auth";
import { Config } from "../class/Config";
import { Window } from "../class/Window";
import { update } from "../updater";
import { install } from "../vpnutils";

export class Update extends Window {
	
	// Attach event listeners
	static {

		// Check for updates when a new window is created
		app.once("browser-window-created", () => this.checkForUpdates());

		// Check for updates every hour
		setInterval(() => this.checkForUpdates(), 1000 * 60 * 60);
		
		// Install updates when requested
		ipcMain.on("update", async(_event, data: string[]) => {
			
			// If the array is empty, remind the user later
			if (data.length === 0) return Config.set("last-update-procrastinate", Date.now());
			
			if (data.includes("openvpn")) await install();
			if (data.includes("embervpn")) await update();

			// Send update complete event
			BrowserWindow.getAllWindows()
				.map(win => win.webContents.send("update-finished"));
		});

		// Observe for menu click
		ipcMain.on("open", (_event, state: string) => {
			if (state === "updater") this.open();
		});
			
	}
	
	// Open the window
	public static open() {
		this.configure({
			title: "Check for Updates • Ember VPN"
		});
	}

	// Check for updates
	public static async checkForUpdates() {

		// Make sure the user is authorized
		if (!await Auth.isAuthorized()) return;

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