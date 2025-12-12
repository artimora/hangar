import { readFile } from "node:fs/promises";
import { Hono } from "hono";
import type { HonoBase } from "hono/hono-base";
import type { Info } from "../core";
import type { NodeBindings } from "./types";
import { resolveHtmlPath, toHonoMiddleware } from "./util";

export function mount(info: Info): Hono<{ Bindings: NodeBindings }> {
	const app = new Hono<{ Bindings: NodeBindings }>();

	app.use("*", toHonoMiddleware(info.vite!));

	app.get("*", async (c) => {
		const url = c.req.path;
		const htmlPath = resolveHtmlPath(info.paths.hangar.content, url);

		try {
			const template = await readFile(htmlPath, "utf8");
			const html = await info.vite!.transformIndexHtml(url, template);
			return c.html(html);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				return c.text("Not Found", 404);
			}

			console.error("Failed to render page", error);
			return c.text("Internal Server Error", 500);
		}
	});

	return app;
}
