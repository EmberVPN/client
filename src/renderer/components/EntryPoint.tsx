import favicon from "../assets/ember.svg";
import { calculateDistance } from "../util/calculateDistance";
import useData from "../util/hooks/useData";
import useIpLocation from "../util/hooks/useIpLocation";
import { useUser } from "../util/hooks/useUser";
import Server from "./Server";

export default function EntryPoint(): JSX.Element | null {

	const { user } = useUser();
	const { data, isLoading } = useData("/ember/servers");
	const ipLocation = useIpLocation();

	if (!user) return null;

	if (isLoading) {
		return (
			<div className="grid h-screen items-center justify-center relative window">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<div className="bg-primary aspect-square w-[400px] rounded-full animate-pulse -z-10"></div>
				</div>
				<img className="select-none z-10"
					src={ favicon } />
			</div>
		);
	}

	if (!data || !data.success) return (
		<pre>
			{ JSON.stringify(data, null, 2) }
		</pre>
	);

	const { servers } = data;

	// If no servers
	if (Object.keys(servers).length === 0) return (
		<div className="grow h-full flex flex-col items-center justify-center">
			<div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
				<div className="mx-auto max-w-screen-sm text-center">
					<h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary">Uh Oh!</h1>
					<p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">No servers available.</p>
					<p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">Your subscription dosnt include any servers.</p>
					<a className="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4 cursor-pointer"
						onClick={ () => window.open("//embervpn.org/plans") }>See Pricing</a>
				</div>
			</div>
		</div>
	);

	// List all servers
	return (
		<div className="grow relative overflow-hidden bg-white/50 dark:bg-gray-800/50 overflow-y-auto flex flex-col">
			<div className="flex flex-col p-4 gap-4 max-w-md mx-auto my-auto py-20">
				{Object.values(servers)
					.sort((a, b) => calculateDistance(ipLocation?.latitude || 0, ipLocation?.longitude || 0, parseFloat(a.location.latitude), parseFloat(a.location.longitude)) - calculateDistance(ipLocation?.latitude || 0, ipLocation?.longitude || 0, parseFloat(b.location.latitude), parseFloat(b.location.longitude)))
					.map((server, key) => (
						<Server key={ key }
							server={ server } />
					))}
			</div>

		</div>
	);
	
}