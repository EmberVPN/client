import { useEffect, useRef } from "react";
import Titlebar from "../components/Titlebar";
import { Spinner } from "@nextui/Spinner";

export function AuthorizeWindow() {

	// Create a reference to the webview
	const ref = useRef<HTMLWebViewElement>(null);

	// Customize the webview
	useEffect(function() {
		if (!ref.current) return;
		const webview = ref.current as HTMLWebViewElement & Electron.WebviewTag;
		
		let iv: NodeJS.Timer;

		// Wait for the webview to load
		webview.addEventListener("dom-ready", function() {
			
			// Drop the old authorization state if it exists
			webview.executeJavaScript("localStorage.setItem(\"authorization\", \"\");");

			// Set the user's authorization token
			const auth = "";
	
			// Steel the authorization from the webview
			iv = setInterval(async function authorize() {
	
				const wanted = webview.src.includes("/authorize/login") ? 370 : 506;
				if (window.innerHeight !== wanted) await electron.ipcRenderer.invoke("window-size", 600, wanted);
	
				// Wait for authorization to exist
				const authorization: string = await webview.executeJavaScript("localStorage.getItem(\"authorization\");");
				if (auth === authorization) return;
				
				// Send the authorization to the main process
				electron.ipcRenderer.send("authorization", authorization);
	
			}, 10);

		});

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
				src="https://embervpn.org/authorize/login" />
			
			{/* Spinner */}
			<div className="flex flex-col items-center justify-center grow -z-10">
				<Spinner />
			</div>
			
		</div>
	);
}
