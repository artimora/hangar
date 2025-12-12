import "@radix-ui/themes/styles.css";
import { Button, Flex, Heading, Link, Text } from "@radix-ui/themes";
import type { JSX } from "react/jsx-runtime";
import BaseLayout from "../layouts/base-layout";

export default function Pure(): JSX.Element {
	return (
		<BaseLayout title="radix">
			<Flex direction="column" gap="2">
				<Heading>Hello from Radix Themes :)</Heading>
				<Button>Let's go</Button>
				<Link href="/">/home</Link>
			</Flex>
		</BaseLayout>
	);
}
