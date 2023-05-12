import Spinner from "@ui-elements/Spinner";
import ToolbarElement from "@ui-elements/Toolbar";
import { useUser } from "../util/hooks/useUser";
import MyAccount from "./Auth/MyAccount";
import ConnectionStatus from "./ConnectionStatus";

export default function Toolbar() {

	// Get the user
	const { user } = useUser();

	return (
		<ToolbarElement htmlFor="entrypoint">

			{/* Connection status */}
			<ConnectionStatus />

			{/* User account */}
			<div className="flex items-center ml-auto">

				{/* Spinner if loading */}
				{!user && <Spinner className="mx-3 w-9" />}

				{/* Menu button */}
				{ user && <MyAccount user={ user } />}
				
			</div>

		</ToolbarElement>
	);
}
