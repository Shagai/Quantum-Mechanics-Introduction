import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const syllabusPath = path.join(root, "SYLLABUS_MAP.md");
const htmlPath = path.join(root, "index.html");
const manimPath = path.join(root, "manim", "quantum_scenes.py");

const syllabus = readFileSync(syllabusPath, "utf8");
const html = readFileSync(htmlPath, "utf8");
const manim = readFileSync(manimPath, "utf8");

const sectionIds = [...new Set([...syllabus.matchAll(/`#([a-z0-9-]+)`/g)].map((match) => match[1]))];
const sceneRefs = [...new Set([...syllabus.matchAll(/`([A-Za-z][A-Za-z0-9]*Scene)`/g)].map((match) => match[1]))];
const sceneClasses = new Set([...manim.matchAll(/^class\s+([A-Za-z][A-Za-z0-9]*Scene)\(/gm)].map((match) => match[1]));

const missingSections = sectionIds.filter((id) => !html.includes(`id="${id}"`));
const missingScenes = sceneRefs.filter((scene) => !sceneClasses.has(scene));

const result = {
  syllabus: "SYLLABUS_MAP.md",
  checkedSections: sectionIds.length,
  checkedScenes: sceneRefs.length,
  missingSections,
  missingScenes,
  ok: missingSections.length === 0 && missingScenes.length === 0,
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
