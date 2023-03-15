import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import favicon from "./assets/ember.svg";
import Authorize from "./components/Authorize";
import EntryPoint from "./components/EntryPoint";
import Titlebar from "./components/Titlebar";
import "./styles/index.less";
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
		<Application />
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
		<div className="h-screen flex flex-col">
			<Titlebar />
			<div className="grow overflow-x-hidden overflow-auto">
				<EntryPoint />
			</div>
		</div>
	);

	return (
		<div className="grid h-screen items-center justify-center relative window">
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<div className="bg-primary-500 aspect-square w-[400px] rounded-full animate-pulse -z-10"></div>
			</div>
			<img className="select-none z-10"
				src={ favicon } />
		</div>
	);
}