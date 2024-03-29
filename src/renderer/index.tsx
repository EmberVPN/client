import { ToastProvider } from "@nextui/Toast";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "react-query";
import "./styles/index.less";
import { useConfigKey } from "./util/hooks/useConfigKey";
import { ConnectionProvider } from "./util/hooks/useConnection";
import queryClient from "./util/queryClient";
import { AuthorizeWindow } from "./windows/Authorize";
import { MainWindow } from "./windows/Main";
import { SettingsWindow } from "./windows/Settings";
import { UpdateWindow } from "./windows/Update";

// Create the root element
const root = createRoot(document.getElementById("root") as HTMLElement);

// Render the app providers
root.render(
	<QueryClientProvider client={ queryClient }>
		<ToastProvider>
			<ConnectionProvider>
				<Application />
			</ConnectionProvider>
		</ToastProvider>
	</QueryClientProvider>
);

// Export the application
export default function Application() {

	// Theme provider from config
	const [ theme ] = useConfigKey("settings.appearance.theme");
	useEffect(function() {
		if (theme === "DARK") return document.documentElement.classList.add("dark");
		if (theme === "LIGHT") return document.documentElement.classList.remove("dark");
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) return document.documentElement.classList.add("dark");
		document.documentElement.classList.remove("dark");
	}, [ theme ]);

	// If the URL contains the settings hash, show the settings window
	switch (decodeURIComponent(window.location.hash.substring(1)).split("-ember-vpn")[0]) {
		default: return <MainWindow />;
		case "check-for-updates": return <UpdateWindow />;
		case "settings": return <SettingsWindow />;
		case "sign-in": return <AuthorizeWindow />;
	}

}