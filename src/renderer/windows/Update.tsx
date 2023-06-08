import { useAutoAnimate } from "@formkit/auto-animate/react";
import Button from "@ui-elements/Button";
import Spinner from "@ui-elements/Spinner";
import classNames from "classnames";
import { useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdBrowserUpdated, MdErrorOutline } from "react-icons/md";
import { gt } from "semver";
import Titlebar from "../components/Titlebar";
import useData from "../util/hooks/useData";
import { usePromise } from "../util/hooks/usePromise";

export function UpdateWindow(): JSX.Element {

	// Use auto animate
	const [ ref ] = useAutoAnimate();
	const [ loading, setLoading ] = useState(false);
	
	// Render the content
	function Content() {

		// Fetch the downloads
		const { data } = useData("/v2/ember/downloads");
		const ovpnVersion = usePromise(electron.ipcRenderer.invoke("openvpn", "version"));
	
		// Show the loading spinner if there is no data
		if (!data || !ovpnVersion) return (
			<div className="flex items-center justify-center w-full"
				key="spinner">
				<Spinner />
			</div>
		);

		// If failed, show the error message
		if (!data.success) return (
			<div className="flex flex-col items-center justify-center w-full grow"
				key="error">
				<div className="flex flex-col items-center gap-2 px-4 m-auto">
					<MdErrorOutline className="text-6xl shrink-0 text-error" />
					<h1 className="text-2xl font-medium">Failed to check for updates</h1>
					<p className="mb-2 text-sm font-medium dark:font-normal opacity-60">{ data.readable ?? data.description ?? data.error ?? "We were unable to check for updates. Please try again later."}</p>
				</div>
			</div>
		);

		// Get the latest version
		const latest = data.version.substring(1);
		const isLatest = latest === version || gt(version, latest);

		// Get the latest OpenVPN version
		const ovpnLatest = data.openvpn.substring(1);
		const isOvpnLatest = ovpnLatest === ovpnVersion || gt(ovpnVersion, ovpnLatest);

		// Get the versions to display
		const versions = [ {
			name: "Ember VPN",
			version: latest,
			isLatest,
		}, {
			name: "OpenVPN Core",
			subtitle: "Required by Ember VPN",
			isLatest: isOvpnLatest,
			version: ovpnLatest
		} ];

		const outdated: string[] = [];
		if (!isLatest) outdated.push("embervpn");
		if (!isOvpnLatest) outdated.push("openvpn");

		// Update the application
		async function update() {
			setLoading(true);
			electron.ipcRenderer.send("update", outdated);

			// Wait for the update to finish
			await new Promise(resolve => electron.ipcRenderer.once("update-finished", resolve));
			setLoading(false);

		}

		// If the version is the latest, show the message
		return (
			<div className="flex flex-col items-center justify-around w-full grow"
				key="result">
				<div className="flex flex-col items-center gap-2 px-4 m-auto">
					
					{/* Update status */}
					<MdBrowserUpdated className={ classNames("text-6xl shrink-0", outdated.length === 0 ? "text-success" : "text-warn") } />
					<h1 className="text-2xl font-medium">{outdated.length === 0 ? "You're' up to date" : "Update found"}</h1>
					<p className="mb-2 text-sm font-medium dark:font-normal opacity-60">
						{outdated.length === 0 ? "You're running the latest version of Ember VPN." : "Updates found. Updating"}
					</p>
				</div>
					
				{/* Dependencies */}
				<ul className="w-full max-w-xs divide-y divide-gray-200 dark:divide-gray-700/50">
					{versions.map((item, key) => (
						<li className="flex items-center h-12 gap-2"
							key={ key }>
								
							{/* Dependency icon */}
							{ item.isLatest ? <IoMdCheckmarkCircleOutline className="text-2xl text-success shrink-0" /> : <MdErrorOutline className="text-2xl text-warn shrink-0" />}
								
							{/* Dependency name */}
							<div className="flex flex-col">
								<strong>{item.name}</strong>
								{item.subtitle && <span className="-mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{item.subtitle}</span>}
							</div>

							{/* Dependency version */}
							<code className={ classNames("px-1.5 py-0.5 ml-auto font-mono text-sm rounded-md border", item.isLatest ? "text-gray-600 bg-gray-200 dark:text-gray-400 dark:bg-gray-800/50 border-gray/10" : "text-warn-800 dark:text-warn-300 border-warn-700/50 dark:border-warn-400/50 bg-warn/10") }>v{item.version}</code>
								
						</li>
					))}
				</ul>

				{/* Update button */}
				<div className="flex justify-end w-full gap-4 p-2 mt-4">
					<Button className={ classNames(outdated.length === 0 && "hidden") }
						color="warn"
						loading={ loading }
						onClick={ update }
						variant="outlined">install update</Button>
				</div>
				
			</div>
		);

	}

	return (
		<div className="flex flex-col w-screen h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
			<Titlebar minimizeable={ false }
				resizeable={ false }>Check for Updates</Titlebar>
			<div className="flex justify-center gap-2 px-4 py-4 select-none grow"
				ref={ ref }>
				<Content />
			</div>
		</div>
	);
}