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
	
	// Get config hooks
	const [ units, setUnits ] = useConfigKey("settings.units.distance");
	const [ theme, setTheme ] = useConfigKey("settings.appearance.theme");
	const [ protocol, setProtocol ] = useConfigKey("settings.openvpn.protocol");

	// If location is still loading
	if (!ipLocation) return null;

	return (
		<div className="flex flex-col w-screen h-screen overflow-hidden">
			<Titlebar minimizeable={ false }
				resizeable={ false }>Settings</Titlebar>
			
			<div className="flex flex-col px-8 overflow-auto divide-y select-none grow divide-gray-20 dark:divide-gray-700/50">

				<section className="pb-4">
					<h1 className="mt-6 text-2xl font-medium">App appearance</h1>

					{/* Distance Units */}
					<div className="flex items-center justify-between h-20 gap-4 py-2 -mb-4">
						<div className="flex flex-col justify-center">
							<h1 className="-mb-0.5 text-lg font-medium opacity-80">Distance Units</h1>
							<p className="text-sm font-medium dark:font-normal opacity-60">Change the units used to display distances.</p>
						</div>
						<div className="pt-3 my-auto">
							<DropDown
								defaultValue={ (units === undefined ? ipLocation?.country_code === "US" : units === "IMPERIAL") ? "Imperial (mi)" : "Metric (km)" }
								label="Distance Units"
								onChange={ (event: ChangeEvent<HTMLInputElement>) => setUnits(event.target.value === "Imperial (mi)" ? "IMPERIAL" : "METRIC") }
								options={ [
									"Metric (km)",
									"Imperial (mi)"
								] } />
						</div>
					</div>
						
					{/* App theme */}
					<div className="flex items-center justify-between h-20 gap-4 py-2 -mb-4">
						<div className="flex flex-col justify-center">
							<h1 className="-mb-0.5 text-lg font-medium opacity-80">App theme</h1>
							<p className="text-sm font-medium dark:font-normal opacity-60">Change the theme used by the app.</p>
						</div>
						<div className="pt-3 my-auto">
							<DropDown
								defaultValue={ [ "LIGHT", "DARK" ].includes(theme) ? theme.toLowerCase().replace(/^[a-z]/, letter => letter.toUpperCase()) : "System (default)" }
								label="App theme"
								onChange={ (event: ChangeEvent<HTMLInputElement>) => setTheme(event.target.value.toUpperCase() as typeof theme) }
								options={ [
									"System (default)",
									"Light",
									"Dark"
								] } />
						</div>
					</div>

				</section>

				<section className="pb-4">
					<h1 className="mt-6 text-2xl font-medium">Settings</h1>

					{/* Protocol */}
					<div className="flex items-center justify-between h-20 gap-4 py-2 -mb-4">
						<div className="flex flex-col justify-center">
							<h1 className="-mb-0.5 text-lg font-medium opacity-80">Protocol</h1>
							<p className="text-sm font-medium dark:font-normal opacity-60">Select the protocol openvpn uses.</p>
						</div>
						<div className="pt-3 my-auto">
							<DropDown
								defaultValue={ protocol || "TCP" }
								label="Protocol"
								onChange={ (event: ChangeEvent<HTMLInputElement>) => setProtocol(event.target.value as typeof protocol) }
								options={ [
									"SSH",
									"TCP"
								] } />
						</div>
					</div>

				</section>

			</div>
		</div>
	);
}