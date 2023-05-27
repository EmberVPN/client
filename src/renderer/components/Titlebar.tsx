import favicon from "@assets/icon.svg";
import classNames from "classnames";
import React, { HTMLAttributes, useEffect, useState } from "react";
import { VscChromeClose, VscChromeMaximize, VscChromeMinimize, VscChromeRestore } from "react-icons/vsc";

interface Props {
	children?: React.ReactNode;
	resizeable?: boolean;
	minimizeable?: boolean;
}

export default function Titlebar({ children, resizeable = true, minimizeable = true, className, ...props }: Props & HTMLAttributes<HTMLDivElement>): JSX.Element {

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

	// Is macos
	const isMac = PLATFORM === "darwin";

	// Window button class
	const button = classNames("flex items-center justify-center h-8 text-base bg-opacity-0 select-none no-drag bg-neutral-500 hover:bg-opacity-10 active:hover:bg-opacity-20 last:hover:bg-red-500 last:hover:bg-opacity-100 last:hover:active:bg-opacity-70 last:hover:text-white w-[46px]");

	return (
		<div className={ classNames("flex w-full items-center relative select-none text-gray-800 dark:text-gray-200 z-[70] font-windows app-drag text-xs", className, isMac ? "h-7 justify-center" : "h-8 justify-between") }
			{ ...props }>
			
			{/* Left side */}
			<div className="z-10 flex items-center gap-2.5 px-3">

				{/* Icon */}
				<img className={ classNames("h-5 aspect-square", isMac && "hidden") }
					src={ favicon } />
				
				{/* Title */}
				<span className="flex items-center my-auto h-7">{children ? `${ children } • Ember VPN` : "Ember VPN"}</span>
				
			</div>

			{/* Window controls (hide for mac) */}
			<div className={ classNames(isMac ? "hidden" : "flex") }>
				
				{/* Minimize */}
				{ minimizeable && <div className={ button }
					onClick={ () => electron.ipcRenderer.send("titlebar", "minimize") }>{ <VscChromeMinimize /> }</div>}
				
				{/* Maximize/restore */}
				{ resizeable && <div className={ button }
					onClick={ () => electron.ipcRenderer.send("titlebar", "restore") }>{maximized ? <VscChromeRestore /> : <VscChromeMaximize />}</div>}
				
				{/* Close */}
				<div className={ button }
					onClick={ () => electron.ipcRenderer.send("titlebar", "hide") }><VscChromeClose /></div>
				
			</div>

		</div>
	);
}