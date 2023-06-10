import ToolbarElement from "@ui-elements/Toolbar";
import ConnectionStatus from "./ConnectionStatus";
import { MyAccount } from "./MyAccount";

export default function Toolbar() {

	return (
		<ToolbarElement htmlFor="entrypoint">

			{/* Connection status */}
			<ConnectionStatus />

			{/* User account */}
			<div className="relative flex items-center ml-auto h-9 w-9">

				{/* User avatar */}
				<MyAccount />
				
			</div>

		</ToolbarElement>
	);
}
