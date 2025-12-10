import { findFilesByExtensionRecursively, folder } from "./util";
import { renderToString } from "react-dom/server";
import type { JSX } from "react";
import nodePath from "node:path";
import { lstatSync, writeFileSync } from "node:fs";

export async function createPages(
  path: string,
  targetPath: string
): Promise<void> {
  const items = findFilesByExtensionRecursively(path, ".tsx");

  for (let index = 0; index < items.length; index++) {
    const element = items[index]!;
    createPage(element, path, targetPath);
  }
}

export async function createPage(
  path: string,
  rootPath: string,
  contentPath: string
): Promise<void> {
  let pageModule = await import(`${path}?t=${Date.now()}`);

  const Page: () => JSX.Element = pageModule.default;
  const rendered = renderToString(<Page />);

  const htmlPath = folder(
    contentPath,
    nodePath.relative(rootPath, path)
  ).replace("tsx", "html");

  if (lstatSync(htmlPath).isDirectory()) {
    return;
  }

  writeFileSync(htmlPath, rendered);
}
