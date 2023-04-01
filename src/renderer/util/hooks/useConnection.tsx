import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

type State =| "connected"
			| "disconnected"
			| "connecting"
			| "reconnecting"
			| "disconnecting"
			| "error";

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
}

const GlobalStateContext = createContext<Context>({
	status: "disconnected",
	ipLocation: null,
	active: false,
	setStatus: () => { },
	setIpLocation: () => { },
	setActive: () => {},
});

export function ConnectionProvider({ children }: PropsWithChildren) {
	const [ status, setStatus ] = useState<State>("disconnected");
	const [ active, setActive ] = useState<false | string>(false);
	const [ ipLocation, setIpLocation ] = useState<GeoLocation | null>(null);
	
	// Sync state with main process
	useEffect(function() {
		
		electron.ipcRenderer.on("openvpn", (_event, state: string) => {
			switch (state) {
				
			case "error":
				setStatus("disconnected");
				setActive(false);
				break;
				
			case "connected":
			case "disconnected":
				setStatus(state);
				break;
				
			}
		});

		electron.ipcRenderer.on("iplocation", (_event, string) => {
			const data = JSON.parse(string);
			if (data.ip !== ipLocation?.ip) setIpLocation(data);
		});

		return () => {
			electron.ipcRenderer.removeAllListeners("openvpn");
			electron.ipcRenderer.removeAllListeners("iplocation");
		};
	}, [ active, ipLocation, setActive, setIpLocation, setStatus ]);

	return <GlobalStateContext.Provider value={{ status, setStatus, active, setActive, ipLocation, setIpLocation }}>{children}</GlobalStateContext.Provider>;
}

export default function useConnection() {
	return useContext(GlobalStateContext);
}