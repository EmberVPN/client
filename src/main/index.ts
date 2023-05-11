import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { BrowserWindow, app, ipcMain, shell } from "electron";
import Store from "electron-store";
import { join, resolve } from "path";
import attachClient from "./openvpn";
import attachTaskbar from "./taskbar";
import attachTray from "./tray";

export const resources = is.dev ? resolve(".") : resolve(app.getPath("exe"), "../resources");

const store = new Store();

// Handle creation of window
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
	
	// Open links in external browser
	win.webContents.setWindowOpenHandler(details => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// HMR for renderer base on electron-vite cli.
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		win.loadFile(join(__dirname, "../renderer/index.html"));
	}

	app.on("second-instance", function() {
		if (!win) return;
		win.show();
		win.focus();
	});
    
	// and load the index.html of the app.
	win.on("ready-to-show", () => {
		win.show();
	});

	attachTaskbar(win);
	attachTray(win);
	attachClient(win);

	// IPC listener
	ipcMain.on("electron-store-get", async(event, val) => {
		event.returnValue = store.get(val);
	});
	ipcMain.on("electron-store-set", async(event, key, val) => {
		store.set(key, val);
	});
	
}

// Wait for ready
app.whenReady().then(function() {
	
	// Set app user model id for windows
	electronApp.setAppUserModelId("org.embervpn");
	
	// Register shortcuts
	app.on("browser-window-created", (_, window) => {
		
		// Default open or close DevTools by F12 in development
		optimizer.watchWindowShortcuts(window);
		
	});
	
	// Create window
	createWindow();
	
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

});