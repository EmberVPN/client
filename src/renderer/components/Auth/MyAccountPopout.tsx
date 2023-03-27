import dayjs from "dayjs";
import { useEffect } from "react";
import { MdExitToApp } from "react-icons/md";
import User from "../../util/class/User";
import { close } from "./MyAccount";

import { signout } from "../../util/signout";
import ThemeToggle from "../ThemeToggle";

export default function MyAccountPopup({ user }: { user: User }): JSX.Element {

	useEffect(() => {

		const handle = (e: MouseEvent) => {
			if (e.target instanceof HTMLElement && e.target.closest(".group") === null) close();
		};

		document.addEventListener("click", handle);
		return () => document.removeEventListener("click", handle);

	}, []);

	return (
		<div className="absolute top-0 right-0 opacity-0 scale-75 group-[.is-open]:opacity-100 group-[.is-open]:scale-100 transition-all origin-top-right rounded-3xl p-4 min-w-full w-[368px] pointer-events-none group-[.is-open]:pointer-events-auto shadow-xl border dark:border-gray-700/50 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden -m-2"
			onClick={ e => e.stopPropagation() }>
			<div className="flex gap-4 items-center overflow-hidden">
				<img alt={ user.username }
					className="w-24 h-24 rounded-full"
					src={ User.getAvatarURL(user.id) } />
				<div className="pr-4 flex flex-col grow overflow-hidden text-left">
					<span className="truncate font-medium text-xl text-gray-800 flex gap-4 dark:text-gray-200 items-center">
						{user.username}
					</span>
					<span className="truncate">{user.email}</span>
					<span className="truncate text-sm">Member since <span className="font-medium">{dayjs(user.created_ms).format("MM/DD/YYYY")}</span></span>
					
				</div>
			</div>
			<hr className="dark:border-gray-600/50 my-4 -mx-4" />
			<ul className="-m-4 divide-y dark:divide-gray-600/50">
							
				<ThemeToggle className="flex cursor-pointer px-8 h-14 gap-6 items-center hover:bg-gray-300/30 dark:hover:bg-gray-600/30 select-none text-sm font-medium">
					Change theme
				</ThemeToggle>
							
				<div className="flex cursor-pointer px-8 h-14 gap-6 items-center hover:bg-gray-300/30 dark:hover:bg-gray-600/30 select-none text-sm font-medium"
					onClick={ () => [ close(), signout() ] }>
					<MdExitToApp className="w-6 h-6" />
					Sign out
				</div>

			</ul>
		</div>
	);
}