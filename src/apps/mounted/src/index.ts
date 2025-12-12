import { start } from "@artimora/hangar";

const server = await start(import.meta.url);

server.get("/api/hello", (c) => {
	return c.json({ msg: "Hello from Hono API + Vite hot module reload!" });
});

server.serve();
