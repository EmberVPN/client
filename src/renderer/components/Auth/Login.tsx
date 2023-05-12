import Spinner from "@ui-elements/Spinner";
import { useEffect, useRef } from "react";
import queryClient from "src/renderer/util/queryClient";
import Titlebar from "../Titlebar";

export default function SelectPlan() {

	// Create a reference to the webview
	const ref = useRef<HTMLWebViewElement>(null);

	// Customize the webview
	useEffect(function() {
		if (!ref.current) return;
		const webview = ref.current as HTMLWebViewElement & Electron.WebviewTag;

		// Steel the authorization from the webview
		async function authorize() {

			// Wait for authorization to exist
			const authorization = await webview.executeJavaScript("localStorage.getItem(\"authorization\");");
			if (!authorization) return setTimeout(authorize, 10);
			
			// Set the user's authorization token
			localStorage.setItem("authorization", authorization);
			queryClient.refetchQueries("user");

		}

		// On new history state, refetch user
		webview.addEventListener("did-finish-load", authorize);
		webview.addEventListener("did-navigate-in-page", authorize);

	}, []);

	return (
		<div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 isolate">

			{/* Window title bar */}
			<Titlebar resizeable={ false }>Sign In</Titlebar>

			{/* Login window */}
			<webview
				className="absolute w-full h-full"
				ref={ ref }
				src={ `//10.16.70.10:8080/authorize/login?redirect_uri=${ encodeURIComponent("/authorize/login") }` } />
			
			{/* Spinner */}
			<div className="flex flex-col items-center justify-center grow -z-10">
				<Spinner />
			</div>
			
		</div>
	);
}
