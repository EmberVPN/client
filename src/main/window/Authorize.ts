import { Window } from "../class/Window";

class $Authorize extends Window {
	public close() {
		this.win?.close();
	}
	public open() {
		this.createWindow({
			title: "Sign In • Ember VPN"
		});
	}
}

export const Authorize = new $Authorize;