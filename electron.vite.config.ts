import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	main: {
		plugins: [ externalizeDepsPlugin() ],
		build: {
			minify: "terser",
			terserOptions: {
				compress: true,
				mangle: true
			}
		}
	},
	preload: {
		plugins: [ externalizeDepsPlugin() ],
		build: {
			minify: "terser",
			terserOptions: {
				compress: true,
				mangle: true
			}
		}
	},
	renderer: {
		plugins: [
			react(),
			tsconfigPaths()
		],
		build: {
			minify: "terser",
			terserOptions: {
				compress: true,
				mangle: true
			}
		}
	}
});
