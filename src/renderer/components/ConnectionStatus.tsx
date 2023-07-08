import { useAutoAnimate } from "@formkit/auto-animate/react";
import Spinner from "@ui-elements/Spinner";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import { cn } from "../util/cn";
import useConnection from "../util/hooks/useConnection";
import useData from "../util/hooks/useData";

export default function ConnectionStatus(): JSX.Element | null {

	// Get the connection status
	const { status, ipLocation, active } = useConnection();
	const { data } = useData("/v2/ember/servers");

	const [ animated ] = useAutoAnimate();

	// Get the class list for the status
	const classes = {
		"flex items-center h-12 gap-2 px-3 border rounded-full select-none": true,
		"border-warn/40 text-warn bg-warn/10": true,
		"border-success/40 text-success bg-success/10": status === "connected",
		"border-error/40 text-error bg-error/10": status === "disconnected",
	};
	
	return (
		<div className={ cn(classes) }>
			
			{/* Icon */}
			<div className="relative flex items-center justify-center w-6 h-6">
				<div className={ cn("absolute inset-0", "transition-[transform,opacity]", !(status === "disconnected" || status === "connected") ? "scale-100 opacity-100" : "scale-0 opacity-0") } key="spinner">
					<Spinner className="stroke-current" />
				</div>
				<MdErrorOutline className={ cn("absolute inset-0 w-full h-full text-current", "transition-[transform,opacity]", status === "disconnected" ? "scale-100 opacity-100" : "scale-0 opacity-0") } />
				<IoMdCheckmarkCircleOutline className={ cn("absolute inset-0 w-full h-full text-current", "transition-[transform,opacity]", status === "connected" ? "scale-100 opacity-100" : "scale-0 opacity-0") } />
			</div>

			{/* Status indicator */}
			<div className="flex flex-col justify-center pr-2" ref={ animated }>
				
				{/* Status text */}
				<h1 className="font-medium leading-6 whitespace-nowrap" key="title">
					{status === "connected" && "Connected"}
					{status === "disconnected" && "Disconnected"}
					{status === "disconnecting" && "Disconnecting"}
					{!(status === "disconnected" || status === "connected" || status === "disconnecting") && "Connecting"}
				</h1>

				{/* Status subtext */}
				<p className="text-xs font-medium leading-3 text-gray-700 dark:text-gray-300" key="subtitle">
					{status === "will-connect" && "Generating Keypair"}
					{status === "connecting" && "Obtaining IP address"}
					{status === "connected" && data && data.success && active && data.servers[active].ip}
					{status === "disconnected" && ipLocation?.ip}
				</p>

			</div>
			
		</div>
	);
}