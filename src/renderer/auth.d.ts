declare namespace Auth {
	
	interface Meta {
		[key: string]: any;
	}

	interface Me<Meta = Meta> {
		id: number;
        username: string;
        created_ms: number;
        mfa_enabled: boolean;
        email: string;
        sessions: Session[];
        passwd_md5: string;
        passwd_length: number;
        passwd_changed_ms: number;
        authorization: string;
        roles: Role[];
        flags: number;
        meta: Meta;
	}

	interface Partial {
		id: number;
		username: string;
		created_ms: number;
		mfa_enabled: boolean;
		email: string;
		flags: number;
		avatar_url: string;
	}

	interface Role {
		id: number;
		name: string;
	}

	interface Session {
        id: number;
        session_id: string;
        user: number;
        md5: string;
        created_ms: number;
        last_used_ms: number;
        user_agent: string;
        ip_address: string;
        current: boolean;
    }

}