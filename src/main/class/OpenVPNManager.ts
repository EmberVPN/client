import { ChildProcess, spawn, spawnSync } from "child_process";
import { BrowserWindow, ipcMain } from "electron";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { resolve } from "path";
import { inetLatency } from "systeminformation";
import { ipvm, resources, tray } from "..";
import { IpGeo } from "./IPManager";

function getBinary() {

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
function install() {

	if (process.platform === "win32") {
			
		// Run the bundled installer
		return spawnSync([
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

	throw new Error("Unsupported platform");
}

export class OpenVPNManager {

	private proc: ChildProcess | null = null;
	private eventDispatcher: Electron.WebContents;
	private authorization: string | null = null;

	private async downloadConfig(server: Ember.Server) {

		// Ensure authorization is set
		if (!this.authorization) throw new Error("Authorization not set");

		// Download config
		const { success, config } = await fetch(`https://api.embervpn.org/v2/rsa/download-client-config?server=${ server.hash }`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": this.authorization
			}
		}).then(res => res.json() as Promise<{ success: boolean, config: string }>);
			
		// Check for errors
		if (!success) throw new Error("Failed to download server config");

		// Write config file
		const path = resolve(resources, "ember.ovpn");
		await writeFile(path, Buffer.from(config, "base64").toString("utf-8"));

	}

	private async confirmConnection(server: Ember.Server) {

		// Await new geolocation
		const geo: IpGeo = await new Promise(resolve => ipvm.once("change", resolve));
		if (geo.ip !== server.ip) throw new Error("Failed to connect to server");
		
		// Set connected
		tray.setState("connected");
		tray.notify(`Connected to ${ geo.country_code }`);
		this.eventDispatcher.send("openvpn", "connected", server.hash);

	}

	constructor(win: BrowserWindow) {

		// Set event dispatcher
		this.eventDispatcher = win.webContents;

		// Ping server handler
		ipcMain.handle("ping-server", async function(_, server: Ember.Server) {
			return await Promise.race([
				new Promise(resolve => setTimeout(() => resolve(-1), 4000)),
				inetLatency(server.ip)
			]);
		});

		// Listen for openvpn events
		ipcMain.on("openvpn", async(_, state: string, json) => {
			
			// On disconnect
			if (state === "disconnect") return this.disconnect()
				.then(() => {
					tray.setState("disconnected");
					this.eventDispatcher.send("openvpn", "disconnected");
				});
			
			// On connect
			if (state === "connect") {

				// Get authorization
				const { authorization, server } = JSON.parse(json);
				this.authorization = authorization;

				// Download server config
				await this.downloadConfig(server)
					.then(e => win.webContents.send("openvpn", "connecting", server.hash, e))
					.then(() => this.connect())
					.then(() => this.confirmConnection(server))
					.catch(e => win.webContents.send("openvpn", "error", server.hash, e));

			}

		});

	}

	/**
	 * Connect to the VPN
	 * @param server The server to connect to
	 * @returns void
	 */
	private async connect() {

		// Set connecting state
		tray.setState("connecting");

		// Get binary and config path
		const binary = await getBinary();
		const config = resolve(resources, "ember.ovpn");

		// Spawn openvpn process
		if (process.platform === "win32") {

			if (this.proc !== null) this.proc.kill();
			return this.proc = spawn(binary, [ "--config", config ], { detached: true });

		}

		throw new Error("Unsupported platform");

	}
	
	/**
	 * Disconnect from the VPN
	 * @returns void
	 */
	public async disconnect() {
		this.eventDispatcher.send("openvpn", "disconnecting");
		
		// Kill process
		if (this.proc) this.proc.kill();
		this.proc = null;

		// Set disconnected state
		tray.setState("disconnected");
		tray.notify("Disconnected from VPN");
		this.eventDispatcher.send("openvpn", "disconnected");

	}

}