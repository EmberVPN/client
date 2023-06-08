import { BrowserWindow, app, ipcMain, shell } from "electron";
import { gt } from "semver";
import { Window } from "../class/Window";
import { install } from "../vpnutils";

function update() {
	shell.openExternal("https://embervpn.org/downloads");
}

class $Update extends Window {
	public open() {
		this.createWindow({
			title: "Check for Updates • Ember VPN"
		});
	}

	// On init
	constructor() {
		super();

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
				app.once("ready", () => this.open());
				
			});
		
		// Listen for update events
		ipcMain.on("update", async(_event, data: string[]) => {
			
			if (data.includes("openvpn")) await install();
			if (data.includes("embervpn")) await update();

			// Send update complete event
			BrowserWindow.getAllWindows()
				.map(win => win.webContents.send("update-finished"));
		});
			
	}

}

export const Update = new $Update;