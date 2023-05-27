import Icon from "@ui-elements/Icon";
import Spinner from "@ui-elements/Spinner";
import ToolbarElement from "@ui-elements/Toolbar";
import Tooltip from "@ui-elements/Tooltip";
import { IoMdSettings } from "react-icons/io";
import { useUser } from "../util/hooks/useUser";
import ConnectionStatus from "./ConnectionStatus";
import { MyAccount } from "./MyAccount";

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
				{user && <MyAccount user={ user } />}
				
				<Icon className="group group/tooltip"
					icon={ IoMdSettings }
					onClick={ () => electron.ipcRenderer.send("open-settings") }>
					<Tooltip>Settings</Tooltip>
				</Icon>
				
			</div>

		</ToolbarElement>
	);
}
