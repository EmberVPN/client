import { is } from "@electron-toolkit/utils";
import { ChildProcessWithoutNullStreams, exec, spawn } from "child_process";
import { app, ipcMain } from "electron";
import { readFile, writeFile } from "fs/promises";
import { mkdirp } from "mkdirp";
import os from "os";
import { dirname, extname, join, resolve } from "path";
import { resources } from "..";

export class OpenSSH {

	// Instance of OpenSSH
	private static instance: ChildProcessWithoutNullStreams;

	// Path to the keypair
	private static keypair: string;

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

		// Get the version
		return new Promise<string>(resolve => {
			exec("ssh -V", (err, stdout, stderr) => {

				// If there was an error, install openssh and try again
				if (err) return resolve("MISSING");

				const output = [ stdout, stderr ].join("\n").trim();
				const x = output.match(/OpenSSH(\w)*_([0-9]*\.[0-9]*\w*)/);
				if (x && x[2]) return resolve(x[2]);
				
			});
		});

	}

	/**
	 * Generate keypair
	 * @returns Promise<string> The public key
	 */
	public static async generateKeyPair() {

		// Get path to save keypair;
		this.keypair = resolve(is.dev ? resources : app.getPath("sessionData"), ".ssh", "ember_ed25519");

		await mkdirp(dirname(this.keypair)).catch(console.error);

		const cmd = `${ process.platform === "win32" ? "powershell Write-Output" : "echo" } "y"| ssh-keygen -ted25519 -f "${ this.keypair }" -q -N ""`;
		await new Promise(r => exec(cmd, r));

		return await readFile(this.keypair + ".pub", "utf-8")
			.then(key => key.split(" ")[1]);
	}

	/**
	 * Start OpenSSH link to a server
	 * @param ip The server to connect to
	 */
	public static async start(ip: string) {

		// Check if OpenSSH is already running
		if (this.instance?.pid) this.instance.kill();

		const cmd = `ssh -i "${ this.keypair }" -NL 1194:localhost:1194 vpn@${ ip }`;

		// Start the tunnel
		this.instance = spawn(cmd, { shell: true })
			.on("exit", () => console.log("exited"));
		
		// Let SSH start
		return await new Promise(resolve => setTimeout(resolve, 1000));

	}

}