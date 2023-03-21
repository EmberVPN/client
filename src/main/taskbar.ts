import { BrowserWindow, ipcMain } from "electron";

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
			win.setSize(600, 440);
			win.setResizable(false);
		}
		
		if (key === "unlock") {
			win.setResizable(true);
			win.setMinimumSize(600, 440);
		}
				
	});

}