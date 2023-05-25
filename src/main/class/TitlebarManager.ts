import { BrowserWindow, ipcMain } from "electron";

export class TitlebarManager {

	private unlocked = false;

	constructor(win: BrowserWindow) {

		// Keep the title bar state in sync with the state of the window
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
	
			// Handle events
			if (key === "minimize") win.minimize();
			if (key === "restore") win.isMaximized() ? win.restore() : win.maximize();
			if (key === "hide") win.hide();

			// Set mini window
			if (key === "lock") {
				win.setResizable(false);

				// TODO: OPENVPN DISCONNECT
				
				this.unlocked = false;
			}

			// Set normal window
			if (key === "unlock") {
				win.setResizable(true);
				win.setMinimumSize(600, 400);
				if (!this.unlocked) win.setSize(800, 600);
				this.unlocked = true;
			}

		});

	}

}
