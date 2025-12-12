import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import type { ViteDevServer } from "vite";
import { createPage, createPages } from "./pages";
import { startVite } from "./server";
import type { Config } from "./types";
import { folder, makeDirs } from "./util";

export async function start(
	path: string,
	config: Config = {},
): Promise<
	| undefined
	| {
			paths: {
				root: string;
				hangar: { root: string; content: string };
				project: { root: string; pages: string };
			};
			vite: ViteDevServer | undefined;
	  }
> {
	config ?? {};

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
	await createPages(pagesDir, contentDir, hangarDir, dir);

	startWatching(pagesDir, contentDir, hangarDir, dir);

	const vite = await startVite(contentDir, config);

	return {
		paths: {
			root: dir,
			hangar: {
				root: hangarDir,
				content: contentDir,
			},
			project: {
				root: srcDir,
				pages: pagesDir,
			},
		},
		vite,
	};
}

function startWatching(
	path: string,
	contentDir: string,
	hangarPath: string,
	projectPath: string,
) {
	// direct page watching
	watch(path, { recursive: true }, async (_event, relativePath) => {
		// biome-ignore lint/style/noNonNullAssertion: praying its not lowkey
		createPage(
			folder(path, relativePath!),
			path,
			contentDir,
			hangarPath,
			projectPath,
		);
	});
}
