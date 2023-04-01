import { exec } from "child_process";
import { ipcMain } from "electron";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { resolve } from "path";
import { resources } from ".";

// Get mainwindow once it loads
export default function() {
	
	// Listen for openvpn events
	ipcMain.on("update", async() => {
		
		if (process.platform !== "win32") throw new Error("Unsupported platform");

		const downloads = await fetch("https://api.embervpn.org/ember/downloads")
			.then(res => res.json() as Promise<REST.ClientDownloads>);
		
		const latest = downloads.latest[process.platform];
		const { download_url } = latest;

		// Download updater
		const updater = await fetch(download_url)
			.then(res => res.arrayBuffer())
			.then(buffer => Buffer.from(buffer))
			.then(buffer => writeFile(resolve(resources, ".bin", "updater.exe"), buffer))
			.then(() => resolve(resources, ".bin", "updater.exe"));
		
		// Run updater withouth waiting
		setTimeout(() => process.exit(0), 1000);
		exec(`cmd /c start ${ updater }`);

	});
	
}