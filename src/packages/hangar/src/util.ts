import { existsSync, mkdirSync, readdirSync } from "node:fs";
import nodePath from "node:path";

export function makeDirs(root: string, sub: string[]): void {
  safeMk(root);

  sub.forEach((p) => {
    safeMk(`${root}${nodePath.sep}${p}`);
  });
}

export function safeMk(path: string): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

export function folder(root: string, sub: string): string {
  return `${root}${nodePath.sep}${sub}`;
}

export function findFilesByExtensionRecursively(
  directory: string,
  extension: string
): string[] {
  let foundFiles: string[] = [];

  const filesAndDirs = readdirSync(directory, { withFileTypes: true });

  for (const item of filesAndDirs) {
    const fullPath = nodePath.join(directory, item.name);

    if (item.isDirectory()) {
      foundFiles = foundFiles.concat(
        findFilesByExtensionRecursively(fullPath, extension)
      );
    } else if (item.isFile() && nodePath.extname(item.name) === extension) {
      foundFiles.push(fullPath);
    }
  }

  return foundFiles;
}
