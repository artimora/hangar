import type { JSX } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";

export default function render(
	to: () => JSX.Element,
	type: "string" | "staticMarkup",
): string {
	const ToRender: () => JSX.Element = to;

	if (type === "staticMarkup") {
		return renderToStaticMarkup(<ToRender />);
	}

	return renderToString(<ToRender />);
}
