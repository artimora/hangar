import { Flex, Heading, Link, Text } from "@radix-ui/themes";
import type { JSX } from "react/jsx-runtime";
import BaseLayout from "../layouts/base-layout";
import "@radix-ui/themes/styles.css";

export default function Pure(): JSX.Element {
	return (
		<BaseLayout title="radix">
			<Flex direction="column" gap="2">
				<Heading>nothing but pure basic html used here!</Heading>
				<Text>
					<i>
						okay technically vite puts its own references here, but theres no
						client component script!
					</i>
				</Text>
				<Link href="/">/home</Link>
			</Flex>
		</BaseLayout>
	);
}
