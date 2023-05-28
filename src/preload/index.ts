import { electronAPI } from "@electron-toolkit/preload";
import { is } from "@electron-toolkit/utils";
import { contextBridge } from "electron";
import { version } from "../../package.json";

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	
	// Expose electron types
	contextBridge.exposeInMainWorld("electron", electronAPI);
	contextBridge.exposeInMainWorld("platform", process.platform);
	contextBridge.exposeInMainWorld("version", version);
	
}
