import "@radix-ui/themes/styles.css";
import { Button, Flex, Link, Text, Theme } from "@radix-ui/themes";
import type { JSX } from "react/jsx-runtime";

export default function Pure(): JSX.Element {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>radix</title>
			</head>
			<body>
				<Theme appearance="dark" radius="medium" panelBackground="translucent">
					<Flex direction="column" gap="2">
						<Text>Hello from Radix Themes :)</Text>
						<Button>Let's go</Button>
						<Link href="/">/home</Link>
					</Flex>
				</Theme>
			</body>
		</html>
	);
}
