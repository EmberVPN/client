import classNames from "classnames";
import { useEffect, useState } from "react";
import { MdLocationPin } from "react-icons/md";
import { toast } from "react-toastify";
import useIpLocation from "../util/hooks/useIpLocation";
import queryClient from "../util/queryClient";
import Button from "./Button";
import Spinner from "./Spinner";

export default function Servers({ server }: { server: Ember.Server }): JSX.Element | null {

	const [ isLoading, setIsLoading ] = useState(false);
	const [ isConnected, setConnected ] = useState(false);
	const ipLocation = useIpLocation();

	useEffect(function() {
		electron.ipcRenderer.on("openvpn", (_event, state: string, hash: string, data) => {

			// Clear currentLocation query
			queryClient.refetchQueries("currentLocation");
			
			switch (state) {
			case "disconnected":
				setConnected(false);
				break;
			case "error":
				setIsLoading(false);
				if (hash !== server.hash) break;
				toast.error(data);
				setConnected(false);
				break;
			}

		});
	}, [ server.hash ]);
	
	useEffect(function() {
		if (!ipLocation) return;
		if (ipLocation.ip === server.ip) {
			setConnected(true);
			setIsLoading(false);
			electron.ipcRenderer.send("openvpn", "connected", JSON.stringify({ server }));
		} else {
			setConnected(false);
		}
	}, [ ipLocation, server ]);

	function connect() {
		setIsLoading(true);
		electron.ipcRenderer.send("openvpn", "connect", JSON.stringify({ server, authorization: localStorage.getItem("authorization") }));
	}
	
	function disconnect() {
		setIsLoading(true);
		electron.ipcRenderer.send("openvpn", "disconnect");
	}

	function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const R = 6371; // km
		const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
		const φ2 = (lat2 * Math.PI) / 180;
		const Δφ = ((lat2 - lat1) * Math.PI) / 180;
		const Δλ = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c;
		return distance;
	}

	const latitude = parseFloat(server.location.latitude);
	const longitude = parseFloat(server.location.longitude);

	if (!ipLocation) return null;

	const distance = calculateDistance(latitude, longitude, ipLocation.latitude, ipLocation.longitude);

	return (
		<div className="absolute group hover:z-[1]"
			style={{
				bottom: `${ (latitude + 90) / 180 * 100 }%`,
				left: `${ (longitude + 180) / 360 * 100 }%`,
			}}>
			
			<div className="w-14 aspect-square -translate-x-1/2 rounded-full">
				<MdLocationPin className="text-primary text-6xl group-hover:scale-150 origin-bottom opacity-60 group-hover:opacity-100 transition-[opacity,transform]" />
			</div>
			<div className="group-hover:scale-100 scale-75 opacity-0 group-hover:opacity-100 transition-all absolute px-2 py-0.5 text-sm origin-top-left rounded-lg top-0 pointer-events-none
shadow-xl border dark:border-gray-700/50 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden -m-4 dark:shadow-black/20 flex flex-col !p-4 gap-3 group-hover:pointer-events-auto min-w-[360px] w-fit">
				<div className="flex items-center gap-4">
					<img alt="France"
						className="w-12"
						src={ `https://cdn.ipregistry.co/flags/emojitwo/${ server.location.country_code2.toLowerCase() }.svg` } />
					<div className="leading-tight font-roboto font-medium whitespace-nowrap w-full">
						<h1 className="text-lg text-gray-700 dark:text-gray-300">{ server.location.country_name}</h1>
						<div className="text-sm flex gap-2 w-full">
							<p className={ classNames(server.ping < 50 ? "text-success" : server.ping < 150 ? "text-amber-500" : "text-error") }>{server.ping}ms</p>
								•
							<p>{ Intl.NumberFormat().format(Math.floor(distance)) }km</p>
								•
							<p>{server.location.ip}</p>
						</div>
					</div>
				</div>
				{ !isConnected && <Button className={ classNames(isLoading && "!bg-opacity-25 !shadow-none pointer-events-none") }
					color="primary"
					onClick={ connect }>{isLoading ? <Spinner className="w-6 mx-auto !stroke-primary" /> : "Connect"}</Button>
				}
				{ isConnected && <Button className={ classNames(isLoading && "!bg-opacity-25 !shadow-none pointer-events-none") }
					color="error"
					onClick={ disconnect }>{isLoading ? <Spinner className="w-6 mx-auto !stroke-error" /> : "Disconnect"}</Button>
				}
			</div>
		</div>
	);
}