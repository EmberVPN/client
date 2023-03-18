import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
	main: {
		plugins: [ externalizeDepsPlugin() ]
	},
	preload: {
		plugins: [ externalizeDepsPlugin() ]
	},
	renderer: {
		resolve: {
			alias: {
				"assets": "./src/renderer/assets",
				"styles": "./src/renderer/styles",
			}
		},
		define: {
			global: {},
			APIROOT: JSON.stringify("https://api.embervpn.org")
			// APIROOT: JSON.stringify("http://10.16.70.10/api")
			// APIROOT: JSON.stringify(process.env.NODE_ENV === "production" ? "https://api.embervpn.org" : "http://10.16.70.10:80/api")
		},
		plugins: [
			react()
		]
	}
});
