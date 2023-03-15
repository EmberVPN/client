import { refetch } from "./refetch";

export async function signout() {

	localStorage.setItem("authorization", undefined)

	await fetch("/api/auth/session", { method: "DELETE" });
	refetch();
	
}
