import { is } from "@electron-toolkit/utils";
import { exec } from "child_process";
import { app } from "electron";
import { writeFile } from "fs/promises";
import { basename, dirname, extname, join } from "path";
import { Config } from "./class/Config";
import { Update } from "./window/Update";

export async function update() {
	
	// Fetch latest version
	const res = await fetch("https://api.embervpn.org/v2/ember/downloads")
		.then(res => res.json() as Promise<REST.APIResponse<EmberAPI.ClientDownloads>>);
	
	// Make sure the request was successful
	if (!res.success) return;

	// Get latest version
	const builds = res.assets.filter(a => a.platform === process.platform);

	// Clear procrastination
	Config.delete("updater.last-remind-me-later");

	// Check platform
	if (process.platform === "win32") {

		// Check if we're using the exe or msi
		const useExe = basename(dirname(app.getPath("exe"))) === "embervpn";
		const binary = builds.find(b => extname(b.name) === (useExe ? ".exe" : ".msi"));

		// Make sure we found a binary
		if (!binary) throw new Error("No binary found for platform");

		// Download the installer binary to the temp directory
		const installer = await fetch(binary.downloadUrl)
			.then(res => res.arrayBuffer())
			.then(buf => writeFile(join(app.getPath("sessionData"), binary.name), Buffer.from(buf)))
			.then(() => join(app.getPath("sessionData"), binary.name));

		// Ensure we're not in dev mode
		if (is.dev) return;

		// Run the installer
		if (useExe) exec(installer);
			
		else exec(`msiexec /i "${ installer }" /passive /norestart`, () => app.quit());
		
		// Close update window
		Update.close();
		setTimeout(() => app.quit(), 2500);

		return;
	}

	// Unsupported platform
	throw new Error("Unsupported platform");

}
