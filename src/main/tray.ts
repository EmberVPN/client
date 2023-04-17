import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, Notification, Tray } from "electron";
import { resolve } from "path";
import { resources } from ".";
import * as openvpn from "./openvpn";

export let tray: Tray | null = null;

let exit = () => { };

export let defaults: (MenuItem | MenuItemConstructorOptions)[] = [];
export let settings: (MenuItem | MenuItemConstructorOptions)[] = [];

// Get mainwindow once it loads
export default function(win: BrowserWindow) {
	
	// Initialize the tray
	if (!tray) tray = new Tray(resolve(resources, "./assets/tray.png"));
	exit = () => win.close();

	defaults = [ {
		label: "Exit",
		click: exit
	} ];
	
	settings = [ {
		label: "Settings",
		click: () => {
			win.show();
			win.webContents.send("settings", "open");
		}
	},
	{ type: "separator" } ];
	
	// Set disconnected state
	tray.setToolTip("Ember VPN");
	tray.setImage(resolve(resources, "./assets/tray.png"));
	tray.on("click", () => win.show());
	setMenu([ ...settings, ...defaults ]);
	
}

/** Sets the tray to show its connected to a server */
export function setConnected() {

	if (!tray) return;
	
	tray.setToolTip("Ember VPN • Connected");
	tray.setImage(resolve(resources, "./assets/tray-connected.png"));
	tray.setContextMenu(Menu.buildFromTemplate([ {
		label: "Disconnect",
		click: () => openvpn.disconnect()
	}, ...defaults ]));
	
}

/** Send native notification balloon */
export function notify(body: string, title = "Ember VPN", icon = resolve(resources, "./assets/icon.png")) {
	new Notification({
		body,
		title,
		icon
	}).show();
}

/** Sets the tray to show its disconnected from a server */
export function disconnect() {
	
	if (!tray) return;

	tray.setToolTip("Ember VPN");
	tray.setImage(resolve(resources, "./assets/tray.png"));
	setMenu([ ...settings, ...defaults ]);
	
}

/** Sets the tray to show its connecting to a server */
export function setConnecting() {
	
	if (!tray) return;

	tray.setToolTip("Ember VPN • Connecting...");
	tray.setImage(resolve(resources, "./assets/tray-pending.png"));
	setMenu([ ...settings, ...defaults ]);
	
}

/** @alias setContextMenu */
export function setMenu(menu: (MenuItem | MenuItemConstructorOptions)[]) {
	if (!tray) return;
	tray.setContextMenu(Menu.buildFromTemplate(menu));
}