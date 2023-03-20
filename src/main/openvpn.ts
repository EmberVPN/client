import { spawnSync } from "child_process";
import { app, BrowserWindow } from "electron";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { join, resolve } from "path";

type State = "connect" | "disconnect";

export default async function openvpn(_event: Electron.IpcMainEvent, state: State, data: string) {

	// Get main window
	const mainWindow = BrowserWindow.getFocusedWindow();
	if (!mainWindow) return;

	if (state === "connect") {

		// Get server
		const { server, session_id }: { server: Ember.Server; session_id: string } = JSON.parse(data);

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

		// Spawn openvpn
		spawnSync("cscript.exe", [ resolve(".bin/connect.vbs"), path ]);

		mainWindow.webContents.send("openvpn", "connected", server.hash);

	}

	if (state === "disconnect") {
		spawnSync("cscript.exe", [ resolve(".bin/disconnect.vbs") ]);
		mainWindow.webContents.send("openvpn", "disconnected");
	}

}