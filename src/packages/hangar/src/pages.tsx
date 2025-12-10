import { findFilesByExtensionRecursively, folder, safeMk } from "./util";
import { renderToString } from "react-dom/server";
import type { JSX } from "react";
import nodePath from "node:path";
import { existsSync, lstatSync, writeFileSync, readFileSync } from "node:fs";

export const clientComponentMarker = "__client_component__";

function extractClientComponentNames(html: string): string[] {
  const names: string[] = [];
  const regex = new RegExp(`id="${clientComponentMarker}-([^"]+)"`, "g");
  let match;
  while ((match = regex.exec(html)) !== null) {
    names.push(match[1]!);
  }
  return [...new Set(names)]; // Remove duplicates
}

export async function createPages(
  path: string,
  targetPath: string
): Promise<void> {
  const items = findFilesByExtensionRecursively(path, ".tsx");

  for (let index = 0; index < items.length; index++) {
    const element = items[index]!;
    await createPage(element, path, targetPath);
  }
}

export async function createPage(
  path: string,
  rootPath: string,
  contentPath: string
): Promise<void> {
  try {
    let pageModule = await import(`${path}?t=${Date.now()}`);

    const Page: () => JSX.Element = pageModule.default;

    let rendered = renderToString(<Page />);

    let htmlPath = folder(
      contentPath,
      nodePath.relative(rootPath, path)
    ).replace("tsx", "html");

    if (!htmlPath.endsWith("index.html")) {
      htmlPath = folder(htmlPath.slice(0, -".html".length), `index.html`);
    }

    safeMk(nodePath.dirname(htmlPath));
    if (existsSync(htmlPath)) {
      if (lstatSync(htmlPath).isDirectory()) {
        return;
      }
    }

    writeFileSync(htmlPath, rendered);
  } catch (err) {
    const error = err as Error;
    console.error(`${error.name}: ${error.message}`);
  }
}
