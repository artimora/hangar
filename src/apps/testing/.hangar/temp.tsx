import type { JSX } from "react/jsx-runtime";

import Info from "../components/info";
import { ClientBoundary } from "@artimora/hangar";

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
        {/* <Info  /> {/* component used */}
        {/* <ClientBoundary name={"info"} children={<Info />} /> */}
        <Info data-client-component="info" />
      <div id="info"></div></body>
    </html>
  );
}
