import { useAutoAnimate } from "@formkit/auto-animate/react";
import Button from "@ui-elements/Button";
import Spinner from "@ui-elements/Spinner";
import classNames from "classnames";
import { useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdArrowRight, MdBrowserUpdated, MdErrorOutline } from "react-icons/md";
import { gt } from "semver";
import Titlebar from "../components/Titlebar";
import useData from "../util/hooks/useData";
import { usePromise } from "../util/hooks/usePromise";

export function UpdateWindow(): JSX.Element {

	// Use auto animate
	const [ ref ] = useAutoAnimate();

	// Fetch the downloads and OpenVPN version
	const { data, isLoading } = useData("/v3/ember/downloads");
	const ovpnVersion = usePromise<string>(electron.ipcRenderer.invoke("openvpn", "version"));

	return (
		<div className="flex flex-col w-screen h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
			<Titlebar minimizeable={ false }
				resizeable={ false }>Check for Updates</Titlebar>
			<div className="flex justify-center gap-2 px-4 py-4 select-none grow"
				ref={ ref }>
				{ (!data || !ovpnVersion || isLoading) ? (
					<div className="flex items-center justify-center w-full"
						key="spinner">
						<Spinner />
					</div>
				) : <Content data={ data }
					ovpnVersion={ ovpnVersion } /> }
			</div>
		</div>
	);
	
}

// Render the content
function Content({ ovpnVersion, data }: { ovpnVersion: string, data: REST.APIResponse<EmberAPI.ClientDownloads> }) {
		
	// Fetch the downloads
	const [ loading, setLoading ] = useState(false);

	// If failed, show the error message
	if (!data.success) return (
		<div className="flex flex-col items-center justify-center w-full grow"
			key="error">
			<div className="flex flex-col items-center gap-2 px-4 m-auto">
				<MdErrorOutline className="text-6xl shrink-0 text-error mt-9" />
				<h1 className="text-2xl font-medium">Failed to check for updates</h1>
				<p className="mb-2 text-sm font-medium dark:font-normal opacity-60">{ data.readable ?? data.description ?? data.error ?? "We were unable to check for updates. Please try again later."}</p>
			</div>
		</div>
	);

	// Get the latest version
	const latest = data.latest.substring(1);
	const isLatest = latest === version || gt(version, latest);

	// Get the latest OpenVPN version
	const ovpnLatest = data.dependencies["openvpn"].latest.substring(1);
	const isOvpnLatest = ovpnLatest === ovpnVersion || gt(ovpnVersion, ovpnLatest);

	// Get the versions to display
	const versions = [ {
		name: "Ember VPN",
		version,
		latest,
		isLatest,
	}, {
		name: "OpenVPN Core",
		subtitle: "Required by Ember VPN",
		isLatest: isOvpnLatest,
		version: ovpnLatest,
		latest: ovpnLatest,
	} ];

	const outdated: string[] = [];
	if (!isLatest) outdated.push("embervpn");
	if (!isOvpnLatest) outdated.push("openvpn");

	// Update the application
	async function update() {
		setLoading(true);
		electron.ipcRenderer.send("update", outdated);
		await new Promise(resolve => electron.ipcRenderer.once("update-finished", resolve));
		setLoading(false);
	}

	// If the version is the latest, show the message
	return (
		<div className="flex flex-col items-center justify-around w-full grow"
			key="result">
			<div className="flex flex-col items-center gap-2 px-4 m-auto">
					
				{/* Update status */}
				<MdBrowserUpdated className={ classNames("text-6xl shrink-0 mt-9", outdated.length === 0 ? "text-success" : "text-warn") } />
				<h1 className="text-2xl font-medium">{outdated.length === 0 ? "You're up to date" : "Update found"}</h1>
				<p className="mb-2 text-sm font-medium text-center dark:font-normal opacity-60">
					{outdated.length === 0 ? "You're running the latest version of Ember VPN." : "Stay up to date with the latest features and security fixes." }
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
						<div className="flex flex-col grow">
							<strong>{item.name}</strong>
							{item.subtitle && <span className="-mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{item.subtitle}</span>}
						</div>

						{/* Dependency version */}
						<p className={ classNames("font-medium text-sm uppercase h-6 flex items-center px-2 rounded-md", {
							"bg-gray-200 dark:bg-gray-700/50 text-gray-900 dark:text-gray-400": item.isLatest,
							"bg-warn-200 dark:bg-warn-700/50 text-warn-900 dark:text-warn-400": !item.isLatest,
						}) }>{item.version}</p>

						{/* Latest version */}
						{!item.isLatest && (<>
							<MdArrowRight className="-mx-2.5 text-xl shrink-0" />
							<p className="flex items-center h-6 px-2 text-sm font-medium text-gray-900 uppercase bg-gray-200 rounded-md dark:bg-gray-700/50 dark:text-gray-400">{item.latest}</p>
						</>)}
								
					</li>
				))}
			</ul>

			{/* Update button */}
			<div className="flex justify-end w-full gap-4 p-2 mt-4">
				<Button className={ classNames(outdated.length === 0 && "opacity-0 pointer-events-none") }
					color="gray"
					disabled={ loading }
					onClick={ () => [ electron.ipcRenderer.send("update", []), window.close() ] }
					variant="outlined">maybe later</Button>
				<Button className={ classNames(outdated.length === 0 && "opacity-0 pointer-events-none") }
					color="warn"
					loading={ loading }
					onClick={ update }
					variant="outlined">install update</Button>
			</div>
				
		</div>
	);

}