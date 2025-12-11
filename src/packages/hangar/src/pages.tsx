import { existsSync, lstatSync, writeFileSync } from "node:fs";
import fs from "node:fs/promises";
import nodePath from "node:path";
import type { JSX } from "react";
import { renderToString } from "react-dom/server";
import {
	addClientScript,
	clientComponentConverter,
	constructClientFile,
	getClientComponents,
} from "./construction";
import { findFilesByExtensionRecursively, folder, safeMk } from "./util";

export async function createPages(
	path: string,
	targetPath: string,
	hangarPath: string,
): Promise<void> {
	const items = findFilesByExtensionRecursively(path, ".tsx");

	for (let index = 0; index < items.length; index++) {
		const element = items[index]!;
		await createPage(element, path, targetPath, hangarPath);
	}
}

export async function createPage(
	path: string,
	rootPath: string,
	contentPath: string,
	hangarPath: string,
): Promise<void> {
	try {
		const contents = await fs.readFile(path, "utf8");
		const updated = await clientComponentConverter(contents, path);
		const components = await getClientComponents(updated);

		const tempPath = folder(hangarPath, "temp.tsx");
		writeFileSync(tempPath, updated);

		const pageModule = await import(`${tempPath}?t=${Date.now()}`);

		const Page: () => JSX.Element = pageModule.default;

		let rendered = renderToString(<Page />);

		let htmlPath = folder(
			contentPath,
			nodePath.relative(rootPath, path),
		).replace("tsx", "html");

		if (!htmlPath.endsWith("index.html")) {
			htmlPath = folder(htmlPath.slice(0, -".html".length), `index.html`);
		}

		safeMk(nodePath.dirname(htmlPath));
		if (existsSync(htmlPath)) {
			if (lstatSync(htmlPath).isDirectory()) {
				console.warn(`return ${htmlPath}`);
				return;
			}
		}

		if (components.length > 0) rendered = await addClientScript(rendered);

		writeFileSync(htmlPath, rendered);

		if (components.length > 0) {
			writeFileSync(
				folder(nodePath.dirname(htmlPath), "client.jsx"),
				constructClientFile(components),
			);
		}
	} catch (err) {
		const error = err as Error;
		console.error(`${error.name}: ${error.message}`);
	}
}
