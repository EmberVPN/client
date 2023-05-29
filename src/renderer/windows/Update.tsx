import Button from "@ui-elements/Button";
import Spinner from "@ui-elements/Spinner";
import { useEffect } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdBrowserUpdated } from "react-icons/md";
import { gt } from "semver";
import Titlebar from "../components/Titlebar";
import useData from "../util/hooks/useData";

export function UpdateWindow(): JSX.Element {
	
	// Render the content
	function Content() {

		// Fetch the downloads
		const { data } = useData("/v2/ember/downloads");
	
		// On mount, set the window size
		useEffect(function() {
			electron.ipcRenderer.invoke("window-size", 512, 128, false);
			
			// Get the latest version
			if (!data || !data.success) return;
			const latest = data.version.substring(1);
			const isLatest = latest === version || gt(version, latest);

			electron.ipcRenderer.invoke("window-size", 512, isLatest ? 128 : 240);

		}, [ data ]);

		// Show the loading spinner if there is no data
		if (!data || !data.success) return (
			<div className="flex items-center w-full gap-8">
				<Spinner />
				<div className="grow">
					<h1 className="font-medium">Checking for updates...</h1>
				</div>
			</div>
		);

		// Get the latest version
		const latest = data.version.substring(1);
		
		// Get some boolean values
		const isLatest = latest === version;
		const isPreview = gt(version, latest);
		
		if (isLatest || isPreview) return (
			<div className="flex flex-col w-full gap-2 select-none">
				<div className="flex items-center gap-4">
					<IoMdCheckmarkCircleOutline className="text-2xl shrink-0 text-success" />
					<h1 className="font-medium">You&apos;re already up to date</h1>
				</div>
				<p className="text-sm text-gray-600 grow dark:text-gray-400">You&apos;re running Ember <code className="font-mono bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded-md">v{ version }</code> which is {isLatest ? "the" : "newer then the"} latest version.</p>
			</div>
		);

		return (
			<div className="flex flex-col w-full gap-2 select-none">
				<div className="flex items-center gap-4">
					<MdBrowserUpdated className="text-2xl shrink-0 text-warn" />
					<h1 className="font-medium">Update available</h1>
				</div>
				<div className="flex flex-col gap-2 text-sm text-gray-600 grow dark:text-gray-400">
					<p>A newer version of Ember is available. You&apos;re running <code className="font-mono bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded-md">v{version}</code> and the latest version is <code className="font-mono bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded-md">v{latest}</code>.</p>
					<p>Keeping Ember up to date is important for security and stability.</p>
				</div>
				<div className="flex items-center justify-end p-4 mt-2 -mx-8 -mb-4 border-t border-gray-200 dark:border-gray-700/50">
					<a href="https://www.embervpn.org/downloads/"
						rel="noreferrer"
						target="_blank">
						<Button>Download</Button>
					</a>
				</div>
			</div>
		);

	}

	return (
		<div className="flex flex-col w-screen h-screen overflow-hidden bg-gray-100 dark:bg-gray-850">
			<Titlebar minimizeable={ false }
				resizeable={ false }>Check for Updates</Titlebar>
			<div className="flex gap-2 px-8 py-4 select-none grow">
				<Content />
			</div>
		</div>
	);
}