/// <reference types="vite/client" />

declare const electron: ElectronAPI;
declare const APIROOT: string;

declare const VERSION: string;

declare type ErrorMessage = `${ number } ${ string }`;

declare interface APIErrorResponse {
	success: false;

	/* The error code */
	message: ErrorMessage;

	/* What went wrong on an API level */
	description: string;

	/* Human readable version of what happened (safe to show the user) */
	readable?: string;
}

declare type APIResponse<T = unknown> = T & { success: true } | APIErrorResponse;
