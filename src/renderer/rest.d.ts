declare namespace REST {

	export interface Success {
		success: true;
	}

	export interface Packages extends Success {
		packages: Ember.Package[];
		currentSubscription: Ember.Subscription | false | null;
	}

	export type Subscription = Success & Ember.Subscription;

}