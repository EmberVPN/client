import Spinner from "@ui-elements/Spinner";
import { useEffect, useRef } from "react";
import { ServerList } from "./components/ServerList";
import useData from "./util/hooks/useData";

export default function EntryPoint(): JSX.Element | null {

	// Get the server registry
	const { data } = useData("/v2/ember/servers");

	// If the server registry is still loading
	if (!data) return <Spinner />;

	// Show the server list
	if (Object.keys(data.servers).length > 0) return <ServerList servers={ Object.values(data.servers) } />;
	
	// Show the plan selector on the website
	return <SelectPlan />;
	
}

function SelectPlan() {

	// Create a reference to the webview
	const ref = useRef<HTMLWebViewElement>(null);
	
	// Customize the webview
	useEffect(function() {
		if (!ref.current) return;
		const webview = ref.current as HTMLWebViewElement & Electron.WebviewTag;
		
		// Set the user's authorization token
		webview.addEventListener("dom-ready", () => webview.executeJavaScript(`localStorage.setItem("authorization", "${ localStorage.getItem("authorization") }");`));
		
	}, []);

	return (
		<webview
			className="flex flex-col items-center h-full justify-evenly"
			ref={ ref }
			src="//10.16.70.10:8080/plans/"
		/>
	);
}