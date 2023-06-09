import { useAutoAnimate } from "@formkit/auto-animate/react";
import EntryPoint from "../components/Application";
import Titlebar from "../components/Titlebar";
import Toolbar from "../components/Toolbar";

export function MainWindow() {

	const [ ref ] = useAutoAnimate();

	return (
		<div className="flex flex-col w-screen h-screen overflow-hidden">

			{/* Window title bar */}
			<Titlebar className="bg-white dark:bg-gray-800" />
			<Toolbar />

			{/* Application Contents */}
			<div className="relative flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto select-none grow"
				id="entrypoint"
				ref={ ref }>

				{/* Application */}
				<EntryPoint />

			</div>
				
		</div>
	);
}