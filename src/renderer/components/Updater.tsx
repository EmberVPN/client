import classNames from "classnames";
import { useState } from "react";
import Button from "./Button";

export default function Updater(): JSX.Element {

	const [ state, setState ] = useState(true);

	return (
		<div className={ classNames("group absolute w-full h-full flex justify-center items-center z-[40] bg-black/20 transition-opacity", state ? "opacity-1 pointer-events-auto active" : "opacity-0 pointer-events-none") }>
			<div className="text-sm shadow dark:shadow-xl text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden dark:shadow-black/20 flex flex-col p-4 gap-2 w-full h-full md:max-w-[600px] md:max-h-[400px] md:rounded-2xl group-[.active]:scale-100 scale-50 transition-transform">

				<div className="bg-red-500">lol</div>
				<div className="bg-green-500 grow">lol</div>

				<div className="flex justify-between items-center">
					<Button
						color="outlined"
						onClick={ () => setState(false) }
						raised={ false }>Not now</Button>
					
				</div>

			</div>
		</div>
	);
}