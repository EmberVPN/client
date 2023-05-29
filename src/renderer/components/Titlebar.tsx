import favicon from "@assets/icon.svg";
import classNames from "classnames";
import React, { HTMLAttributes, useEffect, useState } from "react";
import { VscChromeClose, VscChromeMaximize, VscChromeMinimize, VscChromeRestore } from "react-icons/vsc";

interface Props {
	children?: React.ReactNode;
	resizeable?: boolean;
	minimizeable?: boolean;
}

export default function Titlebar({ children, resizeable = true, minimizeable = true, className }: Props & HTMLAttributes<HTMLDivElement>) {

	// Maximize state
	const [ maximized, setMaximized ] = useState(false);
	
	// On mount, set resizeable
	useEffect(function() {
		electron.ipcRenderer.send("titlebar", "resizeable", resizeable);
	}, [ resizeable ]);
	
	// On mount, set minimizeable
	useEffect(function() {
		electron.ipcRenderer.send("titlebar", "minimizeable", minimizeable);
	}, [ minimizeable ]);
	
	// Listen for maximize/restore events
	electron.ipcRenderer.on("titlebar", (_, action: string) => {
		switch (action) {
		case "maximize":
			setMaximized(true);
			break;
		case "restore":
			setMaximized(false);
			break;
		}
	});

	// If were on mac, our job is easy
	if (platform === "darwin") return (
		<div className={ classNames("flex h-7 shrink-0 w-full items-center relative isolate select-none text-gray-800 dark:text-gray-200 z-[70] font-system app-drag text-xs justify-center", className) }>
			<p className="flex items-center my-auto">{children ? `${ children } • Ember VPN` : "Ember VPN"}</p>
		</div>
	);

	// Somewhat easier on windows
	if (platform === "win32") return (
		<div className={ classNames("flex h-8 shrink-0 w-full items-center relative isolate select-none text-gray-800 dark:text-gray-200 z-[70] font-system app-drag text-xs justify-between", className) }>
			
			{/* Left side */}
			<div className="z-10 flex items-center px-1">
				<img className="h-4 mx-2 aspect-square"
					src={ favicon } />
				<p className="flex items-center my-auto">{children ? `${ children } • Ember VPN` : "Ember VPN"}</p>
			</div>

			{/* Window controls */}
			<div className="flex h-full">
				{[ {
					icon: <VscChromeMinimize />,
					action: "minimize",
					enabled: minimizeable
				}, {
					icon: maximized ? <VscChromeRestore /> : <VscChromeMaximize />,
					action: "restore",
					enabled: resizeable
				}, {
					icon: <VscChromeClose />,
					action: "hide"
				} ].filter(({ enabled }) => enabled !== false).map(({ icon, action }, key) => (
					<button
						className="flex items-center justify-center bg-opacity-0 select-none no-drag bg-neutral-500 hover:bg-opacity-10 active:hover:bg-opacity-20 last:hover:bg-red-500 last:hover:bg-opacity-100 last:hover:active:bg-opacity-70 last:hover:text-white text-base h-full w-[46px]"
						key={ key }
						onClick={ () => electron.ipcRenderer.send("titlebar", action) }>{ icon }</button>
				))}
			</div>

		</div>
	);

	// Generic titlebar for most other platforms and linux distros
	return (
		<div className={ classNames("flex h-9 shrink-0 w-full items-center relative isolate select-none text-gray-800 dark:text-gray-200 z-[70] font-system app-drag justify-center group", className) }>
			
			{/* Window title  */}
			<p className="flex items-center my-auto font-medium -z-[1]">{children ? `${ children } • Ember VPN` : "Ember VPN"}</p>
			
			{/* Window controls */}
			<div className="flex items-center h-full gap-3 px-2 text-xs z-[2] absolute right-0">
				{[ {
					icon: <VscChromeMinimize />,
					action: "minimize",
					enabled: minimizeable
				}, {
					icon: maximized ? <VscChromeRestore /> : <VscChromeMaximize />,
					action: "restore",
					enabled: resizeable
				}, {
					icon: <VscChromeClose />,
					action: "hide"
				} ].filter(({ enabled }) => enabled !== false).map(({ icon, action }, key) => (
					<button
						className="bg-gray bg-opacity-20 hover:bg-opacity-30 active:bg-opacity-40 rounded-full aspect-square h-[22px] flex items-center justify-center no-drag"
						key={ key }
						onClick={ () => electron.ipcRenderer.send("titlebar", action) }>{ icon }</button>
				))}
			</div>

		</div>
	);
}