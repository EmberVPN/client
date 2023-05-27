import Button from "@ui-elements/Button";
import { useState } from "react";
import Titlebar from "./Titlebar";

export function SettingsWindow(): JSX.Element {

	// Whether the save button is disabled
	const [ disabled ] = useState(true);

	return (
		<div className="flex flex-col w-screen h-screen overflow-hidden">
			<Titlebar minimizeable={ false }
				resizeable={ false }>Settings</Titlebar>

			{/* Settings content */}
			<div className="flex flex-col px-12 py-6 overflow-y-auto border-gray-200 divide-y divide-gray-200 grow border-y dark:border-gray-850 dark:divide-gray-850">

				welcome to the settings

			</div>

			{/* Actions & Save button */}
			<div className="flex items-center justify-end gap-4 p-4">
				<Button disabled={ disabled }
					variant="raised">save changes</Button>
			</div>
			
		</div>
	);
}