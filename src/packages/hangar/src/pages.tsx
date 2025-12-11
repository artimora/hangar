import { btoa } from "node:buffer";
import { existsSync, lstatSync, writeFileSync } from "node:fs";
import { EOL } from "node:os";
import nodePath from "node:path";
import { file } from "bun";
import type { JSX } from "react";
import { renderToString } from "react-dom/server";
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
		const f = file(path);
		const updated = await updateType(await f.text(), path);
		const components = await getClientComponents(updated);

		const tempPath = folder(hangarPath, "temp.tsx");

		const temp = file(tempPath);
		await temp.write(updated);

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

		rendered = await addClientScript(rendered);

		writeFileSync(htmlPath, rendered);
		writeFileSync(
			folder(nodePath.dirname(htmlPath), "client.jsx"),
			constructClientFile(components),
		);
	} catch (err) {
		const error = err as Error;
		console.error(`${error.name}: ${error.message}`);
	}
}

async function updateType(input: string, pagePath: string): Promise<string> {
	const importMap = buildImportMap(input, pagePath);

	const rewriter = new HTMLRewriter().on("[data-client-component]", {
		element(element) {
			element.onEndTag((t) => {
				t.before("*/}");
			});

			const markerName = element.getAttribute("data-client-component") ?? "";
			const tagName = element.tagName ?? "";
			const candidates = [
				markerName,
				tagName,
				markerName
					? `${markerName[0]!.toUpperCase()}${markerName.slice(1)}`
					: "",
				tagName ? `${tagName[0]!.toUpperCase()}${tagName.slice(1)}` : "",
			].filter(Boolean);

			let componentAbsolutePath = "?";
			for (const name of candidates) {
				const resolved = importMap.get(name);
				if (resolved) {
					componentAbsolutePath = resolved;
					break;
				}
			}

			element.before(
				`<div id="${btoa(componentAbsolutePath)}" data-client-component${
					element.selfClosing ? " />" : "></div>"
				}`,
				{
					html: true,
				},
			);
			element.before("{/*");
		},
	});

	const transformedHtml = await rewriter.transform(new Response(input)).text();

	return transformedHtml;
}

function buildImportMap(input: string, pagePath: string): Map<string, string> {
	const pageDir = nodePath.dirname(pagePath);
	const regex: RegExp = /import\s+([\w$]+)\s+from\s+["'](.+?)["']/g;
	const imports = new Map<string, string>();

	let match: RegExpExecArray | null = regex.exec(input);
	while (match !== null) {
		const localName = match[1] ?? "";
		const specifier = match[2];
		if (
			!specifier ||
			(!specifier.startsWith(".") && !specifier.startsWith("/"))
		) {
			match = regex.exec(input);
			continue;
		}

		const resolvedPath = resolveImportPath(pageDir, specifier);
		imports.set(localName!, resolvedPath);

		match = regex.exec(input);
	}

	return imports;
}

function resolveImportPath(pageDir: string, specifier: string): string {
	const basePath = nodePath.resolve(pageDir, specifier);
	if (nodePath.extname(basePath)) return basePath;

	const extensions = [".tsx", ".ts", ".jsx", ".js"];
	for (const ext of extensions) {
		const candidate = `${basePath}${ext}`;
		if (existsSync(candidate)) return candidate;
	}

	return basePath;
}

async function addClientScript(input: string): Promise<string> {
	const rewriter = new HTMLRewriter().on("head", {
		element(element) {
			element.append('<script type="module" src="/client.jsx"></script>', {
				html: true,
			});
		},
	});

	const transformedHtml = await rewriter.transform(new Response(input)).text();

	return transformedHtml;
}

async function getClientComponents(input: string): Promise<string[]> {
	const components: string[] = [];
	const rewriter = new HTMLRewriter().on("[data-client-component]", {
		element(element) {
			const id = element.getAttribute("id");
			if (id !== null) {
				components.push(id);
			}
		},
	});
	await rewriter.transform(new Response(input)).text();

	return components;
}

function constructClientFile(ids: string[]): string {
	return `// @ts-check
import { createRoot } from "react-dom/client";

${ids.map((id) => {
	return `await create("${id}");${EOL}`;
})}
/**
 * @param {string} id
 */
async function create(id) {
  const navDomNode = document.getElementById(id);

  if (navDomNode) {
    const Item = (await import(/* @vite-ignore */ atob(id))).default;
    const navRoot = createRoot(navDomNode);
    navRoot.render(<Item />);
  }
}
`;
}
