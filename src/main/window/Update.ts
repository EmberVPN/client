import { is } from "@electron-toolkit/utils";
import { exec } from "child_process";
import { BrowserWindow, app, ipcMain } from "electron";
import { writeFile } from "fs/promises";
import { basename, dirname, extname, join } from "path";
import { platform } from "process";
import { gt } from "semver";
import { Auth } from "../class/Auth";
import { Config } from "../class/Config";
import { OpenSSH } from "../class/OpenSSH";
import { OpenVPN } from "../class/OpenVPN";
import { Window } from "../class/Window";

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
			
			if (data.includes("openvpn")) await OpenVPN.update();
			if (data.includes("openssh")) await OpenSSH.update();
			if (data.includes("embervpn")) await this.update();

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
	 * @returns void
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
		if (Date.now() - procrastinate < 1000 * 60 * 60 * 24) return;

		// Make sure the user is authorized
		if (!await Auth.isAuthorized()) return null;

		// Get current version
		const version = app.getVersion();

		// TODO: open window if a dependency is out of date
		
		// Get latest version
		return await fetch("https://api.embervpn.org/v3/ember/downloads")
			.then(res => res.json() as Promise<REST.APIResponse<EmberAPI.ClientDownloads>>)
			.then(async res => {

				// Make sure the request was successful
				if (!res.success) return false;

				// Get latest version
				const latest = res.latest.substring(1);
				
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

	/**
	 * Update the application
	 * @returns Promise<void>
	 */
	public static async update() {
	
		// Fetch latest version
		const res = await fetch("https://api.embervpn.org/v2/ember/downloads")
			.then(res => res.json() as Promise<REST.APIResponse<EmberAPI.ClientDownloads>>);
	
		// Make sure the request was successful
		if (!res.success) return;

		// Get latest version
		const builds = res.assets[platform];

		// Clear procrastination
		Config.delete("updater.last-remind-me-later");

		// Check platform
		if (process.platform === "win32") {

			// Check if we're using the exe or msi
			const useExe = basename(dirname(app.getPath("exe"))) === "embervpn";
			const binary = builds.find(b => extname(b.name) === (useExe ? ".exe" : ".msi"));

			// Make sure we found a binary
			if (!binary) throw new Error("No binary found for platform");

			// Download the installer binary to the temp directory
			const installer = await fetch(binary.downloadUrl)
				.then(res => res.arrayBuffer())
				.then(buf => writeFile(join(app.getPath("sessionData"), binary.name), Buffer.from(buf)))
				.then(() => join(app.getPath("sessionData"), binary.name));

			// Ensure we're not in dev mode
			if (is.dev) return;

			// Run the installer
			if (useExe) exec(installer);
			
			else exec(`msiexec /i "${ installer }" /passive /norestart`, () => app.quit());
		
			// Close update window
			Update.close();
			setTimeout(() => app.quit(), 2500);

			return;
		}

		// Unsupported platform
		throw new Error("Unsupported platform");
		
	}

}