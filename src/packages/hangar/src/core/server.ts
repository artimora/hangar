import viteReact from "@vitejs/plugin-react";
import {
	createServer,
	mergeConfig,
	type UserConfig,
	type ViteDevServer,
} from "vite";
import type { Config } from "./types";

export async function startVite(
	path: string,
	config: Config,
): Promise<ViteDevServer> {
	const included: UserConfig = {
		root: path,
		plugins: [viteReact()],
		logLevel: "silent",
		appType: "custom",
	};

	return await createServer(mergeConfig(included, config.vite ?? {}));
}
