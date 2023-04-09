import Button from "@ui-elements/Button";
import Card from "@ui-elements/Card";
import Spinner from "@ui-elements/Spinner";
import classNames from "classnames";
import { MdOutlineTimer } from "react-icons/md";
import { calculateDistance } from "../util/calculateDistance";
import useConnection from "../util/hooks/useConnection";
import Timestamp from "./Timestamp";

export default function Servers({ server }: { server: Ember.Server }): JSX.Element | null {

	// Get the current IP location
	const { status, active, ipLocation, setStatus, setActive, lastStateChange } = useConnection();

	// Parse the server location
	const latitude = parseFloat(server.location.latitude);
	const longitude = parseFloat(server.location.longitude);

	// If location is still loading
	if (!ipLocation) return null;
  
	// Calculate the distance from the user to the server
	const distance = calculateDistance(latitude, longitude, ipLocation.latitude, ipLocation.longitude);
	const isActive = active === server.hash;
	const isLoading = isActive && status.endsWith("ing");

	// Connect to the server
	async function connect() {
		setActive(server.hash);
		setStatus("connecting");
		electron.ipcRenderer.send("openvpn", "connect", JSON.stringify({ server, authorization: localStorage.getItem("authorization") }));
	}

	// Disconnect from the server
	async function disconnect() {
		setStatus("disconnecting");
		electron.ipcRenderer.send("openvpn", "disconnect");
	}

	// Render the server
	return (
		<Card className={ classNames("transition-[height,margin,transform] duration-100", isLoading ? "h-[88px] my-[23px] scale-110 shadow-lg" : "h-[134px]", isActive && status === "connected" && "scale-110 shadow-lg my-2") }>
			
			{/* Server Info */}
			<div className="flex items-center gap-4 p-1">

				{/* Icon/spinner */}
				<div className="w-12 h-12 relative shrink-0">
					<img className={ classNames(isLoading && "!opacity-0", "opacity-100 transition-opacity") }
						src={ `https://cdn.ipregistry.co/flags/emojitwo/${ server.location.country_code2.toLowerCase() }.svg` } />
					<Spinner className={ classNames("absolute top-0 left-0 !stroke-gray-800 dark:!stroke-gray-200", !isLoading && "!opacity-0", "opacity-100 transition-opacity") } />
				</div>
					
				{/* Server details */}
				<div className="leading-tight  font-medium whitespace-nowrap w-full">

					{/* Server location */}
					<div className="flex w-full justify-between items-center text-gray-700 dark:text-gray-300 text-lg">
						<h1>{server.location.country_name}</h1>
						<p>{ server.location.district || server.location.state_prov || server.location.country_capital }</p>
					</div>

					{/* Server stats and IP */}
					<div className="text-sm flex justify-between gap-2 w-full">
						<div className="flex grow gap-2 justify-between mr-2">

							{(!isActive || status !== "connected") ? (

								// Measure ping and distance
								<>
									<p className={ classNames(server.ping < 50 ? "text-success" : server.ping < 150 ? "text-warn" : "text-error") }>{server.ping}ms</p>
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
							<p className="self-end">{server.location.ip}</p>
							
						</div>
					</div>
					
				</div>

			</div>

			{/* Connect/disconnect action */}
			{ isLoading ? <Button className="opacity-0 pointer-events-none" /> : (
				(isActive && status === "connected") ? (

					// Disconnect button
					<Button className={ classNames("m-0 shadow-none", status.endsWith("ing") && "opacity-50 pointer-events-none") }
						color="error"
						onClick={ disconnect }>Disconnect</Button>
				) : (

					// Connect button
					<Button className={ classNames("m-0 shadow-none", status.endsWith("ing") && "opacity-50 pointer-events-none") }
						color="success"
						onClick={ connect }>Connect</Button>
				))}
				
		</Card>
	);
}