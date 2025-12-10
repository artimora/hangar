import { fileURLToPath } from "bun";
import { folder, makeDirs } from "./util";
import { createServer } from "vite";
import { watch } from "node:fs";
import { createPage, createPages } from "./pages";

export async function start(path: string): Promise<void> {
  const dir = fileURLToPath(new URL("../", path));

  // base
  const hangarDir = `${dir}.hangar`;
  const srcDir = `${dir}src`;

  // hangar
  const contentDir = folder(hangarDir, "content");

  // src
  const pagesDir = folder(srcDir, "pages");
  const componentsDir = folder(srcDir, "components");

  makeDirs(hangarDir, ["content"]);

  // logic
  await createPages(pagesDir, contentDir);

  startWatching(pagesDir, contentDir, componentsDir);

  await startVite(contentDir);
}

function startWatching(
  path: string,
  contentDir: string,
  componentsDir: string
) {
  // direct page watching
  watch(path, { recursive: true }, async (_event, relativePath) => {
    createPage(folder(path, relativePath!), path, contentDir);
  });
  watch(componentsDir, { recursive: true }, async () => {
    await createPages(path, contentDir);
  });
}

async function startVite(path: string): Promise<void> {
  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    configFile: false,
    root: path,
    server: {
      port: 1337,
    },
  });
  await server.listen();
  server.printUrls();
  server.bindCLIShortcuts({ print: true });
}
