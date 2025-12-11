import { btoa } from "node:buffer";
import { existsSync } from "node:fs";
import { EOL } from "node:os";
import nodePath from "node:path";

import { expandSelfClosingJSX, stripComments } from ".";

export async function clientComponentConverter(
	input: string,
	pagePath: string,
): Promise<string> {
	const importMap = buildImportMap(input, pagePath);

	const rewriter = new HTMLRewriter().on("[data-client-component]", {
		element(element) {
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

			element.replace(
				`<div id="${btoa(componentAbsolutePath)}" data-client-component ></div>`,
				{
					html: true,
				},
			);
		},
	});

	input = expandSelfClosingJSX(input);
	input = stripComments(input);

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

export async function addClientScript(input: string): Promise<string> {
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

export async function getClientComponents(input: string): Promise<string[]> {
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

export function constructClientFile(ids: string[]): string {
	return `// @ts-check
import { createRoot } from "react-dom/client";

${ids
	.map((id) => {
		return `{
  const navDomNode = document.getElementById("${id}");

  if (navDomNode) {
    const Item = (await import("${atob(id)}")).default;
    const navRoot = createRoot(navDomNode);
    navRoot.render(<Item />);
  }
}
`;
	})
	.join(EOL)}
`;
}
