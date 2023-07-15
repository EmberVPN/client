import { useQuery } from "react-query";
import queryClient from "../queryClient";
import { useConfigKey } from "./useConfigKey";

interface Endpoints {
	"/v2/ember/servers": EmberAPI.Servers;
	"/v3/ember/downloads": EmberAPI.ClientDownloads;
}

// Drop cache and refetch data
electron.ipcRenderer.on("drop-cache", () => {
	console.log("Dropping cache");
	queryClient.setQueryData("/v2/ember/servers", () => undefined);
	queryClient.setQueryData("/v3/ember/downloads", () => undefined);

	// Refetch data
	queryClient.refetchQueries();
});

export default function useData<T extends keyof Endpoints>(route: T): { data: REST.APIResponse<Endpoints[T]> | undefined, isLoading: boolean } {

	// Get authorization token
	const [ authorization ] = useConfigKey("auth.token");

	const { isLoading, data } = useQuery(route, async function() {
		return await fetch(`https://api.embervpn.org${ route }`, {
			headers: { authorization }
		})
			.then(res => res.json());
	}, {
		staleTime: 1000 * 5
	});

	return { isLoading, data };

}