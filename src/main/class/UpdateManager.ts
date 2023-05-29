import { app } from "electron";
import { gt } from "semver";
import { Window } from "./Window";

export default class UpdateManager extends Window {

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
				this.open();

			});

	}
	
	public open(): void {

		// Create the window
		this.win = this.createWindow({
			title: "Check for Updates • Ember VPN",
			resizable: false,
			height: 128,
			width: 512,
		});

	}

}