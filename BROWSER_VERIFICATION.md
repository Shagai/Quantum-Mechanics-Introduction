# Codex Browser Verification Checklist

Use this after the Codex in-app Browser panel is open and a Browser tab is available for `http://localhost:5173`.

## Page identity

- The URL is `http://localhost:5173`.
- The document title is `Quantum Physics Course Map`.
- The hero heading reads `Quantum physics starts when probability gets a phase.`

## Visual layout

- Desktop viewport: hero canvas is visible, the overview uses a wide Distill-like reading column, and the course-page cards are visible.
- Mobile viewport: the hero and controls fit without text overlap or horizontal scrolling.
- `foundations.html#uncertainty` is reachable and the interactive panels are not blank.
- `study.html#study-path` shows the six-pass learning sequence.
- `study.html#problems` shows representative derivation prompts.
- `study.html#manim` shows poster thumbnails before videos are loaded.

## Runtime checks

- Browser console has no errors from local scripts.
- The page does not report missing local media.
- At least one interactive control changes its canvas output.
- A Manim video card loads a valid MP4 when focused, hovered, or scrolled into view.

## Automation checks to run after the pane is available

Once the Browser tab exists, the automated pass should verify:

- `tab.title()` equals `Quantum Physics Course Map`.
- `tab.url()` starts with `http://localhost:5173`.
- The hero heading is visible.
- The DOM snapshot includes `Start with the mathematical spine.`
- The DOM snapshot includes `Follow the course in focused chapters.`
- The DOM snapshot includes `Perturbation theory, variational estimates, WKB, scattering, and transitions.`
- Browser console errors are empty or unrelated to local project files.
- `npm run audit:goal` exits successfully.
- If the local-server card did not update because the page was opened by direct navigation, the Browser automation
  should write `output/playwright/codex-browser-verification.json` with:
  - `source: "codex-in-app-browser"`
  - the current `url`, `title`, and `h1`
  - counts for `interactivePanels`, `canvases`, and `videos`
  - the three required page phrases listed above
  - `consoleErrorCount: 0`
  - `generatedAt` later than the current article/runtime files

The proof writer for that path is `scripts/codex_browser_proof_runtime.mjs`. Once a real Codex Browser `tab` handle is
available, the Browser automation pass can call:

```js
const { writeCodexBrowserProofFromTab } = await import("/Users/jorge/Projects/quantum_physics_introduction/scripts/codex_browser_proof_runtime.mjs");
await writeCodexBrowserProofFromTab({
  tab,
  root: "/Users/jorge/Projects/quantum_physics_introduction",
  url: "http://localhost:5173",
});
```

## Expected supporting audit

Run this separately from the terminal while the server is active:

```bash
npm run audit
npm run audit:visual
```

The site/media portion should pass, and either `codexBrowserCard.openedInCodexBrowser` should become `true` after the
local-server card has been opened from the Codex Browser panel, or `codexBrowserProof.ok` should become `true` after a
fresh proof is written from a live Codex Browser tab.
