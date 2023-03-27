declare namespace Ember {

	export interface Price {
		id: string;
		object: string;
		active: boolean;
		billing_scheme: string;
		created: number;
		currency: string;
		livemode: boolean;
		metadata: Record<string, string>;
		product: string;
		tax_behavior: string;
		type: string;
		unit_amount: number;
		unit_amount_decimal: string;
	}

	export interface Package {
		id: string;
		object: string;
		active: boolean;
		created: number;
		description?: string;
		images: string[];
		livemode: boolean;
		metadata: Record<string, string>;
		name: string;
		statement_descriptor?: string;
		type: string;
		updated: number;
		default_price: Price;
	}

	export interface AutomaticTax {
		enabled: boolean;
	}

	export interface CancellationDetails {
		reason: string;
	}

	export interface Plan {
		id: string;
		object: string;
		active: boolean;
		amount: number;
		amount_decimal: string;
		billing_scheme: string;
		created: number;
		currency: string;
		interval: string;
		interval_count: number;
		livemode: boolean;
		metadata: Metadata2;
		product: Product;
		usage_type: string;
	}

	export interface Recurring {
		interval: string;
		interval_count: number;
		usage_type: string;
	}

	export interface Product {
		id: string;
		object: string;
		active: boolean;
		created: number;
		default_price: Price;
		description: string;
		images: string[];
		livemode: boolean;
		metadata: Metadata;
		name: string;
		type: string;
		updated: number;
	}

	export interface Price {
		id: string;
		object: string;
		active: boolean;
		billing_scheme: string;
		created: number;
		currency: string;
		livemode: boolean;
		metadata: Metadata3;
		product: string;
		recurring: Recurring;
		tax_behavior: string;
		type: string;
		unit_amount: number;
		unit_amount_decimal: string;
	}

	export interface Datum {
		id: string;
		object: string;
		created: number;
		metadata: Metadata;
		plan: Plan;
		price: Price;
		quantity: number;
		subscription: string;
	}

	export interface Items {
		object: string;
		data: Datum[];
		has_more: boolean;
		total_count: number;
		url: string;
	}

	export interface PaymentSettings {
		save_default_payment_method: string;
	}

	export interface EndBehavior {
		missing_payment_method: string;
	}

	export interface TrialSettings {
		end_behavior: EndBehavior;
	}

	export interface Subscription {
		id: string;
		object: string;
		automatic_tax: AutomaticTax;
		billing_cycle_anchor: number;
		cancel_at_period_end: boolean;
		canceled_at: number;
		cancellation_details: CancellationDetails;
		collection_method: string;
		created: number;
		currency: string;
		current_period_end: number;
		current_period_start: number;
		customer: string;
		default_payment_method: string;
		ended_at: number;
		items: Items;
		latest_invoice: string;
		livemode: boolean;
		metadata: Metadata4;
		payment_settings: PaymentSettings;
		plan: Plan;
		quantity: number;
		start_date: number;
		status: string;
		trial_settings: TrialSettings;
		success: boolean;
	}

	export interface Server {
		ip: string
		iface: string
		network: string
		subnet: string
		port: string
		proto: string
		hostname: string
		hash: string
		location: Location
	}

	export interface Location {
		ip: string
		continent_code: string
		continent_name: string
		country_code2: string
		country_code3: string
		country_name: string
		country_capital: string
		state_prov: string
		district: string
		city: string
		zipcode: string
		latitude: string
		longitude: string
		is_eu: boolean
		calling_code: string
		country_tld: string
		languages: string
		country_flag: string
		geoname_id: string
		isp: string
		connection_type: string
		organization: string
		currency: Currency
		time_zone: TimeZone
	}

	export interface Currency {
		code: string
		name: string
		symbol: string
	}

	export interface TimeZone {
		name: string
		offset: number
		current_time: string
		current_time_unix: number
		is_dst: boolean
		dst_savings: number
	}

}