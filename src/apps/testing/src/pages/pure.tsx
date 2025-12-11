import type { JSX } from "react/jsx-runtime";

export default function Pure(): JSX.Element {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>coutning</title>
			</head>
			<body>
				<a href="/">home</a>
				<h1>nothing but pure html on this page!</h1>
			</body>
		</html>
	);
}
