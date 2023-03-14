import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/index.less";
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

import favicon from "./assets/ember.svg";

// Export the application
export function Application() {
	return (
		<div className="grid h-screen items-center justify-center relative">
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<div className="bg-primary-500 aspect-square w-[400px] rounded-full animate-pulse -z-10"></div>
			</div>
			<img className="select-none z-10"
				src={ favicon } />
		</div>
	);
}