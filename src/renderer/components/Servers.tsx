import useData from "../util/hooks/useData";
import Server from "./Server";

export default function Servers(): JSX.Element {
	const { data, isLoading } = useData("/ember/servers");

	if (isLoading) return <div>Loading...</div>;
	if (data === undefined || !data.success) return <div>Failed to load servers</div>;
	const { servers } = data;

	return (
		<div className="flex flex-col">
			{Object.keys(servers).map((server, key) => <Server hash={ Object.keys(servers)[key] }
				key={ key }
				server={ servers[server] } />) }
		</div>
	);
}