import classNames from "classnames";
import { HTMLAttributes, ReactNode } from "react";
import { useUser } from "../util/hooks/useUser";
import MyAccount from "./Auth/MyAccount";
import IPBadge from "./IPBadge";
import Spinner from "./Spinner";

export type ToolbarProps = { children?: ReactNode | string, className?: string };

export default function Toolbar({ className, ...props }: ToolbarProps & HTMLAttributes<HTMLDivElement>) {

	const { user } = useUser();

	return (
		<header className={ classNames("min-h-[64px] !overflow-visible z-40 sticky top-0 backdrop-blur-3xl transition-shadow toolbar", className) }>
			
			<div className="!py-4 flex items-center gap-4 justify-between h-full !overflow-visible flex-wrap !flex-row"
				{ ...props }>
				<IPBadge />
				<div className="flex items-center gap-4 grow" />
				<div className="flex items-center lg:order-2 ml-auto">

					{ !user && <Spinner className="w-9 mx-3" /> }
					{user && <MyAccount user={ user } /> }

				</div>
			</div>
		</header>
	);

}