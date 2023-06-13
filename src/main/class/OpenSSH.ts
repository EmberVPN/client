import { exec } from "child_process";
import { app, ipcMain } from "electron";
import { writeFile } from "fs/promises";
import os from "os";
import { dirname, extname, join } from "path";
import { resources } from "..";

export class OpenSSH {

	// The current version of OpenVPN
	private static _version: string | null = null;

	// Manage the openssh lifecycle
	static {

		// Handle openvpn version request
		ipcMain.handle("openssh", async(_, mode: string) => {
			if (mode !== "version") return;
			return await this.getVersion();
		});
		
	}

	/**
	 * Installs OpenSSH on the system
	 * @returns Promise<void>
	 */
	public static async update() {
		
		// Check platform
		if (process.platform === "win32") {
			
			// Get architecture
			const arch = [ "ppc64", "x64", "s390x" ].includes(os.arch()) ? "win64" : os.arch() === "arm64" ? "arm64" : "win32";

			// Get latest version from API
			const downloads = await fetch("https://api.embervpn.org/v3/ember/downloads")
				.then(res => res.json() as Promise<REST.APIResponse<EmberAPI.ClientDownloads>>)
				.then(res => res.success ? res.dependencies["openssh"].assets[process.platform] : null);
			if (!downloads) throw new Error("Failed to get latest version of OpenSSH");

			// Get download link
			const download = downloads.find(download => download.toLowerCase().includes(arch));
			if (!download) throw new Error("Failed to find a download for this platform/architecture");

			const savePath = join(resources, "openssh-update" + extname(download));
			
			// Download installer
			await fetch(download)
				.then(res => res.arrayBuffer())
				.then(buffer => writeFile(savePath, Buffer.from(buffer)));

			// Install openssh
			return await new Promise(resolve => exec(`msiexec /i "${ savePath }" PRODUCTDIR="${ dirname(app.getPath("exe")) }" ADDLOCAL=Client /passive`, resolve));

		}

		throw new Error("Unsupported platform");

	}

	/**
	 * Gets the version of OpenSSH
	 * @returns Promise<string> The version of OpenSSH
	 */
	public static async getVersion() {

		// If we already have the version, return it
		if (this._version) return this._version;

		// Get the version
		return new Promise<string>(resolve => {
			exec("ssh -V", (err, stdout, stderr) => {

				// If there was an error, install openssh and try again
				if (err) {
					console.error(err);
					if (err) return this.update().then(() => this.getVersion());
				}

				const output = [ stdout, stderr ].join("\n").trim();
				const x = output.match(/OpenSSH(\w)*_([0-9]*\.[0-9]*\w*)/);
				if (x && x[2]) return resolve(x[2]);
				
			});
		});

	}

}