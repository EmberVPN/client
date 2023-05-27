import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import User from "../class/User";

export function useUser() {

	const [ isAuthorized, setIsAuthorized ] = useState<boolean>(false);
	const [ user, setUser ] = useState<User | false | undefined>();

	const { data, isLoading, error } = useQuery("user", async function() {

		// Fetch the user
		const response = await fetch(`${ APIROOT }/v2/auth/@me`, {
			headers: {
				Authorization: localStorage.getItem("authorization") ?? "",
			}
		});

		// Check if the user is authorized
		if (!response.ok) return { success: false };

		// Parse the user
		return await response.json() as REST.APIResponse<{ user: Auth.User }>;

	}, { staleTime: 5000 });

	// Check if the user is authorized
	useEffect(function() {
		
		// Check if the user is authorized
		if (data && data.success && "user" in data) {
			electron.ipcRenderer.send("titlebar", "unlock");
			electron.ipcRenderer.send("authorization", localStorage.getItem("authorization"));
			setIsAuthorized(true);
			localStorage.setItem("last_user", data.user.email);
			setUser(new User(data.user));
			return;
		} else {
			electron.ipcRenderer.send("authorization", null);
		}
		
		if (data && !data.success) {
			if (isAuthorized) electron.ipcRenderer.send("titlebar", "lock");
			setIsAuthorized(false);
			setUser(false);
			return;
		}
		
	}, [ data, error, isAuthorized ]);

	return { isLoading, isAuthorized, user };

}
