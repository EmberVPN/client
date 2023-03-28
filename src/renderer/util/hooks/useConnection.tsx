import React, { createContext, PropsWithChildren, useContext, useState } from "react";

type State =| "connected"
			| "disconnected"
			| "connecting"
			| "reconnecting"
			| "disconnecting"
			| "error";

interface Context<T = State> {
	state: T;
	setState: React.Dispatch<React.SetStateAction<T>>;
}

const GlobalStateContext = createContext<Context>({
	state: "disconnected",
	setState: () => {},
});

export function ConnectionProvider({ children }: PropsWithChildren) {
	const [ state, setState ] = useState<State>("disconnected");
	return <GlobalStateContext.Provider value={{ state, setState }}>{children}</GlobalStateContext.Provider>;
}

export default function useConnection() {
	return Object.values(useContext(GlobalStateContext)) as [ State, React.Dispatch<React.SetStateAction<State>> ];
}