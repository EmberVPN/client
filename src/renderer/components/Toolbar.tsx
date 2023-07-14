import { Toolbar } from "@nextui/Toolbar";
import ConnectionStatus from "./ConnectionStatus";
import { MyAccount } from "./MyAccount";

export default function t() {
	return (
		<Toolbar className="bg-white dark:bg-gray-800" htmlFor="entrypoint">
			<ConnectionStatus />
			<div className="relative flex items-center ml-auto h-9 w-9">
				<MyAccount />
			</div>
		</Toolbar>
	);
}
