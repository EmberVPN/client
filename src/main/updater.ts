import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { join } from "path";

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

			const [ path, binary ] = await Promise.all([
				dialog.showSaveDialog({
					defaultPath: join(app.getPath("downloads"), version.name),
					buttonLabel: "Save",
					properties: [ "createDirectory" ]
				}).then(({ filePath }) => filePath),
				fetch(version.download_url)
					.then(res => res.arrayBuffer())
					.then(buf => Buffer.from(buf))
			]);

			try {
				if (!path) throw new Error("No path selected");
				await writeFile(path, binary);
				win.webContents.send("updater", "done");
			} catch (e) {
				win.webContents.send("updater", "error", e);
			}
			
		}

	});
}