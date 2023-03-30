import dayjs from "dayjs";
import { useEffect } from "react";
import { IoMdSettings } from "react-icons/io";
import { MdExitToApp } from "react-icons/md";
import User from "../../util/class/User";
import { signout } from "../../util/signout";
import { setOpen } from "../Settings";
import { close } from "./MyAccount";

export default function MyAccountPopup({ user }: { user: User }): JSX.Element {

	useEffect(() => {

		const handle = (e: MouseEvent) => {
			if (e.target instanceof HTMLElement && e.target.closest(".group") === null) close();
		};

		document.addEventListener("click", handle);
		return () => document.removeEventListener("click", handle);

	}, []);

	return (
		<div className="absolute font-roboto top-0 right-0 opacity-0 scale-75 group-[.is-open]:opacity-100 group-[.is-open]:scale-100 transition-all origin-top-right rounded-3xl p-4 min-w-full w-[368px] pointer-events-none group-[.is-open]:pointer-events-auto shadow-xl border dark:border-gray-700/50 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden -m-4 dark:shadow-black/20"
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
								
				<div className="flex cursor-pointer px-8 h-14 gap-6 items-center hover:bg-gray-200/30 dark:hover:bg-gray-700/30 select-none text-sm font-medium transition-colors duration-75 hover:active:bg-gray-500/10 dark:hover:active:bg-gray-500/20"
					onClick={ () => [ close(), setOpen() ] }>
					<IoMdSettings className="w-6 h-6" />
					Settings
					<div className="ml-auto flex gap-1 items-center opacity-50">
						<kbd className="px-2 py-1.5 text-xs font-semibold border rounded-lg border-gray-400/50 bg-gray-400/10 dark:border-gray-600/50 dark:bg-gray-600/10">Ctrl</kbd>+
						<kbd className="px-2 py-1.5 text-xs font-semibold border rounded-lg border-gray-400/50 bg-gray-400/10 dark:border-gray-600/50 dark:bg-gray-600/10">,</kbd>
					</div>
				</div>
				
				<div className="flex cursor-pointer px-8 h-14 gap-6 items-center hover:bg-gray-200/30 dark:hover:bg-gray-700/30 select-none text-sm font-medium transition-colors duration-75 hover:active:bg-gray-500/10 dark:hover:active:bg-gray-500/20"
					onClick={ () => [ close(), signout() ] }>
					<MdExitToApp className="w-6 h-6" />
					Sign out
				</div>

			</ul>
		</div>
	);
}