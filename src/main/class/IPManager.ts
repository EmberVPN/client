import electron, { BrowserWindow } from "electron";
import EventEmitter from "events";

export interface IpGeo {
	ip: string;
	country_code: string;
	latitude: number;
	longitude: number;
}

export class IPManager extends EventEmitter {

	private lastIP = "";
	private lastGeo = {} as IpGeo;
	private win: BrowserWindow;

	/**
	 * Fetch the IP address
	 * @returns string
	 */
	public async fetchAddress() {

		// Abort if IP times out
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), 1000);

		// Choose a url to get the IP from
		const mirror = [
			"https://icanhazip.com/",
			"https://api.ipify.org/",
			"https://ip.seeip.org/",
			"https://ident.me/text"
		].reduce((a, b) => Math.random() > 0.5 ? a : b);

		// Get IP address
		const ip = await fetch(mirror, {
			signal: controller.signal
		})
			.then(res => res.text())
			.then(text => text.trim())
			.catch(() => undefined);
		
		// Clear timeout
		clearTimeout(id);

		// Retry if IP is undefined
		if (!ip || ip.includes("error")) return await this.fetchAddress();

		// Check if IP has changed and it didnt pick up an ipv6 address
		if (!ip.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) return await this.fetchAddress();

		// Return IP
		return ip;
		
	}

	public async fetchGeo(ip = this.lastIP): Promise<IpGeo> {
		
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), 1000);

		// Get mirror
		const mirror = [
			"https://ipwho.is",
		].reduce((a, b) => Math.random() > 0.5 ? a : b);

		// Send request
		const res = await fetch(mirror, {
			signal: controller.signal
		})
			.then(res => res.json() as Promise<IpGeo & { success: boolean }>)
			.catch(() => undefined);
				
		clearTimeout(id);

		// Retry if res is undefined
		if (!res) return await this.fetchGeo(ip);
		if (!res.success) return await this.fetchGeo(ip);
		if (res.hasOwnProperty("error")) return await this.fetchGeo(ip);

		return res;
		
	}
	
	constructor(win: BrowserWindow) {
		super();
		this.win = win;
		
		// On window contents load
		win.webContents.once("did-finish-load", async() => {

			// Fetch IP address every second and emit event if it changes
			setInterval(async() => {
				const ip = await this.fetchAddress();
				
				// Observe IP changes
				if (ip !== this.lastIP) {
					this.emit("change", ip);
					this.lastIP = ip;
					this.lastGeo = await this.fetchGeo(ip);
				}
				
			}, 1000);

			// Send IP location to renderer
			setInterval(() => {
				const wins = electron.BrowserWindow.getAllWindows();
				wins.map(win => win.webContents.send("iplocation", JSON.stringify(this.lastGeo)));
			}, 50);
			
		});

	}

}