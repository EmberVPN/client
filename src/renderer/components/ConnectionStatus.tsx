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

	if (!ipLocation || !servers) return null;
	
	const isConnected = Object.values(servers.servers).some(server => server.ip === ipLocation.ip);

	function Icon() {
		return isConnected ? <IoMdCheckmarkCircleOutline className="text-success text-2xl" /> : <MdErrorOutline className="text-error text-2xl" />;
	}

	return (
		<div className="group relative">
			<div className="w-12 h-12 -m-4 rounded-full flex items-center justify-center hover:bg-gray-500/10 hover:active:bg-gray-500/20 transition-colors">
				<Icon />
			</div>
			<div className="group-hover:scale-100 scale-75 opacity-0 group-hover:opacity-100 transition-all absolute px-2 py-0.5 text-sm origin-top-left rounded-lg top-0 pointer-events-none
shadow-xl border dark:border-gray-700/50 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 overflow-hidden -m-4 dark:shadow-black/20 flex flex-col !p-4 gap-3 group-hover:pointer-events-auto">
				<div className="flex items-center gap-4">
					<Icon />
					<div className="leading-tight font-roboto font-medium whitespace-nowrap">
						<h1 className={ classNames("text-lg", isConnected ? "text-success" : "text-error") }>{!isConnected && "Not "}Connected</h1>
						<ul className="text-sm flex gap-2">
							<li>{ipLocation.ip}</li>
							{!isConnected && (<>
								•<li className="text-gray-500">{ipLocation.org}</li>
							</>)}
						</ul>
					</div>
				</div>
				<p className="text-xs text-gray-600 dark:text-gray-400">{
					isConnected ? <>Your internet traffic is encrypted and protected from interception, monitoring, or hacking by third parties such as hackers, government agencies, or internet service providers.</> : <>Your internet traffic is not protected by Ember and is susceptible to interception, monitoring, or hacking by third parties such as hackers, government agencies, or internet service providers like <strong>{ipLocation.org}</strong>.</>
				}</p>
				{ isConnected && <Button className={ classNames(isLoading && "!bg-opacity-25 !shadow-none pointer-events-none") }
					color="error"
					onClick={ disconnect }>{isLoading ? <Spinner className="w-6 mx-auto !stroke-gray-700 dark:!stroke-white" /> : "Disconnect"}</Button> }
			</div>
		</div>
	);
}