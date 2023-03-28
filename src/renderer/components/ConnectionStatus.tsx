import classNames from "classnames";
import { useEffect, useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import useData from "../util/hooks/useData";
import useIpLocation from "../util/hooks/useIpLocation";
import Button from "./Button";
import Spinner from "./Spinner";

export default function ConnectionStatus(): JSX.Element | null {

	const [ isLoading, setIsLoading ] = useState(false);
	const ipLocation = useIpLocation();
	const { data: servers } = useData("/ember/servers");
	
	function disconnect() {
		setIsLoading(true);
		electron.ipcRenderer.send("openvpn", "disconnect");
	}
	
	useEffect(function() {
		setIsLoading(false);
	}, [ ipLocation ]);

	if (!ipLocation || !servers) return (
		<div className="w-12 h-12 -m-4 rounded-full flex items-center justify-center hover:bg-gray-500/10 hover:active:bg-gray-500/20 transition-colors border border-amber-500/25">
			<Spinner className="mx-2 !stroke-amber-500" />
		</div>
	);
	
	const isConnected = Object.values(servers.servers).some(server => server.ip === ipLocation.ip);

	function Icon() {
		return isConnected ? <IoMdCheckmarkCircleOutline className="text-success text-2xl" /> : <MdErrorOutline className="text-error text-2xl" />;
	}

	return (
		<div className="group relative">
			<div className={ classNames("w-12 h-12 -m-4 rounded-full flex items-center justify-center hover:bg-gray-500/10 hover:active:bg-gray-500/20 transition-colors border", isConnected ? "border-success/25 bg-success/10" : "border-error/25 bg-error/10") }>
				<Icon />
			</div>
			<div className={ classNames("group-hover:scale-100 scale-75 opacity-0 group-hover:opacity-100 transition-all absolute px-2 py-0.5 text-sm origin-top-left rounded-lg top-0 pointer-events-none shadow-xl border dark:border-gray-700/50 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden -m-4 dark:shadow-black/20 flex flex-col !p-3.5 gap-3 group-hover:pointer-events-auto min-w-[288px] after:content-[''] after:absolute after:top-0 after:left-0 after:bottom-0 after:right-0 after:pointer-events-none", isConnected ? "!border-success/25 after:bg-success/10" : "!border-error/25 after:bg-error/10 rounded-[24px] group-hover:rounded-md") }>
				<div className="flex items-center gap-4">
					<div>
						<Icon />
					</div>
					<div className="leading-tight font-roboto font-medium whitespace-nowrap w-full">
						<h1 className={ classNames("text-lg", isConnected ? "text-success" : "text-error") }>{!isConnected && "Not "}Connected</h1>
						<div className="text-sm flex gap-2 justify-between w-full">
							<p>{ipLocation.ip}</p>
						</div>
					</div>
					{!isConnected && <p className="text-gray-500 font-roboto font-medium whitespace-nowrap">{ipLocation.org}</p> }
				</div>
				<p className="text-xs text-gray-600 dark:text-gray-400">{
					isConnected ? <>Your internet traffic is encrypted and protected from interception, monitoring, or hacking by third parties such as hackers, government agencies, or internet service providers.</> : <>Your internet traffic is not protected by Ember and is susceptible to interception, monitoring, or hacking by third parties such as hackers, government agencies, or internet service providers like <strong>{ipLocation.org}</strong>.</>
				}</p>
				{ isConnected && <Button className={ classNames(isLoading && "!bg-opacity-25 !shadow-none pointer-events-none") }
					color="error"
					onClick={ disconnect }>{isLoading ? <Spinner className="w-6 mx-auto !stroke-error" /> : "Disconnect"}</Button> }
			</div>
		</div>
	);
}