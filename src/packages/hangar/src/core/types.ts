import type { ResolvedConfig as ViteConfig, ViteDevServer } from "vite";

export type Config = {
	port?: number; // forwarded to vite
	host?: boolean | string; // forwared to vite
	vite?: ViteConfig;
	middleware?: boolean;
};

export type Info = {
	paths: Paths;
	vite: ViteDevServer | undefined;
	config: Config;
};

export type Paths = {
	root: string;
	hangar: { root: string; content: string };
	project: { root: string; pages: string };
};
