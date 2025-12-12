import nodePath from "node:path";
import type { MiddlewareHandler } from "hono";
import type { ViteDevServer } from "vite";
import type { NodeBindings } from "./types";

export function toHonoMiddleware(
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

export function resolveHtmlPath(contentDir: string, urlPath: string): string {
	const normalized = nodePath.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
	const relativePath = normalized.replace(/^[/\\]/, "");
	const target = relativePath.endsWith(".html")
		? relativePath
		: nodePath.join(relativePath, "index.html");

	return nodePath.join(contentDir, target);
}
