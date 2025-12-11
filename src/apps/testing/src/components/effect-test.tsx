import { useEffect, useState } from "react";
import type { JSX } from "react/jsx-runtime";

export default function EffectTest(): JSX.Element {
	const [location, setLocation] = useState<{
		origin: string;
		port: string;
		pathname: string;
		href: string;
	}>();

	useEffect(() => {
		new Promise((resolve) => setTimeout(resolve, 1000));
		setLocation({
			origin: document.location.origin,
			port: document.location.port,
			pathname: document.location.pathname,
			href: document.location.href,
		});
	}, []);

	return (
		<div>
			<h2>web info</h2>
			<p>origin: {location?.origin ?? "loading"}</p>
			<p>port: {location?.port ?? "loading"}</p>
			<p>pathname: {location?.pathname ?? "loading"}</p>
			<p>href: {location?.href ?? "loading"}</p>
		</div>
	);
}
