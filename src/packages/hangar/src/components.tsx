import type { JSX } from "react";
import { clientComponentMarker } from "./pages";

export function ClientBoundary({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}): JSX.Element {
  // On server, render empty div. Client will hydrate with actual component.
  if (typeof window === "undefined") {
    return (
      <div
        id={`${clientComponentMarker}-${name}`}
        data-client-component
        suppressHydrationWarning
      />
    );
  }
  // On client, render with children
  return (
    <div
      id={`${clientComponentMarker}-${name}`}
      data-client-component
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
