import { is } from "@electron-toolkit/utils";
import { ChildProcessWithoutNullStreams, exec, spawn } from "child_process";
import { app, ipcMain } from "electron";
import { readFile, writeFile } from "fs/promises";
import { mkdirp } from "mkdirp";
import os from "os";
import { dirname, extname, join, resolve } from "path";
import { SemVer, coerce } from "semver";
import { resources } from "..";
import { EmberAPI } from "./EmberAPI";

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
			const downloads = await EmberAPI.fetch("/v3/ember/downloads")
				.then(res => res.dependencies["openssh"].assets[process.platform]);

			// Get download link
			const download = downloads.find(download => download.toLowerCase().includes(arch));
			if (!download) throw new Error("Failed to find a download for this platform/architecture");

			const savePath = join(resources, "__purge-openssh" + extname(download));
			
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
	 * @returns Promise<SemVer> The version of OpenSSH
	 */
	public static async getVersion() {

		// Get the version
		return new Promise<SemVer | null>((resolve, reject) => {
			exec("ssh -V", (err, stdout, stderr) => {

				// If there was an error, install openssh and try again
				if (err) return resolve(null);

				const output = [ stdout, stderr ].join("\n").trim();
				const x = output.match(/OpenSSH(\w)*_([0-9]*\.[0-9]*\w*)/);
				const v = x && x[2] && coerce(x[2].replace("p", "."));
				if (v) resolve(v);
				else reject("Failed to get version");
				
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
	public static async connect(server: Ember.Server, port: number) {

		console.log("[OpenSSH]", "Connecting to:", server.ip);

		// Kill any existing instance
		if (this.instance) this.instance.kill();

		const cmd = `ssh -i "${ this.keypair }" -vNL ${ port }:localhost:${ server.port } -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null vpn@${ server.ip }`;

		// Start the tunnel
		this.instance = spawn(cmd, { shell: true })
			.on("message", message => console.log("[OpenSSH]", message))
			.on("error", error => console.error("[OpenSSH]", error))
			.on("close", code => console.log("[OpenSSH]", "Closed with code:", code))
			.on("disconnect", () => console.log("[OpenSSH]", "Disconnected"));
		
		// Let SSH start
		return await new Promise(resolve => setTimeout(resolve, 500));

	}

}