import { existsSync } from "node:fs";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getHtmlPageNames } from "./html_pages.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");

const entries = ["styles.css", "src", "public"];
const htmlEntries = getHtmlPageNames(root);
const generatedMediaDir = path.join(root, "public", "media", "manim");

if (!existsSync(generatedMediaDir)) {
  console.error("Missing generated media at public/media/manim.");
  console.error("Run `npm run render:manim` before `npm run build`.");
  process.exit(1);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  await cp(path.join(root, entry), path.join(dist, entry), {
    recursive: true,
    preserveTimestamps: true,
  });
}

for (const entry of htmlEntries) {
  await cp(path.join(root, entry), path.join(dist, entry), {
    preserveTimestamps: true,
  });
}

await writeFile(path.join(dist, ".nojekyll"), "");

console.log(`Built static site in ${path.relative(root, dist)}`);
