import { Flex, Link } from "@radix-ui/themes";
import type { JSX } from "react/jsx-runtime";
import Counter from "../components/counter";
import BaseLayout from "../layouts/base-layout";

export default function Test(): JSX.Element {
	return (
		<BaseLayout title="radix">
			<Flex direction="column" gap="2">
				<Link href="/">/home</Link>
				<Counter data-client-component />
			</Flex>
		</BaseLayout>
	);
}
