import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import User from "../class/User";

export function useUser() {

	const [ isAuthorized, setIsAuthorized ] = useState<boolean>(false);
	const [ user, setUser ] = useState<User | false | undefined>();

	const { data, isLoading, error } = useQuery("user", async function() {

		// Fetch the user
		const response = await fetch("http://10.16.70.10:80/api/auth/@me");

		// Check if the user is authorized
		if (!response.ok) return { success: false };

		// Parse the user
		return await response.json();

	}, { staleTime: 5000 });

	// Check if the user is authorized
	useEffect(function() {
		
		// Check if the user is authorized
		if (data && data.success) {
			setIsAuthorized(true);
			setUser(new User(data));
			return;
		}
		
		if (data && !data.success) {
			setIsAuthorized(false);
			setUser(false);
			return;
		}
		
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ data, error ]);

	return { isLoading, isAuthorized, user };

}
