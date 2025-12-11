import { defineWorkspace } from "bunup";

export default defineWorkspace(
	[
		{
			name: "@artimora/hangar",
			root: "src/packages/hangar",
		},
	],
	{
		minify: false,
		footer: "// built with love and caffeine by copper :3",
		unused: {
			level: "error",
		},
		exports: true,
		external: ["bun"],
		format: ["cjs", "esm"],
	},
);
