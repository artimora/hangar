import swc from "@swc/core";
import { file } from "bun";

swc
	.transform(await file(`${import.meta.dir}/page.tsx`).text(), {
		filename: "index.js",
		sourceMaps: true,
		isModule: true,

		jsc: {
			parser: {
				syntax: "typescript",
			},
			transform: {
				react: {
					refresh: true,
					development: true,
				},
			},
		},
	})
	.then((output) => {
		output.code; // transformed code
		output.map; // source map (in string)
	});
