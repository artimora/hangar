import { findFilesByExtensionRecursively, folder, safeMk } from "./util";
import { renderToString } from "react-dom/server";
import type { JSX } from "react";
import nodePath from "node:path";
import { existsSync, lstatSync, writeFileSync, readFileSync } from "node:fs";
import { file } from "bun";
import { fileURLToPath } from "node:url";

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
  targetPath: string,
  hangarPath: string
): Promise<void> {
  const items = findFilesByExtensionRecursively(path, ".tsx");

  for (let index = 0; index < items.length; index++) {
    const element = items[index]!;
    await createPage(element, path, targetPath, hangarPath);
  }
}

export async function createPage(
  path: string,
  rootPath: string,
  contentPath: string,
  hangarPath: string
): Promise<void> {
  try {
    console.log(path);

    const f = file(path);
    const updated = await updateType(await f.text());

    const tempPath = folder(hangarPath, "temp.tsx");

    const temp = file(tempPath);
    await temp.write(updated);

    let pageModule = await import(`${tempPath}?t=${Date.now()}`);

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
        console.warn(`return ${htmlPath}`);
        return;
      }
    }

    rendered = await addClientScript(rendered);

    writeFileSync(htmlPath, rendered);
  } catch (err) {
    const error = err as Error;
    console.error(`${error.name}: ${error.message}`);
  }
}

async function updateType(input: string): Promise<string> {
  const rewriter = new HTMLRewriter().on("[data-client-component]", {
    element(element) {
      element.append(
        `<div id="${element.getAttribute("data-client-component")}"></div>`,
        {
          html: true,
        }
      );
    },
  });

  const transformedHtml = await rewriter.transform(new Response(input)).text();

  return transformedHtml;
}

async function addClientScript(input: string): Promise<string> {
  const rewriter = new HTMLRewriter().on("head", {
    element(element) {
      element.append('<script type="module" src="/client.jsx"></script>', {
        html: true,
      });
    },
  });

  const transformedHtml = await rewriter.transform(new Response(input)).text();

  return transformedHtml;
}
