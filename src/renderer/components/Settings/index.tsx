import classNames from "classnames";
import { useState } from "react";
import { MdArrowBack } from "react-icons/md";
import ThemeToggle from "../ThemeToggle";
import Toolbar from "../ui-elements/Toolbar";
import Tooltip from "../ui-elements/Tooltip";

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
		<div className={ classNames("top-0 left-0 right-0 bottom-0 absolute z-[60] transition-opacity overflow-hidden bg-gray-200 dark:bg-gray-900 font-roboto duration-75", state ? "pointer-events-all opacity-1" : "pointer-events-none opacity-0 flex flex-col grow") }>
			<Toolbar htmlFor="settings">
				<div className="w-12 h-12 -m-4 -my-2 rounded-full flex items-center justify-center hover:bg-gray-500/10 hover:active:bg-gray-500/20 transition-colors group relative"
					onClick={ () => setState(false) }>
					<MdArrowBack className="text-2xl" />
					<Tooltip anchor="left">Back</Tooltip>
				</div>
				<h1 className="text-xl font-roboto mx-4">Settings</h1>
				<div className="grow" />
				<code className="font-mono border-[1px] px-2 rounded-2xl select-none border-gray-500/10 text-gray-500 bg-gray-500/10">v{VERSION}</code>
			</Toolbar>
			
			<div className="grow p-4 max-h-[calc(100%_-_64px)] overflow-x-hidden overflow-y-auto bg-white/50 dark:bg-gray-800/50 h-full"
				id="settings">
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

