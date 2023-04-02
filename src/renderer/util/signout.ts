import { refetch } from "./refetch";

export async function signout() {

	electron.ipcRenderer.send("openvpn", "disconnect");
	await fetch(APIROOT + "/auth/session", {
		method: "DELETE",
		headers: {
			Authorization: localStorage.getItem("authorization") ?? "",
		}
	});
	localStorage.setItem("authorization", "");
	refetch();
	
}
