import { useState } from "react";
import { MdDns } from "react-icons/md";
import { useUser } from "../util/hooks/useUser";
import Spinner from "./Spinner";

export default function Server({ server, hash }: { server: Ember.Server, hash: string }): JSX.Element {

	const { user } = useUser();

	const [ loading, setLoading ] = useState(false);

	async function connect() {
		setLoading(true);
	
		if (!user) return;

		electron.ipcRenderer.send("openvpn", "connect", JSON.stringify({ server, id: hash, session_id: user.authorization }));

		// Listen for OpenVPN events
		electron.ipcRenderer.on("openvpn", (_, state: string, data) => {
			setLoading(false);
			if (state === "error") {
				console.error("An error occurred while connecting to the server.", data);
			}
		});
		
	}

	return (
		<div className="bg-gray-100 dark:bg-gray-700 border dark:border-gray-600/50 rounded-lg py-2 px-4 flex items-center gap-4">
			<MdDns className="text-2xl" />
			<div className="flex flex-col">
				<div className="flex items-center gap-4">
					<span>{ server.hostname }</span>
				</div>
			
				<p className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
					<span>{ server.ip }</span>
				</p>
			</div>
			<div className="ml-auto btn cursor-pointer select-none"
				onClick={ connect }>{ loading ? <Spinner className="h-5 mx-2" /> : "Connect" }</div>
		</div>
	);
}