# Final Verification

Current local target:

```text
http://localhost:5173
```

## Completed Evidence

- `npm run audit` passes.
- `npm run audit:document` passes.
- `npm run audit:syllabus` passes.
- The main audit validates:
  - HTTP `200` response and expected page title.
  - Distill-style article structure with 45 interactive panels and 46 canvases.
  - MathJax configuration and 317 TeX formulas.
  - No missing media references.
  - Canvas-to-JavaScript coverage for every canvas.
  - Document integrity for IDs, internal links, canvas labels, and Manim video cards.
  - Syllabus map links to 16 real article sections and 41 real Manim scene classes.
  - Study path links to 15 real article sections.
  - 41 rendered Manim MP4s validated with `ffprobe`.
- Fallback Playwright verification captured desktop, mobile, formula, Manim, and study-path screenshots in
  `output/playwright/`.
- `npm run audit:local` chains the static/content audit and fallback Playwright visual smoke test. It is useful for
  local QA, but it intentionally does not satisfy the required Codex in-app Browser gate.

## Remaining Required Gate

The user explicitly requested verification/debugging in the Codex in-app Browser. That gate is still incomplete until
Codex records the local-server card as opened, or a fresh `output/playwright/codex-browser-verification.json` proof is
written from an actual Codex Browser tab.

Check current state:

```bash
npm run status:browser
```

Expected blocker before the Browser tab is opened:

```json
{
  "openedInCodexBrowser": false,
  "codexBrowserProof": { "ok": false },
  "readyForFinalAudit": false
}
```

## Why This Is Still Manual

The Browser plugin can show the Codex Browser panel, but the current app session reports no open Browser tabs and tab
creation/selection times out. A bounded AppleScript attempt to focus Codex, toggle the Browser panel, create a tab, and
navigate to the local URL also timed out at the `System Events` step with AppleEvent error `-1712`, which is consistent
with macOS Accessibility blocking UI automation.

If you want Codex to try the macOS UI automation route again later, grant Accessibility permission to Codex and the
terminal host running this session in:

```text
System Settings > Privacy & Security > Accessibility
```

The manual Browser steps below do not require that permission.

## Finish Procedure

1. Open the Codex Browser panel with `Cmd+Shift+B` or `View > Toggle Browser Panel`.
2. Create or focus a Browser tab with `Cmd+T` or `View > Open Browser Tab`.
3. Open the local-server card for `http://localhost:5173/`, or navigate the Browser tab to `http://localhost:5173`.
   Direct navigation is acceptable once Codex can write the Browser proof file from that live tab.
4. Run:

```bash
npm run verify:browser
```

The goal can only be marked complete after that command passes.
