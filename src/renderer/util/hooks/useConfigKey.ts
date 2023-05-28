import { useEffect, useState } from "react";

export function useConfigKey(key: string) {

	// Initialize state
	const [ state, setState ] = useState(electron.ipcRenderer.sendSync("config", key));
	
	// Observe state changes
	useEffect(function() {
		
		// Listen for config updates
		electron.ipcRenderer.on("config-updated", function(_, k: string, value: unknown) {
			if (key === k) setState(value);
		});

	}, [ key ]);
	
	return [ state, (value: unknown) => electron.ipcRenderer.send("config", key, value) ];

}