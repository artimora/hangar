import type { JSX } from "react/jsx-runtime";
import Counter from "../components/counter";
import EffectTest from "../components/effect-test";
import Info from "../components/info";

export default function Index(): JSX.Element {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>My Basic Page</title>
			</head>
			<body>
				<h1>Welcome to My Page</h1>
				<p>This is a simple paragraph of text</p>
				<ol>
					<li>
						<a href="/test/">counting</a>
					</li>
					<li>
						<a href="/pure/">pure</a>
					</li>
				</ol>

				<EffectTest data-client-component />
				<Info data-client-component />
				<Counter data-client-component />
				<Counter data-client-component />
			</body>
		</html>
	);
}
