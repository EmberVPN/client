import { Menu, Notification, Tray, app, ipcMain, nativeImage } from "electron";
import { resolve } from "path";
import { OpenVPN, resources } from "..";
import { Main } from "../window/Main";
import { Settings } from "../window/Settings";
import { Update } from "../window/Update";

export class TrayManager {

	// Initialize the actual tray
	private tray?: Tray;

	// Initialize the tray state
	private _state: "connected" | "disconnected" | "connecting" = "disconnected";

	private authorization: string | null = null;

	get state() {
		return this._state;
	}

	// Initialize the tray tooltip
	private tooltip = "Ember VPN";

	// Initialize the tray images
	private imagesByState = {
		"connected": "tray-connected",
		"disconnected": "tray",
		"connecting": "tray-pending"
	} satisfies Record<typeof this._state, string>;

	// Initialize the tray menu
	private menu: Record<string, Electron.MenuItemConstructorOptions> = {};

	// Takes a name and optional size and returns a resized image for the tray
	private resizeImage(name: string, size = 16) {
		return nativeImage.createFromPath(resolve(resources, `./assets/${ name }.png`)).resize({ width: size, height: size });
	}

	// Sets the tray menu
	private setMenu(menu: Electron.MenuItemConstructorOptions[]) {
		this.tray?.setContextMenu(Menu.buildFromTemplate(menu));
	}

	// Pushes a menu item to the tray menu
	private pushMenuItem(item: Electron.MenuItemConstructorOptions) {

		// Get the item label
		const label = item.label || JSON.stringify(item);

		// Add the item to the menu
		this.menu[label] = item;

		// Set the menu
		this.setMenu(Object.values(this.menu).reverse());

	}

	// Removes a menu item from the tray menu
	private removeMenuItem(item: string | Electron.MenuItemConstructorOptions) {
		if (typeof item === "string") delete this.menu[item];
		else delete this.menu[JSON.stringify(item)];
		this.setMenu(Object.values(this.menu));
	}

	constructor() {
		
		// Request single instance lock before the app init
		const isUnlocked = app.requestSingleInstanceLock();
		if (!isUnlocked) app.quit();
			
		// Await app ready, then create the tray
		else app.once("ready", () => {

			// Initialize the tray
			this.tray = new Tray(this.resizeImage("tray"));

			// Open the window when the tray is clicked
			this.tray.on("click", () => Main.get()?.show());

			// Set the default state
			this.setState(this._state);
			this.refreshMenu();

			// Handle authorization token changes
			ipcMain.on("authorization", (_, authorization: string) => {
				this.authorization = authorization;
				this.refreshMenu();
				if (!authorization) this.setState("disconnected");
			});
			
		});
	}

	private setToolTip(tooltip?: string) {
		this.tooltip = tooltip ? `Ember VPN • ${ tooltip }` : "Ember VPN";
		this.tray?.setToolTip(this.tooltip);
	}

	public refreshMenu() {

		const label = [ "Ember VPN", `v${ app.getVersion() }` ].join(Array(8).fill(" ").join(""));

		// Reset the tray menu
		this.removeMenuItem("Disconnect");
		this.removeMenuItem("Quick Connect");
		this.removeMenuItem("Settings");
		this.removeMenuItem("settings-sep");
		this.removeMenuItem(label);
		this.removeMenuItem("title-sep");
		this.removeMenuItem("Exit");
		this.removeMenuItem("Check for Updates");
		this.removeMenuItem("update-sep");

		// Add context menu
		this.pushMenuItem({
			label: "Exit",
			role: "quit",
			click: () => process.exit()
		});

		this.pushMenuItem({
			type: "separator",
			label: "settings-sep"
		});
		
		this.addMenuItems();

		this.pushMenuItem({
			type: "separator",
			label: "title-sep"
		});

		// Add the tray title
		this.pushMenuItem({
			label,
			enabled: false,
			icon: this.resizeImage("icon", 16),
		});

	}
	
	private addMenuItems() {

		// Add settings button
		if (this.authorization) {
			this.pushMenuItem({
				label: "Settings",
				click: () => Settings.open(),
				
			});
		}

		// Check for updates
		this.pushMenuItem({
			label: "Check for Updates",
			click: () => Update.open(),
		});

		this.pushMenuItem({
			type: "separator",
			label: "update-sep"
		});
		
		// Add the disconnect button if we're connected
		if (this._state === "connected") this.pushMenuItem({
			label: "Disconnect",
			click: () => OpenVPN.disconnect(),
			enabled: this._state === "connected"
		});

		// Add the quick connect button if we're disconnected
		else if (this.authorization) this.pushMenuItem({
			label: "Quick Connect",
			click: () => OpenVPN.quickConnect(),
			enabled: this._state === "disconnected" && !OpenVPN.isConnecting()
		});
	}

	public setState(state: typeof this._state) {

		// Set the state
		this._state = state;

		// Set the tray image
		this.tray?.setImage(this.resizeImage(this.imagesByState[this._state]));

		// Set tooltip
		this.setToolTip(this._state.replace(/^\w/, c => c.toUpperCase()));

		// Reload the menu
		this.refreshMenu();

	}

	public notify(body: string, title = this.tooltip, icon = this.imagesByState[this._state]) {
		new Notification({
			body,
			title,
			icon: this.resizeImage(icon, 256)
		}).show();
	}

}