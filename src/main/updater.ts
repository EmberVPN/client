import { spawn } from "child_process";
import { app, BrowserWindow, ipcMain } from "electron";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { basename, resolve } from "path";
import { resources } from ".";

export type State = "begin";

// Get mainwindow once it loads
export default function(win: BrowserWindow) {
	
	// Listen for openvpn events
	ipcMain.on("updater", async(_, state: State) => {

		// Set connect state
		if (state === "begin") {

			// Get latest version
			const { latest } = await fetch("https://api.embervpn.org/ember/downloads")
				.then(res => res.json() as Promise<REST.ClientDownloads>);
			const version = latest[process.platform];

			const path = resolve(resources, `.bin/updater-${ version }.exe`);
			if (!existsSync(path)) {
				await fetch(version.download_url)
					.then(res => res.arrayBuffer())
					.then(buf => Buffer.from(buf))
					.then(buf => writeFile(path, buf));
			}

			try {

				// Launch binary
				const child = spawn("cmd", [ "/c", "start", path ], {
					stdio: "ignore",
					detached: true
				});

				child.unref();
				child.once("spawn", () => spawn("cmd", [ "/c", "taskkill", "/f", "/im", basename(app.getPath("exe")) ])
					.once("spawn", () => app.quit()));

			} catch (e) {
				win.webContents.send("updater", "error", e);
			}
			
		}

	});
}