import { BrowserWindow, Menu, Tray } from "electron";
import { resolve } from "path";
import { resources } from ".";
import * as openvpn from "./openvpn";

export let tray: Tray | null = null;

let exit = () => {};

// Get mainwindow once it loads
export default function(win: BrowserWindow) {
	
	// Initialize the tray
	if (!tray) tray = new Tray(resolve(resources, "./src/renderer/assets/tray.png"));
	exit = () => win.close();
	
	// Set disconnected state
	tray.setToolTip("Ember VPN");
	tray.setImage(resolve(resources, "./src/renderer/assets/tray.png"));
	tray.on("click", () => win.show());
	tray.setContextMenu(Menu.buildFromTemplate([ {
		label: "Exit",
		click: exit
	} ]));
	
}

/** Sets the tray to show its connected to a server */
export function setConnected(content: string) {

	if (!tray) return;
	
	tray.setToolTip("Ember VPN • Connected");
	tray.setImage(resolve(resources, "./src/renderer/assets/tray-connected.png"));
	tray.setContextMenu(Menu.buildFromTemplate([ {
		label: "Exit & Disconnect",
		click: exit
	}, {
		label: "Disconnect",
		click: () => openvpn.disconnect()
	} ]));
	
	tray.displayBalloon({
		content,
		title: "Ember VPN",
		icon: resolve(resources, "./src/renderer/assets/ember.png")
	});
	
}

/** Sets the tray to show its disconnected from a server */
export function disconnect() {
	
	if (!tray) return;

	tray.setToolTip("Ember VPN");
	tray.setImage(resolve(resources, "./src/renderer/assets/tray.png"));
	tray.setContextMenu(Menu.buildFromTemplate([ {
		label: "Exit",
		click: exit
	} ]));
	
}

/** Sets the tray to show its connecting to a server */
export function setConnecting() {
	
	if (!tray) return;

	tray.setToolTip("Ember VPN • Connecting...");
	tray.setImage(resolve(resources, "./src/renderer/assets/tray-connecting.png"));
	tray.setContextMenu(Menu.buildFromTemplate([ {
		label: "Exit",
		click: exit
	} ]));
	
}