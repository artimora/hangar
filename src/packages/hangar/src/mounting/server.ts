import { readFile } from "node:fs/promises";
import type { Hangar } from "../main";
import { resolveHtmlPath, toHonoMiddleware } from "./util";

export function mountMiddleware(server: Hangar): void {
	server.use("*", toHonoMiddleware(server.hangar.vite));
}

export function mountPageCollector(server: Hangar): void {
	server.get("*", async (c) => {
		const url = c.req.path;
		const htmlPath = resolveHtmlPath(server.hangar.paths.hangar.content, url);

		try {
			const template = await readFile(htmlPath, "utf8");
			const html = await server.hangar.vite.transformIndexHtml(url, template);
			return c.html(html);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				return c.text("Not Found", 404);
			}

			console.error("Failed to render page", error);
			return c.text("Internal Server Error", 500);
		}
	});
}
