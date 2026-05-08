import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const html = readFileSync(path.join(root, "index.html"), "utf8");

const mediaRefs = [...html.matchAll(/(?:data-src|poster)="\.\/([^"]+)"/g)].map((match) => match[1]);
const missingMedia = mediaRefs.filter((relativePath) => !existsSync(path.join(root, relativePath)));
const mp4Refs = mediaRefs.filter((relativePath) => relativePath.endsWith(".mp4"));
const jpgRefs = mediaRefs.filter((relativePath) => relativePath.endsWith(".jpg"));

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
  };
} catch (error) {
  ffprobe = { ok: false, error: error instanceof Error ? error.message : String(error) };
}

const result = {
  checkedRefs: mediaRefs.length,
  mp4Refs: mp4Refs.length,
  jpgRefs: jpgRefs.length,
  missingMedia,
  ffprobe,
  ok: missingMedia.length === 0 && ffprobe.ok,
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
