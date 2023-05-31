import { exec as oldExec } from "child_process";
import { existsSync } from "fs";
import { installPackage, isPackageInstalled } from "linux-package-manager";
import { resolve } from "path";
import { promisify } from "util";
import { resources } from ".";

// Install OpenVPN using the bundled installer
export const BUNDLED_WIN32_INSTALLER = "OpenVPN-2.6.4-I001-amd64.msi";

// Promisify exec with util.promisify
const exec = (command: string) => promisify(oldExec)(command);

export async function getBinary() {

	if (process.platform === "win32") {

		// Check default location
		const defaultLocation = resolve(process.env.ProgramFiles || "C:\\Program Files", "OpenVPN/bin/openvpn.exe");
		if (existsSync(defaultLocation)) return defaultLocation;

		// Check bundled location
		const bundledLocation = resolve(resources, ".bin/bin/openvpn.exe");
		if (existsSync(bundledLocation)) return bundledLocation;

		// Set state to installing and install
		await exec(`msiexec /i "${ resolve(resources, ".bin", BUNDLED_WIN32_INSTALLER) }" PRODUCTDIR="${ resolve(resources, ".bin") }" ADDLOCAL=OpenVPN.Service,Drivers.OvpnDco,OpenVPN,Drivers,Drivers.TAPWindows6,Drivers.Wintun /passive`);

		// Return bundled location
		return bundledLocation;

	}

	if (process.platform === "linux") {

		// Check if openvpn is on path
		const openvpn = await exec("which openvpn");
		if (openvpn.stdout) return openvpn.stdout.toString().trim();

		// Install OpenVPN if its not installed
		if (!(await isPackageInstalled("openvpn"))) await installPackage("openvpn");

		// Return openvpn
		return "openvpn";

	}

	throw new Error("Unsupported platform");

}