import { readFile } from "node:fs/promises";
import { resolveHtmlPath, start, toHonoMiddleware } from "@artimora/hangar";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";

const server = await start(import.meta.url, { middleware: true });

const app: Hono = new Hono();
app.use(logger());

app.get("/api/hello", (c) => {
	return c.json({ msg: "Hello from Hono API + Vite hot module reload!" });
});

app.mount("/", server.handle);

serve({
	fetch: app.fetch,
	port: 5173,
});

console.log("dev server running at http://localhost:5173");
