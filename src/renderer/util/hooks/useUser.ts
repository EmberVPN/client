import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import User from "../class/User";

export function useUser() {

	const [ isAuthorized, setIsAuthorized ] = useState<boolean>(false);
	const [ user, setUser ] = useState<User | false | undefined>();

	const { data, isLoading, error } = useQuery("user", async function() {

		// Fetch the user
		const response = await fetch(APIROOT + "/auth/@me", { 
			headers: {
				Authorization: localStorage.getItem("authorization") ?? "",
			}
		});

		// Check if the user is authorized
		if (!response.ok) return { success: false };

		// Parse the user
		return await response.json();

	}, { staleTime: 5000 });

	// Check if the user is authorized
	useEffect(function() {
		
		// Check if the user is authorized
		if (data && data.success) {
			electron.ipcRenderer.send("titlebar", "unsplash");
			setIsAuthorized(true);
			localStorage.setItem("authorization", data.authorization);
			setUser(new User(data));
			return;
		}
		
		if (data && !data.success) {
			electron.ipcRenderer.send("titlebar", "splash");
			setIsAuthorized(false);
			setUser(false);
			return;
		}
		
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ data, error ]);

	return { isLoading, isAuthorized, user };

}
