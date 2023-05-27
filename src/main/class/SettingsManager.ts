import { BrowserWindow, ipcMain } from "electron";
import { createWindow } from "..";

export default class SettingsManager {

	private isOpen = false;
	private win: BrowserWindow | undefined;

	constructor(win: BrowserWindow) {

		// Observe for control comma
		win.webContents.on("before-input-event", (event, input) => {
			if (!input.control || input.key !== ",") return;
			event.preventDefault();
			this.open();
		});

		// Observe for menu click
		ipcMain.on("open-settings", () => this.open());

	}
	
	/**
	 * Open the settings window
	 * @returns void
	 */
	public open(): void {

		// Prevent multiple instances
		if (this.isOpen && this.win) return this.win.focus();
		
		this.win = createWindow("settings") || undefined;
		if (!this.win) return;

		// Prevent multiple instances
		this.isOpen = true;
		this.win.on("closed", () => this.isOpen = false);

	}

}