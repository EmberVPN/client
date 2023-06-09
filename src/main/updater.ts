import { exec } from "child_process";
import { app } from "electron";
import { writeFile } from "fs/promises";
import { basename, dirname, extname, join } from "path";

export async function update() {
	
	// Fetch latest version
	const res = await fetch("https://api.embervpn.org/v2/ember/downloads")
		.then(res => res.json() as Promise<REST.APIResponse<EmberAPI.ClientDownloads>>);
	
	// Make sure the request was successful
	if (!res.success) return;

	// Get latest version
	const builds = res.assets.filter(a => a.platform === process.platform);

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
		
		// Run the installer
		await new Promise<void>((resolve, reject) => {
			setTimeout(() => app.quit(), 1000);
			exec([ installer ].join(" "))
				.on("error", reject)
				.on("close", resolve);
		});

		return;
	}

	// Unsupported platform
	throw new Error("Unsupported platform");

}
