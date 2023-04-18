import Button from "@ui-elements/Button";
import Spinner from "@ui-elements/Spinner";
import Toolbar from "@ui-elements/Toolbar";
import { useEffect, useRef } from "react";
import { MdLaunch } from "react-icons/md";
import MyAccount from "./components/Auth/MyAccount";
import ConnectionStatus from "./components/ConnectionStatus";
import Server from "./components/Server";
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
	if (!data?.servers || !user) return (
		<div className="grow relative overflow-hidden bg-white/50 dark:bg-gray-800/50 overflow-y-auto flex flex-col items-center justify-center"
			id="entrypoint">
			<Spinner />
		</div>
	);
	
	if (data?.servers && Object.keys(data.servers).length === 0) return (
		<>
			<Toolbar htmlFor="entrypoint">
				<ConnectionStatus />
				<div className="flex items-center ml-auto">
					{ !user && <Spinner className="w-9 mx-3" /> }
					{ user && <MyAccount user={ user } /> }
				</div>
			</Toolbar>
			<div className="grow relative overflow-hidden bg-white/50 dark:bg-gray-800/50 overflow-y-auto flex flex-col items-center justify-center"
				id="entrypoint">
				<div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
					<div className="mx-auto max-w-screen-sm text-center">
						<h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">Uh Oh</h1>
						<p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">Something&apos;s missing.</p>
						<p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">It appears you do not currently have an active subscription with us or that it may have expired.</p>
						<a href="https://embervpn.org/"
							rel="noreferrer"
							target="_blank">
							<Button className="inline-flex items-center gap-2">
								View Online
								<MdLaunch className="text-2xl" />
							</Button>
						</a>
					</div>
				</div>
			</div>
		</>
	);

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