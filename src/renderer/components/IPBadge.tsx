import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import { useQuery } from "react-query";
import useData from "../util/hooks/useData";

export default function IPBadge(): JSX.Element | null {

	const { data: iplocation } = useQuery("currentLocation", () => fetch("https://ipapi.co/json/").then(res => res.json()));
	const { data: servers } = useData("/ember/servers");

	if (!iplocation || !servers) return null;

	const currentConnection = Object.values(servers.servers).find(server => server.ip === iplocation.ip);
	if (currentConnection) return (
		<div className="flex items-center gap-4 -my-4">
			<IoMdCheckmarkCircleOutline className="text-2xl text-emerald-500" />
			<div>
				<p className="text-emerald-500">Connected</p>
				<p className="text-sm">{ currentConnection.ip }</p>
			</div>
		</div>
	);

	return (
		<div className="flex items-center gap-4 -my-4">
			<MdErrorOutline className="text-2xl text-red-600" />
			<p className="text-red-500">Not Protected</p>
		</div>
	);
}