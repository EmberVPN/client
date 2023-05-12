import Spinner from "@ui-elements/Spinner";
import useData from "../util/hooks/useData";
import SelectPlan from "./SelectPlan";
import { ServerList } from "./ServerList";

export default function EntryPoint(): JSX.Element | null {

	// Get the server registry
	const { data } = useData("/v2/ember/servers");

	// If the server registry is still loading
	if (!data || !data.success) return <Spinner />;

	// Show the server list
	if (Object.keys(data.servers).length > 0) return <ServerList servers={ Object.values(data.servers) } />;
	
	// Show the plan selector on the website
	return <SelectPlan />;
	
}

