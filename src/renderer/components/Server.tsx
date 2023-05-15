import Button from "@ui-elements/Button";
import Card from "@ui-elements/Card";
import Spinner from "@ui-elements/Spinner";
import classNames from "classnames";
import { MdOutlineTimer } from "react-icons/md";
import { calculateDistance } from "../util/calculateDistance";
import useConnection from "../util/hooks/useConnection";
import Timestamp from "./Timestamp";

export default function Server({ server: { ping = -1, ...server }}: { server: Ember.Server & { ping: number } }): JSX.Element | null {

	// Get the current IP location
	const { status, active, ipLocation, setStatus, setActive, lastStateChange } = useConnection();

	// If location is still loading
	if (!ipLocation) return null;
  
	// Calculate the distance from the user to the server
	const distance = calculateDistance(server.location.latitude, server.location.longitude, ipLocation.latitude, ipLocation.longitude);
	const isActive = active === server.hash;
	const willConnect = (status.endsWith("ing") || status === "will-connect");
	const isLoading = isActive && willConnect;
	const authorization = localStorage.getItem("authorization");

	// Connect to the server
	async function connect() {
		setActive(server.hash);
		setStatus("will-connect");
		electron.ipcRenderer.send("openvpn", "connect", JSON.stringify({ server, authorization }));
	}

	// Disconnect from the server
	async function disconnect() {
		setStatus("disconnecting");
		electron.ipcRenderer.send("openvpn", "disconnect");
	}

	// Render the server
	return (
		<li className={ classNames(isLoading && "z-10") }>
			<Card className={ classNames("transition-[height,margin,transform] duration-100", isLoading ? "h-[88px] my-[23px] scale-110 shadow-lg" : "h-[134px]", isActive && status === "connected" && "scale-110 shadow-lg my-2") }>
			
				{/* Server Info */}
				<div className="flex items-center gap-4 p-1">

					{/* Icon/spinner */}
					<div className="relative w-12 h-12 shrink-0">
						<img className={ classNames(isLoading && "!opacity-0", "opacity-100 transition-opacity") }
							src={ `https://cdn.ipregistry.co/flags/emojitwo/${ server.location.countryCode.toLowerCase() }.svg` } />
						<Spinner className={ classNames("absolute top-0 left-0 !stroke-gray-800 dark:!stroke-gray-200", !isLoading && "!opacity-0", "opacity-100 transition-opacity") } />
					</div>
					
					{/* Server details */}
					<div className="w-full font-medium leading-tight whitespace-nowrap">

						{/* Server location */}
						<div className="flex items-center justify-between w-full text-lg text-gray-700 dark:text-gray-300">
							<h1>{ server.location.country }</h1>
							<p>{ server.location.state }</p>
						</div>

						{/* Server stats and IP */}
						<div className="flex justify-between w-full gap-2 text-sm">
							<div className="flex justify-between gap-2 grow">

								{(!isActive || status !== "connected") ? (

									// Measure ping and distance
									<>
										<p className={ classNames(ping > 0 ? ping < 50 ? "text-success" : ping < 150 ? "text-warn" : "text-error" : "text-gray", "transition-colors") }>{ping > 0 ? `${ ping }ms` : "---"}</p>
										
										<span className="text-gray-400 dark:text-gray-600">•</span>
										<p>{Intl.NumberFormat().format(Math.floor(distance * (ipLocation.country_code === "US" ? 0.621371 : 1)))} {ipLocation.country_code === "US" ? "Mi" : "Km"}</p>
									</>) : (
								
									// Measure time connected
									<div className="flex items-center gap-1 opacity-70">
										<MdOutlineTimer className="text-xl -translate-y-[1px]" />
										<Timestamp timestamp={ lastStateChange } />
									</div>
								)}

								{/* IP address */}
								<span className="text-gray-400 dark:text-gray-600">•</span>
								<p className="self-end">{server.ip}</p>
							
							</div>
						</div>
					
					</div>

				</div>

				{/* Connect/disconnect action */}
				<Button className={ classNames("shrink-0", willConnect && "opacity-50 pointer-events-none !shadow-none", active && isLoading && "!opacity-0") }
					color={ isActive && status === "connected" ? "error" : "success" }
					onClick={ isActive && status === "connected" ? disconnect : connect }>
					{(isActive && status === "connected") ? "Disconnect" : "Connect"}
				</Button>
				
			</Card>
		</li>
	);
}