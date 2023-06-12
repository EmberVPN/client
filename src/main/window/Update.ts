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
			if (data.length === 0) return Config.set("updater.last-remind-me-later", Date.now());
			
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

		// On another window open, make sure this one is on top
		app.on("web-contents-created", () => this.checkForUpdates());
			
	}
	
	/**
	 * Open the update window
	 */
	public static open() {
		this.configure({
			title: "Check for Updates • Ember VPN"
		});
	}

	/**
	 * Check for updates and open the update window if there are any
	 * @returns Promise<boolean | null>
	 */
	public static async checkForUpdates() {

		// Get last procrastination
		const procrastinate = Config.get("updater.last-remind-me-later");
		if (Date.now() - procrastinate < 1000 * 60 * 60 * 24) return null;

		// Make sure the user is authorized
		if (!await Auth.isAuthorized()) return null;

		// Get current version
		const version = app.getVersion();
		
		// Get latest version
		return await fetch("https://api.embervpn.org/v2/ember/downloads")
			.then(res => res.json() as Promise<REST.APIResponse<EmberAPI.ClientDownloads>>)
			.then(async res => {
			
				// Make sure the request was successful
				if (!res.success) return false;
			
				// Get latest version
				const latest = res.version.substring(1);
				
				// Compare versions
				if (!gt(latest, version)) return false;
				
				// await 1 second
				await new Promise<void>(resolve => setTimeout(resolve, 1000));
				
				this.open();
				this.instance?.once("ready-to-show", () => {
					this.instance?.focus();
					this.instance?.flashFrame(true);
				});
				
				return true;
				
			});
		
	}

}