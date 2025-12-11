import { defineWorkspace } from "bunup";
import { copy } from "bunup/plugins";

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
		plugins: [copy(["../../../ReadMe.md", "../../../License.txt"]).to("../")],
	},
);
