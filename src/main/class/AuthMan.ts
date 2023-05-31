import { BrowserWindow, ipcMain } from "electron";
import { Authorize } from "../window/Authorize";
import { Main } from "../window/Main";
import { Config } from "./Config";

export const AuthMan = new class AuthMan {

	// The current authorization token
	private static authorization?: string = Config.get("authorization");

	// The current user
	private static user?: Auth.User;

	// Attach events to manage lifecycle
	constructor() {

		// Listen for authorization token changes
		ipcMain.on("authorization", async(_, authorization: string | null) => {
			
			// Ignore if the authorization token is the same
			if (authorization === AuthMan.authorization) return;
			
			// If were signing out, handle that
			if (!authorization) return await AuthMan.destroy();

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

		// Close login window and open main window
		BrowserWindow.getAllWindows()
			.filter(win => !Main.is(win))
			.map(win => win.close());
		
		// Open main window
		Main.open();
		
		// Return the user
		return AuthMan.user = resp.user;

	}

	public async isAuthorized() {
		try {
			return AuthMan.authorization !== undefined && ((AuthMan.user || await AuthMan.fetchUser())?.id || -1) > 0;
		} catch (e) {
			return false;
		}
	}

	public getAuthorization() {
		return AuthMan.authorization;
	}

};