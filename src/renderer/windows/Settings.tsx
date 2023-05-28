import Button from "@ui-elements/Button";
import useMounted from "@ui-elements/util/useMounted";
import Titlebar from "../components/Titlebar";
import { useConfigKey } from "../util/hooks/useConfigKey";
import useConnection from "../util/hooks/useConnection";

export function SettingsWindow() {

	// Get the current IP location
	const { ipLocation } = useConnection();
	
	// Adjust the window size
	useMounted(() => electron.ipcRenderer.invoke("window-size", 600, 400));

	// Get the config
	const [ config, setUnits ] = useConfigKey("units.distance");
	const imperial = config === undefined ? ipLocation?.country_code === "US" : config === "IMPERIAL";

	// If location is still loading
	if (!ipLocation) return null;

	return (
		<div className="flex flex-col w-screen h-screen overflow-hidden bg-gray-100 dark:bg-gray-850">
			<Titlebar minimizeable={ false }
				resizeable={ false }>Settings</Titlebar>
			<div className="flex gap-2 px-8 py-4 select-none grow">

				<pre>{JSON.stringify({ imperial }, null, 2)}</pre>

				<Button onClick={ () => setUnits("IMPERIAL") }>imperial</Button>
				<Button onClick={ () => setUnits("METRIC") }>metric</Button>

			</div>
		</div>
	);
}