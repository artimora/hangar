import { defineWorkspace } from "bunup";

// https://bunup.dev/docs/guide/workspaces

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
	},
);
