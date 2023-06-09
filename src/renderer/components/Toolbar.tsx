import { useAutoAnimate } from "@formkit/auto-animate/react";
import Spinner from "@ui-elements/Spinner";
import ToolbarElement from "@ui-elements/Toolbar";
import { useUser } from "../util/hooks/useUser";
import ConnectionStatus from "./ConnectionStatus";
import { MyAccount } from "./MyAccount";
import classNames from "classnames";

export default function Toolbar() {

	// Get the user
	const user = useUser();
	const [ ref ] = useAutoAnimate();

	return (
		<ToolbarElement htmlFor="entrypoint">

			{/* Connection status */}
			<ConnectionStatus />

			{/* User account */}
			<div className="relative flex items-center ml-auto h-9 w-9">

				{/* Spinner if loading */}
				<div className={ classNames("absolute top-0 right-0 w-9 transition-opacity", user ? "opacity-0" : "opacity-100") }>
					<Spinner className="w-9" />
				</div>

				{/* Menu button */}
				<div ref={ ref }>
					{ user && <MyAccount key="user"
						user={ user } />}
				</div>
				
			</div>

		</ToolbarElement>
	);
}
