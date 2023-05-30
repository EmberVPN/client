import { is } from "@electron-toolkit/utils";
import { BrowserWindow, app, shell } from "electron";
import { resolve } from "path";
import { resources } from "..";

export class Window {

	// The window
	protected win: BrowserWindow | undefined;

	/**
	 * Create a new window but prevent multiple instances
	 * @param options BrowserWindowConstructorOptions
	 * @returns BrowserWindow
	 */
	public createWindow(options?: Electron.BrowserWindowConstructorOptions) {

		// Prevent multiple instances
		const isUnlocked = app.requestSingleInstanceLock();
		if (!isUnlocked && this.win && !this.win.isDestroyed()) {
			this.win.show();
			this.win.focus();
			return this.win;
		}

		// Prevent multiple instances
		if (this.win && !this.win.isDestroyed()) {
			this.win.show();
			this.win.focus();
			return this.win;
		}

		// Create the window
		this.win = new BrowserWindow({
			icon: resolve(resources, "./assets/icon.png"),
			show: false,
			resizable: false,
			title: "Ember VPN",
			titleBarStyle: "hidden",
			frame: process.platform === "win32",
			width: 600,
			height: 400,
			minWidth: options?.width || 600,
			minHeight: options?.height || 400,
			autoHideMenuBar: true,
			webPreferences: {
				preload: resolve(__dirname, "../preload/index.js"),
				nodeIntegration: true,
				sandbox: false,
				webviewTag: true
			},
			...options
		});

		// Get a slug from the title
		const hash = this.win.title
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		// In development load the react app
		if (is.dev && process.env["ELECTRON_RENDERER_URL"]) this.win.loadURL([
			process.env["ELECTRON_RENDERER_URL"],
			hash
		].join("#"));

		// Otherwise load the index.html file
		else this.win.loadFile(resolve(__dirname, "../renderer/index.html"), { hash });

		// Prevent the window from being opened multiple times
		app.on("second-instance", () => {
			if (!this.win) return;
			this.win.show();
			this.win.focus();
		});

		// and load the index.html of the app.
		this.win.on("ready-to-show", this.win.show);

		// Listen for titlebar events
		this.win.on("maximize", () => this.win?.webContents.send("titlebar", "maximize"));
		this.win.on("unmaximize", () => this.win?.webContents.send("titlebar", "restore"));

		// Open links in external browser
		this.win.webContents.setWindowOpenHandler(details => {
			shell.openExternal(details.url);
			return { action: "deny" };
		});

		// Return the window
		return this.win;

	}

	public is(win: BrowserWindow) {
		return this.win?.id === win.id;
	}

	public get() {
		return this.win;
	}

}
