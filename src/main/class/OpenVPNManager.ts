import { ChildProcess, spawn, spawnSync } from "child_process";
import { BrowserWindow, ipcMain } from "electron";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { resolve } from "path";
import { inetLatency } from "systeminformation";
import { ipvm, resources, tray } from "..";
import { calculateDistance } from "../../calculateDistance";

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
			`"${ resolve(resources, ".bin/OpenVPN-2.6.4-I001-amd64.msi") }"`,
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

	private _isConnecting = false;
	public isConnecting() {
		return this._isConnecting;
	}

	private proc: ChildProcess | null = null;
	private eventDispatcher: Electron.WebContents;
	private authorization: string | null = null;
	private server: Ember.Server | null = null;

	public async downloadConfig(server: Ember.Server) {
		this._isConnecting = true;
		tray.refreshMenu();

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
		this._isConnecting = false;
		if (!this.proc) throw new Error("Process not started");
		
		// On process exit
		this.proc.on("exit", () => server.hash === this.server?.hash && this.disconnect());
		this.proc.on("error", error => {
			this.eventDispatcher.send("openvpn", "error", server.hash, error.toString());
			this.disconnect();
		});

		// Log stdout
		this.proc.stdout?.on("data", data => {
			const line = data.toString().trim();
			console.log("[OpenVPN]", line);
			
			if (line.includes("ERROR:")) {
				this.proc?.emit("error", new Error(line.split("ERROR:")[1].trim()));
				return;
			}

			this.eventDispatcher.send("openvpn", "log", server.hash, line);
		});

		// Await new geolocation
		const newIp: string = await new Promise(resolve => ipvm.once("change", resolve));
		const geo = await ipvm.fetchGeo(newIp);

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

		// Handle authorization token changes
		ipcMain.on("authorization", (_, authorization: string) => {
			this.authorization = authorization;
			if (!authorization) this.disconnect();
		});
		
		// Listen for openvpn events
		ipcMain.on("openvpn", async(_, state: string, json) => {
			
			// On disconnect
			if (state === "disconnect") {
				this.eventDispatcher.send("openvpn", "disconnecting");
				await this.disconnect();
			}
			
			// On connect
			if (state === "connect") {

				// Get authorization
				const { authorization, server } = JSON.parse(json);
				this.authorization = authorization;
				this.server = server;
				
				// Download server config
				await this.downloadConfig(server)
					.then(() => this.connect())
					.then(() => this.confirmConnection(server))
					.catch(e => {
						win.webContents.send("openvpn", "error", server.hash, e.toString());
						this.disconnect();
					});
					
			}

			// Kill VPN on process exit
			process.on("exit", () => this.disconnect());
				
		});

	}

	/**
	* Disconnect from the VPN
	* @returns void
	 */
	public async disconnect(switching = false) {

		// Kill process
		if (this.proc) this.proc.kill();
		this.proc = null;
		this._isConnecting = false;

		if (switching) return;
		if (tray.state !== "disconnected") tray.notify("Disconnected from VPN", "Ember VPN • Disconnected", "tray");
		tray.setState("disconnected");
		this.eventDispatcher.send("openvpn", "disconnecting");
		
	}

	/**
	* Connect to the VPN
	* @param server The server to connect to
	* @returns void
	*/
	private async connect() {

		// Ensure we have a server to connect to
		if (!this.server) throw new Error("Server not set");
		
		// Set connecting state
		tray.setState("connecting");
		this.eventDispatcher.send("openvpn", "connecting", this.server.hash);
		
		// Get binary and config path
		const binary = await getBinary();
		const config = resolve(resources, "ember.ovpn");
		
		// Kill existing process
		if (this.proc !== null) this.disconnect(true);
		
		// Spawn openvpn process for windows (requires elevation)
		if (process.platform === "win32") return this.proc = spawn(binary, [ "--config", config ], { detached: true });
		
		throw new Error("Unsupported platform");
		
	}

	public async quickConnect() {

		// Ensure authorization is set
		if (!this.authorization) throw new Error("Authorization not set");
		this.eventDispatcher.send("openvpn", "will-connect");
		this._isConnecting = true;
		tray.refreshMenu();
		
		// Get servers
		const servers = await fetch("https://api.embervpn.org/v2/ember/servers", {
			headers: { "authorization": this.authorization }
		}).then(res => res.json() as Promise<REST.APIResponse<EmberAPI.Servers>>);

		// Check for errors
		if (!servers || !servers.success) throw new Error("Failed to fetch servers");
		
		// Fetch geolocation
		const geo = await ipvm.fetchGeo();

		// Get the closest server
		const server = this.server = Object.values(servers.servers)
			.sort((a, b) => {
				const distA = calculateDistance(a.location.latitude, a.location.longitude, geo.latitude, geo.longitude);
				const distB = calculateDistance(b.location.latitude, b.location.longitude, geo.latitude, geo.longitude);
				return distA - distB;
			})[0];
		
		// Notify the UI that we are connecting
		this.eventDispatcher.send("openvpn", "will-connect", server.hash);

		// Attempt to connect
		return await this.downloadConfig(server)
			.then(() => this.connect())
			.then(() => this.confirmConnection(server))
			.catch(e => {
				this.eventDispatcher.send("openvpn", "error", server.hash, e.toString());
				this.disconnect();
			});

	}

}