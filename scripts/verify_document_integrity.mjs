import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const html = readFileSync(path.join(root, "index.html"), "utf8");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const idCounts = ids.reduce((counts, id) => counts.set(id, (counts.get(id) ?? 0) + 1), new Map());
const duplicateIds = [...idCounts.entries()].filter(([, count]) => count > 1).map(([id]) => id);

const hashLinks = [...new Set([...html.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]))];
const brokenHashLinks = hashLinks.filter((id) => !idCounts.has(id));

const canvasIssues = [...html.matchAll(/<canvas\b[^>]*>/g)]
  .map((match) => match[0])
  .filter((tag) => !/\brole="img"/.test(tag) || !/\baria-label="[^"]+"/.test(tag) || !/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag));

const videoCardIssues = [...html.matchAll(/<figure class="video-card" data-video-card>[\s\S]*?<\/figure>/g)]
  .map((match) => match[0])
  .filter((card) => !/<video\b/.test(card) || !/\bdata-src="\.\/public\/media\/manim\/[^"]+\.mp4"/.test(card) || !/<figcaption>[\s\S]*?<code>[^<]+Scene<\/code>[\s\S]*?<\/figcaption>/.test(card));

const result = {
  checkedIds: ids.length,
  checkedHashLinks: hashLinks.length,
  checkedCanvases: (html.match(/<canvas\b/g) ?? []).length,
  checkedVideoCards: (html.match(/data-video-card/g) ?? []).length,
  duplicateIds,
  brokenHashLinks,
  canvasIssues: canvasIssues.length,
  videoCardIssues: videoCardIssues.length,
  ok: duplicateIds.length === 0 && brokenHashLinks.length === 0 && canvasIssues.length === 0 && videoCardIssues.length === 0,
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
