import favicon from "../assets/ember.svg";
import useData from "../util/hooks/useData";
import { useUser } from "../util/hooks/useUser";
import Map from "./Map";

export default function EntryPoint(): JSX.Element | null {

	const { user } = useUser();
	const { data, isLoading } = useData("/ember/servers");

	if (!user) return null;

	if (isLoading) {
		return (
			<div className="grid h-screen items-center justify-center relative window">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<div className="bg-primary-500 aspect-square w-[400px] rounded-full animate-pulse -z-10"></div>
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
					<h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">Uh Oh!</h1>
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
		<div className="grow h-full flex flex-col gap-4 relative overflow-hidden">
			<Map servers={ Object.values(servers) } />
		</div>
	);
	
}