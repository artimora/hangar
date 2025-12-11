import viteReact from "@vitejs/plugin-react";
import { createServer, mergeConfig, type ResolvedServerUrls } from "vite";
import type { Config } from "./types";
import { getArg } from "./util";

export async function startVite(path: string, config: Config): Promise<void> {
	const server = await createServer(
		mergeConfig(
			{
				// any valid user config options, plus `mode` and `configFile`
				configFile: false,
				root: path,
				server: {
					port: config.port ?? 1337,
					host: config.host ?? getArg("--host"),
				},
				plugins: [viteReact()],
				logLevel: "silent",
			},
			config.vite ?? {},
		),
	);

	await server.listen();

	printServerUrls(server.resolvedUrls);
}

function printServerUrls(urls: ResolvedServerUrls | null) {
	if (urls === null) return;

	const local = prettyUrls(urls.local);
	const network = prettyUrls(urls.network);

	console.log("hangar server");
	if (local) console.log(`> Local: ${local}`);
	console.log(`> Network: ${network ?? "use --host to expose"}`);

	function prettyUrls(urls: string[] | undefined): string | null {
		if (urls === undefined) {
			return null;
		}

		if (urls.length === 0) {
			return null;
		} else if (urls.length === 1) {
			if (urls[0]) return urls[0];
		} else if (urls.length > 1) {
			return urls.join(", ");
		}
		return null;
	}
}
