import type { ResolvedConfig as ViteConfig } from "vite";

export type Config = {
	port?: number; // forwarded to vite
	host?: boolean | string; // forwared to vite
	vite?: ViteConfig;
};
