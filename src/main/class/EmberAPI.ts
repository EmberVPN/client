import { Config } from "./Config";

export interface IdealResponses {
	"/v3/ember/downloads": EmberAPI.ClientDownloads;
	"/v2/auth/@me": { user: Auth.User };
	"/auth/session": null;
	"/v2/ember/servers": EmberAPI.Servers;
	"/v2/rsa/download-client-config": { config: string };
}

export class EmberAPI {

	// The root URL of the Ember API
	public static readonly URL = "https://api.embervpn.org";

	// The current authorization token
	protected static authorization = Config.get("auth.token") || undefined;

	/**
	 * Fetches data from the Ember API
	 * @param path The path to fetch from (if not absolute, will be appended to the API root)
	 * @returns Promise<IdealResponse[T]>
	 */
	public static async fetch<T extends keyof IdealResponses>(path: T, init?: Partial<RequestInit>) {

		// Make sure the path is not outside of the API root domain
		if (path.startsWith("http") && !path.startsWith(EmberAPI.URL)) throw new Error("Path cannot be absolute. Start with a slash to make it relative to the API root.");

		if (!init) init = {};
		if (!init.headers) init.headers = {} as HeadersInit;
		if (init.body && typeof init.body !== "string") init.body = JSON.stringify(init.body);
		if (init.body) init.headers["Content-Type"] = "application/json";

		// If we have an authorization token, add it to the headers
		if (EmberAPI.authorization) {
			init.headers["Authorization"] = EmberAPI.authorization;
		}

		console.log(path, init);

		// Fetch the data
		const response = await fetch(EmberAPI.URL.concat(path), init)
			.then(res => res.json() as Promise<REST.APIResponse<IdealResponses[T]>>);
		
		// If the response is an error, throw it
		if (!response.success) throw new Error(response.readable || response.description || response.error);
		
		// Return the response
		return {
			...response,
			success: undefined
		} as IdealResponses[T];

	}

	/**
	 * Sets the authorization token
	 * @param token The authorization token
	 */
	protected static setAuthorization(token: string) {
		EmberAPI.authorization = token;
		Config.set("auth.token", token);
	}

}