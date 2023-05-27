import { electronApp, is } from "@electron-toolkit/utils";
import AutoLaunch from "auto-launch";
import { BrowserWindow, app, shell } from "electron";
import { join, resolve } from "path";
import { IPManager } from "./class/IPManager";
import { OpenVPNManager } from "./class/OpenVPNManager";
import { TitlebarManager } from "./class/TitlebarManager";
import { TrayManager } from "./class/TrayManager";

// Get app resource path
export const resources = is.dev ? resolve(".") : resolve(app.getPath("exe"), "../resources");

// Export app state managers
export let tray: TrayManager;
export let ovpn: OpenVPNManager;
export let tbar: TitlebarManager;
export let ipvm: IPManager;

/**
 * Create the main window
 * @returns void
 */
function createWindow(): void {

	// Create the browser window.
	const win = new BrowserWindow({
		icon: resolve(resources, "./assets/icon.png"),
		show: false,
		resizable: false,
		title: "Ember VPN",
		titleBarStyle: "hidden",
		frame: process.platform === "win32",
		width: 600,
		height: 400,
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

	// Prevent multiple instances
	const isUnlocked = app.requestSingleInstanceLock();
	if (!isUnlocked && !is.dev) return app.quit();
	app.on("second-instance", function() {
		if (!win) return;
		win.show();
		win.focus();
	});
	
	// Open links in external browser
	win.webContents.setWindowOpenHandler(details => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// In development load the react app
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
		
	// Otherwise load the index.html file
	else win.loadFile(join(__dirname, "../renderer/index.html"));
    
	// and load the index.html of the app.
	win.on("ready-to-show", win.show);

	// Initialize state managers
	tray = new TrayManager(win);
	tbar = new TitlebarManager(win);
	ovpn = new OpenVPNManager(win);
	ipvm = new IPManager(win);
	
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
	.then(createWindow);

