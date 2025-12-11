import { watch } from "node:fs";
import viteReact from "@vitejs/plugin-react";
import { fileURLToPath } from "bun";
import { createServer, type ResolvedServerUrls } from "vite";
import { createPage, createPages } from "./pages";
import { folder, makeDirs } from "./util";

export async function start(path: string): Promise<void> {
	const dir = fileURLToPath(new URL("../", path));

	// base
	const hangarDir = `${dir}.hangar`;
	const srcDir = `${dir}src`;

	// hangar
	const contentDir = folder(hangarDir, "content");

	// src
	const pagesDir = folder(srcDir, "pages");

	makeDirs(hangarDir, ["content"]);

	// logic
	await createPages(pagesDir, contentDir, hangarDir);

	startWatching(pagesDir, contentDir, hangarDir);

	await startVite(contentDir);
}

function startWatching(path: string, contentDir: string, hangarPath: string) {
	// direct page watching
	watch(path, { recursive: true }, async (_event, relativePath) => {
		// biome-ignore lint/style/noNonNullAssertion: praying its not lowkey
		createPage(folder(path, relativePath!), path, contentDir, hangarPath);
	});
}

async function startVite(path: string): Promise<void> {
	const server = await createServer({
		// any valid user config options, plus `mode` and `configFile`
		configFile: false,
		root: path,
		server: {
			port: 1337,
		},
		plugins: [viteReact()],
		logLevel: "silent",
	});

	await server.listen();

	printServerUrls(server.resolvedUrls);

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
}
