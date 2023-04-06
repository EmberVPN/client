import classNames from "classnames";
import { useState } from "react";
import { MdMoreVert } from "react-icons/md";
import User from "../../util/class/User";
import Icon from "../ui-elements/Icon";
import Tooltip from "../ui-elements/Tooltip";
import MyAccountPopout from "./MyAccountPopout";

export let open = () => { };
export let close = () => { };

export default function MyAccount({ user }: { user: User }): JSX.Element {

	const [ _open, setOpen ] = useState(false);
	open = () => setOpen(true);
	close = () => setOpen(false);

	return (
		<div className={ classNames("group relative", _open && "is-open") }>
			<Icon icon={ MdMoreVert }
				onClick={ open }>
				<Tooltip anchor="right">More</Tooltip>
			</Icon>
			<MyAccountPopout user={ user } />
		</div>
	);
}