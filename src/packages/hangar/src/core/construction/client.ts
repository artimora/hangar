import { btoa } from "node:buffer";
import { existsSync } from "node:fs";
import { EOL } from "node:os";
import nodePath from "node:path";
import { pathToFileURL } from "node:url";
import { cleanPath } from "../util";
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

			element.before(
				`<div id="${btoa(componentAbsolutePath)}#${crypto.randomUUID()}" data-client-component >`,
				{ html: true },
			);
			element.after(`</div>`, { html: true });
			element.removeAndKeepContent();
			// element.replace(
			// 	`<div id="${btoa(componentAbsolutePath)}#${crypto.randomUUID()}" data-client-component ></div>`,
			// 	{
			// 		html: true,
			// 	},
			// );
		},
	});

	input = expandSelfClosingJSX(input);
	input = stripComments(input);

	let transformedHtml = await rewriter.transform(new Response(input)).text();

	// convert relative import specifiers to absolute file:// URLs
	const importRegex = /import\s+([\w$]+)\s+from\s+["'](.+?)["']/g;
	transformedHtml = transformedHtml.replace(
		importRegex,
		(full, localName: string, specifier: string) => {
			if (
				!specifier ||
				(!specifier.startsWith(".") && !specifier.startsWith("/"))
			) {
				return full;
			}

			const resolved =
				importMap.get(localName) ??
				resolveImportPath(nodePath.dirname(pagePath), specifier);

			const specifierUrl = pathToFileURL(cleanPath(resolved)).href;

			return `import ${localName} from "${specifierUrl}"`;
		},
	);

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
		imports.set(localName!.toLowerCase(), resolvedPath);

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

export async function getClientComponents(
	input: string,
): Promise<{ path: string; uuid: string }[]> {
	const components: { path: string; uuid: string }[] = [];
	const rewriter = new HTMLRewriter().on("[data-client-component]", {
		element(element) {
			const id = element.getAttribute("id");

			if (id !== null) {
				const split = id.split("#");

				components.push({ path: split[0]!, uuid: split[1]! });
			}
		},
	});
	await rewriter.transform(new Response(input)).text();

	return components;
}

// uuid is always unique, but path isn't always. imports could be simplified so each unique component is imported once
export function constructClientFile(
	components: { path: string; uuid: string }[],
): string {
	const items = new Map<string, string[]>();

	for (let index = 0; index < components.length; index++) {
		const element = components[index];

		if (!element) continue;

		if (items.has(element.path)) {
			const gotten = items.get(element.path);

			if (gotten) {
				items.set(element.path, [...gotten, element.uuid]);
			}
		} else {
			items.set(element.path, [element.uuid]);
		}
	}

	return `// @ts-check
import { createRoot } from "react-dom/client";

${items
	.keys()
	.map((v) => {
		const uuids = items.get(v)!;

		if (uuids.length > 1) {
			return `{
    const Item = (await import("${cleanPath(atob(v))}")).default;    
    ${uuids
			.map((u) => {
				return `
    {
        const navDomNode = document.getElementById("${v}#${u}");

        if (navDomNode) {
            const navRoot = createRoot(navDomNode);
            navRoot.render(<Item />);
        }
    }`;
			})
			.join(EOL)}
}
`;
		} else if (uuids.length === 1) {
			return `{
  const navDomNode = document.getElementById("${v}#${uuids[0]}");

  if (navDomNode) {
    const Item = (await import("${cleanPath(atob(v))}")).default;
    const navRoot = createRoot(navDomNode);
    navRoot.render(<Item />);
  }
}
`;
		} else {
			return "";
		}
	})
	.toArray()
	.join(EOL)}
`;
}
