import { useEffect, useRef } from "react";
import useData from "../util/hooks/useData";
import Server from "./Server";
import Toolbar from "./Toolbar";

export default function EntryPoint(): JSX.Element | null {

	const { data } = useData("/ember/servers");
	const ref = useRef<HTMLWebViewElement>(null);
	
	// Set authorization
	useEffect(function() {
		if (!ref.current) return;
		const webview = ref.current as HTMLWebViewElement & { executeJavaScript: (code: string) => void };
		webview.addEventListener("did-start-loading", () => webview.executeJavaScript(`localStorage.setItem("authorization", "${ localStorage.getItem("authorization") }");`));
	}, []);

	// If no servers
	if (!data?.servers || Object.keys(data?.servers).length === 0) return (
		<webview className="grow relative overflow-hidden bg-white dark:bg-gray-800 overflow-y-auto flex flex-col items-center justify-center"
			ref={ ref }
			src="https://embervpn.org/my-subscription?app" />
	);

	// List all servers
	return (
		<>
			<Toolbar />
			<div className="grow relative overflow-hidden bg-white/50 dark:bg-gray-800/50 overflow-y-auto flex flex-col"
				id="entrypoint">
				<div className="flex p-4 gap-4 m-auto py-20 flex-col">

					{Object.values(data.servers)
						.sort((a, b) => a.ping - b.ping)
						.map((server, key) => (
							<Server key={ key }
								server={ server } />
						))}
					
				</div>
			</div>
		</>
	);
	
}