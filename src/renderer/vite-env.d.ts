/// <reference types="vite/client" />

declare const electron: ElectronAPI;
declare const APIROOT: string;
declare const VERSION: string;

declare const config: {
	get(key: string): unknown;
	set(key: string, val: unknown): void;
};

declare const platform: string;