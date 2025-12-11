import viteReact from "@vitejs/plugin-react";
import {
	createServer,
	mergeConfig,
	type ResolvedConfig,
	type ResolvedServerUrls,
} from "vite";
import { getArg } from "./util";

export async function startVite(
	path: string,
	additonalConfig?: ResolvedConfig,
): Promise<void> {
	const server = await createServer(
		mergeConfig(
			{
				// any valid user config options, plus `mode` and `configFile`
				configFile: false,
				root: path,
				server: {
					port: 1337,
					host: getArg("--host"),
				},
				plugins: [viteReact()],
				logLevel: "silent",
			},
			additonalConfig ?? {},
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
