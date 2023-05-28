import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import tsconfigPaths from "vite-tsconfig-paths";

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
		plugins: [
			react(),
			tsconfigPaths()
		]
	}
});
