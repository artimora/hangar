import { start } from "@artimora/hangar";

const server = await start(import.meta.url);

server.serve();
