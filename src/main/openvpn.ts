import { ChildProcessWithoutNullStreams, spawn, spawnSync } from "child_process";
import { app, BrowserWindow, Menu, Tray } from "electron";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { join, resolve } from "path";

type State = "connect" | "disconnect";

export let ovpn: ChildProcessWithoutNullStreams | null = null;
export let tray: Tray | null = null;

export default async function openvpn(_event: Electron.IpcMainEvent | null, state: State, data?: string) {
	
	// Get main window
	const mainWindow = BrowserWindow.getFocusedWindow();
	if (!mainWindow) return;
	
	if (state === "connect") {

		ovpn?.kill("SIGINT");

		if (!tray) {
			tray = new Tray(resolve("./src/renderer/assets/tray.png"));
		}

		tray.setToolTip("Ember VPN");
		tray.on("click", mainWindow.show.bind(mainWindow));
		tray.setContextMenu(Menu.buildFromTemplate([ {
			label: "Exit",
			click: () => mainWindow.close()
		} ]));
		
		// Get server
		const { server, session_id }: { server: Ember.Server; session_id: string } = JSON.parse(data || "{}");

		const resp = await fetch(`https://api.embervpn.org/rsa/download-client-config?server=${ server.hash }`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": session_id
			}
		}).then(res => res.json() as Promise<{ success: boolean, config: string }>);
		const { success, config } = resp;

		// Check for errors
		if (!success) return mainWindow.webContents.send("openvpn", "error", server.hash, "Could not initialize connection...");
		
		// Write config file
		const path = join(app.getPath("temp"), "EMBER.ovpn");
		await writeFile(path, Buffer.from(config, "base64").toString("utf-8"));

		// If windows
		if (process.platform === "win32") {
			
			// Prod binarys
			const isDev = process.env.NODE_ENV_ELECTRON_VITE === "development";
			const bin = isDev ? resolve("C:\\Program Files\\OpenVPN\\bin\\openvpn.exe") : join(resolve(app.getPath("exe"), "../resources/app.asar.unpacked"), ".bin/bin/openvpn.exe");
			const exe = resolve(app.getPath("exe"), "../resources/app.asar.unpacked");

			// If openvpn isnt installed
			if (!existsSync(bin) && !isDev) {

				// Begin installation
				spawnSync([
					"msiexec",
					"/i",
					`"${ resolve(exe, ".bin/installer.msi") }"`,
					`PRODUCTDIR="${ join(exe, ".bin") }"`,
					"ADDLOCAL=OpenVPN.Service,Drivers.OvpnDco,OpenVPN,Drivers,Drivers.TAPWindows6,Drivers.Wintun",
					"/passive",
					"/l*v",
					join(exe, ".bin/installer.log")
				].join(" "), {
					shell: true,
				});

			}

			// Spawn openvpn
			ovpn = spawn(bin, [ "--config", path ], {
				detached: true,
			});

			tray.setContextMenu(Menu.buildFromTemplate([ {
				label: "Exit",
				click: () => mainWindow.close()
			}, {
				label: "Disconnect",
				click: () => ovpn?.kill("SIGINT")
			} ]));
				
			tray.displayBalloon({
				title: "Ember VPN",
				content: `Connected to ${ server.hostname } (${ server.ip })`,
				icon: resolve("./src/renderer/assets/balloon.png")
			});

			mainWindow.webContents.send("openvpn", "connected", server.hash);
			
		} else {
			
			// Spawn openvpn
			ovpn = spawn("openvpn", [ "--config", path ], {
				detached: true,
			});

		}

		// Handle openvpn output
		ovpn?.stdout.on("data", data => {
			console.log(data.toString());
		});

		// Handle openvpn errors
		ovpn?.stderr.on("error", data => {
			mainWindow.webContents.send("openvpn", "disconnected");
			mainWindow.webContents.send("openvpn", "error", server.hash, data.toString());
		});
		
		// Handle openvpn exit
		ovpn?.on("exit", code => {
			mainWindow.webContents.send("openvpn", "disconnected");
			console.log(`OpenVPN exited with code ${ code }`);
		});

		// Send connected event
		mainWindow.webContents.send("openvpn", "connected", server.hash);

	}

	if (state === "disconnect") {
		ovpn?.kill("SIGINT");
		tray?.destroy();
	}

}