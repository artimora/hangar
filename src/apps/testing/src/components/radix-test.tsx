import "@radix-ui/themes/styles.css";
import { Button, Flex, Text, Theme } from "@radix-ui/themes";
import type { JSX } from "react/jsx-runtime";

export default function Radix(): JSX.Element {
	return (
		<Theme>
			<Flex direction="column" gap="2">
				<Text>Hello from Radix Themes :)</Text>
				<Button>Let's go</Button>
			</Flex>
		</Theme>
	);
}
