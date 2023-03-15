import { refetch } from "./refetch";


export async function signout() {

	await fetch("/api/auth/session", { method: "DELETE" });
	refetch();
	
}
