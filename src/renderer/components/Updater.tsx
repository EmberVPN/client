import classNames from "classnames";
import { useEffect, useState } from "react";
import { MdDownload, MdSystemUpdateAlt } from "react-icons/md";
import semver from "semver";
import useData from "../util/hooks/useData";
import { close } from "./Auth/MyAccount";
import Button from "./Button";
import Spinner from "./Spinner";

export default function Updater(): JSX.Element | null {

	const [ state, setState ] = useState(false);
	const { data: downloads } = useData("/ember/downloads");
	const [ isLoading, setIsLoading ] = useState(false);
	
	useEffect(function() {
		if (!downloads) return;
		const latest = downloads?.latest[platform];
		const shouldUpdate = semver.gt(latest?.version, VERSION) && localStorage.getItem("ignoreUpdate") !== latest?.version;
		if (!state && shouldUpdate) setState(true);
	}, [ downloads, state ]);
	
	const latest = downloads?.latest[platform] as REST.Version;
	if (!latest) return (
		<div className={ classNames("group fixed top-0 w-full h-full flex justify-center items-center z-40 bg-black/20 transition-opacity", state ? "opacity-1 pointer-events-auto active" : "opacity-0 pointer-events-none") }
			onClick={ close }>
			<div className="shadow-2xl bg-white dark:bg-gray-800 dark:shadow-black/20 w-full h-full md:max-w-[600px] md:max-h-[400px] md:rounded-lg group-[.active]:scale-100 scale-50 transition-transform" />
		</div>
	);

	function download() {
		setIsLoading(true);
		electron.ipcRenderer.send("updater", "begin");
		electron.ipcRenderer.once("updater", function() {
			setIsLoading(false);
		});
	}

	return (
		<div className={ classNames("group fixed top-0 w-full h-full flex justify-center items-center z-40 bg-black/20 transition-opacity", state ? "opacity-1 pointer-events-auto active" : "opacity-0 pointer-events-none") }
			onClick={ close }>
			<div className="text-sm shadow-2xl text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden dark:shadow-black/20 flex flex-col gap-2 w-full h-full md:max-w-[600px] md:max-h-[400px] md:rounded-lg group-[.active]:scale-100 scale-50 transition-transform relative p-8">

				<div className="grow flex flex-col gap-4">
					<div className="flex items-center gap-4 text-4xl ">
						<MdSystemUpdateAlt className="text-success mr-2" />
						<h1 className="font-manrope font-bold select-none">Update available</h1>
						<code className="text-base ml-auto font-mono border-[1px] px-2 rounded-2xl select-none border-gray-500/10 text-gray-500 bg-gray-500/10">v{VERSION}</code>
					</div>
					<p className="font-roboto opacity-75">No additional information is known about this update...</p>
					<div className="rounded-lg bg-gray-300 dark:bg-gray-700 p-4 flex items-center gap-4 cursor-pointer !bg-opacity-25 hover:!bg-opacity-40 hover:active:!bg-opacity-60"
						onClick={ download }>
						{ isLoading ? <Spinner className="w-6 !stroke-gray-800 dark:!stroke-gray-200" /> : <MdDownload className="text-2xl" /> }
						<p className="font-roboto">{ latest.name }</p>
					</div>
				</div>

				<div className="flex justify-end items-center gap-4 md:-m-4">
					<Button
						color="outlined"
						onClick={ () => [ setState(false), localStorage.setItem("ignoreUpdate", latest.version) ] }
						raised={ false }>Skip version</Button>
				</div>

			</div>
		</div>
	);
}