import Spinner from "@ui-elements/Spinner";
import { useEffect, useRef } from "react";
import queryClient from "src/renderer/util/queryClient";
import Titlebar from "./Titlebar";

export default function Authorize() {

	// Create a reference to the webview
	const ref = useRef<HTMLWebViewElement>(null);

	// Customize the webview
	useEffect(function() {
		if (!ref.current) return;
		const webview = ref.current as HTMLWebViewElement & Electron.WebviewTag;

		// Set the user's authorization token
		const auth = "";

		// Steel the authorization from the webview
		async function authorize() {

			const includes = webview.src.includes("/authorize/login");
			await electron.ipcRenderer.invoke("window-size", 600, includes ? 370 : 506);

			// Wait for authorization to exist
			const authorization: string = await webview.executeJavaScript("localStorage.getItem(\"authorization\");");
			if (auth === authorization) return;
			
			// Set the user's authorization token
			localStorage.setItem("authorization", authorization);

			// Refetch with the new authorization
			const [ user, servers ] = await Promise.all([
				queryClient.fetchQuery<REST.APIResponse<Auth.User>>("user"),
				queryClient.fetchQuery<REST.APIResponse<EmberAPI.Servers>>("/v2/ember/servers")
			]);

			// If we have the data, set it
			if (user && user.success) queryClient.setQueryData("user", user);
			if (servers && servers.success) queryClient.setQueryData("/v2/ember/servers", servers);

		}

		// This is easier then listening
		const iv = setInterval(authorize, 100);
		return () => clearInterval(iv);

	}, [ ref ]);

	return (
		<div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 isolate">

			{/* Window title bar */}
			<Titlebar resizeable={ false }>Sign In</Titlebar>

			{/* Login window */}
			<webview
				className="absolute w-full h-full"
				ref={ ref }
				src="//embervpn.org/authorize/login" />
			
			{/* Spinner */}
			<div className="flex flex-col items-center justify-center grow -z-10">
				<Spinner />
			</div>
			
		</div>
	);
}
