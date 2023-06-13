import { exec } from "child_process";
import { ipcMain } from "electron";

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
	 * @returns {Promise<void>}
	 */
	private static async install() {

		// Install OpenSSH

	}

	/**
	 * Gets the version of OpenSSH
	 * @returns {Promise<string>} The version of OpenSSH
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
					if (err) return this.install().then(() => this.getVersion());
				}

				const output = [ stdout, stderr ].join("\n").trim();
				const x = output.match(/OpenSSH(\w)*_([0-9]*\.[0-9]*\w*)/);
				if (x && x[2]) return resolve(x[2]);
				
			});
		});

	}

}