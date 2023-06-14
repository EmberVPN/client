import { BrowserWindow, ipcMain } from "electron";
import { Authorize } from "../window/Authorize";
import { Main } from "../window/Main";
import { Config } from "./Config";
import { EmberAPI } from "./EmberAPI";
import { OpenVPN } from "./OpenVPN";
import { Tray } from "./Tray";

export class Auth extends EmberAPI {

	// The current user
	private static user?: Auth.User;

	// Sync with the render process
	static {
		ipcMain.on("authorization", async(_, authorization: string | null) => {
			
			// Ignore if the authorization token is the same
			if (authorization === EmberAPI.authorization) return;
			
			// If were signing out, handle that
			if (authorization === null) return await Auth.logout();

			// Set authorization token
			EmberAPI.authorization = authorization;

			// Fetch user
			await Auth.login();

			// Refresh the tray menu
			await Tray.refreshMenu();

		});
	}

	/**
	 * Destroys the current authorization token (signs out)
	 * @returns Promise<void>
	 */
	protected static async logout() {

		// Destroy token
		await EmberAPI.fetch("/v2/auth/session", { method: "DELETE" });

		// Unset authorization token and user
		Auth.user = undefined;
		Config.delete("auth.token");

		// Disconnect from OpenVPN
		await OpenVPN.disconnect();
		
		// Close all windows
		BrowserWindow.getAllWindows().map(win => win.close());
		
		// Open login window
		Authorize.open();
		
	}

	/**
	 * Logs in to the Ember API given an authorization token
	 * @param token The authorization token (defaults to the current authorization token)
	 * @returns Promise<Auth.User>
	 */
	public static async login(token = EmberAPI.authorization) {

		// If we don't have a token, throw an error
		if (!token) throw new Error("No authorization token. You must provide one from the renderer process.");

		// If we got a token from the renderer, attempt to sign in
		const resp = await EmberAPI.fetch("/v2/auth/@me");

		// Set authorization token
		EmberAPI.setAuthorization(token);

		// If login window is open, close it and open the main window
		Authorize.close();
		Main.open();
		
		// Return the user
		return Auth.user = resp.user;

	}

	/**
	 * Gets whether or not the user is authorized
	 * @returns Promise<boolean>
	 */
	public static async isAuthorized() {
		try {
			return EmberAPI.authorization !== undefined && ((Auth.user || await Auth.login())?.id || -1) > 0;
		} catch (e) {
			return false;
		}
	}

}