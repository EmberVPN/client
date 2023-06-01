import Spinner from "@ui-elements/Spinner";
import classNames from "classnames";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import useConnection from "../util/hooks/useConnection";
import useData from "../util/hooks/useData";

export default function ConnectionStatus(): JSX.Element | null {

	// Get the connection status
	const { status, active, ipLocation } = useConnection();

	// Get the list of servers
	const { data } = useData("/v2/ember/servers");
	
	// If the VPN is connected 
	const isConnected = status === "connected" || status === "will-connect";
	
	// If somethings loading, show the spinning version
	if (!ipLocation || !data || status === "connecting" || status === "disconnecting" || status === "will-connect" || status === "installing") return (
		<div className="flex items-center justify-center h-12 gap-2 px-5 transition-colors border rounded-full border-warn/25 bg-warn/10">
			<Spinner className="w-6 -ml-2 mr-0.5 !stroke-warn shrink-0" />
			<div className="flex flex-col justify-center w-full pr-2 font-medium whitespace-nowrap">
				<h1 className={ classNames("text-warn", (status === "will-connect" || status === "connecting") && "-mb-1") }>{status === "installing" ? "Updating" : status === "will-connect" ? "Pending" : status.includes("ing") ? status[0].toUpperCase() + status.substring(1) : "Loading"}</h1>
				{(status === "will-connect" || status === "connecting") && <p className="text-xs">{status === "will-connect" ? "Generating keypair" : "Obtaining IP"}</p>}
			</div>
		</div>
	);

	// Render the connection status
	return (
		<div className={ classNames("h-12 rounded-full flex items-center justify-center transition-colors border gap-2 px-3", isConnected ? "border-success/25 bg-success/10" : "border-error/25 bg-error/10") }>
			{ isConnected ? <IoMdCheckmarkCircleOutline className="text-2xl text-success shrink-0" /> : <MdErrorOutline className="text-2xl text-error shrink-0" /> }
			<div className="flex flex-col justify-center w-full pr-2 font-medium whitespace-nowrap">
				<h1 className={ classNames("-mb-1", isConnected ? "text-success" : "text-error") }>{!isConnected && "Not "}Connected</h1>
				<p className="text-xs">{(active && data && data.success && data.servers && data.servers[active]) ? data.servers[active].ip : ipLocation.ip || "Couldn't determine IP"}</p>
			</div>
		</div>
	);
}