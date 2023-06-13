import { useQuery } from "react-query";
import { useConfigKey } from "./useConfigKey";

interface Endpoints {
	"/v2/ember/servers": EmberAPI.Servers;
	"/v3/ember/downloads": EmberAPI.ClientDownloads;
}

export default function useData<T extends keyof Endpoints>(route: T): { data: REST.APIResponse<Endpoints[T]> | undefined, isLoading: boolean } {

	// Get authorization token
	const [ authorization ] = useConfigKey("auth.token");

	const { isLoading, data } = useQuery(route, async function() {
		return await fetch(`https://api.embervpn.org${ route }`, {
			headers: { authorization }
		})
			.then(res => res.json());
	});

	return { isLoading, data };

}