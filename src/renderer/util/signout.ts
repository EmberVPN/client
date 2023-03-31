import { refetch } from "./refetch";

export async function signout() {

	electron.ipcRenderer.send("openvpn", "disconnect");
	await fetch("/api/auth/session", { method: "DELETE" });
	localStorage.setItem("authorization", "");
	refetch();
	
}
