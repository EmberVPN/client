import React, { createContext, PropsWithChildren, useContext, useState } from "react";

type State =| "connected"
			| "disconnected"
			| "connecting"
			| "reconnecting"
			| "disconnecting"
			| "error";

interface Context<T = State> {
	status: T;
	active: false | string;
	setStatus: React.Dispatch<React.SetStateAction<T>>;
	setActive: React.Dispatch<React.SetStateAction<false | string>>;
}

const GlobalStateContext = createContext<Context>({
	status: "disconnected",
	active: false,
	setStatus: () => {},
	setActive: () => {},
});

export function ConnectionProvider({ children }: PropsWithChildren) {
	const [ status, setStatus ] = useState<State>("disconnected");
	const [ active, setActive ] = useState<false | string>(false);
	return <GlobalStateContext.Provider value={{ status, setStatus, active, setActive }}>{children}</GlobalStateContext.Provider>;
}

export default function useConnection() {
	return useContext(GlobalStateContext);
}