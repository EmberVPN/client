import useMounted from "@ui-elements/util/useMounted";
import { ChangeEvent } from "react";
import Titlebar from "../components/Titlebar";
import DropDown from "../ui-elements/DropDown";
import { useConfigKey } from "../util/hooks/useConfigKey";
import useConnection from "../util/hooks/useConnection";

export function SettingsWindow() {

	// Get the current IP location
	const { ipLocation } = useConnection();
	
	// Adjust the window size
	useMounted(() => electron.ipcRenderer.invoke("window-size", 600, 400));

	// Get the config
	const [ units, setUnits ] = useConfigKey("units.distance");
	const imperial = units === undefined ? ipLocation?.country_code === "US" : units === "IMPERIAL";

	// If location is still loading
	if (!ipLocation) return null;

	return (
		<div className="flex flex-col w-screen h-screen overflow-hidden">
			<Titlebar minimizeable={ false }
				resizeable={ false }>Settings</Titlebar>
			
			<div className="flex flex-col gap-2 px-8 overflow-auto divide-y select-none grow divide-gray-20 dark:divide-gray-700/50">

				<section>
					<h1 className="mt-6 -mb-2 text-2xl font-medium">App appearance</h1>
					<div className="divide-y divide-gray-20 dark:divide-gray-700/50">

						<div className="flex items-center justify-between gap-4 py-2">
							<div className="flex flex-col justify-center">
								<h1 className="-mb-1 text-lg font-medium opacity-80">Distance Units</h1>
								<p className="text-sm opacity-50">Change the units used to display distances.</p>
							</div>
							<div className="pt-3 my-auto">
								<DropDown
									defaultValue={ imperial ? "Imperial (mi)" : "Metric (km)" }
									label="Distance Units"
									onChange={ (event: ChangeEvent<HTMLInputElement>) => setUnits(event.target.value === "Imperial (mi)" ? "IMPERIAL" : "METRIC") }
									options={ [
										"Metric (km)",
										"Imperial (mi)"
									] } />
							</div>
						</div>

					</div>
				</section>

			</div>
		</div>
	);
}