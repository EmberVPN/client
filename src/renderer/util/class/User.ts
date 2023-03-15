import Session from "./Session";

export default class User<Meta = Auth.Meta> {

	/**
	 * Get the avatar URL for a user given their ID
	 * @param id The user ID
	 */
	static getAvatarURL(id: number): string {
		return APIROOT + `/auth/avatar/${ id }`;
	}

	/** ANCHOR: User Properties */
	public readonly id: number;
	public readonly created_ms: number;
	public mfa_enabled: boolean;
	public username: string;
	public email: string;
	private readonly passwd_md5: string;
	public readonly passwd_length: number;
	public readonly passwd_changed_ms: number;
	public readonly sessions: Session[] = [];

	private _meta: Meta;
	
	/** ANCHOR: Constructor */
	constructor(data: Auth.Me<Meta>) {
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

	get meta(): Meta {
		return this._meta;
	}

	public getAvatarURL() {
		return User.getAvatarURL(this.id);
	}

	public async uploadAvatar(binary?: string) {

		// Upload file
		async function upload(file: File | Blob): Promise<APIResponse> {
			return await fetch("/api/auth/avatar", {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file
			}).then(resp => resp.json());
		}

		// If binary, upload it
		if (binary) {
			const blob = await fetch(binary)
				.then(resp => resp.blob());
			
			// Upload file
			await upload(blob);
			return;
		}

		// Create hidden file input
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.style.display = "none";
		document.body.appendChild(input);

		// Open file input
		input.click();

		// Handle file input
		input.onchange = async() => {
			
			// Make sure theres something there
			if (!input.files) return input.remove();

			// Read each file as a blob
			const file = input.files[0];

			upload(file);

			// Remove input
			input.remove();
			
		};
		
	}

}

