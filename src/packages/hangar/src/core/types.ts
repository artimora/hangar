import type { HonoOptions } from "hono/hono-base";
import type { ResolvedConfig as ViteConfig, ViteDevServer } from "vite";
import type { NodeBindings } from "../mounting";

export type Config = {
	port?: number; // forwared to honos node server
	vite?: ViteConfig;
	hono?: HonoOptions<{
		Bindings: NodeBindings;
	}>;
	logs?: boolean;
};

export type Info = {
	paths: Paths;
	vite: ViteDevServer;
	config: Config;
};

export type Paths = {
	root: string;
	hangar: { root: string; content: string };
	project: { root: string; pages: string };
};
