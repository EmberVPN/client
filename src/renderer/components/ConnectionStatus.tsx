import classNames from "classnames";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import useConnection from "../util/hooks/useConnection";
import useData from "../util/hooks/useData";
import Spinner from "../ui-elements/Spinner";

export default function ConnectionStatus(): JSX.Element | null {

	// Get the connection status
	const { status, active, ipLocation } = useConnection();

	// Get the list of servers
	const { data: servers } = useData("/ember/servers");
	
	// If the VPN is connected 
	const isConnected = status === "connected";
	
	// If somethings loading, show the spinner
	if (!ipLocation || !servers || status === "connecting" || status === "disconnecting") return (
		<div className="h-12 rounded-full flex items-center justify-center transition-colors border gap-2 px-5 border-warn/25 bg-warn/10">
			<Spinner className="w-6 -ml-2 mr-0.5 !stroke-warn shrink-0" />
			<div className=" font-medium whitespace-nowrap w-full flex flex-col justify-center pr-2">
				<h1 className="text-warn">{ status.includes("ing") ? status[0].toUpperCase() + status.substring(1) : "Loading"}</h1>
			</div>
		</div>
	);

	// Render the connection status
	return (
		<div className={ classNames("h-12 rounded-full flex items-center justify-center transition-colors border gap-2 px-3", isConnected ? "border-success/25 bg-success/10" : "border-error/25 bg-error/10") }>
			{ isConnected ? <IoMdCheckmarkCircleOutline className="text-success text-2xl shrink-0" /> : <MdErrorOutline className="text-error text-2xl shrink-0" /> }
			<div className=" font-medium whitespace-nowrap w-full flex flex-col justify-center pr-2">
				<h1 className={ classNames("-mb-1", isConnected ? "text-success" : "text-error") }>{!isConnected && "Not "}Connected</h1>
				<p className="text-xs">{active ? servers.servers[active].ip : ipLocation.ip || "Couldn't determine IP"}</p>
			</div>
		</div>
	);
}