import classNames from "classnames";
import { useState } from "react";
import ThemeToggle from "../ThemeToggle";
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

	document.onkeyup = e => {
		if (e.key === "Escape") {
			setState(false);
		}
	};

	return (
		<div className={ classNames("top-0 left-0 right-0 bottom-0 absolute z-[40] transition-opacity overflow-hidden bg-gray-200 dark:bg-gray-900 font-roboto duration-75", state ? "pointer-events-all opacity-1" : "pointer-events-none opacity-0 flex flex-col grow") }>
			<SettingsHeader setState={ setState } />
			<div className="grow p-4 max-h-[calc(100%_-_64px)] overflow-x-hidden overflow-y-auto bg-white/50 dark:bg-gray-800/50 h-full">
				<div className="container !max-w-xl mx-auto grow">

					<section className="flex flex-col gap-2">
						<h1 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Application</h1>
						<ul>
							<ThemeToggle className="flex h-14 items-center gap-4 hover:bg-gray-200 dark:hover:bg-gray-800 px-6 rounded-md transition-colors duration-75">
								<kbd className="px-2 py-1.5 text-xs font-semibold border rounded-lg border-gray-400/50 bg-gray-400/10 dark:border-gray-700/50 dark:bg-gray-700/10">F10</kbd>
							</ThemeToggle>
						</ul>
					</section>
					
				</div>
			</div>
		</div>
	);
}

