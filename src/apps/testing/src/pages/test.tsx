import type { JSX } from "react/jsx-runtime";
import Counter from "../components/counter";

export default function Test(): JSX.Element {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>coutning</title>
			</head>
			<body>
				<a href="/">home</a>
				<Counter data-client-component />
			</body>
		</html>
	);
}
