import { BrowserWindow, Tray as ElectronTray, Menu, Notification, app, nativeImage } from "electron";
import { resolve } from "path";
import { resources } from "..";
import { Main } from "../window/Main";
import { Settings } from "../window/Settings";
import { Update } from "../window/Update";
import { Auth } from "./Auth";
import { OpenVPN } from "./OpenVPN";

export class Tray {

	// Initialize the actual tray
	private static tray?: ElectronTray;

	// Initialize the tray state
	private static _state: "connected" | "disconnected" | "connecting" = "disconnected";

	static get state() {
		return this._state;
	}

	// Initialize the tray tooltip
	private static tooltip = "Ember VPN";

	// Initialize the tray images
	private static imagesByState = {
		"connected": "tray-connected",
		"disconnected": "tray",
		"connecting": "tray-pending"
	} satisfies Record<typeof this._state, string>;

	// Initialize the tray menu
	private static menu: Record<string, Electron.MenuItemConstructorOptions> = {};

	// Takes a name and optional size and returns a resized image for the tray
	private static resizeImage(name: string, size = 16) {
		return nativeImage.createFromPath(resolve(resources, `./assets/${ name }.png`)).resize({ width: size, height: size });
	}

	// Sets the tray menu
	private static setMenu(menu: Electron.MenuItemConstructorOptions[]) {
		this.tray?.setContextMenu(Menu.buildFromTemplate(menu));
	}

	// Pushes a menu item to the tray menu
	private static pushMenuItem(item: Electron.MenuItemConstructorOptions) {

		// Get the item label
		const label = item.label || JSON.stringify(item);

		// Add the item to the menu
		this.menu[label] = item;

		// Set the menu
		this.setMenu(Object.values(this.menu).reverse());

	}

	// Removes a menu item from the tray menu
	private static removeMenuItem(item: string | Electron.MenuItemConstructorOptions) {
		if (typeof item === "string") delete this.menu[item];
		else delete this.menu[JSON.stringify(item)];
		this.setMenu(Object.values(this.menu));
	}

	static {
		
		// Request single instance lock before the app init
		const isUnlocked = app.requestSingleInstanceLock();
		if (!isUnlocked) app.quit();
			
		// Await app ready, then create the tray
		else app.once("ready", async() => {

			// Initialize the tray
			this.tray = new ElectronTray(this.resizeImage("tray"));

			// Open the window when the tray is clicked
			this.tray.on("click", function() {
			
				// Sort so main window with Main.is is first
				BrowserWindow.getAllWindows().sort((a, b) => {
					if (Main.is(a)) return -1;
					if (Main.is(b)) return 1;
					return 0;
				}).at(0)?.show();
				
			});

			// Set the default state
			await this.setState(this._state);
			await this.refreshMenu();
			
		});
	}

	private static setToolTip(tooltip?: string) {
		this.tooltip = tooltip ? `Ember VPN • ${ tooltip }` : "Ember VPN";
		this.tray?.setToolTip(this.tooltip);
	}

	public static async refreshMenu() {

		// Reset the tray menu
		this.removeMenuItem("Disconnect");
		this.removeMenuItem("Quick Connect");
		this.removeMenuItem("Settings");
		this.removeMenuItem("settings-sep");
		this.removeMenuItem("Ember VPN");
		this.removeMenuItem("title-sep");
		this.removeMenuItem("Exit");
		this.removeMenuItem("Check for Updates");
		this.removeMenuItem("update-sep");

		// Add context menu
		this.pushMenuItem({
			label: "Exit",
			role: "quit",
			accelerator: "Alt+F4",
			click: () => process.exit()
		});

		this.pushMenuItem({
			type: "separator",
			label: "settings-sep"
		});
		
		await this.addMenuItems();

		this.pushMenuItem({
			type: "separator",
			label: "title-sep"
		});

		// Add the tray title
		this.pushMenuItem({
			label: "Ember VPN",
			accelerator: `v${ app.getVersion() }`,
			enabled: false,
			icon: this.resizeImage("icon", 16),
		});

	}
	
	private static async addMenuItems() {

		// Check if we're authorized
		const authorized = await Auth.isAuthorized();

		// Add settings button
		if (authorized) {
			this.pushMenuItem({
				label: "Settings",
				click: () => Settings.open(),
				accelerator: "CmdOrCtrl+,"
			});
		}

		// Check for updates
		this.pushMenuItem({
			label: "Check for Updates",
			click: () => Update.open(),
			accelerator: "CmdOrCtrl+U"
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
		else if (authorized) this.pushMenuItem({
			label: "Quick Connect",
			click: () => OpenVPN.quickConnect(),
			enabled: this._state === "disconnected" && !OpenVPN.isConnecting()
		});
	}

	public static async setState(state: typeof this._state) {

		// Set the state
		this._state = state;

		// Set the tray image
		this.tray?.setImage(this.resizeImage(this.imagesByState[this._state]));

		// Set tooltip
		this.setToolTip(this._state.replace(/^\w/, c => c.toUpperCase()));

		// Reload the menu
		await this.refreshMenu();

	}

	public static notify(body: string, title = this.tooltip, icon = this.imagesByState[this._state]) {
		new Notification({
			body,
			title,
			icon: this.resizeImage(icon, 256)
		}).show();
	}

}