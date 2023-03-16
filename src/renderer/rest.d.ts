declare namespace REST {

	export interface Success {
		success: true;
	}

	export interface Packages extends Success {
		packages: Ember.Package[];
		currentSubscription: Ember.Subscription | false | null;
	}

	export interface Servers extends Success {
		servers: Ember.Server[];
	}

	export type Subscription = Success & Ember.Subscription;

}