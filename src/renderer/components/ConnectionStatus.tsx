import classNames from "classnames";
import { useEffect } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import { toast } from "react-toastify";
import useConnection from "../util/hooks/useConnection";
import useData from "../util/hooks/useData";
import useIpLocation from "../util/hooks/useIpLocation";
import queryClient from "../util/queryClient";
import Spinner from "./Spinner";

export default function ConnectionStatus(): JSX.Element | null {

	// Get the connection status
	const [ status, setStatus ] = useConnection();
	
	// Get the current IP location
	const ipLocation = useIpLocation();

	// Get the list of servers
	const { data: servers } = useData("/ember/servers");
	
	// Sync state with main process
	useEffect(function() {
		electron.ipcRenderer.on("openvpn", (_event, state: string, _hash: string, data: string) => {
			switch (state) {
				
			case "error":
				setStatus("disconnected");
				toast.error(data);
				break;
				
			case "connected":
			case "disconnected":
				setStatus(state);
				queryClient.refetchQueries("currentLocation");
				break;
				
			}
		});
		() => electron.ipcRenderer.removeAllListeners("openvpn");
	}, [ ipLocation, setStatus ]);
	
	// If the VPN is connected 
	const isConnected = status === "connected";

	// Sync state with the VPN
	useEffect(function() {
		if (status === "connected") {
			queryClient.refetchQueries("currentLocation");
			setStatus("connected");
		}
	}, [ status, ipLocation?.ip, setStatus ]);
	
	// If somethings loading, show the spinner
	if (!ipLocation || !servers || status === "connecting" || status === "disconnecting") return (
		<div className="h-12 -m-4 rounded-full flex items-center justify-center transition-colors border gap-2 px-5 border-warn/25 bg-warn/10">
			<Spinner className="w-6 -ml-2 mr-1 !stroke-warn shrink-0" />
			<div className="font-roboto font-medium whitespace-nowrap w-full flex flex-col justify-center pr-2">
				<h1 className="text-warn">Loading</h1>
			</div>
		</div>
	);

	// Render the connection status
	return (
		<div className={ classNames("h-12 -m-4 rounded-full flex items-center justify-center transition-colors border gap-2 px-3", isConnected ? "border-success/25 bg-success/10" : "border-error/25 bg-error/10") }>
			{ isConnected ? <IoMdCheckmarkCircleOutline className="text-success text-2xl shrink-0" /> : <MdErrorOutline className="text-error text-2xl shrink-0" /> }
			<div className="font-roboto font-medium whitespace-nowrap w-full flex flex-col justify-center pr-2">
				<h1 className={ classNames("-mb-1", isConnected ? "text-success" : "text-error") }>{!isConnected && "Not "}Connected</h1>
				<p className="text-xs">{ipLocation.ip || "Couldn't determine IP"}</p>
			</div>
		</div>
	);
}