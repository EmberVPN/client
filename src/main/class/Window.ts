import { is } from "@electron-toolkit/utils";
import { BrowserWindow, app, shell } from "electron";
import { resolve } from "path";
import { resources } from "..";

export class Window {

	/**
	 * The window instance
	 */
	protected static instance: BrowserWindow | undefined;

	/**
	 * Configure the window
	 * @param options BrowserWindowConstructorOptions
	 * @returns BrowserWindow
	 */
	protected static configure(options?: Electron.BrowserWindowConstructorOptions & { delayed?: boolean }) {

		// Prevent multiple instances
		const isUnlocked = app.requestSingleInstanceLock();
		if (!isUnlocked && this.instance && !this.instance.isDestroyed()) {
			this.instance.show();
			this.instance.focus();
			return this.instance;
		}

		// Prevent multiple instances
		if (this.instance && !this.instance.isDestroyed()) {
			this.instance.show();
			this.instance.focus();
			return this.instance;
		}

		// Create the window
		this.instance = new BrowserWindow({
			icon: resolve(resources, "./assets/icon.png"),
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
			...options,
			show: false,
		});

		// Get a slug from the title
		const hash = this.instance.title
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		// In development load the react app
		if (is.dev && process.env["ELECTRON_RENDERER_URL"]) this.instance.loadURL([
			process.env["ELECTRON_RENDERER_URL"],
			hash
		].join("#"));

		// Otherwise load the index.html file
		else this.instance.loadFile(resolve(__dirname, "../renderer/index.html"), { hash });

		// Prevent the window from being opened multiple times
		app.on("second-instance", () => {
			if (!this.instance) return;
			this.instance.show();
			this.instance.focus();
		});
		
		// Show when ready
		this.instance.once("ready-to-show", () => setTimeout(() => this.instance?.show(), options?.delayed ? 500 : 50));

		// Listen for titlebar events
		this.instance.on("maximize", () => this.instance?.webContents.send("titlebar", "maximize"));
		this.instance.on("unmaximize", () => this.instance?.webContents.send("titlebar", "restore"));

		// Open links in external browser
		this.instance.webContents.setWindowOpenHandler(details => {
			shell.openExternal(details.url);
			return { action: "deny" };
		});

		// Return the window
		return this.instance;

	}

	/**
	 * Check if the window is the current window
	 * @param win BrowserWindow
	 * @returns boolean
	 */
	public static is(win: BrowserWindow) {
		return this.instance?.id === win.id;
	}

	/**
	 * Get the current window
	 * @returns BrowserWindow
	 */
	public static get() {
		return this.instance;
	}

	/**
	 * Close the current window
	 */
	public static close() {
		this.instance?.close();
	}

}
