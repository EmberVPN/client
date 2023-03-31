import classNames from "classnames";
import { HTMLAttributes, ReactNode, useRef } from "react";
import useAnimation from "../util/hooks/useAnimation";
import { useUser } from "../util/hooks/useUser";
import MyAccount from "./Auth/MyAccount";
import ConnectionStatus from "./ConnectionStatus";
import Spinner from "./Spinner";

export type ToolbarProps = { children?: ReactNode | string, className?: string };

export default function Toolbar({ className, ...props }: ToolbarProps & HTMLAttributes<HTMLDivElement>) {

	const { user } = useUser();
	const ref = useRef<HTMLDivElement>(null);

	useAnimation(function() {
		const entrypoint = document.getElementById("entrypoint") as HTMLElement;
		const state = !entrypoint || entrypoint.scrollTop === 0;
		ref.current?.classList.toggle("border-b", state);
		ref.current?.classList.toggle("shadow-none", state);
		ref.current?.classList.toggle("shadow-lg", !state);
		ref.current?.classList.toggle("border-transparent", !state);
	});

	return (
		<header className={ classNames("min-h-[64px] !overflow-visible z-40 sticky top-0 backdrop-blur-3xl transition-all toolbar", className) }
			ref={ ref }>
			
			<div className="!py-4 flex items-center gap-4 justify-between h-full !overflow-visible flex-wrap !flex-row"
				{ ...props }>
				<ConnectionStatus />
				<div className="flex items-center gap-4 grow" />
				<div className="flex items-center lg:order-2 ml-auto">

					{ !user && <Spinner className="w-9 mx-3" /> }
					{user && <MyAccount user={ user } /> }

				</div>
			</div>
		</header>
	);

}