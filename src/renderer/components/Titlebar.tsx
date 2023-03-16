import React, { HTMLAttributes, useState } from "react";
import { VscChromeClose, VscChromeMaximize, VscChromeMinimize, VscChromeRestore } from "react-icons/vsc";
import favicon from "../assets/ember.svg";

interface Props {
	children?: React.ReactNode;
	resizeable?: boolean;
}

export default function Titlebar({ children, resizeable = true }: Props & HTMLAttributes<HTMLDivElement>): JSX.Element {
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

	return (
		<div className="titlebar--root">
			<div className="flex items-center px-3 gap-2 z-10">
				<img alt=""
					className="titlebar--icon"
					src={ favicon } />
				<span>{children ? `Ember VPN - ${ children }` : "Ember VPN"}</span>
			</div>
			<div className="flex">
				<div className="titlebar--button"
					onClick={ () => electron.ipcRenderer.send("titlebar", "minimize") }><VscChromeMinimize /></div>
				{ resizeable && <div className="titlebar--button"
					onClick={ () => electron.ipcRenderer.send("titlebar", "restore") }>{maximized ? <VscChromeRestore /> : <VscChromeMaximize />}</div>}
				<div className="titlebar--button"
					onClick={ window.close }><VscChromeClose /></div>
			</div>
		</div>
	);
}