import classNames from "classnames";
import { ChangeEvent, HTMLAttributes, PropsWithChildren, useState } from "react";
import Checkbox from "../Checkbox";
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

					<section>
						<h1 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Application</h1>
						<div className="divide-y divide-gray-300/50 dark:divide-gray-800/50">
							<ToggleOption
								defaultChecked={ config.get("settings.application.start-on-boot") === true }
								onChange={ (e: ChangeEvent<HTMLInputElement>) => config.set("settings.application.start-on-boot", e.target.checked) }>Start on boot</ToggleOption>
						</div>
					</section>
					
				</div>
			</div>
		</div>
	);
}

function ToggleOption({ children, ...props }: PropsWithChildren & HTMLAttributes<HTMLInputElement>): JSX.Element {
	props.id = props.id || Math.floor(Math.random() * 10e10).toString(16);
	return (
		<label className="flex items-center justify-between h-14"
			htmlFor={ props.id }>
			<p className="text-gray-800 dark:text-gray-300">{ children }</p>
			<Checkbox { ...props } />
		</label>
	);
}