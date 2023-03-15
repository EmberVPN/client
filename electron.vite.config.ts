import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";

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
				"@renderer": resolve("src/renderer/src"),
				"assets": "./src/renderer/assets",
				"styles": "./src/renderer/styles",
			}
		},
		define: {
			global: {}
		},
		plugins: [
			react()
		]
	}
});
