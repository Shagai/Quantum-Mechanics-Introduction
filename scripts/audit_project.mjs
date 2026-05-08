import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { isCodexBrowserVerified, readCodexBrowserCard, readCodexBrowserProof } from "./browser_gate_helpers.mjs";

const root = process.cwd();
const outDir = path.join(root, "output", "playwright");
const htmlPath = path.join(root, "index.html");
const jsPath = path.join(root, "src", "main.js");
const manimPath = path.join(root, "manim", "quantum_scenes.py");
const syllabusPath = path.join(root, "SYLLABUS_MAP.md");
const studyPathPath = path.join(root, "STUDY_PATH.md");
const problemSetPath = path.join(root, "PROBLEM_SET.md");
const url = process.env.AUDIT_URL || "http://localhost:5173";
const requireCodexBrowser = process.env.REQUIRE_CODEX_BROWSER === "1";

const html = readFileSync(htmlPath, "utf8");
const js = readFileSync(jsPath, "utf8");
const manim = readFileSync(manimPath, "utf8");
const syllabus = readFileSync(syllabusPath, "utf8");
const studyPath = readFileSync(studyPathPath, "utf8");
const problemSet = readFileSync(problemSetPath, "utf8");

const mediaRefs = [...html.matchAll(/(?:data-src|poster)="\.\/([^"]+)"/g)].map((match) => match[1]);
const missingMedia = mediaRefs.filter((relativePath) => !existsSync(path.join(root, relativePath)));
const mp4Refs = mediaRefs.filter((relativePath) => relativePath.endsWith(".mp4"));
const jpgRefs = mediaRefs.filter((relativePath) => relativePath.endsWith(".jpg"));
const sceneClasses = [...manim.matchAll(/^class\s+(\w+Scene)\(/gm)].map((match) => match[1]);
const inlineFormulaCount = [...html.matchAll(/\\\([\s\S]*?\\\)/g)].length;
const displayFormulaCount = [...html.matchAll(/\\\[[\s\S]*?\\\]/g)].length;
const math = {
  ok: html.includes("window.MathJax") && inlineFormulaCount + displayFormulaCount >= 50,
  hasMathJaxConfig: html.includes("window.MathJax"),
  inlineFormulaCount,
  displayFormulaCount,
  totalFormulaCount: inlineFormulaCount + displayFormulaCount,
  minimumFormulaCount: 50,
};
const scriptCanvasIds = new Set([...js.matchAll(/#([a-z0-9-]+-canvas|hero-wave)/gi)].map((match) => match[1]));
const htmlCanvasIds = [...html.matchAll(/<canvas[^>]+id="([^"]+)"/g)].map((match) => match[1]);
const canvasesMissingJs = htmlCanvasIds.filter((id) => !scriptCanvasIds.has(id));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const idCounts = ids.reduce((counts, id) => counts.set(id, (counts.get(id) ?? 0) + 1), new Map());
const duplicateIds = [...idCounts.entries()].filter(([, count]) => count > 1).map(([id]) => id);
const hashLinks = [...new Set([...html.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]))];
const brokenHashLinks = hashLinks.filter((id) => !idCounts.has(id));
const canvasA11yIssues = [...html.matchAll(/<canvas\b[^>]*>/g)]
  .map((match) => match[0])
  .filter((tag) => !/\brole="img"/.test(tag) || !/\baria-label="[^"]+"/.test(tag) || !/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag));
const videoCardIssues = [...html.matchAll(/<figure class="video-card" data-video-card>[\s\S]*?<\/figure>/g)]
  .map((match) => match[0])
  .filter((card) => !/<video\b/.test(card) || !/\bdata-src="\.\/public\/media\/manim\/[^"]+\.mp4"/.test(card) || !/<figcaption>[\s\S]*?<code>[^<]+Scene<\/code>[\s\S]*?<\/figcaption>/.test(card));
const documentIntegrity = {
  ok: duplicateIds.length === 0 && brokenHashLinks.length === 0 && canvasA11yIssues.length === 0 && videoCardIssues.length === 0,
  checkedIds: ids.length,
  checkedHashLinks: hashLinks.length,
  checkedCanvases: htmlCanvasIds.length,
  checkedVideoCards: (html.match(/data-video-card/g) ?? []).length,
  duplicateIds,
  brokenHashLinks,
  canvasA11yIssues: canvasA11yIssues.length,
  videoCardIssues: videoCardIssues.length,
};
const syllabusSectionIds = [
  ...new Set([...syllabus.matchAll(/`#([a-z0-9-]+)`/g)].map((match) => match[1])),
];
const syllabusSceneRefs = [
  ...new Set([...syllabus.matchAll(/`([A-Za-z][A-Za-z0-9]*Scene)`/g)].map((match) => match[1])),
];
const sceneClassSet = new Set(sceneClasses);
const syllabusAudit = {
  ok: true,
  checkedSections: syllabusSectionIds.length,
  checkedScenes: syllabusSceneRefs.length,
  missingSections: syllabusSectionIds.filter((id) => !html.includes(`id="${id}"`)),
  missingScenes: syllabusSceneRefs.filter((scene) => !sceneClassSet.has(scene)),
};
syllabusAudit.ok = syllabusAudit.missingSections.length === 0 && syllabusAudit.missingScenes.length === 0;
const studyPathSectionIds = [
  ...new Set([...studyPath.matchAll(/`#([a-z0-9-]+)`/g)].map((match) => match[1])),
];
const studyPathAudit = {
  ok: true,
  checkedSections: studyPathSectionIds.length,
  missingSections: studyPathSectionIds.filter((id) => !html.includes(`id="${id}"`)),
};
studyPathAudit.ok = studyPathAudit.missingSections.length === 0;
const problemSetSectionIds = [
  ...new Set([...problemSet.matchAll(/`#([a-z0-9-]+)`/g)].map((match) => match[1])),
];
const problemSetAudit = {
  ok: true,
  checkedSections: problemSetSectionIds.length,
  problemCount: (problemSet.match(/^\d+\.\s/gm) ?? []).length,
  missingSections: problemSetSectionIds.filter((id) => !html.includes(`id="${id}"`)),
  minimumProblemCount: 18,
};
problemSetAudit.ok =
  problemSetAudit.missingSections.length === 0 && problemSetAudit.problemCount >= problemSetAudit.minimumProblemCount;

let server = null;
try {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  const body = await response.text();
  server = {
    ok: response.ok,
    status: response.status,
    title: body.match(/<title>([^<]+)<\/title>/)?.[1] ?? null,
    hasHeroHeading: body.includes("Quantum physics starts when probability gets a phase."),
  };
} catch (error) {
  server = { ok: false, error: error instanceof Error ? error.message : String(error) };
}

let ffprobe = null;
try {
  const durations = mp4Refs.map((relativePath) => {
    const stdout = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(root, relativePath)],
      { encoding: "utf8" },
    );
    return Number(stdout.trim());
  });
  ffprobe = {
    ok: durations.every((duration) => Number.isFinite(duration) && duration > 0),
    count: durations.length,
    minSeconds: Math.min(...durations),
    maxSeconds: Math.max(...durations),
    totalSeconds: durations.reduce((sum, duration) => sum + duration, 0),
  };
} catch (error) {
  ffprobe = { ok: false, error: error instanceof Error ? error.message : String(error) };
}

const codexBrowserCard = readCodexBrowserCard({ url });
const codexBrowserProof = readCodexBrowserProof({ root, url });
const codexBrowserVerified = isCodexBrowserVerified(codexBrowserCard, codexBrowserProof);

const goalGate = {
  requiresCodexBrowser: requireCodexBrowser,
  ok:
    server.ok &&
    missingMedia.length === 0 &&
    canvasesMissingJs.length === 0 &&
    math.ok &&
    ffprobe.ok &&
    documentIntegrity.ok &&
    syllabusAudit.ok &&
    studyPathAudit.ok &&
    problemSetAudit.ok &&
    (!requireCodexBrowser || codexBrowserVerified),
  blockers: [
    ...(!server.ok ? ["Local server did not return a successful response."] : []),
    ...(missingMedia.length > 0 ? ["Some referenced Manim media files are missing."] : []),
    ...(canvasesMissingJs.length > 0 ? ["Some HTML canvases are not covered by src/main.js."] : []),
    ...(!math.ok ? ["MathJax configuration or formula-count requirement is not satisfied."] : []),
    ...(!ffprobe.ok ? ["One or more rendered Manim MP4s failed ffprobe validation."] : []),
    ...(!documentIntegrity.ok ? ["Document integrity checks failed for IDs, hash links, canvas labels, or video cards."] : []),
    ...(!syllabusAudit.ok ? ["Syllabus map references missing article sections or Manim scene classes."] : []),
    ...(!studyPathAudit.ok ? ["Study path references missing article sections."] : []),
    ...(!problemSetAudit.ok ? ["Problem set references missing article sections or has too few problems."] : []),
    ...(requireCodexBrowser && !codexBrowserVerified
      ? ["Codex Browser verification is missing: open the local-server card or create a fresh valid Codex Browser proof file."]
      : []),
  ],
};

const result = {
  server,
  counts: {
    interactivePanels: (html.match(/class="interactive-panel/g) ?? []).length,
    canvases: htmlCanvasIds.length,
    videos: (html.match(/<video/g) ?? []).length,
    mediaRefs: mediaRefs.length,
    mp4Refs: mp4Refs.length,
    jpgRefs: jpgRefs.length,
    manimSceneClasses: sceneClasses.length,
  },
  missingMedia,
  canvasesMissingJs,
  math,
  documentIntegrity,
  syllabus: syllabusAudit,
  studyPath: studyPathAudit,
  problemSet: problemSetAudit,
  ffprobe,
  codexBrowserCard,
  codexBrowserProof,
  codexBrowserVerified,
  goalGate,
};

await mkdir(outDir, { recursive: true });
writeFileSync(path.join(outDir, "audit-static.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));

if (!goalGate.ok) {
  process.exitCode = 1;
}
