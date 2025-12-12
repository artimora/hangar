import swc from "@swc/core";
import { file } from "bun";

swc
	.transform(await file(`${import.meta.dir}/page.tsx`).text(), {
		filename: "page.tsx",
		sourceMaps: true,
		isModule: true,

		jsc: {
			parser: {
				syntax: "typescript",
				tsx: true,
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
		console.log("done");
		file("out/page.js").write(output.code);
		file("out/map.json").write(output.map!);
	});
