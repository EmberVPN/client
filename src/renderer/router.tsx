import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import favicon from "./assets/ember.svg";
import Authorize from "./components/Auth/Login";
import EntryPoint from "./components/EntryPoint";
import Settings from "./components/Settings";
import ThemeToggle from "./components/ThemeToggle";
import Titlebar from "./components/Titlebar";
import Toolbar from "./components/Toolbar";
import Updater from "./components/Updater";
import "./styles/index.less";
import { ConnectionProvider } from "./util/hooks/useConnection";
import { useUser } from "./util/hooks/useUser";
import queryClient from "./util/queryClient";

// Create the root element
const root = createRoot(document.getElementById("root") as HTMLElement);
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
			<Application />
		</ConnectionProvider>
	</QueryClientProvider>
);

// Export the application
export function Application() {

	const { user } = useUser();

	if (user === false) return (
		<div className="h-screen flex flex-col">
			<Titlebar resizeable={ false }>Sign In</Titlebar>
			<Authorize />
		</div>
	);
	
	if (user) return (
		<div className="h-screen flex flex-col overflow-hidden">
			<Titlebar />
			<div className="grow overflow-x-hidden overflow-auto flex flex-col select-none relative">
				<Toolbar />
				<Settings />
				<Updater />
				<EntryPoint />
			</div>
		</div>
	);

	return (
		<div className="grid h-screen items-center justify-center relative window">
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<div className="bg-primary aspect-square w-[400px] rounded-full animate-pulse -z-10"></div>
			</div>
			<img className="select-none z-10"
				src={ favicon } />
		</div>
	);
}