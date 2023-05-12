import { BrowserWindow, ipcMain } from "electron";
import * as tray from "./tray";

let unlocked = false;

// Get mainwindow once it loads
export default function(win: BrowserWindow) {
	
	// Update the UI state when the window is minimized or restored.
	win.on("maximize", () => win.webContents.send("titlebar", "maximize"));
	win.on("unmaximize", () => win.webContents.send("titlebar", "restore"));

	// Set size of window from renderer
	ipcMain.handle("window-size", (_, width: number, height: number) => {
		win.setResizable(false);
		win.setMinimumSize(width, height);
		win.setSize(width, height);
	});
	
	// Listen for titlebar events
	ipcMain.on("titlebar", async(_, key) => {
		
		// Get window
		const win = BrowserWindow.getFocusedWindow();
		if (!win) return;

		// Handle events
		if (key === "minimize") win.minimize();
		if (key === "restore") win.isMaximized() ? win.restore() : win.maximize();
		if (key === "hide") win.hide();
			
		// Set mini window
		if (key === "lock") {
			win.setResizable(false);
			tray.setMenu(tray.defaults);
			unlocked = false;
		}
		
		// Set normal window
		if (key === "unlock") {
			win.setResizable(true);
			win.setMinimumSize(600, 400);
			tray.setMenu([ ...tray.defaults ]);
			if (!unlocked) win.setSize(800, 600);
			unlocked = true;
		}
				
	});

}