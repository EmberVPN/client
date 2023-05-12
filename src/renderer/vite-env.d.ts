/// <reference types="vite/client" />

// Expose electron types
type Electron = import("electron");
declare const electron: Electron;

declare const APIROOT: string;
declare const VERSION: string;