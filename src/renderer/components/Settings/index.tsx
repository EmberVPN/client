import classNames from "classnames";
import { useState } from "react";
import SettingsHeader from "./SettingsHeader";

export let setOpen: () => unknown;

export default function Settings(): JSX.Element {
	
	const [ state, setState ] = useState(false);
	setOpen = () => setState(true);

	electron.ipcRenderer.on("settings", (_, action: string) => {
		switch (action) {
		case "open":
			setState(true);
			break;
		case "close":
			setState(false);
			break;
		}
	});

	return (
		<div className={ classNames("top-0 left-0 right-0 bottom-0 absolute z-[40] transition-opacity overflow-hidden bg-gray-200 dark:bg-gray-900 font-roboto", state ? "pointer-events-all opacity-1" : "pointer-events-none opacity-0 flex flex-col grow") }>
			<SettingsHeader setState={ setState } />
			<div className="grow p-4 max-h-[calc(100%_-_64px)] overflow-x-hidden overflow-y-auto">
				<div className="container !max-w-xl mx-auto grow">

					<h1 className="text-gray-600 dark:text-gray-400 text-lg">Application</h1>
					<pre>{JSON.stringify({
						"version": VERSION,
					}, null, 2) }</pre>
					
				</div>
			</div>
		</div>
	);
}

