import { is } from "@electron-toolkit/utils";
import { BrowserWindow, app, globalShortcut } from "electron";
import { Settings } from "../window/Settings";
import { Update } from "../window/Update";
import { Auth } from "./Auth";

export class KeybindManager {

	// Keybinds to disregard in production
	private static disregardInProd: Electron.Accelerator[] = [
		"CommandOrControl+R",
		"CommandOrControl+Shift+R",
	];

	// Register keybinds events
	static {

		// Observe for app ready
		app.on("browser-window-focus", function() {

			// Allow in development
			if (is.dev) return;

			// Override keybinds
			KeybindManager.disregardInProd.map(accelerator => globalShortcut.register(accelerator, () => { }));

			// Unregister keybinds on window blur
			app.once("browser-window-blur", () => KeybindManager.disregardInProd.map(accelerator => globalShortcut.unregister(accelerator)));
			
		});
		
		// Observe for browser window creation
		app.on("browser-window-created", () => {

			// Get all windows
			BrowserWindow.getAllWindows()
				.map(win => win.webContents

					// Reset before-input-event listener
					.removeAllListeners("before-input-event")

					// Observe for keybinds
					.on("before-input-event", this.handler));
			
		});

	}

	/**
	 * Handle keybinds
	 * @param event KeyboardEvent
	 * @param input Input
	 */
	private static async handler(event: Electron.Event, input: Electron.Input) {

		// Make sure the user is authorized
		if (!await Auth.isAuthorized()) return;

		// Make sure the user is pressing control and comma
		if (input.control && input.key === ",") {
			Settings.open();
			event.preventDefault();
			return;
		}

		// Control U
		if (input.control && input.key === "u") {
			Update.open();
			event.preventDefault();
			return;
		}
						
	}

}