import { electronApp, is } from "@electron-toolkit/utils";
import AutoLaunch from "auto-launch";
import { BrowserWindow, app, shell } from "electron";
import { join, resolve } from "path";
import { IPManager } from "./class/IPManager";
import { OpenVPNManager } from "./class/OpenVPNManager";
import SettingsManager from "./class/SettingsManager";
import { TitlebarManager } from "./class/TitlebarManager";
import { TrayManager } from "./class/TrayManager";
import UpdateManager from "./class/UpdateManager";

// Get app resource path
export const resources = is.dev ? resolve(".") : resolve(app.getPath("exe"), "../resources");

// Export app state managers
export let tray: TrayManager;
export let ovpn: OpenVPNManager;
export let tbar: TitlebarManager;
export let ipvm: IPManager;
export let setm: SettingsManager;
export let updateManager: UpdateManager;

/**
 * Create the main window
 * @returns void
 */
export function createWindow(subWindow?: string) {

	// Create the browser window.
	const win = new BrowserWindow({
		icon: resolve(resources, "./assets/icon.png"),
		show: false,
		resizable: false,
		title: subWindow ? `${ subWindow } - Ember VPN` : "Ember VPN",
		titleBarStyle: "hidden",
		frame: process.platform === "win32",
		width: subWindow ? 512 : 600,
		height: subWindow ? 128 : 400,
		minWidth: 600,
		minHeight: 400,
		autoHideMenuBar: true,
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			nodeIntegration: true,
			sandbox: false,
			webviewTag: true
		}
	});
	
	// Open links in external browser
	win.webContents.setWindowOpenHandler(details => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// In development load the react app
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) win.loadURL(process.env["ELECTRON_RENDERER_URL"] + (subWindow ? `#${ subWindow }` : ""));
		
	// Otherwise load the index.html file
	else win.loadFile(join(__dirname, "../renderer/index.html"), { hash: subWindow || undefined });
    
	// and load the index.html of the app.
	win.on("ready-to-show", win.show);

	if (subWindow) return win;

	// Prevent multiple instances
	const isUnlocked = app.requestSingleInstanceLock();
	if (!isUnlocked && !is.dev) app.quit();
	app.on("second-instance", function() {
		if (!win) return;
		win.show();
		win.focus();
	});

	// Initialize state managers
	tray = new TrayManager(win);
	tbar = new TitlebarManager(win);
	ovpn = new OpenVPNManager(win);
	ipvm = new IPManager(win);
	setm = new SettingsManager(win);
	updateManager = new UpdateManager(win);
	return win;
	
}

// Request start on boot
new AutoLaunch({
	name: "Ember VPN",
	path: process.execPath,
}).enable();

// When the app loads, create the window
app.whenReady()
	.then(function() {
	
		// Set app user model id for windows
		electronApp.setAppUserModelId("org.embervpn");
	
		// macOS: Re-create window when dock icon is clicked and there are no other windows open.
		app.on("activate", function() {
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});
	
		// Quit when all windows are closed.
		app.on("window-all-closed", () => {
			if (process.platform !== "darwin") {
				app.quit();
			}
		});

	})

	// Create the window
	.then(() => createWindow());

