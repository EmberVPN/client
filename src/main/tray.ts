import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, Notification, Tray, nativeImage } from "electron";
import { resolve } from "path";
import { resources } from ".";
import * as openvpn from "./openvpn";

export let tray: Tray | null = null;

let exit = () => { };

export let defaults: (MenuItem | MenuItemConstructorOptions)[] = [];
export const settings: (MenuItem | MenuItemConstructorOptions)[] = [];

// Wrap icon as 16x16
export const resizeImage = (name: string, size = 16) => nativeImage.createFromPath(resolve(resources, `./assets/${ name }.png`)).resize({ width: size, height: size });

// Get mainwindow once it loads
export default function(win: BrowserWindow) {
	
	// Initialize the tray
	if (!tray) tray = new Tray(resizeImage("tray"));
	exit = () => process.exit();

	defaults = [ {
		label: "Exit",
		click: exit
	} ];
	
	// Set disconnected state
	tray.setToolTip("Ember VPN");
	tray.setImage(resizeImage("tray"));
	tray.on("click", () => win.show());
	setMenu([ ...defaults ]);
	
}

/** Sets the tray to show its connected to a server */
export function setConnected() {

	if (!tray) return;
	
	tray.setToolTip("Ember VPN • Connected");
	tray.setImage(resizeImage("tray-connected"));
	tray.setContextMenu(Menu.buildFromTemplate([ {
		label: "Disconnect",
		click: () => openvpn.disconnect()
	}, ...defaults ]));
	
}

/** Send native notification balloon */
export function notify(body: string, title = "Ember VPN", icon = resizeImage("icon")) {
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
	tray.setImage(resizeImage("tray"));
	setMenu([ ...defaults ]);
	
}

/** Sets the tray to show its connecting to a server */
export function setConnecting() {
	
	if (!tray) return;

	tray.setToolTip("Ember VPN • Connecting...");
	tray.setImage(resizeImage("tray-pending"));
	setMenu([ ...defaults ]);
	
}

/** @alias setContextMenu */
export function setMenu(menu: (MenuItem | MenuItemConstructorOptions)[]) {
	if (!tray) return;
	tray.setContextMenu(Menu.buildFromTemplate(menu));
}