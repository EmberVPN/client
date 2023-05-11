/* eslint-disable react-hooks/exhaustive-deps */
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Button from "@ui-elements/Button";
import Spinner from "@ui-elements/Spinner";
import Toolbar from "@ui-elements/Toolbar";
import { useEffect, useRef, useState } from "react";
import { MdLaunch } from "react-icons/md";
import MyAccount from "./components/Auth/MyAccount";
import ConnectionStatus from "./components/ConnectionStatus";
import Server from "./components/Server";
import { calculateDistance } from "./util/calculateDistance";
import useConnection from "./util/hooks/useConnection";
import useData from "./util/hooks/useData";
import { useUser } from "./util/hooks/useUser";

export default function EntryPoint(): JSX.Element | null {

	const { data } = useData("/v2/ember/servers");
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
		<div className="relative flex flex-col items-center justify-center overflow-hidden overflow-y-auto bg-gray-100 grow dark:bg-gray-850"
			id="entrypoint">
			<Spinner />
		</div>
	);
	
	if (data?.servers && Object.keys(data.servers).length === 0) return (
		<>
			<Toolbar htmlFor="entrypoint">
				<ConnectionStatus />
				<div className="flex items-center ml-auto">
					{ !user && <Spinner className="mx-3 w-9" /> }
					{ user && <MyAccount user={ user } /> }
				</div>
			</Toolbar>
			<div className="relative flex flex-col items-center justify-center overflow-hidden overflow-y-auto bg-gray-100 grow dark:bg-gray-850"
				id="entrypoint">
				<div className="max-w-screen-xl px-4 py-8 mx-auto sm:py-16 lg:px-6">
					<div className="max-w-screen-sm mx-auto text-center">
						<h1 className="mb-4 font-extrabold tracking-tight text-7xl lg:text-9xl text-primary-600 dark:text-primary-500">Uh Oh</h1>
						<p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">Something&apos;s missing.</p>
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
					{ !user && <Spinner className="mx-3 w-9" /> }
					{ user && <MyAccount user={ user } /> }
				</div>
			</Toolbar>
			<Entrypoint servers={ Object.values(data.servers) } />
		</>
	);
	
}

interface IServer extends Ember.Server {
	ping: number;
}

function Entrypoint({ servers: _servers }: { servers: Ember.Server[] }): JSX.Element {
	const [ ref ] = useAutoAnimate();
	const { active, ipLocation } = useConnection();
	const [ servers, setServers ] = useState<IServer[]>([]);
	
	// Ping on mount
	useEffect(ping, [ active ]);
	useEffect(function() {
		if (!ipLocation) return;
		const interval = setInterval(ping, 5000);
		return () => clearInterval(interval);
	}, [ ipLocation, ping ]);
	
	// Sort servers by distance then by active
	const sort = (servers: IServer[]) => servers
		.sort((a, b) => {
			if (!ipLocation) return 0;
			const distanceA = calculateDistance(a.location.latitude, a.location.longitude, ipLocation?.latitude, ipLocation?.longitude);
			const distanceB = calculateDistance(b.location.latitude, b.location.longitude, ipLocation?.latitude, ipLocation?.longitude);
			return distanceA - distanceB;
		})
		.sort((a, b) => {
			if (!active) return 0;
			if (a.hash === active) return -1;
			if (b.hash === active) return 1;
			return 0;
		});

	// Helper function to ping servers
	function ping(soft = false) {
		Promise.allSettled(_servers.map(server => new Promise((resolve, reject) => {
			if (soft) return resolve(servers.find(s => s.hash === server.hash)?.ping || -1);
			electron.ipcRenderer.invoke("ping-server", server)
				.then(ping => resolve({ ...server, ping }));
			setTimeout(() => reject(), 1000);
		}))).then(results => results.filter(result => result.status === "fulfilled")
			.map(result => (result as { value: IServer }).value))
			.then(sort)
			.then(setServers);
	}

	return (
		<div className="relative flex flex-col overflow-hidden overflow-y-auto bg-gray-100 grow dark:bg-gray-850"
			id="entrypoint">
			{!servers.length ? (
				<div className="flex flex-col items-center justify-center w-full h-full"
					key={ -1 }>
					<Spinner className="w-12" />
				</div>
			) : (
				<ul className="flex flex-col w-[380px] gap-4 p-4 py-20 m-auto"
					ref={ ref }>
					{servers.map(server => (
						<Server key={ server.hash }
							server={ server } />))}
				</ul>
			)}
		</div>
	);
}