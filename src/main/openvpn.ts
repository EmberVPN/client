import { BrowserWindow } from "electron";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { homedir } from "os";
import { join } from "path";

export default async function openvpn(_event: Electron.IpcMainEvent, mode: "connect" | "disconnect", data) {

	const mainWindow = BrowserWindow.getFocusedWindow();
	if (!mainWindow) return;

	if (mode === "connect") {

		const server: Ember.Server & { id: string, session_id: string } = JSON.parse(data);

		console.log(server)
		
		// Download config file
		// const resp = await fetch(`${process.env.NODE_ENV === "production" ? "https://api.embervpn.org" : "http://10.16.70.10:80/api"}/rsa/download-client-config?server=${server.id}`, {
		// const resp = await fetch(`http://10.16.70.10:80/api/rsa/download-client-config?server=${server.id}`, {
		const resp = await fetch(`https://api.embervpn.org/rsa/download-client-config?server=${server.id}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": server.session_id
			}
		}).then(res => res.json() as Promise<{ success: boolean, config: string }>);
		const { success, config } = resp;

		if (!success) {
			console.error(resp);
			return mainWindow.webContents.send("openvpn", "error", "Failed to download config file");
		}
		
		// Write config file
		await writeFile(join(homedir(), "OpenVPN", "config", "EMBER.ovpn"), Buffer.from(config, "base64").toString("utf-8"));
		mainWindow.webContents.send("openvpn", "connected");

	}

}