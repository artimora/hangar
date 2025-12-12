"use client";
import type { JSX } from "react/jsx-runtime";

export default function Links({
	links,
}: {
	links: [path: string, display: string][];
}): JSX.Element {
	return (
		<ol>
			{links.map((l) => {
				return (
					<li key={l[0]}>
						<a href={l[0]}>{l[1]}</a>
					</li>
				);
			})}
		</ol>
	);
}
