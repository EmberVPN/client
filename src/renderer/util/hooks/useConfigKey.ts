import { useEffect, useState } from "react";
import { ConfigType } from "../../../main/class/Config";

export function useConfigKey<T extends keyof ConfigType>(key: T) {

	// Initialize state
	const state = useState<T>(electron.ipcRenderer.sendSync("config", key));
	
	// Observe state changes
	useEffect(function() {
		
		// Listen for config updates
		electron.ipcRenderer.on("config-updated", function(_, k: string, value: unknown) {
			if (key === k) state[1](value as T);
		});

	}, [ key, state ]);
	
	return state;

}