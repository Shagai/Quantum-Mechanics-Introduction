import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export function getHtmlPageNames(root) {
  return readdirSync(root)
    .filter((name) => name.endsWith(".html"))
    .sort((a, b) => {
      if (a === "index.html") return -1;
      if (b === "index.html") return 1;
      return a.localeCompare(b);
    });
}

export function readHtmlPages(root) {
  return getHtmlPageNames(root).map((file) => ({
    file,
    html: readFileSync(path.join(root, file), "utf8"),
  }));
}

export function combineHtml(pages) {
  return pages.map((page) => page.html).join("\n");
}
