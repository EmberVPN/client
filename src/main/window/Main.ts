import { Window } from "../class/Window";

export class Main extends Window {
	public static open() {

		// Attempt to open a hidden window first
		if (this.instance && !this.instance.isDestroyed()) {
			this.instance.show();
			return;
		}

		// Otherwise, open a new window
		this.instance = this.createWindow({
			title: "Ember VPN",
			resizable: true,
			height: 600,
			width: 800,
			minWidth: 600,
			minHeight: 400,
		});

	}
}