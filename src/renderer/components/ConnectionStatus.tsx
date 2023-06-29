import { useAutoAnimate } from "@formkit/auto-animate/react";
import Spinner from "@ui-elements/Spinner";
import { ClassValue } from "clsx";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import { cn } from "../util/cn";
import useConnection from "../util/hooks/useConnection";
import useData from "../util/hooks/useData";

export default function ConnectionStatus(): JSX.Element | null {

	// Get the connection status
	const { status, ipLocation, active } = useConnection();
	const { data } = useData("/v2/ember/servers");

	// Use animatable
	const [ animatable ] = useAutoAnimate({ duration: 100 });

	// Get the class list for the status
	const classes: ClassValue[] = [

		// Base classes
		"flex items-center h-12 gap-2 px-3 transition-colors border rounded-full select-none",

		// Color
		{
			"border-warn text-warn bg-warn/10": true,
			"border-success text-success bg-success/10": status === "connected",
			"border-error text-error bg-error/10": status === "disconnected" || status === "disconnecting",
		}

	];
	
	return (
		<div className={ cn(classes) }>
			
			{/* Icon */}
			<div className="flex items-center justify-center w-6 h-6" ref={ animatable }>
				{function() {
					switch (status) {

						// Spinner
						default:
							return <Spinner className="stroke-current" key="spinner" />;
					
						// Disconnected
						case "disconnected":
							return <MdErrorOutline className="w-full h-full text-current" key="disconnected" />;
						
						// Connected
						case "connected":
							return <IoMdCheckmarkCircleOutline className="w-full h-full text-current" key="connected" />;

					}
				}()}
			</div>

			{/* Status indicator */}
			<div className="flex flex-col justify-center pr-1">
				
				{/* Status text */}
				<h1 className="font-medium whitespace-nowrap" key={ status }>
					{function() {
						switch (status) {
							default: return status.replace(/-/g, " ").replace(/(?:^|\s)\S/g, a => a.toUpperCase());
							
							// Will connect
							case "will-connect": return "Generating Keys";
						
						}
					}()}
				</h1>

				{/* Status subtext */}
				{status.endsWith("ed") && ipLocation && (
					<p className="-mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">{(status === "connected" && data && data.success && active && data.servers) ? data.servers[active].ip : ipLocation?.ip}</p>
				)}

			</div>
			
		</div>
	);
}