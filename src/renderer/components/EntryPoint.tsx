import { useEffect, useRef } from "react";
import { calculateDistance } from "../util/calculateDistance";
import useConnection from "../util/hooks/useConnection";
import useData from "../util/hooks/useData";
import Server from "./Server";
import Toolbar from "./Toolbar";

export default function EntryPoint(): JSX.Element | null {

	const { data } = useData("/ember/servers");
	const { ipLocation } = useConnection();
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
				<div className="flex flex-col p-4 gap-4 max-w-md mx-auto my-auto py-20">
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