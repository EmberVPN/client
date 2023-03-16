import { useState } from "react";
import { MdDns } from "react-icons/md";
import Spinner from "./Spinner";

export default function Server({ server }: { server: Ember.Server }): JSX.Element {

	const [ loading, setLoading ] = useState(false);

	async function connect() {
		setLoading(true);

		// electron.ipcRenderer.send("openvpn-connect", server.hash);
		// electron.ipcRenderer.on("openvpn-connect", (_, data: string) => {
		// 	console.log(data);
		// 	setLoading(false);
		// });

		const { hash } = server;

		// Generate a client config file
		const config = await fetch(APIROOT + "/ember/create-connection", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": localStorage.getItem("authorization") ?? ""
			},
			body: JSON.stringify({ hash })
		}).then(res => res.json());

		if (!config.success) {
			setLoading(false);
			return;
		}

		// Open the config in OpenVPN
		electron.ipcRenderer.send("openvpn", "connect", config);

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
					<span>{ server.name }</span>
				</div>
			
				<p className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
					<span>{ server.location }</span>
					<span>{ server.ip }</span>
					{/* <span className="text-gray-800 dark:text-gray-200">{ session.ip_address.split(":").reverse()[0] }</span> */}
				</p>
			</div>
			<div className="ml-auto btn cursor-pointer select-none"
				onClick={ connect }>{ loading ? <Spinner className="h-5 mx-2" /> : "Connect" }</div>
		</div>
	);
}