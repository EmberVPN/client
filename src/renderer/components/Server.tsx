import { useEffect, useState } from "react";
import { MdLocationPin } from "react-icons/md";
import { toast } from "react-toastify";
import useIpLocation from "../util/hooks/useIpLocation";
import queryClient from "../util/queryClient";
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

			<div className="absolute opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 -translate-x-1/2 transition-[opacity,transform] scale-75 group-hover:scale-100 origin-top w-fit">
				<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-xl flex flex-col min-w-[360px] gap-4">
					
					<div className="flex items-center gap-4">
						<img
							className="rounded"
							src={ `https://my.vultr.com/_images/flags/flagsm_${ server.location.country_code2.toLowerCase() }.png` } />
						
						<div className="flex flex-col w-full">
							<div className="flex flex-nowrap justify-between text-xl font-medium whitespace-nowrap">
								<h1 className="grow">{server.location.country_name}</h1>
								<p className="text-gray-500 font-medium font-mono">{server.hostname.split("-")[1]}</p>
							</div>
							<div className="flex flex-nowrap gap-2 items-center text-gray-700 dark:text-gray-400 font-medium text-sm">
								<span>{ Intl.NumberFormat().format(Math.floor(distance)) }km</span>
								<span>•</span>
								<span>{server.ping}ms</span>
								<span className="grow"></span>
								<span>{server.ip}</span>
							</div>
						</div>
					</div>

					{ !isConnected && <button className="h-12 text-primary hover:bg-primary/10 bg-primary/5 text-lg font-medium rounded-lg"
						onClick={ connect }>{isLoading ? <Spinner className="w-5 mx-auto !stroke-primary" /> : "Quick Connect"}</button>}
					{isConnected && <button className="h-12 bg-red-600 hover:bg-red-700 text-white text-lg font-medium rounded-lg"
						onClick={ disconnect }>{isLoading ? <Spinner className="w-5 mx-auto !stroke-white" /> : "Disconnect"}</button>}

				</div>
			</div>

		</div>
	);
}