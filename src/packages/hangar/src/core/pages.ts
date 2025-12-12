import { existsSync, lstatSync, writeFileSync } from "node:fs";
import fs from "node:fs/promises";
import nodePath from "node:path";
import {
	addClientScript,
	addStylesheets,
	clientComponentConverter,
	constructClientFile,
	getClientComponents,
} from "./construction";
import render from "./render";
import { findFilesByExtensionRecursively, folder, safeMk } from "./util";

export async function createPages(
	path: string,
	targetPath: string,
	hangarPath: string,
	projectPath: string,
): Promise<void> {
	const items = findFilesByExtensionRecursively(path, ".tsx");

	for (let index = 0; index < items.length; index++) {
		const element = items[index]!;
		await createPage(element, path, targetPath, hangarPath, projectPath);
	}
}

export async function createPage(
	path: string,
	rootPath: string,
	contentPath: string,
	hangarPath: string,
	projectPath: string,
): Promise<void> {
	try {
		const contents = await fs.readFile(path, "utf8");
		const updated = await clientComponentConverter(contents, path);
		const components = await getClientComponents(updated);
		const styled = await addStylesheets(updated, projectPath);

		const tempPath = folder(hangarPath, "temp.tsx");
		writeFileSync(tempPath, styled);

		const pageModule = await import(`${tempPath}?t=${Date.now()}`);

		let rendered = render(
			pageModule.default,
			components.length > 0 ? "string" : "staticMarkup",
		);

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
		rendered = await addStylesheets(rendered, projectPath);

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
