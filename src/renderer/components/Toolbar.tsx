import Spinner from "./Spinner";

/*

import { HiMenuAlt1 } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useUser } from "../util/hooks/useUser";
import SignInButton from "./Auth/SignIn/Button";
import { setOpen } from "./Drawer";

export default function Toolbar(): JSX.Element {

	const { isLoading, isAuthorized, user } = useUser();

	return (
		<nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800/50 dark:text-gray-200/50 border-b dark:border-gray-700/50 fixed w-full z-40 backdrop-blur-3xl">
			<div className="flex flex-wrap justify-between items-center gap-2">
				<div className="flex flex-wrap justify-between items-center">
						
					<button className="hidden p-2 mr-3 text-gray-600 rounded cursor-pointer lg:inline hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
						onClick={ () => setOpen() }>
						<HiMenuAlt1 className="w-6 h-6" />
					</button>

					<button className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
						onClick={ () => setOpen() }>
						<HiMenuAlt1 className="w-6 h-6" />
					</button>

					<Link className="flex mr-4"
						to="/">
						<img alt="Ember VPN"
							className="mr-3 h-8"
							src={ favicon } />
						<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Ember VPN</span>
					</Link>
					
				</div>
				<div className="flex items-center lg:order-2">

					{ isLoading && <Spinner className="w-9 mx-3" /> }
					{!isLoading && !isAuthorized && <AnonActions />}
					{user && <UserActions controller
						isAuthorized={ isAuthorized }
						user={ user } /> }

				</div>
			</div>
		</nav>
	);
}

*/

import classNames from "classnames";
import { HTMLAttributes, ReactNode } from "react";
import { useUser } from "../util/hooks/useUser";
import MyAccount from "./Auth/MyAccount";

export type ToolbarProps = { children?: ReactNode | string, className?: string };

export default function Toolbar({ className, ...props }: ToolbarProps & HTMLAttributes<HTMLDivElement>) {

	const { user } = useUser();

	return (
		<header className={ classNames("min-h-[64px] !overflow-visible z-40 sticky top-0 backdrop-blur-3xl transition-shadow toolbar", className) }>
			
			<div className="!py-4 flex items-center gap-4 justify-between h-full !overflow-visible flex-wrap !flex-row"
				{ ...props }>
				<div className="flex items-center gap-4 grow" />
				<div className="flex items-center lg:order-2 ml-auto">

					{ !user && <Spinner className="w-9 mx-3" /> }
					{user && (
						<div className="flex items-center gap-4">
							{user && <MyAccount user={ user } /> }
						</div>
					) }

				</div>
			</div>
		</header>
	);

}