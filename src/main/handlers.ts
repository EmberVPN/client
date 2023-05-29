import { BrowserWindow, ipcMain } from "electron";
import { inetLatency } from "systeminformation";

// Handle window size requests
ipcMain.handle("window-size", (event, width: number, height: number, resizable?: boolean) => {

	// Get the window that sent the request
	const win = BrowserWindow.fromWebContents(event.sender);
	if (!win) return;

	// Set normal size
	win.setResizable(resizable === true);
	win.setMinimumSize(width, height);

	// Center window around the delta
	const size = win.getSize();
	win.setSize(width, height);
	const dw = size[0] - win.getSize()[0];
	const dh = size[1] - win.getSize()[1];
	const pos = win.getPosition();
	win.setPosition(pos[0] + dw / 2, pos[1] + dh / 2);

});

// Handle titlebar events
ipcMain.on("titlebar", (event, key: string, val?: boolean) => {

	// Get the window that sent the request
	const win = BrowserWindow.fromWebContents(event.sender);
	if (!win) return;

	// Handle events
	if (key === "minimize") win.minimize();
	if (key === "minimizeable" && val !== undefined) win.setMinimizable(val);
	if (key === "restore") win.isMaximized() ? win.restore() : win.maximize();
	if (key === "hide") win.close();

	if (key === "resizeable" && val !== undefined) {
		win.setResizable(val);
		win.setMaximizable(val);
	}

});

// Ping server handler
ipcMain.handle("ping-server", async function(_, server: Ember.Server) {
	return await Promise.race([
		new Promise(resolve => setTimeout(() => resolve(-1), 4000)),
		inetLatency(server.ip)
	]);
});
