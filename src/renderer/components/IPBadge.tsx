import { useEffect, useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import { useQuery } from "react-query";
import useData from "../util/hooks/useData";
import Spinner from "./Spinner";

export default function IPBadge(): JSX.Element | null {

	const [ isLoading, setIsLoading ] = useState(false);
	const { data: iplocation } = useQuery("currentLocation", () => fetch("https://ipapi.co/json/").then(res => res.json()));
	const { data: servers } = useData("/ember/servers");
	
	function disconnect() {
		setIsLoading(true);
		electron.ipcRenderer.send("openvpn", "disconnect");
	}
	
	useEffect(function() {
		setIsLoading(false);
	}, [ iplocation ]);

	if (!iplocation || !servers) return null;
	
	const currentConnection = Object.values(servers.servers).find(server => server.ip === iplocation.ip);
	if (currentConnection) return (
		<div className="flex items-center gap-4 -my-4">
			<IoMdCheckmarkCircleOutline className="text-2xl text-success" />
			<div>
				<p className="text-success">Connected</p>
				<p className="text-sm">{ currentConnection.ip }</p>
			</div>
			<button className="h-12 bg-red-600 hover:bg-red-700 text-white text-lg font-medium rounded-lg px-4"
				onClick={ disconnect }>{isLoading ? <Spinner className="w-5 mx-4 !stroke-white" /> : "Disconnect"}</button>
		</div>
	);

	return (
		<div className="flex items-center gap-4 -my-4">
			<MdErrorOutline className="text-2xl text-red-600" />
			<p className="text-red-500">Not Protected</p>
		</div>
	);
}