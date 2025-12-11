import { useState } from "react";
import type { JSX } from "react/jsx-runtime";

export default function Counter(): JSX.Element {
	const [countValue, setCountValue] = useState<number>(0);
	const increment = () => setCountValue(countValue + 1);
	const decrement = () => setCountValue(countValue - 1);

	return (
		<div>
			<h2>Count Value: {countValue}</h2>
			<button type="button" onClick={decrement}>
				-1
			</button>
			<button type="button" onClick={increment}>
				+1
			</button>
		</div>
	);
}
