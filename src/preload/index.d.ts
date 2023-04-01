import { ElectronAPI } from "@electron-toolkit/preload";

declare const electron: ElectronAPI;

declare global {
	interface Window {
		electron: ElectronAPI;
		api: unknown;
		platform: string;
	}
}
