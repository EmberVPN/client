import classNames from "classnames";
import { MdOutlineTimer } from "react-icons/md";
import { calculateDistance } from "../util/calculateDistance";
import useConnection from "../util/hooks/useConnection";
import Button from "./Button";
import Spinner from "./Spinner";
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
		<div className={ classNames(
			"text-sm rounded-lg shadow text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden dark:shadow-black/20 flex flex-col p-4 gap-2 transition-[height,margin,transform] duration-100",
			isLoading ? "h-[88px] my-[23px] scale-110 shadow-lg" : "h-[134px]",
			isActive && status === "connected" && "scale-110 shadow-lg my-2"
		) }>
				
			<div className="flex items-center gap-4 p-1">

				<div className="w-12 h-12 relative shrink-0">
					<img className={ classNames(isLoading && "!opacity-0", "opacity-100 transition-opacity") }
						src={ `https://cdn.ipregistry.co/flags/emojitwo/${ server.location.country_code2.toLowerCase() }.svg` } />
					<Spinner className={ classNames("absolute top-0 left-0 !stroke-gray-800 dark:!stroke-gray-200", !isLoading && "!opacity-0", "opacity-100 transition-opacity") } />
				</div>
					
				<div className="leading-tight font-roboto font-medium whitespace-nowrap w-full">
					<div className="flex w-full justify-between items-center text-gray-700 dark:text-gray-300 text-lg">
						<h1>{server.location.country_name}</h1>
						<p>{ server.location.district || server.location.state_prov || server.location.country_capital }</p>
					</div>
					<div className="text-sm flex justify-between gap-2 w-full">
						<div className="flex grow gap-2 justify-between mr-2">
							{(!isActive || status !== "connected") ? (<>
								<p className={ classNames(server.ping < 50 ? "text-success" : server.ping < 150 ? "text-warn" : "text-error") }>{server.ping}ms</p>
								<span className="text-gray-400 dark:text-gray-600">•</span>
								<p>{Intl.NumberFormat().format(Math.floor(distance * (ipLocation.country_code === "US" ? 0.621371 : 1)))} {ipLocation.country_code === "US" ? "Mi" : "Km"}</p>
							</>
							) : (<div className="flex items-center gap-1 opacity-70">
								<MdOutlineTimer className="text-xl -translate-y-[1px]" />
								<Timestamp timestamp={ lastStateChange } />
							</div>) }
							<span className="text-gray-400 dark:text-gray-600">•</span>
							<p className="self-end">{server.location.ip}</p>
						</div>
					</div>
				</div>

			</div>

			{isLoading ? (
				<Button className="!bg-transparent"
					raised={ false }>
				</Button>
			) : (
				(isActive && status === "connected") ? (
					<Button className="m-0"
						color="error"
						onClick={ disconnect }
						raised={ false }>
							Disconnect
					</Button>
				) : (
					<Button className="m-0"
						color="success"
						onClick={ connect }
						raised={ false }>
							Connect
					</Button>
				)
			)}
				
		</div>
	);
}