import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

import { version } from "./package.json";

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
			APIROOT: JSON.stringify("https://api.embervpn.org"),
			VERSION: JSON.stringify(version)
		},
		plugins: [
			react()
		]
	}
});
