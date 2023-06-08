import electron from "electron";
import EventEmitter from "events";

export interface IpGeo {
	ip: string;
	country_code: string;
	latitude: number;
	longitude: number;
}

export class IPManager {

	private static lastIP = "";
	private static geoCache: Record<string, IpGeo> = {};
	private static emitter = new EventEmitter();

	/**
	 * Fetch the IP address
	 * @returns string
	 */
	public static async fetchAddress() {

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
		const ip = await fetch(mirror + `?t=${ Date.now().toString(36) }`, {
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

	public static dropCache() {
		this.lastIP = "";
	}

	public static async fetchGeo(ip = this.lastIP): Promise<IpGeo> {
		
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), 1000);

		// Get mirror
		const mirror = [
			"https://ipwho.is",
		].reduce((a, b) => Math.random() > 0.5 ? a : b);

		// Send request
		const res = await fetch(mirror + `?t=${ Date.now().toString(36) }`, {
			signal: controller.signal
		})
			.then(res => res.json() as Promise<IpGeo & { success: boolean }>)
			.catch(() => undefined);
				
		clearTimeout(id);

		// Retry if res is undefined
		if (!res) return await this.fetchGeo(ip);
		if (!res.success) return await this.fetchGeo(ip);
		if (res.hasOwnProperty("error")) return await this.fetchGeo(ip);

		return this.geoCache[ip] = res;
		
	}
	
	static {

		// Fetch IP address every second and emit event if it changes
		setInterval(async() => {
			const ip = await this.fetchAddress();
				
			// Observe IP changes
			if (ip !== this.lastIP) {
				this.lastIP = ip;
				this.emitter.emit("change", ip);
				await this.fetchGeo();
			}
				
		}, 1000);

		// Send IP location to renderer
		setInterval(() => {

			// Send IP location to renderer
			if (!this.geoCache[this.lastIP]) return;
			electron.BrowserWindow.getAllWindows()
				.map(win => win.webContents.send("iplocation", JSON.stringify(this.geoCache[this.lastIP])));
		}, 50);

	}

	public static on(event: "change", listener: (ip: string) => void) {
		this.emitter.on(event, listener);
	}

	public static once(event: "change", listener: (ip: string) => void) {
		this.emitter.once(event, listener);
	}

}