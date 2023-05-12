import favicon from "@assets/icon.svg";
import ThemeToggle from "@ui-elements/ThemeToggle";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EntryPoint from "./Application";
import Authorize from "./components/Auth/Login";
import Titlebar from "./components/Titlebar";
import Toolbar from "./components/Toolbar";
import "./styles/index.less";
import useConnection, { ConnectionProvider } from "./util/hooks/useConnection";
import useData from "./util/hooks/useData";
import { useUser } from "./util/hooks/useUser";
import queryClient from "./util/queryClient";

// Create the root element
const root = createRoot(document.getElementById("root") as HTMLElement);

// Render the app providers
root.render(
	<QueryClientProvider client={ queryClient }>
		<ToastContainer
			autoClose={ 5000 }
			closeOnClick
			draggable
			hideProgressBar={ false }
			newestOnTop={ false }
			pauseOnFocusLoss
			pauseOnHover
			position="top-right"
			rtl={ false }
			theme="colored"
		/>
		<ThemeToggle provider />
		<ConnectionProvider>

			{/* Application entry point */}
			<Application />
		
		</ConnectionProvider>
	</QueryClientProvider>
);

// Export the application
export default function Application() {

	// Get the user, ip location and server registry
	const { user } = useUser();
	const { data } = useData("/v2/ember/servers");
	const { ipLocation } = useConnection();

	// If the user is definitely not logged in, show the login screen
	if (user === false) return (
		<div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">

			{/* Window title bar */}
			<Titlebar resizeable={ false }>Sign In</Titlebar>

			{/* Login screen */}
			<Authorize />

		</div>
	);
	
	// If we have all the data, render the app
	if (user && ipLocation && data) return (
		<div className="flex flex-col w-screen h-screen overflow-hidden">

			{/* Window title bar */}
			<Titlebar className="bg-white dark:bg-gray-800" />
			<div className="relative flex flex-col overflow-auto overflow-x-hidden select-none grow">

				<Toolbar />

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