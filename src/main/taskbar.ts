import { BrowserWindow, ipcMain } from "electron";
import * as tray from "./tray";

let isLocked = true;

// Get mainwindow once it loads
export default function(win: BrowserWindow) {
	
	// Update the UI state when the window is minimized or restored.
	win.on("maximize", () => win.webContents.send("titlebar", "maximize"));
	win.on("unmaximize", () => win.webContents.send("titlebar", "restore"));
	
	// Listen for titlebar events
	ipcMain.on("titlebar", async(_, key) => {
		
		const win = BrowserWindow.getFocusedWindow();
		if (!win) return;

		if (key === "minimize") win.minimize();
		if (key === "restore") win.isMaximized() ? win.restore() : win.maximize();
		if (key === "hide") win.hide();
			
		if (key === "lock") {
			if (isLocked) return;
			win.setSize(600, 400);
			win.setResizable(false);
			win.center();
			isLocked = true;
			tray.setMenu(tray.defaults);
		}
		
		if (key === "unlock") {
			if (!isLocked) return;
			win.setResizable(true);
			win.setMinimumSize(600, 400);
			win.setSize(800, 600);
			win.center();
			isLocked = false;
			tray.setMenu([ ...tray.settings, ...tray.defaults ]);
		}
				
	});

}