import { useEffect, useState } from "react";
import { useConfigKey } from "./useConfigKey";

export function useUser() {

	// Get authorization token
	const [ authorization ] = useConfigKey("auth.token");

	// Initialize user state
	const [ user, setUser ] = useState<Auth.User | undefined>();
	
	// On authorization token change
	useEffect(function() {
		
		// If we don't have an authorization token, set user to undefined
		if (!authorization) return setUser(undefined);

		// Otherwise, fetch user
		fetch("https://api.embervpn.org/v2/auth/@me", { headers: { authorization }})
			.then(a => a.json() as Promise<REST.APIResponse<{ user: Auth.User }>>)
			.then(function(response) {
				
				// Ensure success
				if (!response.success) throw new Error(response.readable || response.description || response.error);

				// Set user
				setUser(response.user);

			})
			.catch(() => setUser(undefined));

	}, [ authorization ]);
	
	// Return user
	return user;

}
