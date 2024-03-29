import { useEffect, useRef } from "react";
import { useConfigKey } from "../util/hooks/useConfigKey";
import queryClient from "../util/queryClient";
import { Spinner } from "@nextui/Spinner";

export default function SelectPlan() {

	// Get the user's authorization token
	const [ authorization ] = useConfigKey("auth.token");

	// Create a reference to the webview
	const ref = useRef<HTMLWebViewElement>(null);

	// Customize the webview
	useEffect(function() {
		if (!ref.current) return;
		const webview = ref.current as HTMLWebViewElement & Electron.WebviewTag;

		// Set the user's authorization token
		webview.addEventListener("dom-ready", () => webview.executeJavaScript(`localStorage.setItem("authorization", "${ authorization }");`));
		
		// On new history state, refetch servers
		webview.addEventListener("did-navigate-in-page", async function() {
			const servers = await queryClient.fetchQuery<REST.APIResponse<EmberAPI.Servers>>("/v2/ember/servers");
			if (servers && servers.success) queryClient.setQueryData("/v2/ember/servers", servers);
		});

	}, [ authorization ]);

	return (
		<div className="flex flex-col w-full h-screen bg-gray-100 dark:bg-gray-900 isolate">

			<webview
				className="absolute w-full h-full"
				ref={ ref }
				src="https://embervpn.org/plans/" />
		
			{/* Spinner */}
			<div className="flex flex-col items-center justify-center grow -z-10">
				<Spinner />
			</div>
			
		</div>
	);
}
