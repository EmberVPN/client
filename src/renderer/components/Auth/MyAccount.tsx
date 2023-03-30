import classNames from "classnames";
import { useState } from "react";
import { MdMoreVert } from "react-icons/md";
import User from "../../util/class/User";
import Tooltip from "../Tooltip";
import MyAccountPopout from "./MyAccountPopout";

export let open = () => { };
export let close = () => { };

export default function MyAccount({ user }: { user: User }): JSX.Element {

	const [ _open, setOpen ] = useState(false);
	open = () => setOpen(true);
	close = () => setOpen(false);

	return (
		<div className={ classNames("group relative", _open && "is-open") }>
			<div className="w-12 h-12 -m-4 rounded-full flex items-center justify-center hover:bg-gray-500/10 hover:active:bg-gray-500/20 transition-colors relative"
				onClick={ open }>
				<MdMoreVert className="text-2xl" />
				<Tooltip>More</Tooltip>
			</div>
			<MyAccountPopout user={ user } />
		</div>
	);
}