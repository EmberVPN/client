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
		
		// On new history state
		webview.addEventListener("did-navigate-in-page", () => queryClient.invalidateQueries("/v2/ember/servers"));

	}, []);

	return (
		<webview
			className="flex flex-col items-center h-full justify-evenly"
			ref={ ref }
			src="//embervpn.org/plans/" />
	);
}
