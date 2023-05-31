import { Window } from "../class/Window";

class $Main extends Window {
	public open() {

		// Attempt to open a hidden window first
		if (Main.win && !Main.win.isDestroyed()) {
			Main.win.show();
			return;
		}

		// Otherwise, open a new window
		Main.win = this.createWindow({
			title: "Ember VPN",
			resizable: true,
			height: 600,
			width: 800,
			minWidth: 600,
			minHeight: 400,
		});

	}
}

export const Main = new $Main;