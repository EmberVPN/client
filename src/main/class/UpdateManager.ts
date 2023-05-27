import { BrowserWindow, app } from "electron";
import { gt } from "semver";
import { createWindow } from "..";

export default class UpdateManager {

	private isOpen = false;
	private win: BrowserWindow | undefined;

	constructor() {

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
				if (gt(latest, version)) this.open();

			});

	}
	
	/**
	 * Open the settings window
	 * @returns void
	 */
	public open(): void {

		// Prevent multiple instances
		if (this.isOpen && this.win) return this.win.focus();
		
		this.win = createWindow("updates") || undefined;
		if (!this.win) return;

		// Prevent multiple instances
		this.isOpen = true;
		this.win.on("closed", () => this.isOpen = false);

	}

}