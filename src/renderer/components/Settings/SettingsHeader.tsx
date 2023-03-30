import { MdClose } from "react-icons/md";
import Tooltip from "../Tooltip";

export default function SettingsHeader({ setState }: { setState: (state: boolean) => unknown }) {
	return (
		<header className="min-h-[64px] !overflow-visible z-40 sticky top-0 backdrop-blur-3xl transition-shadow toolbar">
			<div className="!py-4 flex items-center gap-4 h-full !overflow-visible flex-wrap !flex-row">
				<h1 className="text-xl font-roboto">Settings</h1>
				<div className="grow" />
				<code className="font-mono border-[1px] px-2 rounded-2xl select-none border-gray-500/10 text-gray-500 bg-gray-500/10 mx-4">v{VERSION}</code>
				<div className="w-12 h-12 -m-4 -my-2 rounded-full flex items-center justify-center hover:bg-gray-500/10 hover:active:bg-gray-500/20 transition-colors group relative"
					onClick={ () => setState(false) }>
					<MdClose className="text-2xl" />
					<Tooltip>Close</Tooltip>
				</div>
			</div>
		</header>
	);
}

