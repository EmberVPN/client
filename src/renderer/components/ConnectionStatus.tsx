import Spinner from "@ui-elements/Spinner";
import classNames from "classnames";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import useConnection from "../util/hooks/useConnection";
import useData from "../util/hooks/useData";

export default function ConnectionStatus() {

	// Get the connection status & server list
	const { status, ipLocation } = useConnection();
	const { data } = useData("/v2/ember/servers");
	
	// Derive the state
	const isConnected = status === "connected";
	const isLoading = status === "connecting" || status === "disconnecting" || status === "will-connect" || status === "installing" || (status === "disconnected" && !(ipLocation && data)) || status === "error";
	const isDisconnected = status === "disconnected" && !isLoading && !isConnected;
	const hasSublabel = status === "will-connect" || status === "connecting" || status === "installing" || status === "connected" || (status === "disconnected" && !isLoading);
	
	return (
		<div className={ classNames("flex items-center justify-center h-12 gap-2 px-5 transition-colors border rounded-full select-none", {
			"border-warn/25 bg-warn/10": isLoading,
			"border-success/25 bg-success/10": isConnected,
			"border-error/25 bg-error/10": isDisconnected
		}) }>
			
			{/* Icon */}
			<div className="relative w-6 -ml-2 aspect-square shrink-0">

				{/* Loading */}
				<div className={ classNames("transition-[opacity,transform] duration-[300ms] ease-bounce absolute inset-0", isLoading ? "scale-100 opacity-100" : "scale-50 opacity-0") }>
					<Spinner className="stroke-warn" />
				</div>

				{/* Disconnected */}
				<div className={ classNames("transition-[opacity,transform] duration-[300ms] ease-bounce absolute inset-0", isDisconnected ? "scale-100 opacity-100" : "scale-50 opacity-0") }>
					<MdErrorOutline className="text-2xl text-error" />
				</div>

				{/* Connected */}
				<div className={ classNames("transition-[opacity,transform] duration-[300ms] ease-bounce absolute inset-0", isConnected ? "scale-100 opacity-100" : "scale-50 opacity-0") }>
					<IoMdCheckmarkCircleOutline className="text-2xl text-success" />
				</div>

			</div>

			{/* Text */}
			<div className="flex flex-col justify-center w-full pr-2 font-medium whitespace-nowrap">
				
				{/* Label */}
				<h1 className={ classNames("transition-[margin,color]", hasSublabel && "-mb-1", {
					"text-warn": isLoading,
					"text-success": isConnected,
					"text-error": isDisconnected
				}) }>
					{function() {
						switch (status) {
							case "installing": return "Updating";
							case "will-connect": return "Pending";
							case "connecting": return "Connecting";
							case "disconnecting": return "Disconnecting";
							case "connected": return "Connected";
							case "error":
							case "disconnected":
								if (!ipLocation || !data) return "Obtaining IP";
								else return "Disconnected";
							default: return "Loading";
						}
					}()}
				</h1>
				
				{/* Sublabel */}
				<p className={ classNames("transition-[height,transform,opacity] overflow-hidden origin-left text-xs", hasSublabel ? "h-4 opacity-100" : "h-0 opacity-0") }>
					{function() {
						switch (status) {
							case "installing": return "OpenVPN Core";
							case "will-connect": return "Generating keypair";
							case "connecting":
							case "disconnecting": return "Obtaining IP";
							case "connected":
							case "disconnected":
							default: return ipLocation?.ip ?? "Couldn't determine IP";
						}
					}()}
				</p>

			</div>
			
		</div>
	);
}