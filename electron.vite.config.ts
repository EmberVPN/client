import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import tsconfigPaths from "vite-tsconfig-paths";

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
				"styles": "./src/renderer/styles"
			}
		},
		define: {
			global: {},
			APIROOT: JSON.stringify("https://api.embervpn.org"),
			VERSION: JSON.stringify(version),
			DEVELOPMENT: JSON.stringify(process.env.NODE_ENV === "development"),
			PLATFORM: JSON.stringify(process.platform)
		},
		plugins: [
			react(),
			tsconfigPaths()
		]
	}
});
