import classNames from "classnames";
import { useState } from "react";
import SettingsHeader from "./SettingsHeader";

export let setOpen: () => unknown;

export default function Settings(): JSX.Element {

	const [ state, setState ] = useState(false);
	setOpen = () => setState(true);

	return (
		<div className={ classNames("bg-white dark:bg-gray-800 top-0 left-0 right-0 bottom-0 absolute z-[40] transition-opacity", state ? "pointer-events-all opacity-1" : "pointer-events-none opacity-0 flex flex-col grow") }>
			<SettingsHeader setState={ setState } />
			<div className="grow p-4">
				<div className="container !max-w-xl mx-auto">
					<pre>{ JSON.stringify(state, null, 2) }</pre>
				</div>
			</div>
		</div>
	);
}

