import { Tray as ElectronTray, Menu, Notification, app, nativeImage } from "electron";
import { resolve } from "path";
import { resources } from "..";
import { Main } from "../window/Main";
import { Settings } from "../window/Settings";
import { Update } from "../window/Update";
import { Auth } from "./Auth";
import { OpenVPN } from "./OpenVPN";

// The state that the tray can be in
type TrayState = "connected" | "disconnected" | "connecting";

export class Tray {

	// Initialize the tray state
	public static state: TrayState = "disconnected";
	
	// Initialize the actual tray
	private static tray?: ElectronTray;
	
	// Initialize the tray menu
	private static menu: Record<string, Electron.MenuItemConstructorOptions> = {};

	// Initialize the tray tooltip
	private static tooltip = "Ember VPN";

	// A record of images by state
	private static imagesByState: Record<TrayState, string> = {
		connected: "tray-connected",
		disconnected: "tray",
		connecting: "tray-pending"
	};

	// Await app ready, then create the tray
	static {
		app.once("ready", async() => {

			// Initialize the tray
			this.tray = new ElectronTray(this.resizeImage("tray"));

			// Open the window when the tray is clicked
			this.tray.on("click", () => Main.open());

			// Set the default state
			await this.setState(this.state);
			await this.refreshMenu();
			
		});
	}

	/**
	 * Resize an image using the nativeImage module
	 * @param name name of the image, without path or extension 
	 * @param size size of the image, in pixels (default 16)
	 * @returns NativeImage
	 */
	private static resizeImage(name: string, size = 16) {
		return nativeImage.createFromPath(resolve(resources, `./assets/${ name }.png`)).resize({ width: size, height: size });
	}

	/**
	 * Completely replace the tray menu with a new one
	 * @param menu Electron.MenuItemConstructorOptions[]
	 */
	private static setMenu(menu: Electron.MenuItemConstructorOptions[]) {
		this.tray?.setContextMenu(Menu.buildFromTemplate(menu));
	}

	/**
	 * Push a menu item to the tray menu (items are appended to the end)
	 * @param item Electron.MenuItemConstructorOptions
	 */
	private static pushMenuItem(item: Electron.MenuItemConstructorOptions) {

		// Get the item label
		const label = item.label || JSON.stringify(item);

		// Add the item to the menu
		this.menu[label] = item;

		// Set the menu
		this.setMenu(Object.values(this.menu).reverse());

	}

	/**
	 * Remove a menu item from the tray menu from its label or object
	 * @param item Electron.MenuItemConstructorOptions | string
	 */
	private static removeMenuItem(item: string | Electron.MenuItemConstructorOptions) {
		if (typeof item === "string") delete this.menu[item];
		else delete this.menu[JSON.stringify(item)];
		this.setMenu(Object.values(this.menu));
	}

	/**
	 * Set the tray tooltip
	 * @param tooltip string | undefined
	 */
	private static setToolTip(tooltip?: string) {
		this.tooltip = tooltip ? `Ember VPN • ${ tooltip }` : "Ember VPN";
		this.tray?.setToolTip(this.tooltip);
	}

	/**
	 * Remove and re-add all items in the tray menu.
	 * This is used to update the menu when the user connects or disconnects, logs in/out, etc.
	 */
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
		if (this.state === "connected") this.pushMenuItem({
			label: "Disconnect",
			click: () => OpenVPN.disconnect(),
			enabled: this.state === "connected"
		});

		// Add the quick connect button if we're disconnected
		else if (authorized) this.pushMenuItem({
			label: "Quick Connect",
			click: () => OpenVPN.quickConnect(),
			enabled: this.state === "disconnected" && !OpenVPN.isConnecting()
		});

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

	/**
	 * Set the tray state
	 * @param state TrayState
	 */
	public static async setState(state: TrayState) {

		// Set the state
		this.state = state;

		// Set the tray image
		this.tray?.setImage(this.resizeImage(Tray.imagesByState[this.state]));

		// Set tooltip
		this.setToolTip(this.state.replace(/^\w/, c => c.toUpperCase()));

		// Reload the menu
		await this.refreshMenu();

	}

	/**
	 * Show a notification
	 * @param body string
	 * @param title string (defaults to "Ember VPN")
	 * @param icon string (defaults to the tray icon for the current state)
	 */
	public static notify(body: string, title = this.tooltip, icon = Tray.imagesByState[this.state]) {
		new Notification({
			body,
			title,
			icon: this.resizeImage(icon, 256)
		}).show();
	}

}