import classNames from "classnames";
import { useState } from "react";
import User from "../../util/class/User";
import MyAccountPopout from "./MyAccountPopout";

export let open = () => { };
export let close = () => { };

export default function MyAccount({ user }: { user: User }): JSX.Element {

	const [ _open, setOpen ] = useState(false);
	open = () => setOpen(true);
	close = () => setOpen(false);

	return (
		<div className={ classNames("group relative", _open && "is-open") }>
			<button className="flex mx-3 text-sm bg-neutral-500/25 rounded-full md:mr-0 focus:ring-4 focus:ring-primary-400 -my-1 select-none"
				onClick={ open }>
				<img alt="user photo"
					className="w-9 h-9 rounded-full"
					src={ User.getAvatarURL(user.id) } />
			</button>
			<MyAccountPopout user={ user } />
		</div>
	);
}