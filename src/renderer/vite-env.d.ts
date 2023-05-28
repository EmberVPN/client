/// <reference types="vite/client" />

// Expose electron types
declare const platform: string;
declare const version: string;
declare const electron: typeof import("electron");