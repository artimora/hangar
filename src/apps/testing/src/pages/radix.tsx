// import "@radix-ui/themes/styles.css";
import type { JSX } from "react/jsx-runtime";
import Radix from "../components/radix-test";

export default function Pure(): JSX.Element {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>radix</title>
			</head>
			<body>
				<Radix data-client-component />
			</body>
		</html>
	);
}
