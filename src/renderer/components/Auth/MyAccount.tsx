import Tooltip from "@ui-elements/Tooltip";
import useRipple from "@ui-elements/util/useCenteredRipple";
import classNames from "classnames";
import { useRef, useState } from "react";
import User from "../../util/class/User";
import MyAccountPopout from "./MyAccountPopout";

export let open = () => { };
export let close = () => { };

export default function MyAccount({ user }: { user: User }): JSX.Element {

	const ref = useRef<HTMLButtonElement>(null);
	const [ _open, setOpen ] = useState(false);
	open = () => setOpen(true);
	close = () => setOpen(false);
	useRipple(ref);

	return (
		<div className={ classNames("group relative", _open && "is-open") }>
			<button className="flex mx-3 -my-1 text-sm rounded-full select-none bg-gray-500/10 md:mr-0 group/tooltip"
				onClick={ open }
				ref={ ref }>
				<img
					alt="user photo"
					className="rounded-full w-9 h-9"
					src={ User.getAvatarURL(user.id) } />
				<Tooltip anchor="right">More</Tooltip>
			</button>
			<MyAccountPopout user={ user } />
		</div>
	);
}