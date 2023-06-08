import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useData from "./useData";

type State =| "connected"
			| "disconnected"
			| "connecting"
			| "reconnecting"
			| "disconnecting"
			| "error"
			| "installing"
			| "will-connect";

interface GeoLocation {
	success: boolean;
	country_code: string;
	latitude: number;
	longitude: number;
	ip: string;
}

interface Context<T = State> {
	status: T;
	ipLocation: GeoLocation | null;
	active: false | string;
	setStatus: React.Dispatch<React.SetStateAction<T>>;
	setIpLocation: React.Dispatch<React.SetStateAction<GeoLocation | null>>;
	setActive: React.Dispatch<React.SetStateAction<false | string>>;
	lastStateChange: number;
}

const GlobalStateContext = createContext<Context>({
	status: "disconnected",
	ipLocation: null,
	active: false,
	setStatus: () => { },
	setIpLocation: () => { },
	setActive: () => { },
	lastStateChange: Date.now()
});

export function ConnectionProvider({ children }: PropsWithChildren) {
	const [ status, setStatus ] = useState<State>("disconnected");
	const [ active, setActive ] = useState<false | string>(false);
	const [ ipLocation, setIpLocation ] = useState<GeoLocation | null>(null);
	const [ lastStateChange, setLastStateChange ] = useState<number>(Date.now());
	const { data: servers } = useData("/v2/ember/servers");
	const lastServerRef = useRef<string>("");
	
	// Sync state with main process
	useEffect(function() {
		
		electron.ipcRenderer.on("openvpn", (_event, state: string, hash?: string, message?: string) => {
			if (hash) lastServerRef.current = hash;
			switch (state) {

				case "log":
					console.log(JSON.parse(message || "{}"));
					break;
				
				case "error":
					toast.error(message);
				case "disconnected":
					setStatus("disconnected");
					setActive(false);
					break;
					
				case "connected":
					setLastStateChange(Date.now());
				case "will-connect":
				case "connecting":
					setActive(hash || false);
				case "disconnecting":
				case "installing":
					setStatus(state);
					break;
				
			}
		});
		
		// Observe IP address changes
		electron.ipcRenderer.on("iplocation", (_event, string) => {
			const data = JSON.parse(string);

			// If the IP has changed, update the location
			if (data.ip !== ipLocation?.ip) setIpLocation(data);

			// If we're disconnecting, set the status to disconnected
			if (status === "disconnecting") {

				// If we dont have the IP of one of the servers, set it as disconnected
				if (!servers || !servers.success) return;
				if (Object.values(servers.servers).some(server => server.ip === data.ip)) return;

				setStatus("disconnected");
				setActive(false);
				return;

			}

			// Get the server that matches the IP
			if (!servers || !servers.success) return;
			const server = Object.values(servers.servers).find(server => server.ip === data.ip);

			// If we have a server, set the status to connected
			if (server && ![ "will-connect", "disconnecting" ].includes(status)) {
				setStatus("connected");
				setActive(server.hash);
				return;
			}

		});

		return () => {
			electron.ipcRenderer.removeAllListeners("openvpn");
			electron.ipcRenderer.removeAllListeners("iplocation");
		};
	}, [ active, ipLocation, servers, setActive, setIpLocation, setStatus, status ]);

	return <GlobalStateContext.Provider value={{ status, setStatus, active, setActive, ipLocation, setIpLocation, lastStateChange }}>{children}</GlobalStateContext.Provider>;
}

export default function useConnection() {
	return useContext(GlobalStateContext);
}