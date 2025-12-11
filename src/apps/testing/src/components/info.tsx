import type { JSX } from "react/jsx-runtime";

export default function Info(): JSX.Element {
	return (
		<div>
			<h2>web info</h2>
			<p>origin: {document.location.origin}</p>
			<p>port: {document.location.port}</p>
			<p>pathname: {document.location.pathname}</p>
			<p>href: {document.location.href}</p>
		</div>
	);
}
