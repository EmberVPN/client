import { Window } from "../class/Window";

export class Main extends Window {
	public static open() {
		this.configure({
			title: "Ember VPN",
			resizable: true,
			height: 600,
			width: 800,
			minWidth: 600,
			minHeight: 400,
			delayed: true
		});
	}
}