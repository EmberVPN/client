declare namespace Ember {

	export interface Price {
		id: string;
		object: string;
		active: boolean;
		billing_scheme: string;
		created: number;
		currency: string;
		custom_unit_amount: any;
		livemode: boolean;
		lookup_key: any;
		metadata: Record<string, string>;
		nickname: any;
		product: string;
		recurring: any;
		tax_behavior: string;
		tiers_mode: any;
		transform_quantity: any;
		type: string;
		unit_amount: number;
		unit_amount_decimal: string;
	}

	export interface Package {
		id: string;
		object: string;
		active: boolean;
		attributes: any[];
		created: number;
		description?: string;
		images: string[];
		livemode: boolean;
		metadata: Record<string, string>;
		name: string;
		package_dimensions: any;
		shippable: any;
		statement_descriptor?: string;
		tax_code: any;
		type: string;
		unit_label: any;
		updated: number;
		url: any;
		default_price: Price;
	}

	export interface AutomaticTax {
		enabled: boolean;
	}

	export interface CancellationDetails {
		comment?: any;
		feedback?: any;
		reason: string;
	}

	export interface Plan {
		id: string;
		object: string;
		active: boolean;
		aggregate_usage?: any;
		amount: number;
		amount_decimal: string;
		billing_scheme: string;
		created: number;
		currency: string;
		interval: string;
		interval_count: number;
		livemode: boolean;
		metadata: Metadata2;
		nickname?: any;
		product: Product;
		tiers_mode?: any;
		transform_usage?: any;
		trial_period_days?: any;
		usage_type: string;
	}

	export interface Recurring {
		aggregate_usage?: any;
		interval: string;
		interval_count: number;
		trial_period_days?: any;
		usage_type: string;
	}

	export interface Product {
		id: string;
		object: string;
		active: boolean;
		attributes: any[];
		created: number;
		default_price: Price;
		description: string;
		images: string[];
		livemode: boolean;
		metadata: Metadata;
		name: string;
		package_dimensions?: any;
		shippable?: any;
		statement_descriptor?: any;
		tax_code?: any;
		type: string;
		unit_label?: any;
		updated: number;
		url?: any;
	}

	export interface Price {
		id: string;
		object: string;
		active: boolean;
		billing_scheme: string;
		created: number;
		currency: string;
		custom_unit_amount?: any;
		livemode: boolean;
		lookup_key?: any;
		metadata: Metadata3;
		nickname?: any;
		product: string;
		recurring: Recurring;
		tax_behavior: string;
		tiers_mode?: any;
		transform_quantity?: any;
		type: string;
		unit_amount: number;
		unit_amount_decimal: string;
	}

	export interface Datum {
		id: string;
		object: string;
		billing_thresholds?: any;
		created: number;
		metadata: Metadata;
		plan: Plan;
		price: Price;
		quantity: number;
		subscription: string;
		tax_rates: any[];
	}

	export interface Items {
		object: string;
		data: Datum[];
		has_more: boolean;
		total_count: number;
		url: string;
	}

	export interface PaymentSettings {
		payment_method_options?: any;
		payment_method_types?: any;
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
		application?: any;
		application_fee_percent?: any;
		automatic_tax: AutomaticTax;
		billing_cycle_anchor: number;
		billing_thresholds?: any;
		cancel_at?: any;
		cancel_at_period_end: boolean;
		canceled_at: number;
		cancellation_details: CancellationDetails;
		collection_method: string;
		created: number;
		currency: string;
		current_period_end: number;
		current_period_start: number;
		customer: string;
		days_until_due?: any;
		default_payment_method: string;
		default_source?: any;
		default_tax_rates: any[];
		description?: any;
		discount?: any;
		ended_at: number;
		items: Items;
		latest_invoice: string;
		livemode: boolean;
		metadata: Metadata4;
		next_pending_invoice_item_invoice?: any;
		on_behalf_of?: any;
		pause_collection?: any;
		payment_settings: PaymentSettings;
		pending_invoice_item_interval?: any;
		pending_setup_intent?: any;
		pending_update?: any;
		plan: Plan;
		quantity: number;
		schedule?: any;
		start_date: number;
		status: string;
		test_clock?: any;
		transfer_data?: any;
		trial_end?: any;
		trial_settings: TrialSettings;
		trial_start?: any;
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
		ping: number
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