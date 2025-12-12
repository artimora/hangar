import nodePath from "node:path";
import { fileURLToPath } from "node:url";
import viteReact from "@vitejs/plugin-react";
import vitePluginRsc from "@vitejs/plugin-rsc";
import { globSync } from "glob";
import {
	createServer,
	mergeConfig,
	type UserConfig,
	type ViteDevServer,
} from "vite";
import type { Config } from "./types";

export async function startVite(
	path: string,
	config: Config,
	root: string,
): Promise<ViteDevServer> {
	const input = globSync(`${path}/pages/**/*.tsx`).map((file) => {
		console.log({
			file,
			root,
			returned: [
				nodePath.relative(
					"src",
					file.slice(0, file.length - nodePath.extname(file).length),
				),
				fileURLToPath(new URL(file, root)),
			],
		});

		return [
			// This removes `src/` as well as the file extension from each
			// file, so e.g. src/nested/foo.js becomes nested/foo
			nodePath.relative(
				"src",
				file.slice(0, file.length - nodePath.extname(file).length),
			),
			// This expands the relative paths to absolute paths, so e.g.
			// src/nested/foo becomes /project/src/nested/foo.js
			fileURLToPath(new URL(file, root)),
		];
	});

	console.log(input);

	const included: UserConfig = {
		root: path,
		plugins: [viteReact(), vitePluginRsc()],
		logLevel: "info",
		appType: "custom",
		build: {
			rollupOptions: {
				input: Object.fromEntries(input),
			},
		},
	};

	return await createServer(mergeConfig(included, config.vite ?? {}));
}
