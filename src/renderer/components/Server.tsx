import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "./Spinner";

export default function Servers({ server }: { server: Ember.Server }): JSX.Element {

	const [ isLoading, setIsLoading ] = useState(false);
	const [ isConnected, setConnected ] = useState(false);

	useEffect(function() {
		electron.ipcRenderer.on("openvpn", (_event, state: string, hash: string, data) => {

			setIsLoading(false);
			
			switch (state) {
			case "connected":
				setIsLoading(false);
				if (hash !== server.hash) break;
				setConnected(true);
				break;
			case "disconnected":
				setConnected(false);
				break;
			case "error":
				setIsLoading(false);
				if (hash !== server.hash) break;
				toast.error(data);
				setConnected(false);
				break;
			}

		});
	}, []);

	function connect() {
		setIsLoading(true);
		electron.ipcRenderer.send("openvpn", "connect", JSON.stringify({ server, session_id: localStorage.getItem("authorization") }));
	}
	
	function disconnect() {
		setIsLoading(true);
		electron.ipcRenderer.send("openvpn", "disconnect");
	}

	return (
		<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 group">
			<div className="flex items-center gap-4">
				<div className="grow">
					<div className="flex items-center gap-2">
						<img
							className="rounded"
							src={ `https://my.vultr.com/_images/flags/flagsm_${ server.location.country_code2.toLowerCase() }.png` } />
						<h1 className="text-xl font-medium font-mono">{server.hostname}</h1>
						<p className="hidden group-hover:block text-gray-500 dark:text-gray-400 text-xs py-1">({server.ip})</p>
					</div>
					<p className="text-gray-600 dark:text-gray-300 text-sm">{[ `${ server.location.city } (${ server.location.state_prov })`, server.location.country_name ].join(", ")}</p>
				</div>
				{ isLoading && !isConnected ? (
					<div className="gap-4">
						<Spinner className="w-5 mx-2" />
					</div>
				) : !isConnected ? (
					<div className="gap-4 items-center hidden group-hover:flex">
						<button className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
							onClick={ connect }>Connect</button>
					</div>
				) : (
					<div className="gap-4 items-center flex">
						<button className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
							onClick={ disconnect }>Disonnect</button>
					</div>
				)}
			</div>
		</div>
	);
}