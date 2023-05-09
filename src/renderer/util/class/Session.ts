export default class Session implements Auth.Session {
	
	id: number;
	session_id: string;
	created_ms: number;
	last_used_ms: number;
	user_agent: string;
	ip_address: string;
	current: boolean;

	constructor(session: Auth.Session) {
		this.id = session.id;
		this.session_id = session.session_id;
		this.created_ms = session.created_ms;
		this.last_used_ms = session.last_used_ms;
		this.user_agent = session.user_agent;
		this.ip_address = session.ip_address;
		this.current = session.current;
	}

	public toJSON() {
		return {
			id: this.id,
			session_id: this.session_id,
			created_ms: this.created_ms,
			last_used_ms: this.last_used_ms,
			user_agent: this.user_agent,
			ip_address: this.ip_address,
			current: this.current
		};
	}

	public async revoke() {
		return await fetch(`${ APIROOT }/auth/session`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ session_id: this.session_id })
		});
	}

}