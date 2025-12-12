import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import {
	type Config,
	createPage,
	createPages,
	folder,
	type Info,
	makeDirs,
	type Paths,
	startVite,
} from "./core";
import {
	mountMiddleware,
	mountPageCollector,
	type NodeBindings,
} from "./mounting";

export class Hangar extends Hono<{ Bindings: NodeBindings }> {
	public hangar: Info;

	constructor(info: Info) {
		super(info.config.hono);
		this.hangar = info;

		if (info.config.logs !== undefined && info.config.logs === true)
			this.use(logger());

		mountMiddleware(this);

		this.serve = () => {
			mountPageCollector(this);
			serve({
				fetch: this.fetch,
				port: info.config.port,
			});

			if (info.config.logs !== undefined && info.config.logs === true)
				console.log(
					`dev server running at http://localhost:${info.config.port}`,
				);
		};
	}

	serve: () => void;
}
export async function start(
	path: string,
	config: Config = { port: 1337, logs: true },
): Promise<void> {
	const server = await create(path, config);
	server.serve();
}

export async function create(
	path: string,
	config: Config = { port: 1337, logs: true },
): Promise<Hangar> {
	config ??= { port: 1337, logs: true };

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

	const vite = await startVite(srcDir, config, path);

	const paths: Paths = {
		root: dir,
		hangar: {
			root: hangarDir,
			content: contentDir,
		},
		project: {
			root: srcDir,
			pages: pagesDir,
		},
	};

	console.log(paths);

	const info: Info = {
		paths,
		vite,
		config,
	};

	const hangar = new Hangar(info);

	return hangar;
}

function startWatching(
	path: string,
	contentDir: string,
	hangarPath: string,
	projectPath: string,
) {
	// direct page watching
	watch(path, { recursive: true }, async (_event, relativePath) => {
		createPage(
			// biome-ignore lint/style/noNonNullAssertion: praying its not lowkey
			folder(path, relativePath!),
			path,
			contentDir,
			hangarPath,
			projectPath,
		);
	});
}
