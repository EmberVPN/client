import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	contextBridge.exposeInMainWorld("electron", electronAPI);
	contextBridge.exposeInMainWorld("api", api);
	contextBridge.exposeInMainWorld("config", {
		get(key: string) {
			return ipcRenderer.sendSync("electron-store-get", key);
		},
		set(property: string, val: unknown) {
			ipcRenderer.send("electron-store-set", property, val);
		},
	});
}
