declare namespace REST {

	export interface Packages {
		success: true;
		packages: Ember.Package[];
		currentSubscription: Ember.Subscription | false | null;
	}

}