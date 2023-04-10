import DrawerItem from "@ui-elements/Drawer/DrawerItem";
import dayjs from "dayjs";
import { useEffect } from "react";
import { IoMdSettings } from "react-icons/io";
import { MdExitToApp, MdManageAccounts } from "react-icons/md";
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
		<div className="absolute top-0 right-0 opacity-0 scale-75 group-[.is-open]:opacity-100 group-[.is-open]:scale-100 transition-all origin-top-right rounded-2xl p-4 min-w-full w-[320px] pointer-events-none group-[.is-open]:pointer-events-auto shadow-xl border dark:border-gray-700/50 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden -m-2"
			onClick={ e => e.stopPropagation() }>
			<div className="flex gap-4 items-center overflow-hidden">
				<img alt={ user.username }
					className="w-16 h-16 rounded-full bg-gray-500/20 my-auto"
					src={ User.getAvatarURL(user.id) } />
				<div className="pr-4 flex text-sm flex-col grow overflow-hidden text-left">
					<span className="truncate font-medium text-lg text-gray-800 flex gap-4 dark:text-gray-200 items-center">
						{user.username}
					</span>
					<span className="truncate">{user.email}</span>
					<span className="truncate text-xs">Member since <span className="font-medium">{dayjs(user.created_ms).format("MM/DD/YYYY")}</span></span>
					
				</div>
			</div>
			<div className="flex flex-col -m-2 mt-4">
								
				<DrawerItem icon={ IoMdSettings }
					onClick={ () => [ close(), setOpen() ] }
					size="dense">
					Settings
				</DrawerItem>
				
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