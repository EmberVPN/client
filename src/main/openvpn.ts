import { ChildProcessWithoutNullStreams, spawn, spawnSync } from "child_process";
import { BrowserWindow, ipcMain } from "electron";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { resolve } from "path";
import { inetLatency } from "systeminformation";
import { resources } from ".";
import * as tray from "./tray";

export type State = "connect" | "disconnect";

export let proc: ChildProcessWithoutNullStreams | null = null;

let contents: Electron.WebContents | null = null;
let lastServer: Ember.Server;

let lastIp = "";
let lastGeo = {};

// Get mainwindow once it loads
export default function(win: BrowserWindow) {
	
	contents = win.webContents;

	ipcMain.handle("ping-server", async(_event, server: Ember.Server) => await inetLatency(server.ip));
	
	// Listen for openvpn events
	ipcMain.on("openvpn", async(_, state: State, data: string) => {

		// Set connect state
		if (state === "connect") {
			
			// Get server & authorization from data
			const { server, authorization }: { server: Ember.Server; authorization: string } = JSON.parse(data || "{}");
			
			// Download server config
			await downloadConfig(server, authorization)
				.then(e => win.webContents.send("openvpn", "connecting", server.hash, e))
				.then(() => connect(server))
				.catch(e => win.webContents.send("openvpn", "error", server.hash, e));

		// Set disconnected state
		} else if (state === "disconnect") {
			disconnect();
		}

	});

	(async function monitor() {

		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), 1000);

		const mirror = [
			"https://icanhazip.com/",
			"https://api.ipify.org/",
			"https://ip.seeip.org/",
			"https://ident.me/text"
		].reduce((a, b) => Math.random() > 0.5 ? a : b);

		// Get IP address
		const ip = await fetch(mirror, {
			signal: controller.signal
		})
			.then(res => res.text())
			.then(text => text.trim())
			.catch(() => undefined);
		
		clearTimeout(id);
		
		// Retry if IP is undefined
		if (!ip || ip.includes("error")) return monitor();
		setTimeout(() => monitor(), 1000);

		// Check if IP has changed and it didnt pick up an ipv6 address
		if (ip !== lastIp && ip.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
			lastIp = ip;
			
			(async function monitor() {

				const controller = new AbortController();
				const id = setTimeout(() => controller.abort(), 1000);

				// Get mirror
				const mirror = [
					"https://ipwho.is",
				].reduce((a, b) => Math.random() > 0.5 ? a : b);

				interface GeoLocation {
					success: boolean;
					country_code: string;
					latitude: number;
					longitude: number;
					ip: string;
					error: boolean;
				}

				// Send request
				const res = await fetch(mirror, {
					signal: controller.signal
				})
					.then(res => res.json() as Promise<GeoLocation>)
					.catch(() => undefined);
				
				clearTimeout(id);
				
				// Retry if res is undefined
				if (!res) return monitor();
				if (!res.success) return monitor();
				if (res.hasOwnProperty("error")) return monitor();
				
				// console.log(res);

				lastGeo = JSON.stringify({
					ip,
					country_code: res.country_code,
					latitude: res.latitude,
					longitude: res.longitude
				});
				contents?.send("iplocation", lastGeo);

			}());

			return;

		}

		if (Object.values(lastGeo).length > 0) contents?.send("iplocation", lastGeo);

	}());

}

// Get binary path
export function getBinary() {

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
		install();

		// Return bundled location
		return bundledLocation;

	}

	if (process.platform === "darwin") {

		// Check if openvpn is on path
		const openvpn = spawnSync("which openvpn", { shell: true });
		if (openvpn.status === 0) return "openvpn";

		// Check default location
		const defaultLocation = resolve("/usr/local/sbin/openvpn");
		if (existsSync(defaultLocation)) return defaultLocation;

		// Install OpenVPN
		install();

		// Return openvpn
		return "openvpn";

	}

	// Check if openvpn is on path
	const openvpn = spawnSync("which openvpn", { shell: true });
	if (openvpn.status === 0) return "openvpn";

	// Check default location
	const defaultLocation = resolve("/usr/sbin/openvpn");
	if (existsSync(defaultLocation)) return defaultLocation;

	// Install OpenVPN
	install();

	// Return openvpn
	return "openvpn";

}

// Install OpenVPN
export function install() {

	if (process.platform === "win32") {
			
		// Run the bundled installer
		spawnSync([
			"msiexec",
			"/i",
			`"${ resolve(resources, ".bin/installer.msi") }"`,
			`PRODUCTDIR="${ resolve(resources, ".bin") }"`,
			"ADDLOCAL=OpenVPN.Service,Drivers.OvpnDco,OpenVPN,Drivers,Drivers.TAPWindows6,Drivers.Wintun",
			"/passive",
		].join(" "), {
			shell: true,
		});
	
	}

	if (process.platform === "darwin") {

		// Install openvpn
		spawnSync("brew install openvpn", { shell: true });

	}

	// Install openvpn
	spawnSync("sudo apt-get install openvpn", { shell: true });

}

// Download server config
export async function downloadConfig(server: Ember.Server, authorization: string) {
	const { success, config } = await fetch(`https://api.embervpn.org/v2/rsa/download-client-config?server=${ server.hash }`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": authorization
		}
	}).then(res => res.json() as Promise<{ success: boolean, config: string }>);
			
	// Check for errors
	if (!success) throw new Error("Failed to download server config");

	// Write config file
	const path = resolve(resources, "ember.ovpn");
	await writeFile(path, Buffer.from(config, "base64").toString("utf-8"));
}

// Connect to openvpn
export function connect(server: Ember.Server) {

	lastServer = server;
	
	const iv = setInterval(async function refetch() {
		
		// Set connected
		if (lastIp === server.ip) {
			clearInterval(iv);
			tray.setConnected();
			tray.notify(`Connected to ${ server.ip }`, "Ember VPN • Connected", resolve(resources, "./assets/tray-connected.png"));
			contents?.send("openvpn", "connected");
		}

	}, 1000);

	// Dispose of old process
	proc?.kill();

	// Set connecting
	tray.setConnecting();

	// Get binary path
	const binary = getBinary();

	// Spawn openvpn process
	const path = resolve(resources, "ember.ovpn");
	if (process.platform === "win32") {
		proc = spawn(binary, [ "--config", path ], { detached: true });
	} else {
		proc = spawn("sudo", [ binary, "--config", path ], { detached: true });
	}

	// Kill the process on exit
	process.on("exit", () => proc?.kill());

	// Listen for data
	proc?.stdout.on("data", chunk => {
		const line = chunk.toString();
		console.log("[openvpn]", line);
		if (line.includes("error code 1")) {
			contents?.send("openvpn", "error", server.hash, line);
			proc?.kill();
			return;
		}
		contents?.send("openvpn", "log", server.hash, line);
	});

	// On exit
	proc?.on("exit", code => {

		clearInterval(iv);
		tray.disconnect();

		// Check if process was killed
		if (code === null) return;

		// Check if process exited with error
		if (code !== 0) {
			contents?.send("openvpn", "error", server.hash, "OpenVPN exited with code " + code);
			tray.notify(`Could not connect to ${ server.ip }`, "Ember VPN • Not Connected", resolve(resources, "./assets/tray.png"));
		}
		return;

	});
		
}

// Disconnect from openvpn
export function disconnect() {
	if (!proc || proc.exitCode !== null) return;
	proc?.kill();
	tray.disconnect();
	tray.notify(`Disconnected from ${ lastServer.ip }`, "Ember VPN • Disconnected", resolve(resources, "./assets/tray.png"));
	contents?.send("openvpn", "disconnecting");
}