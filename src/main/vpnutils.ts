import child_process from "child_process";
import { BrowserWindow, app } from "electron";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import os from "os";
import { dirname, resolve } from "path";

// Install OpenVPN using the bundled installer
export const BUNDLED_WIN32_INSTALLER = "OpenVPN-2.6.4-I001-amd64.msi";

// Promisify sudo-prompt & exec
// const sudo = (cmd: string) => new Promise<string | Buffer | undefined>((resolve, reject) => sudoPrompt.exec(cmd, { name: "Ember VPN" }, (error, stdout) => error ? reject(error) : resolve(stdout)));
const exec = (cmd: string) => new Promise<string | Buffer | undefined>((resolve, reject) => child_process.exec(cmd, (error, stdout) => error ? reject(error) : resolve(stdout)));

/**
 * A function to get the path to the OpenVPN binary, installing it if it doesn't exist
 * @returns string
 */
export async function getBinary(): Promise<string> {

	// Check platform
	if (process.platform === "win32") {
		
		// Check if openvpn is on path
		const path = process.env.Path?.split(";").find(path => existsSync(resolve(path, "openvpn.exe")));
		if (path) return resolve(path, "openvpn.exe");

		// Check default location
		const defaultLocation = resolve(process.env.ProgramFiles || "C:\\Program Files", "OpenVPN/bin/openvpn.exe");
		if (existsSync(defaultLocation)) return defaultLocation;

		// Check bundled location
		const bundledLocation = resolve(dirname(app.getPath("exe")), "bin/openvpn.exe");
		if (existsSync(bundledLocation)) return bundledLocation;
		
		// Set state to installing
		BrowserWindow.getAllWindows()
			.map(win => win.webContents.send("openvpn", "installing"));
			
		// Get architecture
		const arch = [ "arm64", "ppc64", "x64", "s390x" ].includes(os.arch()) ? "amd64" : "x86";
		
		// Figure out where to put it
		const SAVE_PATH = resolve(app.getPath("sessionData"), `openvpn-latest-stable-${ arch }.msi`);

		// Download installer to user's temp directory
		await fetch(`https://build.openvpn.net/downloads/releases/latest/openvpn-latest-stable-${ arch }.msi`)
			.then(res => res.arrayBuffer())
			.then(buffer => writeFile(SAVE_PATH, Buffer.from(buffer)));

		// Install openvpn
		await exec(`msiexec /i "${ SAVE_PATH }" PRODUCTDIR="${ dirname(app.getPath("exe")) }" ADDLOCAL=OpenVPN.Service,Drivers.OvpnDco,OpenVPN,Drivers,Drivers.TAPWindows6,Drivers.Wintun /passive`);

		// Return bundled location
		return await getBinary();

	}
	
	// Throw an error if the platform is not supported *yet*
	throw new Error("Unsupported platform");

}