// @ts-check
import { createRoot, hydrateRoot } from "react-dom/client";

import Info from "../../src/components/info";

const navDomNode = document.getElementById("info");

if (navDomNode) {
  const navRoot = createRoot(navDomNode);
  navRoot.render(<Info />);
}
