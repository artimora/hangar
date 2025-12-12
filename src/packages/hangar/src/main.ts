import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import type { ExecutionContext, Hono } from "hono";
import type { ViteDevServer } from "vite";
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
import { mount, type NodeBindings } from "./mounting";

export class Hangar {
	public info: Info;
	public paths: Paths;

	private hono: Hono<{ Bindings: NodeBindings }>;

	constructor(info: Info) {
		this.info = info;
		this.paths = info.paths;
		this.hono = mount(this.info);
		this.handle = async (request, env, ctx) => {
			return await this.hono.fetch(request, env, ctx);
		};
	}

	public handle: (
		request: Request,
		Env?: {} | NodeBindings | undefined | any,
		executionCtx?: ExecutionContext,
	) => Promise<Response> | Response;
}

export async function start(
	path: string,
	config: Config = {},
): Promise<Hangar> {
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

	const info: Info = {
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
