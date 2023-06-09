import { BrowserWindow, app } from "electron";
import { Settings } from "../window/Settings";
import { Update } from "../window/Update";
import { Auth } from "./Auth";

export class KeybindManager {
	static {

		// Observe for browser window creation
		app.on("browser-window-created", () => {
			BrowserWindow.getAllWindows()
				.map(win => win.webContents

					// Reset before-input-event listener
					.removeAllListeners("before-input-event")
					.on("before-input-event", async(event, input) => {

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
						
					}));
		});

	}
}