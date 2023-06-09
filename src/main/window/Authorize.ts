import { Window } from "../class/Window";

export class Authorize extends Window {
	public static open() {
		this.configure({
			title: "Sign In • Ember VPN"
		});
	}
}