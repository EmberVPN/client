import Button from "@ui-elements/Button";
import Spinner from "@ui-elements/Spinner";
import { MdLaunch } from "react-icons/md";
import { ServerList } from "./components/ServerList";
import useData from "./util/hooks/useData";

export default function EntryPoint(): JSX.Element | null {

	// Get the server registry
	const { data } = useData("/v2/ember/servers");

	// If the server registry is still loading
	if (!data) return <Spinner />;

	// Show the server list
	if (Object.keys(data.servers).length > 0) return <ServerList servers={ Object.values(data.servers) } />;
	
	return (
		<div className="relative flex flex-col items-center justify-center overflow-hidden overflow-y-auto bg-gray-100 grow dark:bg-gray-850"
			id="entrypoint">
			<div className="max-w-screen-xl px-4 py-8 mx-auto sm:py-16 lg:px-6">
				<div className="max-w-screen-sm mx-auto text-center">
					<h1 className="mb-4 font-extrabold tracking-tight text-7xl lg:text-9xl text-primary-600 dark:text-primary-500">Uh Oh</h1>
					<p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">Something&apos;s missing.</p>
					<p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">It appears you do not currently have an active subscription with us or that it may have expired.</p>
					<a href="https://embervpn.org/"
						rel="noreferrer"
						target="_blank">
						<Button className="inline-flex items-center gap-2">
								View Online
							<MdLaunch className="text-2xl" />
						</Button>
					</a>
				</div>
			</div>
		</div>
		
	);
	
}

