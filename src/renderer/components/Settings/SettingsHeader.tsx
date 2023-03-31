import { useRef } from "react";
import { MdArrowBack } from "react-icons/md";
import useAnimation from "../../util/hooks/useAnimation";
import Tooltip from "../Tooltip";

export default function SettingsHeader({ setState }: { setState: (state: boolean) => unknown }) {

	const ref = useRef<HTMLDivElement>(null);

	useAnimation(function() {
		const entrypoint = document.getElementById("settings") as HTMLElement;
		const state = !entrypoint || entrypoint.scrollTop === 0;
		ref.current?.classList.toggle("border-b", state);
		ref.current?.classList.toggle("shadow-none", state);
	});

	return (
		<header className="h-[64px] !overflow-visible z-40 sticky top-0 backdrop-blur-3xl transition-all toolbar"
			ref={ ref }>
			<div className="!py-4 flex items-center gap-4 h-full !overflow-visible flex-wrap !flex-row">
				<div className="w-12 h-12 -m-4 -my-2 rounded-full flex items-center justify-center hover:bg-gray-500/10 hover:active:bg-gray-500/20 transition-colors group relative"
					onClick={ () => setState(false) }>
					<MdArrowBack className="text-2xl" />
					<Tooltip anchor="left">Back</Tooltip>
				</div>
				<h1 className="text-xl font-roboto mx-4">Settings</h1>
				<div className="grow" />
				<code className="font-mono border-[1px] px-2 rounded-2xl select-none border-gray-500/10 text-gray-500 bg-gray-500/10">v{VERSION}</code>
			</div>
		</header>
	);
}

