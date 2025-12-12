import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import type { JSX } from "react/jsx-runtime";

export default function BaseLayout({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}): JSX.Element {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
			</head>
			<body>
				<Theme appearance="dark" radius="medium" panelBackground="translucent">
					{children}
				</Theme>
			</body>
		</html>
	);
}
