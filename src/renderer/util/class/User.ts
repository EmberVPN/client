import Session from "./Session";

export default class User implements Auth.User {

	/**
	 * Get the avatar URL for a user given their ID
	 * @param id The user ID
	 */
	static getAvatarURL(id: number): string {
		return `${ APIROOT }/auth/avatar/${ id }`;
	}

	/** ANCHOR: User Properties */
	public readonly id: number;
	public readonly created_ms: number;
	public mfa_enabled: boolean;
	public username: string;
	public email: string;
	public readonly passwd_md5: string;
	public readonly passwd_length: number;
	public readonly passwd_changed_ms: number;
	public readonly sessions: Session[] = [];

	private _meta: Auth.Meta;
	
	/** ANCHOR: Constructor */
	constructor(data: Auth.User) {
		this.id = data.id;
		this.username = data.username;
		this.email = data.email;
		this.created_ms = data.created_ms;
		this.mfa_enabled = data.mfa_enabled;
		this.passwd_md5 = data.passwd_md5;
		this.passwd_length = data.passwd_length;
		this.passwd_changed_ms = data.passwd_changed_ms;
		data.sessions.map(session => this.sessions.push(new Session(session)));
		this._meta = data.meta;
	}

	public toJSON() {
		return {
			id: this.id,
			username: this.username,
			email: this.email,
			created_ms: this.created_ms,
			mfa_enabled: this.mfa_enabled,
			passwd_length: this.passwd_length,
			passwd_changed_ms: this.passwd_changed_ms,
			sessions: this.sessions.map(session => session.toJSON())
		};
	}

	get meta(): Auth.Meta {
		return this._meta;
	}

	public getAvatarURL() {
		return User.getAvatarURL(this.id);
	}

}

