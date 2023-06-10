import { Window } from "../class/Window";

export class Authorize extends Window {

	/**
	 * Open the login window
	 */
	public static open() {
		this.configure({
			title: "Sign In • Ember VPN"
		});
	}

}