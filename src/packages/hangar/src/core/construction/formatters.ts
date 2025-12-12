export function expandSelfClosingJSX(code: string): string {
	const selfClosingTag = /<([A-Za-z0-9:_-]+)([^>]*)\/>/g;

	return code.replace(selfClosingTag, (_, tag, attrs) => {
		// Preserve whitespace in attrs (could be empty)
		const attrText = attrs?.trimEnd() ?? "";
		return attrText.length > 0
			? `<${tag}${attrs}></${tag}>`
			: `<${tag}></${tag}>`;
	});
}

export function stripComments(code: string): string {
	// 1. Remove JSX comments including surrounding {}
	// Examples matched:
	//   {/* ... */}
	//   { /* ... */ }
	//   {/** ... **/}
	code = code.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");

	// 2. Remove block comments everywhere else (normal JS/TS)
	code = code.replace(/\/\*[\s\S]*?\*\//g, "");

	// 3. Remove line comments (excluding URLs)
	code = code.replace(/(^|[^:])\/\/.*$/gm, "$1");

	return code;
}
