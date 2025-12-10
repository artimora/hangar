import type { JSX } from "react/jsx-runtime";

// component that was used was imported here
//  get the source and check if its a client compoents
//  if it is, rewrite the source to not include it on the server
//  transpile the target component to js, and add it to where its needed on the client
import Info from "../components/info";

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
        <Info /> {/* component used */}
      </body>
    </html>
  );
}
