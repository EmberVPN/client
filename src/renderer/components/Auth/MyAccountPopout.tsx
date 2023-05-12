import DrawerItem from "@ui-elements/Drawer/DrawerItem";
import dayjs from "dayjs";
import { useEffect } from "react";
import { MdExitToApp, MdManageAccounts } from "react-icons/md";
import User from "../../util/class/User";
import { signout } from "../../util/signout";
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
		<div className="absolute top-0 right-0 opacity-0 scale-75 group-[.is-open]:opacity-100 group-[.is-open]:scale-100 transition-all origin-top-right rounded-2xl p-4 min-w-full w-[320px] pointer-events-none group-[.is-open]:pointer-events-auto shadow-xl border dark:border-gray-700/50 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden -m-2"
			onClick={ e => e.stopPropagation() }>
			<div className="flex items-center gap-4 overflow-hidden">
				<img alt={ user.username }
					className="w-16 h-16 my-auto rounded-full bg-gray-500/20"
					src={ User.getAvatarURL(user.id) } />
				<div className="flex flex-col pr-4 overflow-hidden text-sm text-left grow">
					<span className="flex items-center gap-4 text-lg font-medium text-gray-800 truncate dark:text-gray-200">
						{user.username}
					</span>
					<span className="truncate">{user.email}</span>
					<span className="text-xs truncate">Member since <span className="font-medium">{dayjs(user.created_ms).format("MM/DD/YYYY")}</span></span>
					
				</div>
			</div>
			<div className="flex flex-col mt-4 -m-2">
				
				<DrawerItem icon={ MdManageAccounts }
					onClick={ () => [ close(), window.open("https://embervpn.org/my/account") ] }
					size="dense">
					My account
				</DrawerItem>
				
				<DrawerItem icon={ MdExitToApp }
					onClick={ () => [ close(), signout() ] }
					size="dense">
					Sign out
				</DrawerItem>

			</div>
		</div>
	);
}