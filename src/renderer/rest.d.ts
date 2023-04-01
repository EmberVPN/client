declare namespace REST {

	export interface Success {
		success: true;
	}

	export interface Packages extends Success {
		packages: Ember.Package[];
		currentSubscription: Ember.Subscription | false | null;
	}

	export interface Servers extends Success {
		servers: Record<string, Ember.Server>;
	}

	export type Subscription = Success & Ember.Subscription;

	export interface ClientDownloads {
		success: boolean;
		latest: {
			win32: Version;
		}
		older: {
			win32: Version;
		}
	}

	export interface Version {
		name: string;
		download_url: string;
		version: string;
		about?: string;
	}

}