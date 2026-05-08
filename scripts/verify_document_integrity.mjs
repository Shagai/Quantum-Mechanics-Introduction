import { combineHtml, readHtmlPages } from "./html_pages.mjs";

const root = process.cwd();
const pages = readHtmlPages(root);
const html = combineHtml(pages);

const checks = pages.map((page) => {
  const ids = [...page.html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const idCounts = ids.reduce((counts, id) => counts.set(id, (counts.get(id) ?? 0) + 1), new Map());
  const duplicateIds = [...idCounts.entries()].filter(([, count]) => count > 1).map(([id]) => `${page.file}#${id}`);
  const hashLinks = [...new Set([...page.html.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]))];
  const brokenHashLinks = hashLinks.filter((id) => !idCounts.has(id)).map((id) => `${page.file}#${id}`);
  const canvasIssues = [...page.html.matchAll(/<canvas\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => !/\brole="img"/.test(tag) || !/\baria-label="[^"]+"/.test(tag) || !/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag));
  const videoCardIssues = [...page.html.matchAll(/<figure class="video-card" data-video-card>[\s\S]*?<\/figure>/g)]
    .map((match) => match[0])
    .filter((card) => !/<video\b/.test(card) || !/\bdata-src="\.\/public\/media\/manim\/[^"]+\.mp4"/.test(card) || !/<figcaption>[\s\S]*?<code>[^<]+Scene<\/code>[\s\S]*?<\/figcaption>/.test(card));

  return {
    file: page.file,
    ids,
    hashLinks,
    duplicateIds,
    brokenHashLinks,
    canvasIssues,
    videoCardIssues,
  };
});

const duplicateIds = checks.flatMap((check) => check.duplicateIds);
const brokenHashLinks = checks.flatMap((check) => check.brokenHashLinks);
const canvasIssues = checks.flatMap((check) => check.canvasIssues);
const videoCardIssues = checks.flatMap((check) => check.videoCardIssues);

const result = {
  checkedPages: pages.map((page) => page.file),
  checkedIds: checks.reduce((sum, check) => sum + check.ids.length, 0),
  checkedHashLinks: checks.reduce((sum, check) => sum + check.hashLinks.length, 0),
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
