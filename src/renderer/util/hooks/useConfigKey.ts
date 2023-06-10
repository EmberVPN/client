import { useEffect, useState } from "react";
import { ConfigType } from "../../../main/class/Config";

export function useConfigKey<T extends keyof ConfigType>(key: T) {

	// Initialize state
	const [ state, setState ] = useState<ConfigType[T]>(electron.ipcRenderer.sendSync("config", key));
	
	// Initialize setter
	function setter(value: ConfigType[T]) {
		setState(value);
		electron.ipcRenderer.send("config", key, value);
	}
	
	// Observe state changes
	useEffect(function() {
		
		// Listen for config updates
		electron.ipcRenderer.on("config-updated", function(_, k: string, value: unknown) {
			if (key === k) setState(value as ConfigType[T]);
		});

	});
	
	return [ state, setter ] as [
		ConfigType[T],
		React.Dispatch<React.SetStateAction<ConfigType[T]>>
	];

}