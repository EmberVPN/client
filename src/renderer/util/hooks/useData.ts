import { useQuery } from "react-query";

interface Endpoints {
	"/v2/ember/servers": EmberAPI.Servers;
	"/v2/ember/downloads": EmberAPI.ClientDownloads;
}

export default function useData<T extends keyof Endpoints>(route: T): { data: REST.APIResponse<Endpoints[T]> | undefined, isLoading: boolean } {

	const { isLoading, data } = useQuery(route, async function() {
		return await fetch(APIROOT + route, {
			headers: {
				Authorization: localStorage.getItem("authorization") ?? "",
			}
		})
			.then(res => res.json());
	});

	return { isLoading, data };

}