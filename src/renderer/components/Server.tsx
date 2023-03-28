import classNames from "classnames";
import { useEffect, useState } from "react";
import { MdLocationPin } from "react-icons/md";
import { calculateDistance } from "../util/calculateDistance";
import useConnection from "../util/hooks/useConnection";
import useIpLocation from "../util/hooks/useIpLocation";
import Button from "./Button";
import Spinner from "./Spinner";

export default function Servers({ server }: { server: Ember.Server }): JSX.Element | null {

	// Get the current IP location
	const ipLocation = useIpLocation();
	const [ status, setStatus ] = useConnection();
	const [ isActive, setActive ] = useState(false);

	// Parse the server location
	const latitude = parseFloat(server.location.latitude);
	const longitude = parseFloat(server.location.longitude);

	// If the server is active
	useEffect(function() {
		if (status === "disconnected") setActive(false);
	}, [ status ]);

	// If location is still loading
	if (!ipLocation) return null;
  
	// Calculate the distance from the user to the server
	const distance = calculateDistance(latitude, longitude, ipLocation.latitude, ipLocation.longitude);

	// Connect to the server
	async function connect() {
		setActive(true);
		setStatus("connecting");
		electron.ipcRenderer.send("openvpn", "connect", JSON.stringify({ server, authorization: localStorage.getItem("authorization") }));
	}

	// Disconnect from the server
	async function disconnect() {
		setActive(true);
		setStatus("disconnecting");
		electron.ipcRenderer.send("openvpn", "disconnect");
	}

	// Render the server
	return (
		<div className="absolute group hover:z-[1]"
			style={{
				bottom: `${ (latitude + 90) / 180 * 100 }%`,
				left: `${ (longitude + 180) / 360 * 100 }%`,
			}}>
			
			{/* Pin */}
			<div className="w-14 aspect-square -translate-x-1/2 rounded-full">
				<MdLocationPin className="text-primary text-6xl group-hover:scale-150 origin-bottom opacity-60 group-hover:opacity-100 transition-[opacity,transform]" />
			</div>

			{/* Popup */}
			<div className="group-hover:scale-100 scale-75 opacity-0 group-hover:opacity-100 transition-all absolute px-2 py-0.5 text-sm origin-top rounded-lg top-0 pointer-events-none -translate-x-1/2 translate-y-1/2 left-1/2
shadow-xl border dark:border-gray-700/50 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden -m-4 dark:shadow-black/20 flex flex-col !p-4 gap-3 group-hover:pointer-events-auto min-w-[360px] w-fit">
				
				<div className="flex items-center gap-4 p-1">

					<img className="w-12"
						src={ `https://cdn.ipregistry.co/flags/emojitwo/${ server.location.country_code2.toLowerCase() }.svg` } />
					
					<div className="leading-tight font-roboto font-medium whitespace-nowrap w-full">
						<div className="flex w-full justify-between items-center text-gray-700 dark:text-gray-300">
							<h1 className="text-lg">{server.location.country_name}</h1>
							<p>{ server.location.district || server.location.state_prov || server.location.country_capital }</p>
						</div>
						<div className="text-sm flex justify-between gap-2 w-full">
							<p className={ classNames(server.ping < 50 ? "text-success" : server.ping < 150 ? "text-warn" : "text-error") }>{server.ping}ms</p>
							<span className="text-gray-400 dark:text-gray-600">•</span>
							<p>{ Intl.NumberFormat().format(Math.floor(distance)) }km</p>
							<span className="text-gray-400 dark:text-gray-600">•</span>
							<p>{server.location.ip}</p>
						</div>
					</div>

				</div>

				{ (isActive && (status === "connecting" || status === "disconnecting")) ? (
					<Button className="m-0 !bg-transparent pointer-events-none"
						raised={ false }>
						<Spinner className="w-6 mx-auto" />
					</Button>
				) : (
					(isActive && status === "connected" && ipLocation.ip === server.ip) ? (
						<Button className="m-0"
							color="error"
							onClick={ disconnect }>
							Disconnect
						</Button>
					) : (
						<Button className="m-0"
							color="success"
							onClick={ connect }>
							Connect
						</Button>
					)
				)}

				{/* { !isConnected && <Button className={ classNames("m-0", isLoading && "!bg-opacity-25 !shadow-none pointer-events-none") }
					color="primary"
					onClick={ connect }>{isLoading ? <Spinner className="w-6 mx-auto !stroke-primary" /> : "Connect"}</Button>
				}
				{ isConnected && <Button className={ classNames("m-0", isLoading && "!bg-opacity-25 !shadow-none pointer-events-none") }
					color="error"
					onClick={ disconnect }>{isLoading ? <Spinner className="w-6 mx-auto !stroke-error" /> : "Disconnect"}</Button> */}
				
			</div>
		</div>
	);
}