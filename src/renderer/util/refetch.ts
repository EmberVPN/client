import queryClient from "./queryClient";

export function refetch(resp?: Response) {

	// Eager Update
	if (resp) queryClient.setQueryData("user", async function() {
		return await resp.json();
	});

	queryClient.invalidateQueries({ queryKey: [ "user" ]});
}
