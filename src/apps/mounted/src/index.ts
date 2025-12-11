import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { start } from "@artimora/hangar";
import { serve } from "@hono/node-server";
import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { logger } from "hono/logger";
import type { ViteDevServer } from "vite";

async function main() {
	const app = new Hono<{ Bindings: NodeBindings }>();
	app.use(logger());

	const server = await start(import.meta.url, { middleware: true });

	if (!server || !server.vite) {
		return;
	}

	const { vite, paths } = server;

	app.use("*", toHonoMiddleware(vite));

	app.get("/api/hello", (c) => {
		return c.json({ msg: "Hello from Hono API + Vite hot module reload!" });
	});

	app.get("*", async (c) => {
		const url = c.req.path;
		const htmlPath = resolveHtmlPath(paths.hangar.content, url);

		try {
			const template = await readFile(htmlPath, "utf8");
			const html = await vite.transformIndexHtml(url, template);
			return c.html(html);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				return c.text("Not Found", 404);
			}

			console.error("Failed to render page", error);
			return c.text("Internal Server Error", 500);
		}
	});

	serve({
		fetch: app.fetch,
		port: 5173,
	});

	console.log("🚀 Dev server running at http://localhost:5173");
}

main().catch((error) => {
	console.error("Failed to start server", error);
	process.exitCode = 1;
});

type NodeBindings = {
	incoming: IncomingMessage;
	outgoing: ServerResponse;
};

function toHonoMiddleware(
	vite: ViteDevServer,
): MiddlewareHandler<{ Bindings: NodeBindings }> {
	return async (c, next) => {
		const nodeReq = c.env?.incoming;
		const nodeRes = c.env?.outgoing;

		if (!nodeReq || !nodeRes) {
			return next();
		}

		return new Promise((resolve, reject) => {
			vite.middlewares(nodeReq, nodeRes, (err?: unknown) => {
				if (err) {
					reject(err);
					return;
				}

				if (nodeRes.writableEnded) {
					resolve();
					return;
				}

				resolve(next());
			});
		});
	};
}

function resolveHtmlPath(contentDir: string, urlPath: string): string {
	const normalized = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
	const relativePath = normalized.replace(/^[/\\]/, "");
	const target = relativePath.endsWith(".html")
		? relativePath
		: path.join(relativePath, "index.html");

	return path.join(contentDir, target);
}
