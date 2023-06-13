import { is } from "@electron-toolkit/utils";
import { app } from "electron";
import { resolve } from "path";

// Import state managers
import { Auth } from "./class/Auth";
import "./class/Config";
import "./class/IPManager";
import "./class/KeybindManager";
import "./class/OpenVPN";
import "./class/Tray";

// Handle events from the renderer
import "./handlers";

// Import windows
import { readdir, unlink } from "fs/promises";
import { Authorize } from "./window/Authorize";
import { Main } from "./window/Main";
import "./window/Settings";
import "./window/Update";

// Get app resource path
export const resources = is.dev ? resolve(".") : resolve(app.getPath("exe"), "../resources");

// Configure app
app.setAppUserModelId("org.embervpn.client");
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on("activate", () => Main.open());

// App lifecycle
app.once("ready", async function() {

	// Await for us to know if the user is authorized
	const isAuth = await Auth.isAuthorized();

	// If the user is not authorized, open the login window
	if (!isAuth) return Authorize.open();

	// Open main window
	Main.open();

	// Purge old updaters
	(async function purge() {
		readdir(resources)
			.then(files => files.filter(file => file.startsWith("__purge-")))
			.then(files => files.map(file => resolve(resources, file)))
			.then(files => files.map(file => unlink(file).catch(console.error)));
		app.once("will-quit", purge);
	}());
	
});