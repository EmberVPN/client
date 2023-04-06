import { useEffect, useRef } from "react";
import MyAccount from "./components/Auth/MyAccount";
import ConnectionStatus from "./components/ConnectionStatus";
import Server from "./components/Server";
import Spinner from "./ui-elements/Spinner";
import Toolbar from "./ui-elements/Toolbar";
import useData from "./util/hooks/useData";
import { useUser } from "./util/hooks/useUser";

export default function EntryPoint(): JSX.Element | null {

	const { data } = useData("/ember/servers");
	const { user } = useUser();
	const ref = useRef<HTMLWebViewElement>(null);
	
	// Set authorization
	useEffect(function() {
		if (!ref.current) return;
		const webview = ref.current as HTMLWebViewElement & { executeJavaScript: (code: string) => void };
		webview.addEventListener("did-start-loading", () => webview.executeJavaScript(`localStorage.setItem("authorization", "${ localStorage.getItem("authorization") }");`));
	}, []);

	// If no servers
	if (!data?.servers || Object.keys(data?.servers).length === 0) return <p>no plans</p>;

	// List all servers
	return (
		<>
			<Toolbar htmlFor="entrypoint">
				<ConnectionStatus />
				<div className="flex items-center ml-auto">
					{ !user && <Spinner className="w-9 mx-3" /> }
					{ user && <MyAccount user={ user } /> }
				</div>
			</Toolbar>
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