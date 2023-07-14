import { useAutoAnimate } from "@formkit/auto-animate/react";
import Button from "@ui-elements/Button";
import Spinner from "@ui-elements/Spinner";
import { useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdArrowRight, MdBrowserUpdated, MdErrorOutline } from "react-icons/md";
import { SemVer, coerce, lt, major, minor } from "semver";
import Titlebar from "../components/Titlebar";
import { cn } from "../util/cn";
import useData from "../util/hooks/useData";
import { usePromise } from "../util/hooks/usePromise";

export function UpdateWindow(): JSX.Element {

	// Use auto animate
	const [ ref ] = useAutoAnimate();

	// Fetch the downloads and OpenVPN version
	const { data, isLoading } = useData("/v3/ember/downloads");
	const ovpnVersion = usePromise<SemVer | null>(electron.ipcRenderer.invoke("openvpn", "version"));
	const opensshVersion = usePromise<SemVer | null>(electron.ipcRenderer.invoke("openssh", "version"));

	return (
		<div className="flex flex-col w-screen h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
			<Titlebar minimizeable={ false }
				resizeable={ false }>Check for Updates</Titlebar>
			<div className="flex justify-center gap-2 px-4 py-4 select-none grow"
				ref={ ref }>
				{ (!data || ovpnVersion === undefined || isLoading || opensshVersion === undefined) ? (
					<div className="flex items-center justify-center w-full"
						key="spinner">
						<Spinner />
					</div>
				) : <Content
					data={ data }
					opensshVersion={ opensshVersion }
					ovpnVersion={ ovpnVersion } /> }
			</div>
		</div>
	);
	
}

// Render the content
function Content({ ovpnVersion, data, opensshVersion }: { ovpnVersion: SemVer | null, opensshVersion: SemVer | null, data: REST.APIResponse<EmberAPI.ClientDownloads> }) {
		
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
	
	const outdated: string[] = [];
	
	// Initialize array of dependencies
	const dependencies = [ {
		name: "Ember VPN",
		wanted: coerce(data.latest),
		has: coerce(version),
		product: "embervpn",
	}, {
		name: "Open VPN",
		wanted: coerce(data.dependencies["openvpn"].latest),
		has: ovpnVersion?.raw ? coerce(ovpnVersion.raw) : null,
		product: "openvpn",
		subtitle: "Required by Ember VPN",
	}, {
		name: "Open SSH",
		wanted: coerce(data.dependencies["openssh"].latest),
		has: opensshVersion?.raw ? coerce(opensshVersion.raw) : null,
		product: "openssh",
		subtitle: "Required by Ember VPN",
	} ];
	
	// Add outdated dependencies
	dependencies.map(function(dependency) {

		// If we dont know what we want
		if (!dependency.wanted) return null;

		// If the dependency is missing, add it to the list
		if (!dependency.has) return outdated.push(dependency.product);

		// If the dependency is outdated, add it to the list
		if (lt(dependency.has, dependency.wanted) && dependency.product !== "openssh") return outdated.push(dependency.product);

		// Otherwise, for ssh
		if (dependency.product === "openssh" && major(dependency.has) > major(dependency.wanted) || minor(dependency.has) > minor(dependency.wanted)) return outdated.push(dependency.product);

		return null;
		
	});

	// Update the application
	async function update() {
		setLoading(true);
		electron.ipcRenderer.send("update", outdated);
		await new Promise(resolve => electron.ipcRenderer.once("update-finished", resolve));
		location.reload();
	}

	const isMissing = dependencies.some(item => item.has === null);
	const isUpToDate = outdated.length === 0;

	// Set window always on top
	electron.ipcRenderer.send("titlebar", "always-on-top", !isUpToDate);

	// If the version is the latest, show the message
	return (
		<div className="flex flex-col items-center justify-around w-full -mt-12 grow"
			key="result">
					
			{/* Update status */}
			<div className="flex flex-col items-center gap-2 px-4 m-auto">
				<MdBrowserUpdated className={ cn("text-6xl shrink-0 mt-9", isUpToDate ? "text-success" : "text-warn") } />
				<h1 className="text-2xl font-medium">{isMissing ? "Somethings missing" : isUpToDate ? "You're up to date" : "Update found"}</h1>
				<p className="mb-2 text-sm font-medium text-center dark:font-normal opacity-60">
					{isMissing ? "Ember VPN is missing software it depends on." : isUpToDate ? "You're running the latest version of Ember VPN." : "Stay up to date with the latest features and security fixes."}
				</p>
			</div>
					
			{/* Dependencies */}
			<ul className="w-full max-w-xs divide-y divide-gray-200 dark:divide-gray-700/50">
				{dependencies.map((item, key) => (
					<li className="flex items-center h-12 gap-2"
						key={ key }>
								
						{/* Dependency icon */}
						{ outdated.includes(item.product) ? <MdErrorOutline className="text-2xl text-warn shrink-0" /> : <IoMdCheckmarkCircleOutline className="text-2xl text-success shrink-0" />}
								
						{/* Dependency name */}
						<div className="flex flex-col grow">
							<strong>{item.name}</strong>
							{item.subtitle && <span className="-mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{item.subtitle}</span>}
						</div>

						{/* Dependency version */}
						<p className={ cn("font-medium text-sm uppercase h-6 flex items-center px-2 rounded-md", outdated.includes(item.product) ? "bg-warn-200 dark:bg-warn-700/50 text-warn-900 dark:text-warn-400" : "bg-gray-200 dark:bg-gray-700/50 text-gray-900 dark:text-gray-400") }>{item.has === null ? "MISSING" : item.has.toString()}</p>

						{/* Latest version */}
						{ outdated.includes(item.product) && item.wanted && (<>
							<MdArrowRight className="-mx-2.5 text-xl shrink-0" />
							<p className="flex items-center h-6 px-2 text-sm font-medium text-gray-900 uppercase bg-gray-200 rounded-md dark:bg-gray-700/50 dark:text-gray-400">{item.wanted.toString()}</p>
						</>)}
								
					</li>
				))}
			</ul>

			{/* Update button */}
			<div className="flex justify-end w-full gap-4 p-2 mt-4">
				<Button className={ cn((isUpToDate || isMissing) && "opacity-0 pointer-events-none", loading && "hidden") }
					color="gray"
					disabled={ loading }
					onClick={ () => [ electron.ipcRenderer.send("update", []), window.close() ] }
					variant="outlined">maybe later</Button>
				<Button className={ cn(isUpToDate && "opacity-0 pointer-events-none") }
					color="warn"
					loading={ loading }
					onClick={ update }
					variant="outlined">{isMissing ? "install" : "update"} all</Button>
			</div>
				
		</div>
	);

}