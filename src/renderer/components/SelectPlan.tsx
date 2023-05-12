import Spinner from "@ui-elements/Spinner";
import { useEffect, useRef } from "react";
import queryClient from "../util/queryClient";

export default function SelectPlan() {

	// Create a reference to the webview
	const ref = useRef<HTMLWebViewElement>(null);

	// Customize the webview
	useEffect(function() {
		if (!ref.current) return;
		const webview = ref.current as HTMLWebViewElement & Electron.WebviewTag;

		// Set the user's authorization token
		webview.addEventListener("dom-ready", () => webview.executeJavaScript(`localStorage.setItem("authorization", "${ localStorage.getItem("authorization") }");`));
		
		// On new history state, refetch servers
		webview.addEventListener("did-navigate-in-page", async function() {
			const servers = await queryClient.fetchQuery<REST.APIResponse<EmberAPI.Servers>>("/v2/ember/servers");
			if (servers && servers.success) queryClient.setQueryData("/v2/ember/servers", servers);
		});

	}, []);

	return (
		<div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 isolate">

			<webview
				className="flex flex-col items-center w-full h-full justify-evenly"
				ref={ ref }
				src="https://embervpn.org/plans/" />
		
			{/* Spinner */}
			<div className="flex flex-col items-center justify-center grow -z-10">
				<Spinner />
			</div>
			
		</div>
	);
}
