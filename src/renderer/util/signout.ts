import { refetch } from "./refetch";

export async function signout() {

	await fetch("http://10.16.70.10:80/api/auth/session", { method: "DELETE" });
	refetch();
	
}
