import admin from "admin-check";
import { ChildProcess, spawn } from "child_process";
import { BrowserWindow, ipcMain } from "electron";
import { writeFile } from "fs/promises";
import { resolve } from "path";
import { resources } from "..";
import { calculateDistance } from "../../calculateDistance";
import { getBinary } from "../vpnutils";
import { Auth } from "./Auth";
import { IPManager } from "./IPManager";
import { Tray } from "./Tray";

export class OpenVPN {

	private static _isConnecting = false;
	public static isConnecting() {
		return this._isConnecting;
	}

	private static proc: ChildProcess | null = null;
	private static server: Ember.Server | null = null;

	public static async downloadConfig(server: Ember.Server) {
		this._isConnecting = true;
		await Tray.refreshMenu();

		// Ensure authorization is set
		const auth = Auth.getAuthorization();
		if (!auth) throw new Error("Authorization not set");

		// Download config
		const { success, config } = await fetch(`https://api.embervpn.org/v2/rsa/download-client-config?server=${ server.hash }`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": auth
			}
		}).then(res => res.json() as Promise<{ success: boolean, config: string }>);
			
		// Check for errors
		if (!success) throw new Error("Failed to download server config");

		// Write config file
		const path = resolve(resources, "ember.ovpn");
		await writeFile(path, Buffer.from(config, "base64").toString("utf-8"));

	}

	private static async confirmConnection(server: Ember.Server) {
		this._isConnecting = false;
		if (!this.proc) throw new Error("Process not started");
		
		// On process exit
		this.proc.on("exit", () => server.hash === this.server?.hash && this.disconnect());
		this.proc.on("error", error => {
			BrowserWindow.getAllWindows()
				.map(win => win.webContents.send("openvpn", "error", server.hash, error.toString()));
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

			BrowserWindow.getAllWindows()
				.map(win => win.webContents.send("openvpn", "log", server.hash, line));
		});

		// Await new geolocation
		const newIp: string = await new Promise(resolve => IPManager.once("change", resolve));
		const geo = await IPManager.fetchGeo(newIp);

		if (geo.ip !== server.ip) throw new Error("Failed to connect to server");
		
		// Set connected
		await Tray.setState("connected");
		Tray.notify(`Connected to ${ geo.country_code }`);
		BrowserWindow.getAllWindows()
			.map(win => win.webContents.send("openvpn", "connected", server.hash));
		
	}
	
	static {
		
		// Listen for openvpn events
		ipcMain.on("openvpn", async(_, state: string, json) => {
			
			// On disconnect
			if (state === "disconnect") {
				BrowserWindow.getAllWindows()
					.map(win => win.webContents.send("openvpn", "disconnecting"));
				await this.disconnect();
			}
			
			// On connect
			if (state === "connect") {

				// Get authorization
				const { server } = JSON.parse(json);
				this.server = server;
				
				// Download server config
				await this.downloadConfig(server)
					.then(() => this.connect())
					.then(() => this.confirmConnection(server))
					.catch(e => {
						BrowserWindow.getAllWindows()
							.map(win => win.webContents.send("openvpn", "error", server.hash, e.toString()));
						this.disconnect();
					});
					
			}

			// Kill VPN on process exit
			process.on("exit", () => this.disconnect());
				
		});

		// Handle openvpn version request
		ipcMain.handle("openvpn", async(_, mode: string) => {
			if (mode !== "version") return;
			return await this.getVersion();
		});

	}

	/**
	* Disconnect from the VPN
	* @returns void
	 */
	public static async disconnect(switching = false) {

		let notify = false;

		// Kill process
		if (this.proc) {
			this.proc.kill();
			notify = true;
		}
		this.proc = null;
		this._isConnecting = false;

		if (switching) return;
		
		// Notify the UI that we are disconnecting
		BrowserWindow.getAllWindows()
			.map(win => win.webContents.send("openvpn", "disconnecting"));
		await Tray.setState("connecting");

		// Await new IP
		IPManager.dropCache();
		await new Promise(resolve => IPManager.once("change", resolve));

		// Set disconnected state
		if (Tray.state !== "disconnected" || notify) Tray.notify("Disconnected from VPN", "Ember VPN • Disconnected", "tray");
		Tray.setState("disconnected");

		const newGeo = await IPManager.fetchGeo();

		// Notify the UI that we are disconnecting
		BrowserWindow.getAllWindows()
			.map(win => {
				win.webContents.send("openvpn", "disconnected");
				win.webContents.send("iplocation", JSON.stringify(newGeo));
			});
		
	}

	/**
	* Connect to the VPN
	* @param server The server to connect to
	* @returns void
	*/
	private static async connect() {

		// Ensure we have a server to connect to
		if (!this.server) throw new Error("Server not set");
		
		// Get binary and config path
		const binary = await getBinary();
		const config = resolve(resources, "ember.ovpn");
		
		// Set connecting state
		await Tray.setState("connecting");
		BrowserWindow.getAllWindows()
			.map(win => win.webContents.send("openvpn", "connecting", this.server?.hash));

		// Check elevation status
		const elevated = await admin.check();
		if (!elevated) throw new Error("You must run Ember VPN as administrator to connect to the VPN");
		
		// Kill existing process
		if (this.proc !== null) this.disconnect(true);
		
		// Spawn openvpn process (should be the same for all platforms)
		return this.proc = spawn(binary, [ "--config", config ], { detached: true });
		
	}

	public static async quickConnect() {

		// Ensure authorization is set
		const auth = Auth.getAuthorization();
		if (!auth) throw new Error("Authorization not set");
		
		BrowserWindow.getAllWindows()
			.map(win => win.webContents.send("openvpn", "will-connect"));
		this._isConnecting = true;
		await Tray.refreshMenu();
		
		// Get servers
		const servers = await fetch("https://api.embervpn.org/v2/ember/servers", {
			headers: { "authorization": auth }
		}).then(res => res.json() as Promise<REST.APIResponse<EmberAPI.Servers>>);

		// Check for errors
		if (!servers || !servers.success) throw new Error("Failed to fetch servers");
		
		// Fetch geolocation
		const geo = await IPManager.fetchGeo();

		// Get the closest server
		const server = this.server = Object.values(servers.servers)
			.sort((a, b) => {
				const distA = calculateDistance(a.location.latitude, a.location.longitude, geo.latitude, geo.longitude);
				const distB = calculateDistance(b.location.latitude, b.location.longitude, geo.latitude, geo.longitude);
				return distA - distB;
			})[0];
		
		// Notify the UI that we are connecting
		BrowserWindow.getAllWindows()
			.map(win => win.webContents.send("openvpn", "will-connect", server.hash));

		// Attempt to connect
		return await this.downloadConfig(server)
			.then(() => this.connect())
			.then(() => this.confirmConnection(server))
			.catch(e => {
				BrowserWindow.getAllWindows()
					.map(win => win.webContents.send("openvpn", "error", server.hash, e.toString()));
				this.disconnect();
			});

	}

	private static _version: string | null = null;
	public static async getVersion(): Promise<string> {
		if (this._version) return this._version;
		const binary = await getBinary();
		return this._version = await new Promise<string>(resolve => {

			// Spawn openvpn process (should be the same for all platforms)
			const proc = spawn(binary, [ "--version" ], { detached: true });
			
			// Listen for data
			proc.stdout.on("data", data => {
				const version = data.toString().split("\n")[0].split(" ")[1];
				resolve(version);
			});

		});
	}

}