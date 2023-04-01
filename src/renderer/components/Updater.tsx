import classNames from "classnames";
import { useEffect, useState } from "react";
import { MdSystemUpdateAlt } from "react-icons/md";
import semver from "semver";
import useData from "../util/hooks/useData";
import Button from "./Button";
import Spinner from "./Spinner";

export default function Updater(): JSX.Element | null {

	const [ state, setState ] = useState(false);
	const { data: downloads } = useData("/ember/downloads");
	const [ loading, setLoading ] = useState(true);
	
	useEffect(function() {
		if (!downloads) return;
		const latest = downloads?.latest[platform];
		const shouldUpdate = semver.gt(latest?.version, DEVELOPMENT ? "0.0.0" : VERSION) && localStorage.getItem("ignoreUpdate") !== latest?.version;
		if (!state && shouldUpdate) setState(true);
	}, [ downloads, state ]);
	
	function update() {
		setLoading(true);
		electron.ipcRenderer.send("update");
	}
	
	const latest = downloads?.latest[platform] as REST.Version;
	if (!latest) return (
		<div className={ classNames("group absolute w-full h-full flex justify-center items-center z-[40] bg-black/20 transition-opacity", state ? "opacity-1 pointer-events-auto active" : "opacity-0 pointer-events-none") }>
			<div className="shadow dark:shadow-xl bg-white dark:bg-gray-800  dark:shadow-black/20 w-full h-full md:max-w-[600px] md:max-h-[400px] md:rounded-2xl group-[.active]:scale-100 scale-50 transition-transform" />
		</div>
	);

	return (
		<div className={ classNames("group absolute w-full h-full flex justify-center items-center z-[40] bg-black/20 transition-opacity", state ? "opacity-1 pointer-events-auto active" : "opacity-0 pointer-events-none") }>
			<div className="text-sm shadow dark:shadow-xl text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden dark:shadow-black/20 flex flex-col gap-2 w-full h-full md:max-w-[600px] md:max-h-[400px] md:rounded-2xl group-[.active]:scale-100 scale-50 transition-transform relative p-8">

				<div className="grow flex flex-col gap-4">
					<div className="flex items-center gap-4 text-4xl ">
						<MdSystemUpdateAlt className="text-success" />
						<h1 className="font-manrope font-bold select-none">Update available</h1>
						<div className="font-mono ml-auto text-xl opacity-70 border px-2 rounded-lg dark:border-gray-700">{ latest.version }</div>
					</div>
					<p>No additional information is known about this update</p>
				</div>

				<div className="flex justify-end items-center gap-4 md:-m-4">
					<Button
						className={ classNames(loading && "opacity-50 pointer-events-none") }
						color="outlined"
						onClick={ () => [ setState(false), localStorage.setItem("ignoreUpdate", latest.version) ] }
						raised={ false }>Skip version</Button>
					<Button
						className={ classNames(loading && "!bg-opacity-0 !shadow-none pointer-events-none") }
						color="success"
						onClick={ update }
						raised={ false }>{loading ? <Spinner className="w-8 mx-3 !stroke-success" /> : "Update"}</Button>
				</div>

			</div>
		</div>
	);
}