import { is } from "@electron-toolkit/utils";
import { app } from "electron";
import { resolve } from "path";
import { AuthMan } from "./class/AuthMan";
import "./class/Config";
import { IPManager } from "./class/IPManager";
import { OpenVPNManager } from "./class/OpenVPNManager";
import { TrayManager } from "./class/TrayManager";
import "./handlers";
import { Authorize } from "./window/Authorize";
import { Main } from "./window/Main";
import "./window/Settings";
import "./window/Update";

// Export app state managers
export const Tray = new TrayManager;
export const OpenVPN = new OpenVPNManager;
export const IPv4 = new IPManager;

// Get app resource path
export const resources = is.dev ? resolve(".") : resolve(app.getPath("exe"), "../resources");

// Configure app
app.setAppUserModelId("org.embervpn.client");
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on("activate", () => Main.open());

app.once("ready", async function() {

	// Await for us to know if the user is authorized
	const isAuth = await AuthMan.isAuthorized();

	// If the user is not authorized, open the login window
	if (!isAuth) return Authorize.open();

	// Open main window
	Main.open();
	
});