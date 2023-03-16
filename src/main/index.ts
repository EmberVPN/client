import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { join } from "path";
import icon from "../../build/icon.png?asset";
import openvpn from "./openvpn";

function createWindow(): void {

	// Create the browser window.
	const mainWindow = new BrowserWindow({
		icon,
		show: false,
		resizable: false,
		title: "Ember Client",
		titleBarStyle: "hidden",
		width: 600,
		height: 440,
		minWidth: 600,
		minHeight: 440,
		autoHideMenuBar: true,
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			nodeIntegration: true,
			sandbox: false
		}
	});

	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
	});
	
	mainWindow.on("maximize", () => mainWindow.webContents.send("titlebar", "maximize"));
	mainWindow.on("unmaximize", () => mainWindow.webContents.send("titlebar", "restore"));

	mainWindow.webContents.setWindowOpenHandler(details => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

	// Set app user model id for windows
	electronApp.setAppUserModelId("org.embervpn");

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	createWindow();

	app.on("activate", function() {

		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});

	ipcMain.on("titlebar", async(_, key) => {
		
		const win = BrowserWindow.getFocusedWindow();
		if (!win) return;

		if (key === "minimize") win.minimize();
		if (key === "restore") win.isMaximized() ? win.restore() : win.maximize();
		if (key === "close") win.close();
			
		if (key === "lock") {
			win.setSize(600, 440);
			win.setResizable(false);
		}
		
		if (key === "unlock") {
			win.setResizable(true);
			win.setMinimumSize(600, 440);
		}
				
	});

	ipcMain.on("openvpn", openvpn);
	
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
