import { BrowserWindow, ipcMain } from "electron";
import { ovpn } from "..";

export class TitlebarManager {

	private unlocked = false;

	constructor(mainWindow: BrowserWindow) {

		// Keep the title bar state in sync with the state of the window
		mainWindow.on("maximize", () => mainWindow.webContents.send("titlebar", "maximize"));
		mainWindow.on("unmaximize", () => mainWindow.webContents.send("titlebar", "restore"));

		// Set size of window from renderer
		ipcMain.handle("window-size", (_, width: number, height: number) => {

			const win = BrowserWindow.getFocusedWindow();
			if (!win) return;
			
			const size = win.getSize();
			const dw = size[0] - width;
			const dh = size[1] - height;
			const pos = win.getPosition();
			win.setPosition(pos[0] + dw / 2, pos[1] + dh / 2);

			win.setResizable(false);
			win.setMinimumSize(width, height);
			win.setSize(width, height);
		});

		// Listen for titlebar events
		ipcMain.on("titlebar", async(_, key: string, val?: boolean) => {
			
			const win = BrowserWindow.getFocusedWindow() || mainWindow;
	
			// Handle events
			if (key === "minimize") win.minimize();
			if (key === "restore") win.isMaximized() ? win.restore() : win.maximize();
			if (key === "hide") {
				win.hide();
				if (win.id !== mainWindow.id) win.close();
			}

			// Set mini window
			if (key === "lock") {
				mainWindow.setResizable(false);
				
				// Iterate through all windows and close all but the main window
				BrowserWindow.getAllWindows()
					.filter(window => window.id !== mainWindow.id)
					.map(window => window.close());

				ovpn.disconnect();
				this.unlocked = false;
			}

			// Set normal window
			if (key === "unlock") {
				mainWindow.setResizable(true);
				mainWindow.setMinimumSize(600, 400);
				const size = mainWindow.getSize();
				if (!this.unlocked) mainWindow.setSize(800, 600);
				const dw = size[0] - 800;
				const dh = size[1] - 600;
				const pos = mainWindow.getPosition();
				mainWindow.setPosition(pos[0] + dw / 2, pos[1] + dh / 2);

				this.unlocked = true;
			}

			if (key === "resizeable" && val !== undefined) {
				win.setResizable(val);
			}
			
			if (key === "minimizeable" && val !== undefined) {
				win.setMinimizable(val);
			}

		});

	}

}