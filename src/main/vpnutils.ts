import admin from "admin-check";
import child_process from "child_process";
import { BrowserWindow } from "electron";
import { existsSync } from "fs";
import { resolve } from "path";
import sudoPrompt from "sudo-prompt";
import { resources } from ".";

// Install OpenVPN using the bundled installer
export const BUNDLED_WIN32_INSTALLER = "OpenVPN-2.6.4-I001-amd64.msi";

// Promisify sudo-prompt & exec
const sudo = (cmd: string) => new Promise<string | Buffer | undefined>((resolve, reject) => sudoPrompt.exec(cmd, { name: "Ember VPN" }, (error, stdout) => error ? reject(error) : resolve(stdout)));
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
		const bundledLocation = resolve(resources, ".bin/bin/openvpn.exe");
		if (existsSync(bundledLocation)) return bundledLocation;

		// Set state to installing
		BrowserWindow.getAllWindows()
			.map(win => win.webContents.send("openvpn", "installing"));

		// Check elevation status
		const elevated = await admin.check();

		// Construct the install command
		const cmd = `msiexec /i "${ resolve(resources, ".bin", BUNDLED_WIN32_INSTALLER) }" PRODUCTDIR="${ resolve(resources, ".bin") }" ADDLOCAL=OpenVPN.Service,Drivers.OvpnDco,OpenVPN,Drivers,Drivers.TAPWindows6,Drivers.Wintun /passive`;

		// If we are not elevated, elevate
		if (!elevated) await sudo(cmd);
			
		// If we are elevated, run the command
		else await exec(cmd);

		// Return bundled location
		return await getBinary();

	}
	
	// Throw an error if the platform is not supported *yet*
	throw new Error("Unsupported platform");

}