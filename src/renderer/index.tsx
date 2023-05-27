import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/index.less";
import { ConnectionProvider } from "./util/hooks/useConnection";
import queryClient from "./util/queryClient";
import { MainWindow } from "./windows/Main";
import { SettingsWindow } from "./windows/Settings";
import { UpdateWindow } from "./windows/Update";

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
		<ConnectionProvider>

			{/* Application entry point */}
			<Application />
		
		</ConnectionProvider>
	</QueryClientProvider>
);

// Export the application
export default function Application() {

	// If the URL contains the settings hash, show the settings window
	if (window.location.hash.includes("settings")) return <SettingsWindow />;

	// If the URL contains the update hash, show the update window
	if (window.location.hash.includes("updates")) return <UpdateWindow />;
	
	// Otherwise, show the main window
	return <MainWindow />;

}