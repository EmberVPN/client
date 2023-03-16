import { BrowserWindow } from "electron";
import { writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export default async function openvpn(_event: Electron.IpcMainEvent, mode: "connect" | "disconnect", data) {

	const mainWindow = BrowserWindow.getFocusedWindow();
	if (!mainWindow) return;

	if (mode === "connect") {

		const { config } = data;
		await writeFile(join(homedir(), "Desktop", "EMBER.ovpn"), Buffer.from(config, "base64").toString("utf-8"));

		mainWindow.webContents.send("openvpn", "connected");

	}

}