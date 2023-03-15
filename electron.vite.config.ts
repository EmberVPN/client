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
			APIROOT: JSON.stringify("http://10.16.70.10:80/api")
		},
		plugins: [
			react()
		],
		server: {
			proxy: {
				"/api": {
					target: "http://10.16.70.10:80",
					changeOrigin: true,
				}
			}
		}
	}
});
