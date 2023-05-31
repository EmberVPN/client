import { useEffect, useState } from "react";

export function useConfigKey<T = unknown>(key: string) {

	// Initialize state
	const [ state, setState ] = useState<T>(electron.ipcRenderer.sendSync("config", key));
	
	// Observe state changes
	useEffect(function() {
		
		// Listen for config updates
		electron.ipcRenderer.on("config-updated", function(_, k: string, value: unknown) {
			if (key === k) setState(value as T);
		});

	}, [ key ]);
	
	return [ state, (value: unknown) => electron.ipcRenderer.send("config", key, value) ] as [T, (value: T) => void];

}