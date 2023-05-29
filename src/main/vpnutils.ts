import admin from "admin-check";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";
import { resources } from ".";

export async function getBinary() {

	if (process.platform === "win32") {

		// Check if openvpn.exe is on path
		const openvpn = spawnSync("where openvpn", { shell: true });
		if (openvpn.status === 0) return "openvpn.exe";

		// Check default location
		const defaultLocation = resolve(process.env.ProgramFiles || "C:\\Program Files", "OpenVPN/bin/openvpn.exe");
		if (existsSync(defaultLocation)) return defaultLocation;

		// Check bundled location
		const bundledLocation = resolve(resources, ".bin/bin/openvpn.exe");
		if (existsSync(bundledLocation)) return bundledLocation;

		// Install OpenVPN
		await install();

		// Return bundled location
		return bundledLocation;

	}

	throw new Error("Unsupported platform");

}

// Install OpenVPN
async function install() {

	// Check elevation status
	const elevated = await admin.check();
	if (!elevated) throw new Error("You must run Ember VPN as administrator to connect to the VPN");

	// Install with the bundled installer on windows
	if (process.platform === "win32") {

		// Run the bundled installer
		return spawnSync([
			"msiexec",
			"/i",
			`"${ resolve(resources, ".bin/OpenVPN-2.6.4-I001-amd64.msi") }"`,
			`PRODUCTDIR="${ resolve(resources, ".bin") }"`,
			"ADDLOCAL=OpenVPN.Service,Drivers.OvpnDco,OpenVPN,Drivers,Drivers.TAPWindows6,Drivers.Wintun",
			"/passive",
		].join(" "), { shell: true });

	}

	throw new Error("Unsupported platform");
}
