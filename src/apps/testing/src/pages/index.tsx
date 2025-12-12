import { Heading, Text } from "@radix-ui/themes";
import type { JSX } from "react/jsx-runtime";
import Counter from "../components/counter";
import EffectTest from "../components/effect-test";
import Info from "../components/info";
import BaseLayout from "../layouts/base-layout";

export default function Index(): JSX.Element {
	return (
		<BaseLayout title="index">
			<Heading>Welcome to My Page</Heading>
			<Text>This is a simple paragraph of text</Text>
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
			</ol>

			<EffectTest data-client-component />
			<Info data-client-component />
			<Counter data-client-component />
			<Counter data-client-component />
		</BaseLayout>
	);
}
