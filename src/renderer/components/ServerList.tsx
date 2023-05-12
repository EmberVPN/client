import { useAutoAnimate } from "@formkit/auto-animate/react";
import Spinner from "@ui-elements/Spinner";
import { useEffect, useState } from "react";
import { calculateDistance } from "../util/calculateDistance";
import useConnection from "../util/hooks/useConnection";
import Server from "./Server";

export type PingedServer = Ember.Server & { ping: number; };

/* eslint-disable react-hooks/exhaustive-deps */
export function ServerList({ servers: _servers }: { servers: Ember.Server[]; }): JSX.Element {

	// Initialize state
	const [ ref ] = useAutoAnimate();
	const { active, ipLocation } = useConnection();
	const [ servers, setServers ] = useState<PingedServer[]>([]);

	// Sort servers by distance then by active
	const sort = (servers: PingedServer[]) => servers.sort((a, b) => {
		if (!ipLocation) return 0;
		const distanceA = calculateDistance(a.location.latitude, a.location.longitude, ipLocation?.latitude, ipLocation?.longitude);
		const distanceB = calculateDistance(b.location.latitude, b.location.longitude, ipLocation?.latitude, ipLocation?.longitude);
		return distanceA - distanceB;
	}).sort((a, b) => {
		if (!active) return 0;
		if (a.hash === active) return -1;
		if (b.hash === active) return 1;
		return 0;
	});
	
	// Side effect to ping servers
	function ping() {

		// Run for each server in parallel
		Promise.allSettled(_servers.map(server => new Promise((resolve, reject) => {

			// Otherwise, ping server
			electron.ipcRenderer.invoke("ping-server", server)
				.then(ping => resolve({ ...server, ping }));

			// If no response within 1s, reject
			setTimeout(() => reject(), 1000);

			// Filter out rejected promises
		}))).then(results => results.filter(result => result.status === "fulfilled")
			.map(result => (result as { value: PingedServer; }).value))

			// Sort & set
			.then(sort)
			.then(setServers);
	}

	// Ping on mount
	useEffect(ping, [ active ]);
	useEffect(function() {
		if (!ipLocation) return;
		const interval = setInterval(ping, 5000);
		return () => clearInterval(interval);
	}, [ ipLocation, ping ]);

	// Render ServerList
	return (
		<div className="relative flex flex-col overflow-hidden overflow-y-auto bg-gray-100 grow dark:bg-gray-850">
			{!servers.length ? (
				<div className="flex flex-col items-center justify-center w-full h-full"
					key={ -1 }>
					<Spinner className="w-12" />
				</div>
			) : (
				<ul className="flex flex-col w-[380px] gap-4 p-4 py-20 m-auto"
					ref={ ref }>
					{servers.map(server => (
						<Server key={ server.hash }
							server={ server } />))}
				</ul>
			)}
		</div>
	);
}
