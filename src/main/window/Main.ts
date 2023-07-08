import { Window } from "../class/Window";

export class Main extends Window {

	/**
	 * Open the main window
	 */
	public static open() {

		// If the instance already exists, just reopen that one
		if (this.instance && !this.instance.isDestroyed() && !this.isLoading) return this.instance.show();

		this.configure({
			title: "Ember VPN",
			resizable: true,
			height: 600,
			width: 800,
			minWidth: 600,
			minHeight: 400
		});
	}
	
}