import { Window } from "../class/Window";

export class Authorize extends Window {
	public static open() {
		this.win = this.createWindow({
			title: "Sign In • Ember VPN"
		});
	}

}