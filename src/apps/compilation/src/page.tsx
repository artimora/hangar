import type { JSX } from "react/jsx-runtime";
import Links from "./links";

export default function Index(): JSX.Element {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>index</title>
			</head>
			<body>
				<h1>Welcome to My Page</h1>
				<h2>This is a simple paragraph of text</h2>
				<ol>
					<li>
						<a href="/test/">counting</a>
					</li>
					<li>
						<a href="/pure/">pure</a>
					</li>
					<li>
						<a href="/radix/">radix</a>
					</li>
					<Links
						links={[
							["/test/", "counting"],
							["/pure/", "pure"],
							["/radix/", "radix"],
						]}
					/>
				</ol>
			</body>
		</html>
	);
}
