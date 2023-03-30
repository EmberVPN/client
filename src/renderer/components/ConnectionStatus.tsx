import classNames from "classnames";
import { useEffect, useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import { toast } from "react-toastify";
import useConnection from "../util/hooks/useConnection";
import useData from "../util/hooks/useData";
import useIpLocation from "../util/hooks/useIpLocation";
import queryClient from "../util/queryClient";
import Spinner from "./Spinner";

export default function ConnectionStatus(): JSX.Element | null {

	// Initialize local state
	const [ isLoading, setIsLoading ] = useState(false);
	
	// Get the connection status
	const [ status, setStatus ] = useConnection();
	
	// Get the current IP location
	const ipLocation = useIpLocation();

	// Get the list of servers
	const { data: servers } = useData("/ember/servers");
	
	// Sync state with main process
	useEffect(function() {
		setIsLoading(false);
		electron.ipcRenderer.on("openvpn", (_event, state: string, _hash: string, data: string) => {
			switch (state) {
				
			case "error":
				setStatus("disconnected");
				toast.error(data);
				break;
				
			case "connected":
			case "disconnected":
				setIsLoading(false);
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
	
	// Disconnect from the VPN
	async function disconnect() {
		setStatus("disconnecting");
		setIsLoading(true);
		electron.ipcRenderer.send("openvpn", "disconnect");
	}
	
	// If somethings loading, show the spinner
	if (!ipLocation || !servers || status === "connecting" || status === "disconnecting") return (
		<div className="group relative">
			<div className="h-12 -m-4 rounded-full flex items-center justify-center transition-colors border gap-2 px-5 border-warn/25 bg-warn/10">
				<Spinner className="w-6 -ml-2 mr-1 !stroke-warn shrink-0" />
				<div className="font-roboto font-medium whitespace-nowrap w-full flex flex-col justify-center pr-2">
					<h1 className="text-warn">Loading</h1>
				</div>
			</div>
		</div>
	);

	// Render the connection status
	return (
		<div className="group relative">

			{/* Toolbar icon */}
			<div className={ classNames("h-12 -m-4 rounded-full flex items-center justify-center transition-colors border gap-2 px-3", isConnected ? "border-success/25 bg-success/10" : "border-error/25 bg-error/10") }>
				{ isConnected ? <IoMdCheckmarkCircleOutline className="text-success text-2xl shrink-0" /> : <MdErrorOutline className="text-error text-2xl shrink-0" /> }
				<div className="font-roboto font-medium whitespace-nowrap w-full flex flex-col justify-center pr-2">
					<h1 className={ classNames("-mb-1", isConnected ? "text-success" : "text-error") }>{!isConnected && "Not "}Connected</h1>
					<p className="text-xs">{ipLocation.ip}</p>
				</div>
			</div>

			{/* Popup */}
			{/* <div className={ classNames("group-hover:scale-100 scale-75 opacity-0 group-hover:opacity-100 transition-all absolute px-2 py-0.5 text-sm origin-top-left rounded-[24px] top-0 pointer-events-none shadow-xl border dark:border-gray-700/50 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden -m-4 dark:shadow-black/20 flex flex-col !p-3.5 gap-3 group-hover:pointer-events-auto min-w-[288px] before:content-[''] before:absolute before:-z-[1] before:top-0 before:left-0 before:bottom-0 before:right-0 before:pointer-events-none", isConnected ? "!border-success/25 before:bg-success/10" : "!border-error/25 before:bg-error/10") }>
				
				<p className="text-sm text-gray-900/50 dark:text-gray-100/50">{
					isConnected ? <>Your internet traffic is encrypted and protected from interception, monitoring, or hacking by third parties such as hackers, government agencies, or internet service providers.</> : <>Your internet traffic is not protected by Ember and is susceptible to interception, monitoring, or hacking by third parties such as hackers, government agencies, or internet service providers like <strong>{ipLocation.org}</strong>.</>
				}</p>
				
				{ isConnected && <Button className={ classNames(isLoading && "!bg-opacity-25 !shadow-none pointer-events-none z-[10]") }
					color="error"
					onClick={ disconnect }>{isLoading ? <Spinner className="w-6 mx-auto !stroke-error" /> : "Disconnect"}</Button> }
			</div> */}
			
		</div>
	);
}