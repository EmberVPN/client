import { ChildProcessWithoutNullStreams, spawn, spawnSync } from "child_process";
import { BrowserWindow, ipcMain } from "electron";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { resolve } from "path";
import { resources } from ".";
import * as tray from "./tray";

export type State = "connect" | "disconnect";

export let proc: ChildProcessWithoutNullStreams | null = null;

let contents: Electron.WebContents | null = null;
let lastServer: Ember.Server;

// Get mainwindow once it loads
export default function(win: BrowserWindow) {
	
	contents = win.webContents;
	
	// Listen for openvpn events
	ipcMain.on("openvpn", async(_, state: State, data: string) => {

		// Set connect state
		if (state === "connect") {
			
			// Get server & authorization from data
			const { server, authorization }: { server: Ember.Server; authorization: string } = JSON.parse(data || "{}");
			
			// Download server config
			await downloadConfig(server, authorization)
				.then(() => connect(server))
				.catch(e => win.webContents.send("openvpn", "error", server.hash, e));

		// Set disconnected state
		} else if (state === "disconnect") {
			disconnect();
		}

	});

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

	throw new Error("Unsupported platform");

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

}

// Download server config
export async function downloadConfig(server: Ember.Server, authorization: string) {
	const { success, config } = await fetch(`https://api.embervpn.org/rsa/download-client-config?server=${ server.hash }`, {
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

		// Get current IP
		const { ip } = await fetch("https://ipapi.co/json/").then(res => res.json()) as { ip: string };

		// Set connected
		if (ip === server.ip) {
			clearInterval(iv);
			tray.setConnected();
			tray.notify(`Connected to ${ server.hostname } (${ server.ip })`, "Ember VPN • Connected", resolve(resources, "./src/renderer/assets/tray-connected.png"));
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
	proc = spawn(binary, [ "--config", path ], { detached: true });

	// Kill the process on exit
	process.on("exit", () => proc?.kill());

	// Listen for data
	proc.stdout.on("data", chunk => {
		const line = chunk.toString();
		contents?.send("openvpn", "log", server.hash, line);
	});

	// On exit
	proc.on("exit", code => {

		clearInterval(iv);
		tray.disconnect();

		// Check if process was killed
		if (code === null) return;

		// Check if process exited with error
		if (code !== 0) {
			contents?.send("openvpn", "error", server.hash, "OpenVPN exited with code " + code);
			tray.notify(`Could not connect to ${ server.hostname } (${ server.ip })`, "Ember VPN • Not Connected", resolve(resources, "./src/renderer/assets/tray.png"));
		}
		return;

	});
		
}

// Disconnect from openvpn
export function disconnect() {
	proc?.kill();
	tray.disconnect();
	tray.notify(`Disconnected from ${ lastServer.hostname } (${ lastServer.ip })`, "Ember VPN • Disconnected", resolve(resources, "./src/renderer/assets/tray.png"));
	contents?.send("openvpn", "disconnected");
}