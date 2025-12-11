import { watch } from "node:fs";
import { fileURLToPath } from "bun";
import type { ResolvedConfig } from "vite";
import { createPage, createPages } from "./pages";
import { startVite } from "./server";
import { folder, makeDirs } from "./util";

export async function start(
	path: string,
	vite?: ResolvedConfig,
): Promise<void> {
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

	await startVite(contentDir, vite);
}

function startWatching(path: string, contentDir: string, hangarPath: string) {
	// direct page watching
	watch(path, { recursive: true }, async (_event, relativePath) => {
		// biome-ignore lint/style/noNonNullAssertion: praying its not lowkey
		createPage(folder(path, relativePath!), path, contentDir, hangarPath);
	});
}
