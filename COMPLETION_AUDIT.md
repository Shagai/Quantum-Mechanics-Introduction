# Completion Audit

Objective: create an interactive Distill-style introduction to quantum physics webpage with visual explanations,
Manim-based animations, Griffiths-like undergraduate scope, mathematical formulas, and verification/debugging in the
Codex in-app Browser.

## Prompt-to-artifact checklist

| Requirement | Concrete artifact or command | Current evidence |
| --- | --- | --- |
| Webpage format | `index.html`, `styles.css`, `src/main.js` | Static site serves at `http://localhost:5173` with title `Quantum Physics, From Amplitudes to Measurement`. |
| Distill-style visual article | `styles.css`, `index.html` | Article layout uses a wide scholarly page, margin notes, figures, equations, and interactive panels. |
| Deep quantum mechanics scope | `index.html`, `README.md`, `SYLLABUS_MAP.md` | Covers amplitudes, measurement, postulates, Schrodinger dynamics, exact systems, formalism, angular momentum, spin, identical particles, approximation methods, scattering, transitions, and advanced structure. `SYLLABUS_MAP.md` maps the Griffiths-style course topics to concrete web sections, figures, and Manim scenes. |
| Deep learning path | `STUDY_PATH.md`, `index.html#study-path` | Provides a six-pass self-study sequence with section targets, interactive figure targets, derivation checkpoints, and a final audit/Browser check. The webpage now includes a compact Study path section linked from the top nav and article outline. |
| Practice problems | `PROBLEM_SET.md`, `index.html#problems`, `npm run audit` | Provides 22 derivation-heavy exercises keyed to the study path and article sections; the webpage includes a representative problem section, and the main audit checks section anchors and minimum problem count. |
| Syllabus consistency gate | `npm run audit:syllabus` | Checks that every `SYLLABUS_MAP.md` section link resolves to `index.html` and every listed Manim scene class exists in `manim/quantum_scenes.py`. |
| Math formulas | `index.html`, `npm run audit` | MathJax is configured in the document head and the main audit checks direct formula coverage. Current audit reports 192 inline formulas and 125 display formulas. |
| Interactive explanations | `src/main.js`, `index.html` | `npm run audit` reports 45 interactive panels and 46 canvases, with no canvas missing JavaScript coverage. |
| Manim-based animations | `manim/quantum_scenes.py`, `public/media/manim/` | `npm run audit` reports 41 Manim scene classes, 41 MP4 references, 41 JPG poster references, no missing media, and valid MP4 durations. |
| Run command | `npm run dev` | Runs `python3 -m http.server 5173`; current local server responds HTTP 200. |
| Project audit | `npm run audit` | Checks HTTP response, title, hero heading, article/media counts, missing media, canvas-to-JavaScript coverage, MathJax/formula coverage, document integrity, syllabus-map consistency, study-path and problem-set section links, MP4 durations via `ffprobe`, and optional Codex Browser-card state. |
| Document integrity gate | `npm run audit:document` | Checks duplicate IDs, broken internal hash links, canvas accessible labels/dimensions, and Manim video-card structure. |
| Full goal audit | `npm run audit:goal` | Same checks as `npm run audit`, but fails until the Codex Browser local-server card has been opened or a fresh valid Codex Browser proof file exists. |
| Browser-card/proof wait helper | `npm run wait:browser-card` | Polls Codex's local-server registry and the proof path, exiting successfully once the `localhost:5173` card has `lastOpenedAt` or `output/playwright/codex-browser-verification.json` validates. |
| Browser gate status helper | `npm run status:browser` | Prints server health, Codex Browser-card state, Codex Browser proof state, readiness for the final audit, and the exact next command/manual steps. Current output has `server.ok: true` and `readyForFinalAudit: false`. |
| Shared Browser gate logic | `scripts/browser_gate_helpers.mjs` | Centralizes Browser card/proof validation so `audit:goal`, `status:browser`, and `wait:browser-card` use the same criteria. |
| Codex Browser proof writer | `scripts/codex_browser_proof_runtime.mjs` | Collects URL, title, hero heading, required phrases, interactive/canvas/video counts, and console errors from a real Codex Browser tab, then writes `output/playwright/codex-browser-verification.json` for the shared gate validator. |
| Final Browser verification command | `npm run verify:browser` | Chains `npm run wait:browser-card` and `npm run audit:goal`; currently stops at the Browser-card/proof wait because neither Browser signal is available. |
| Syntax gates | `node --check src/main.js`, `python3 -m py_compile manim/quantum_scenes.py` | Both pass. |
| Codex in-app Browser verification | Browser plugin against `http://localhost:5173` | Blocked: Codex Browser backend is visible, but it reports no user tabs and tab listing/selection/creation currently time out. |
| Final Browser checklist | `BROWSER_VERIFICATION.md` | Defines the concrete page identity, layout, runtime, and Manim-video checks to perform once the Browser pane is open. |
| Final verification note | `FINAL_VERIFICATION.md` | Summarizes completed evidence, current Browser blocker, and the exact finish procedure. |
| Fallback visual/runtime pass | `output/playwright/*.png`, Playwright console/eval output | External Playwright pass opened `http://localhost:5173`, captured desktop/mobile/Manim screenshots, verified 0 console errors after favicon fix, confirmed 46 nonblank canvases, first slider updates, no page-level mobile horizontal scrolling, 41 Manim video cards, and 9 nearby lazy Manim videos in the Manim section with 6 assigned sources during the smoke pass. |
| Fallback visual smoke command | `npm run audit:visual` | Re-runs a headless Playwright smoke check for desktop, mobile, study-path, problems, and Manim views, writing `output/playwright/fallback-visual-smoke.json` and screenshots. This does not replace the Codex in-app Browser gate. |
| Local QA bundle | `npm run audit:local` | Chains `npm run audit` and `npm run audit:visual` so all non-Codex-Browser checks can be repeated with one command. This still does not replace `npm run verify:browser`. |

## Latest verified commands

```bash
curl -I http://localhost:5173
npm run audit
npm run audit:document
npm run audit:goal
npm run audit:local
npm run audit:syllabus
npm run audit:visual
npm run status:browser
npm run wait:browser-card
npm run verify:browser
node --check src/main.js
python3 -m py_compile manim/quantum_scenes.py
```

Latest fallback Playwright artifacts:

```text
output/playwright/fallback-desktop.png
output/playwright/fallback-mobile.png
output/playwright/fallback-study-path.png
output/playwright/fallback-problems.png
output/playwright/fallback-manim.png
```

The first fallback browser load reported a missing `/favicon.ico`; this was fixed with an inline SVG favicon in
`index.html`, and a reload then reported `Total messages: 0 (Errors: 0, Warnings: 0)`. Later Canvas2D warnings were
caused by the verification script reading canvas pixels with `getImageData`, not by normal page runtime.

Latest `npm run audit` summary:

```json
{
  "server": {
    "ok": true,
    "status": 200,
    "title": "Quantum Physics, From Amplitudes to Measurement",
    "hasHeroHeading": true
  },
  "counts": {
    "interactivePanels": 45,
    "canvases": 46,
    "videos": 41,
    "mediaRefs": 82,
    "mp4Refs": 41,
    "jpgRefs": 41,
    "manimSceneClasses": 41
  },
  "missingMedia": [],
  "canvasesMissingJs": [],
  "math": {
    "ok": true,
    "hasMathJaxConfig": true,
    "inlineFormulaCount": 192,
    "displayFormulaCount": 125,
    "totalFormulaCount": 317,
    "minimumFormulaCount": 50
  },
  "documentIntegrity": {
    "ok": true,
    "checkedIds": 222,
    "checkedHashLinks": 20,
    "checkedCanvases": 46,
    "checkedVideoCards": 41,
    "duplicateIds": [],
    "brokenHashLinks": [],
    "canvasA11yIssues": 0,
    "videoCardIssues": 0
  },
  "syllabus": {
    "ok": true,
    "checkedSections": 16,
    "checkedScenes": 41,
    "missingSections": [],
    "missingScenes": []
  },
  "studyPath": {
    "ok": true,
    "checkedSections": 15,
    "missingSections": []
  },
  "problemSet": {
    "ok": true,
    "checkedSections": 13,
    "problemCount": 22,
    "missingSections": [],
    "minimumProblemCount": 18
  },
  "ffprobe": {
    "ok": true,
    "count": 41,
    "minSeconds": 4.266667,
    "maxSeconds": 8.8,
    "totalSeconds": 281.265041
  },
  "codexBrowserCard": {
    "checked": true,
    "found": true,
    "lastOpenedAt": null,
    "openedInCodexBrowser": false
  },
  "goalGate": {
    "requiresCodexBrowser": true,
    "ok": false,
    "blockers": [
      "Codex Browser local-server card has not been opened yet."
    ]
  }
}
```

Latest `npm run audit:goal` result: all content/server/media/math/document/syllabus/study/problem checks pass, but the
stricter goal gate fails because Codex Browser verification is missing. `npm run verify:browser` currently stops at the
Browser-card/proof wait with `opened: false`.

## Remaining gate

The only uncovered requirement is live verification in the Codex in-app Browser. The app currently registers the local
server card for `http://localhost:5173/`, but Browser automation cannot attach because there is no active Browser pane.
The local-server registry currently still reports `lastOpenedAt: null` for that card, which indicates it has not been
opened from the Codex Browser surface in this app session.
The final audit now accepts either that local-server card signal or a fresh `output/playwright/codex-browser-verification.json`
written from a live Codex Browser tab. No valid Browser proof file exists yet.
The Codex app-server protocol schema was checked as well; it does not expose an RPC for opening the Browser panel or
creating a Browser tab externally.
The app bundle was also scanned for `codex://` deeplink routes; no Browser-opening deeplink was found.
`/Applications/Codex.app/Contents/Info.plist` declares only the generic `codex` URL scheme plus folder/CSV document
types, and `codex app --help` only supports opening a workspace path.
Running Codex process arguments were inspected; the desktop app is using `codex app-server`/stdio plumbing and the
Electron renderer processes do not expose a remote debugging port or browser-control listener.
Sending `http://localhost:5173` to Codex with `open -a Codex` completed without a shell error, but it did not update
the local-server card. Showing the Browser panel through the Browser visibility capability succeeds, but the Browser API
still has no open tabs and cannot create/select a tab until a Browser pane/tab is opened inside Codex.
A bounded AppleScript retry using the app's native Browser shortcuts (`Cmd+Shift+B`, `Cmd+T`, `Cmd+L`, URL, Return)
timed out with `System Events got an error: AppleEvent timed out. (-1712)`, so the macOS UI automation route is blocked
unless Accessibility permission is granted.

Manual action needed in Codex before the final Browser pass:

1. Open the Browser panel with `Cmd+Shift+B` or `View > Toggle Browser Panel`.
2. Create or focus a Browser tab with `Cmd+T` or `View > Open Browser Tab`.
3. Open the `localhost:5173` local-server card, or navigate to `http://localhost:5173`.
4. Retry the Browser verification against the active tab.
