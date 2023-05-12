import Spinner from "@ui-elements/Spinner";
import SelectPlan from "./components/SelectPlan";
import { ServerList } from "./components/ServerList";
import useData from "./util/hooks/useData";

export default function EntryPoint(): JSX.Element | null {

	// Get the server registry
	const { data } = useData("/v2/ember/servers");

	// If the server registry is still loading
	if (!data) return <Spinner />;

	// Show the server list
	if (Object.keys(data.servers).length > 0) return <ServerList servers={ Object.values(data.servers) } />;
	
	// Show the plan selector on the website
	return <SelectPlan />;
	
}

