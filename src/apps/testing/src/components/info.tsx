import { useState } from "react";
import type { JSX } from "react/jsx-runtime";

export default function Info(): JSX.Element {

	return (
		<div>
			<h2>info</h2>
			<p>{document.location.origin}</p>
		</div>
	);
}
