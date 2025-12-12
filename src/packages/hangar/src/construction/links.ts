export async function addStylesheets(
	input: string,
	projectRoot: string,
): Promise<string> {
	const imports = extractCssImports(input);
	const rewriter = new HTMLRewriter().on("head", {
		element(element) {
			for (let index = 0; index < imports.length; index++) {
				const imported = imports[index];

				const path = resolveFrom(projectRoot, imported!);

				console.log(path);

				element.append(`<link rel="stylesheet" href="${path}"></link>`, {
					html: true,
				});
			}
		},
	});

	const transformedHtml = await rewriter.transform(new Response(input)).text();

	return transformedHtml;
}

export function resolveFrom(projectRoot: string, spec: string): string {
	return require.resolve(spec, { paths: [projectRoot] });
}

function extractCssImports(source: string): string[] {
	const importRegex = /import\s+(?:[^'"]*from\s+)?["']([^"']+\.css)["']/g;

	return Array.from(
		source.matchAll(importRegex),
		(match) => match[1],
	) as string[];
}
