import favicon from "@assets/icon.svg";
import EntryPoint from "../components/Application";
import Authorize from "../components/Authorize";
import Titlebar from "../components/Titlebar";
import Toolbar from "../components/Toolbar";
import useData from "../util/hooks/useData";
import { useUser } from "../util/hooks/useUser";

export function MainWindow() {

	// Get the user, ip location and server registry
	const { user } = useUser();
	const { data } = useData("/v2/ember/servers");

	// If this is the settings window

	// If the user is definitely not logged in, show the login screen
	if (user === false) return <Authorize />;
	
	// If we have all the data, render the app
	if (user && data) return (
		<div className="flex flex-col w-screen h-screen overflow-hidden">

			{/* Window title bar */}
			<Titlebar className="bg-white dark:bg-gray-800" />
			<Toolbar />

			{/* Application Contents */}
			<div className="relative flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto select-none grow"
				id="entrypoint">

				{/* Application */}
				<EntryPoint />

			</div>
			
		</div>
	);

	// Otherwise, show the splash screen
	return (
		<div className="flex items-center justify-center w-full h-screen bg-white dark:bg-gray-800">

			{/* Ripple background */}
			<div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
				<div className="bg-primary aspect-square w-[400px] rounded-full animate-ember -z-10" />
			</div>

			{/* Ember logo */}
			<img className="z-10 select-none"
				src={ favicon } />
			
		</div>
	);
}