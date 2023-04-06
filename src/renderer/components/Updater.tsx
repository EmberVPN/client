import classNames from "classnames";
import { useEffect, useState } from "react";
import { MdArrowForward, MdSystemUpdateAlt } from "react-icons/md";
import semver from "semver";
import useConnection from "../util/hooks/useConnection";
import useData from "../util/hooks/useData";
import { close } from "./Auth/MyAccount";
import Button from "./ui-elements/Button";
import Spinner from "./ui-elements/Spinner";

export default function Updater(): JSX.Element | null {

	// Initialize state
	const { status } = useConnection();
	const [ state, setState ] = useState(false);
	const { data: downloads } = useData("/ember/downloads");
	const [ isLoading, setIsLoading ] = useState(false);
	
	// Check for updates
	useEffect(function() {
		if (!downloads) return;
		const latest = downloads?.latest[platform];
		const shouldUpdate = semver.gt(latest?.version, VERSION) && localStorage.getItem("ignoreUpdate") !== latest?.version && status === "disconnected";
		if (!state && shouldUpdate) setState(true);
	}, [ downloads, state, status ]);
	
	// Get the latest version
	const latest = downloads?.latest[platform] as REST.Version;

	// Return base UI if no update is available
	if (!latest) return (
		<div className={ classNames("group fixed top-0 w-full h-full flex justify-center items-center z-40 bg-black/20 transition-opacity", state ? "opacity-1 pointer-events-auto active" : "opacity-0 pointer-events-none") }
			onClick={ close }>
			<div className="shadow-2xl bg-white dark:bg-gray-800 dark:shadow-black/20 w-full h-full md:max-w-[600px] md:max-h-[400px] md:rounded-lg group-[.active]:scale-100 scale-50 transition-transform" />
		</div>
	);

	// Tell the main process to download the update
	function download() {
		setIsLoading(true);
		electron.ipcRenderer.send("updater", "begin");
		electron.ipcRenderer.once("updater", () => setIsLoading(false));
	}

	// Render the updater dialog
	return (
		<div className={ classNames("group fixed top-0 w-full h-full flex justify-center items-center z-40 bg-black/20 transition-opacity", state ? "opacity-1 pointer-events-auto active" : "opacity-0 pointer-events-none") }
			onClick={ close }>
			<div className="text-sm shadow-2xl text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden dark:shadow-black/20 flex flex-col gap-2 w-full h-full md:max-w-[640px] md:max-h-[400px] md:rounded-lg group-[.active]:scale-100 scale-50 transition-transform relative p-8 ">

				<div className={ classNames("bg-inherit absolute w-full top-0 left-0 h-full flex items-center justify-center z-[1] transition-opacity", isLoading ? "opacity-1 pointer-events-auto" : "opacity-0 pointer-events-none") }>
					<Spinner className="w-12 !stroke-gray-800 dark:!stroke-gray-200" />
				</div>

				<div className="grow flex flex-col gap-4">
					<div className="flex items-center gap-4 text-4xl z-[2]">
						<MdSystemUpdateAlt className="text-success mr-2 shrink-0" />
						<h1 className="font-manrope font-bold select-none truncate">Update available</h1>
					</div>
					<div className="flex gap-2 items-center">
						<h2 className="text-base opacity-90 grow">A new <b>{(semver.diff(VERSION, latest.version) || "patch") + (semver.diff(VERSION, latest.version)?.endsWith("r") ? " version" : "")}</b> is available.</h2>
						<code className="text-base font-mono border-[1px] px-2 rounded-2xl select-none border-gray-500/10 text-gray-500 bg-gray-500/10">v{ VERSION }</code>
						<MdArrowForward className="text-lg" />
						<code className="text-base font-mono border-[1px] px-2 rounded-2xl select-none border-success/10 text-success bg-success/10">v{ latest.version }</code>
					</div>
					<p className="opacity-75">Keeping Ember VPN up-to-date is crucial to ensure that you have access to the latest security features, bug fixes, and improvements.</p>
				</div>

				<div className="flex justify-end items-center gap-4 md:-m-4 !mt-2">
					<Button
						onClick={ () => [ setState(false), localStorage.setItem("ignoreUpdate", latest.version) ] }
						variant="outlined">Skip version</Button>
					<Button
						color="success"
						onClick={ download }>Download & Install</Button>
				</div>

			</div>
		</div>
	);
}