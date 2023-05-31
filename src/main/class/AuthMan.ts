import { BrowserWindow, ipcMain } from "electron";
import { Authorize } from "../window/Authorize";
import { Main } from "../window/Main";
import { Config } from "./Config";

export class AuthMan {

	// The current authorization token
	private static authorization?: string = Config.get("authorization");

	// The current user
	private static user?: Auth.User;

	// Listen for authorization token changes
	static {
		ipcMain.on("authorization", async(_, authorization: string | null) => {
			
			// Ignore if the authorization token is the same
			if (authorization === AuthMan.authorization) return;
			
			// If were signing out, handle that
			if (authorization === null) return await AuthMan.destroy();

			// Set authorization token
			AuthMan.authorization = authorization;

			// Fetch user
			await AuthMan.fetchUser();

		});
	}

	// Destroy the current authorization session
	protected static async destroy() {
		AuthMan.authorization = undefined;
		AuthMan.user = undefined;

		// Remove authorization token from config
		Config.set("authorization", undefined);

		// Close all windows
		BrowserWindow.getAllWindows().map(win => win.close());
		
		// Open login window
		Authorize.open();
		
	}

	// Fetch user from authorization token
	public static async fetchUser(token = AuthMan.authorization) {

		// Get authorization token
		const authorization = token;

		// If we don't have a token, throw an error
		if (!authorization) throw new Error("No authorization token provided");

		// If we got a token from the renderer, attempt to sign in
		const resp = await fetch("https://api.embervpn.org/v2/auth/@me", { headers: { authorization }})
			.then(resp => resp.json() as Promise<REST.APIResponse<{ user: Auth.User }>>)
			.catch(() => null);
			
		// If the response is an error, throw it
		if (!resp || !resp.success) throw new Error(resp ? resp.readable || resp.description || resp.error : "Unknown error");

		// Set authorization token
		Config.set("authorization", authorization);

		// If login window is open, close it and open the main window
		if (BrowserWindow.getAllWindows().find(win => Authorize.is(win))) {
			Authorize.close();
			Main.open();
		}
		
		// Return the user
		return AuthMan.user = resp.user;

	}

	public static async isAuthorized() {
		try {
			return AuthMan.authorization !== undefined && ((AuthMan.user || await AuthMan.fetchUser())?.id || -1) > 0;
		} catch (e) {
			return false;
		}
	}

	public static getAuthorization() {
		return AuthMan.authorization;
	}

}