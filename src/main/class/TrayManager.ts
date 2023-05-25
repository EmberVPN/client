import { BrowserWindow, Menu, Notification, Tray, nativeImage } from "electron";
import { resolve } from "path";
import { ovpn, resources } from "..";

export class TrayManager {

	// Initialize the actual tray
	private tray: Tray;

	// Initialize the tray state
	private state: "connected" | "disconnected" | "connecting" = "disconnected";

	// Initialize the tray tooltip
	private tooltip = "Ember VPN";

	// Initialize the tray images
	private imagesByState = {
		"connected": "tray-connected",
		"disconnected": "tray",
		"connecting": "tray-pending"
	} satisfies Record<typeof this.state, string>;

	// Initialize the tray menu
	private menu: Record<string, Electron.MenuItemConstructorOptions> = {};

	// Takes a name and optional size and returns a resized image for the tray
	private resizeImage(name: string, size = 16) {
		return nativeImage.createFromPath(resolve(resources, `./assets/${ name }.png`)).resize({ width: size, height: size });
	}

	// Sets the tray menu
	private setMenu(menu: Electron.MenuItemConstructorOptions[]) {
		this.tray.setContextMenu(Menu.buildFromTemplate(menu));
	}

	// Pushes a menu item to the tray menu
	private pushMenuItem(item: Electron.MenuItemConstructorOptions) {

		// Get the item label
		const label = item.label || JSON.stringify(item);

		// Add the item to the menu
		this.menu[label] = item;

		// Set the menu
		this.setMenu(Object.values(this.menu));

	}

	// Removes a menu item from the tray menu
	private removeMenuItem(item: string | Electron.MenuItemConstructorOptions) {
		if (typeof item === "string") delete this.menu[item];
		else delete this.menu[JSON.stringify(item)];
		this.setMenu(Object.values(this.menu));
	}

	constructor(win: BrowserWindow) {

		// Initialize the tray
		this.tray = new Tray(this.resizeImage("tray"));

		// Open the window when the tray is clicked
		this.tray.on("click", () => win.show());

		// Set the default state
		this.setState(this.state);

		// Add context menu
		this.pushMenuItem({
			label: "Exit",
			click: () => process.exit()
		});

	}

	private setToolTip(tooltip?: string) {
		this.tooltip = tooltip ? `Ember VPN • ${ tooltip }` : "Ember VPN";
		this.tray.setToolTip(this.tooltip);
	}

	public setState(state: typeof this.state) {

		// Set the state
		this.state = state;

		// Set the tray image
		this.tray.setImage(this.resizeImage(this.imagesByState[this.state]));

		// Set tooltip
		this.setToolTip(this.state.replace(/^\w/, c => c.toUpperCase()));

		// Add the disconnect button if we're connected
		this.removeMenuItem("Disconnect");
		if (this.state === "connected") this.pushMenuItem({
			label: "Disconnect",
			click: () => ovpn.disconnect()
		});

	}

	public notify(body: string, title = this.tooltip, icon = this.imagesByState[this.state]) {
		new Notification({
			body,
			title,
			icon: this.resizeImage(icon, 256)
		}).show();
	}

}