import favicon from "@assets/icon.svg";
import classNames from "classnames";
import React, { HTMLAttributes, useState } from "react";
import { VscChromeClose, VscChromeMaximize, VscChromeMinimize, VscChromeRestore } from "react-icons/vsc";

interface Props {
	children?: React.ReactNode;
	resizeable?: boolean;
}

export default function Titlebar({ children, resizeable = true, className, ...props }: Props & HTMLAttributes<HTMLDivElement>): JSX.Element {
	const [ maximized, setMaximized ] = useState(false);
	
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

	const isMac = PLATFORM === "darwin";

	return (
		<div className={ classNames("flex w-full items-center relative select-none text-gray-800 dark:text-gray-200 z-[70] font-windows app-drag", className, isMac ? "h-7 justify-center text-xs" : "text-sm h-8 justify-between") }
			{ ...props }>
			<div className="z-10 flex items-center gap-2 px-3">
				<img alt=""
					className={ classNames("h-5 aspect-square", isMac && "hidden") }
					src={ favicon } />
				<span className="flex items-center my-auto h-7">{children ? `Ember VPN - ${ children }` : "Ember VPN"}</span>
			</div>
			<div className={ classNames(isMac ? "hidden" : "flex") }>
				<div className="flex items-center justify-center h-8 text-base bg-opacity-0 select-none no-drag bg-neutral-500 hover:bg-opacity-10 active:hover:bg-opacity-20 last:hover:bg-red-500 last:hover:bg-opacity-100 last:hover:active:bg-opacity-70 last:hover:text-white w-[46px]"
					onClick={ () => electron.ipcRenderer.send("titlebar", "minimize") }><VscChromeMinimize /></div>
				{ resizeable && <div className="flex items-center justify-center h-8 text-base bg-opacity-0 select-none no-drag bg-neutral-500 hover:bg-opacity-10 active:hover:bg-opacity-20 last:hover:bg-red-500 last:hover:bg-opacity-100 last:hover:active:bg-opacity-70 last:hover:text-white w-[46px]"
					onClick={ () => electron.ipcRenderer.send("titlebar", "restore") }>{maximized ? <VscChromeRestore /> : <VscChromeMaximize />}</div>}
				<div className="flex items-center justify-center h-8 text-base bg-opacity-0 select-none no-drag bg-neutral-500 hover:bg-opacity-10 active:hover:bg-opacity-20 last:hover:bg-red-500 last:hover:bg-opacity-100 last:hover:active:bg-opacity-70 last:hover:text-white w-[46px]"
					onClick={ () => electron.ipcRenderer.send("titlebar", "hide") }><VscChromeClose /></div>
			</div>
		</div>
	);
}