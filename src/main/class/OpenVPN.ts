import admin from "admin-check";
import { ChildProcess, exec, spawn } from "child_process";
import { BrowserWindow, ipcMain } from "electron";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { createServer } from "http";
import os from "os";
import { extname, join, resolve } from "path";
import { SemVer, coerce } from "semver";
import { resources } from "..";
import { calculateDistance } from "../../calculateDistance";
import { Config } from "./Config";
import { EmberAPI } from "./EmberAPI";
import { IPManager } from "./IPManager";
import { OpenSSH } from "./OpenSSH";
import { Tray } from "./Tray";

export class OpenVPN {
	
	// If the manager is currently connecting
	private static _isConnecting = false;

	// The current process
	private static proc: ChildProcess | null = null;

	// The current server
	private static server: Ember.Server | null = null;

	// Manage the openvpn lifecycle
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
	 * @returns Promise<void>
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
		if (Tray.state !== "disconnected") await Tray.setState("connecting");

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
	 * Connect to the VPN configuration thats been downloaded
	 * @returns Promise<void>
	 */
	public static async connect() {

		// Ensure we have a server to connect to
		if (!this.server) throw new Error("Server not set");
		
		// Get binary and config path
		const binary = await this.getBinary(true);
		if (!binary) throw new Error("Failed to get openvpn binary");

		const config = resolve(resources, "__purge-lastconfig.ovpn");
		
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
		return this.proc = spawn(binary, [ "--config", config ]);
		
	}

	/**
	 * Confirm that we are connected to a server
	 * @returns boolean
	 */
	public static isConnecting() {
		return this._isConnecting;
	}

	/**
	 * Connect to the closest/quickest server
	 * @returns Promise<void>
	 */
	public static async quickConnect() {
		
		BrowserWindow.getAllWindows()
			.map(win => win.webContents.send("openvpn", "will-connect"));
		this._isConnecting = true;
		await Tray.refreshMenu();
		
		// Get servers
		const servers = await EmberAPI.fetch("/v2/ember/servers");
		
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

	/** 
	 * Get the current version of OpenVPN
	 * @returns Promise<SemVer | null>
	 */
	public static async getVersion() {

		// Get binary
		const binary = await this.getBinary(false);
		if (!binary) return null;

		return await new Promise<SemVer | null>((resolve, reject) => {

			// Spawn openvpn process (should be the same for all platforms)
			const proc = spawn(binary, [ "--version" ], { detached: true });

			// Listen for data
			proc.stdout.on("data", data => {
				const raw = data.toString().split("\n")[0].split(" ")[1];
				const ver = coerce(raw);
				if (ver) resolve(ver);
				else reject("Failed to parse version");
			});

			// On error
			proc.on("error", reject);

		});

	}

	/**
	 * Download a client configuration file
	 * @param server The server to download the config for
	 * @returns Promise<void>
	 */
	public static async downloadConfig(server: Ember.Server) {
		this._isConnecting = true;
		await Tray.refreshMenu();

		// Get ed25519 key
		const ed25519 = Config.get("settings.openvpn.protocol") === "SSH" ? await OpenSSH.generateKeyPair() : undefined;

		const port = await (async function findPort() {
			
			// Get a random port
			const port = Math.floor(Math.random() * (65535 - 1024) + 1024);

			// Check if the port is in use
			const inUse = await new Promise<boolean>(resolve => {
				const server = createServer();
				server.listen(port, () => {
					server.close(() => resolve(false));
				}).on("error", () => resolve(true));
			});

			// If the port is in use, try again
			if (inUse) return findPort();

			// Otherwise return the port
			return port;

		}());
		
		// Download config
		const data = await EmberAPI.fetch("/v2/rsa/download-client-config", {
			method: "POST",
			body: JSON.stringify({
				hash: server.hash,
				ed25519,
				proto: ed25519 ? "SSH" : Config.get("settings.openvpn.protocol"),
				port
			})
		});
		
		// Write config file
		const path = resolve(resources, "__purge-lastconfig.ovpn");
		await writeFile(path, Buffer.from(data.config, "base64").toString("utf-8"));
		
		if (ed25519) {
			await OpenSSH.connect(server, port);
			await new Promise(resolve => setTimeout(resolve, 1000));
		}

	}

	/**
	 * Confirm that we are connected to a server
	 * @param server The server to confirm connection for
	 * @returns Promise<void>
	 */
	public static async confirmConnection(server: Ember.Server) {
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
		this.proc.stdout?.on("data", async data => {
			const line = data.toString().trim();

			console.log("[OpenVPN]", line);
			
			if (line.includes("ERROR:")) {
				this.proc?.emit("error", new Error(line.split("ERROR:")[1].trim()));
				return;
			}

			// Error on connection failed
			if (line.includes("Restart pause, 2")) {
				this.proc?.emit("error", new Error("Connection failed"));
				return;
			}

			// If we are connected
			if (line.includes("Initialization Sequence Completed")) {

				// Set connected
				await Tray.setState("connected");
				Tray.notify(`New IP: ${ server.ip }`);
				BrowserWindow.getAllWindows()
					.map(win => win.webContents.send("openvpn", "connected", server.hash));
				
			}

			BrowserWindow.getAllWindows()
				.map(win => win.webContents.send("openvpn", "log", server.hash, line));
		});
		
	}

	/**
	 * Locate the OpenVPN binary
	 * @returns Promise<string | null>
	 */
	public static async getBinary(installIfMissing = true): Promise<string | null> {

		// Check platform
		if (process.platform === "win32") {
		
			// Check if openvpn is on path
			const path = process.env.Path?.split(";").find(path => existsSync(resolve(path, "openvpn.exe")));
			if (path) return resolve(path, "openvpn.exe");

			// Check default location
			const defaultLocation = resolve(process.env.ProgramFiles || "C:\\Program Files", "OpenVPN/bin/openvpn.exe");
			if (existsSync(defaultLocation)) return defaultLocation;
		
			if (installIfMissing) {
				
				// Install OpenVPN
				await this.update();
				
				// Return bundled location
				return await this.getBinary();

			} else return null;

		}
	
		// Throw an error if the platform is not supported *yet*
		throw new Error("Unsupported platform");

	}

	/**
	 * Install the latest version of OpenVPN
	 * @returns Promise<void>
	 */
	public static async update() {

		// Check platform
		if (process.platform === "win32") {

			// Get architecture
			const arch = [ "ppc64", "x64", "s390x" ].includes(os.arch()) ? "amd64" : os.arch() === "arm64" ? "arm64" : "x86";
			
			// Get latest version from API
			const downloads = await EmberAPI.fetch("/v3/ember/downloads")
				.then(res => res.dependencies["openvpn"].assets[process.platform]);
			
			if (!downloads) throw new Error("Failed to fetch downloads links");

			// Get download link
			const download = downloads.find(download => download.includes(arch));
			if (!download) throw new Error("Failed to find a download for this platform/architecture");
			
			const savePath = join(resources, "__purge-openvpn" + extname(download));
			
			// Download installer
			await fetch(download)
				.then(res => res.arrayBuffer())
				.then(buffer => writeFile(savePath, Buffer.from(buffer)));

			// Install openvpn
			return await new Promise(resolve => exec(`msiexec /i "${ savePath }" ADDLOCAL=OpenVPN.Service,Drivers.OvpnDco,OpenVPN,Drivers,Drivers.TAPWindows6,Drivers.Wintun /passive`, resolve));

		}

		// Throw an error if the platform is not supported *yet*
		throw new Error("Unsupported platform");

	}

}