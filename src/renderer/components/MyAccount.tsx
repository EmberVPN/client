import DrawerItem from "@ui-elements/Drawer/DrawerItem";
import Spinner from "@ui-elements/Spinner";
import Tooltip from "@ui-elements/Tooltip";
import useRipple from "@ui-elements/util/useCenteredRipple";
import classNames from "classnames";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { IoMdSettings } from "react-icons/io";
import { MdExitToApp, MdManageAccounts, MdOutlineBrowserUpdated } from "react-icons/md";
import User from "../util/class/User";
import { useUser } from "../util/hooks/useUser";

export let open = () => { };
export let close = () => { };

export function MyAccount(): JSX.Element {

	// Grab the user
	const user = useUser();
	const [ loading, setLoading ] = useState(true);
	
	// Wait for the user image to load
	useEffect(function() {
		
		// If the user loaded
		if (!loading || !user) return;

		// Wait for the users picture to load
		const img = new Image();
		img.onload = () => setLoading(false);
		img.src = User.getAvatarURL(user.id);

	}, [ loading, user ]);
	
	const ref = useRef<HTMLButtonElement>(null);
	const [ _open, setOpen ] = useState(false);
	open = () => setOpen(true);
	close = () => setOpen(false);
	useRipple(ref);

	return (
		<div className={ classNames("group", _open && "is-open") }>
			
			{/* Spinner if loading */}
			<div className={ classNames("absolute top-0 right-0 w-9 transition-opacity", (user && !loading) ? "opacity-0" : "opacity-100") }>
				<Spinner className="w-9" />
			</div>
				
			{/* Menu button */}
			<button className={ classNames("flex text-sm rounded-full select-none bg-gray-500/10 md:mr-0 group/tooltip transition-[opacity,transform] duration-[300ms] ease-bounce", loading ? "opacity-0 scale-75" : "opacity-100 scale-100") }
				onClick={ open }
				ref={ ref }>
				{user && <img
					alt="user photo"
					className="rounded-full w-9 h-9"
					src={ User.getAvatarURL(user.id) } />}
				<Tooltip anchor="right">More</Tooltip>
			</button>

			{/* Popup window */}
			<PopupWindow user={ user } />
			
		</div>
	);
}

export function PopupWindow({ user }: { user?: Auth.User }) {

	// Close the popup when the user clicks outside of it
	useEffect(function() {
		function handle(e: MouseEvent) {
			if (e.target instanceof HTMLElement && e.target.closest(".group") === null) close();
		}
		document.addEventListener("click", handle);
		return () => document.removeEventListener("click", handle);
	}, []);

	// If the user is not logged in
	if (!user) return null;

	return (
		<div
			className="absolute -m-1 top-0 right-0 opacity-0 scale-75 group-[.is-open]:opacity-100 group-[.is-open]:scale-100 transition-all origin-top-right rounded-2xl p-4 min-w-full w-[320px] pointer-events-none group-[.is-open]:pointer-events-auto select-none dark:shadow-xl dark:shadow-black/20 border dark:border-gray-700/50 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden ease-bounce duration-[300ms] drop-shadow-xl"
			onClick={ e => e.stopPropagation() }>
			<div className="flex items-center gap-4 overflow-hidden">
				<img
					alt={ user.username }
					className="w-16 h-16 my-auto rounded-full bg-gray-500/20"
					src={ User.getAvatarURL(user.id) } />
				<div className="flex flex-col pr-4 overflow-hidden text-sm text-left grow">
					<span className="flex items-center gap-4 text-lg font-medium text-gray-800 truncate dark:text-gray-200">{user.username}</span>
					<span className="truncate">{user.email}</span>
					<span className="text-xs truncate">Member since <span className="font-medium">{dayjs(user.created_ms).format("MM/DD/YYYY")}</span></span>
				</div>
			</div>
			<div className="flex flex-col mt-4 -m-2">
				
				<DrawerItem
					icon={ MdOutlineBrowserUpdated }
					onClick={ () => [ close(), electron.ipcRenderer.send("open", "updater") ] }
					size="dense">
					Check for updates
				</DrawerItem>
				
				<DrawerItem
					icon={ MdManageAccounts }
					onClick={ () => [ close(), window.open("https://embervpn.org/my/account") ] }
					size="dense">
					My account
				</DrawerItem>
				
				<DrawerItem
					icon={ IoMdSettings }
					onClick={ () => [ close(), electron.ipcRenderer.send("open", "settings") ] }
					size="dense">
					Settings
				</DrawerItem>
				
				<DrawerItem
					icon={ MdExitToApp }
					onClick={ () => [ close(), electron.ipcRenderer.send("authorization", null) ] }
					size="dense">
					Sign out
				</DrawerItem>

			</div>
		</div>
	);
}