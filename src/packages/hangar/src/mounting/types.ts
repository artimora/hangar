import type { IncomingMessage, ServerResponse } from "node:http";

export type NodeBindings = {
	incoming: IncomingMessage;
	outgoing: ServerResponse;
};
