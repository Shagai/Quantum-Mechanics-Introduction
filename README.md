# Introduction to Quantum Physics

A self-contained, Distill-inspired interactive article for learning quantum physics from first principles toward a
book-length undergraduate scope. It starts with amplitudes and measurement, then adds a mathematical course spine:
postulates, Schrodinger dynamics, solvable systems, angular momentum and spin, identical particles, approximation
methods, and scattering.

Current interactive figures include wave packets, momentum-space Fourier transforms, the momentum operator as translation generator, double-slit interference, Bloch-sphere measurement, repeated
measurements, projection measurement, Fourier and Robertson uncertainty, probability current and continuity, the spectral theorem for observables, basis changes and matrix representations, the completeness relation, commutators and compatible observables, unitary time evolution, Schrodinger and Heisenberg pictures, Ehrenfest conservation laws, free-particle wave-packet dispersion, orthogonality of stationary states, infinite-square-well eigenstates, finite-square-well bound states, parity symmetry, delta-potential bound states and scattering, spectral expansion and quantum beats, rectangular-barrier
tunneling, harmonic-oscillator eigenstates, hydrogen radial probability, spherical harmonics, spin angular momentum, a
Clebsch-Gordan spin-coupling model, identical-particle exchange symmetry, a time-independent perturbation
energy-shift model, degenerate perturbation avoided crossings, the Stark effect, a variational-method energy bound, WKB action
quantization, Born, Rutherford, and partial-wave scattering cross sections, driven time-dependent transitions,
electric-dipole selection rules, the optical theorem, fine-structure and Zeeman splitting, hyperfine coupling, and
adiabatic Berry phase.

## Run the webpage

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

The page uses only static HTML, CSS, and JavaScript, so it can also be served by any simple static server.
Mathematical notation is rendered with MathJax from a CDN.

## Build and publish

Generate the media and create the GitHub Pages artifact locally:

```bash
npm run render:manim
npm run build
```

The build writes the static site to `dist/`.

This project includes a GitHub Actions workflow at `.github/workflows/pages.yml`. After pushing to GitHub, enable
GitHub Pages in the repository settings with source set to **GitHub Actions**. Pushes to `main` will then install
ManimGL, render the media into the ignored `public/media/manim/` directory on the runner, verify the generated media,
build `dist/`, and deploy it to GitHub Pages.

## Verify the project

With the local server running, execute:

```bash
npm run audit
```

The audit checks the HTTP response, article/media counts, missing media references, canvas-to-JavaScript coverage,
MathJax/formula coverage, document integrity for IDs, hash links, canvas labels, and video cards, the syllabus map's
links to article sections and Manim scene classes, the study path and problem set section links, the rendered Manim MP4
durations through `ffprobe`, and, when running inside Codex on macOS, whether the local-server card has been opened in
the Codex Browser panel or a fresh Codex Browser proof file exists. It writes the latest static result to:

```text
output/playwright/audit-static.json
```

The book-scope coverage map is in `SYLLABUS_MAP.md`.
The recommended deep-study sequence is in `STUDY_PATH.md`.
The derivation-heavy practice set is in `PROBLEM_SET.md`.
The current completion evidence and final Browser gate are summarized in `FINAL_VERIFICATION.md`.

To verify that the syllabus map still points at real article sections and Manim scene classes:

```bash
npm run audit:syllabus
```

To run the document integrity subset directly:

```bash
npm run audit:document
```

To verify that generated media files and video durations are present:

```bash
npm run audit:media
```

To run the fallback Playwright visual smoke check outside the Codex in-app Browser gate:

```bash
npm run audit:visual
```

To run both local, non-Codex-Browser checks together:

```bash
npm run audit:local
```

For visual verification in Codex, open the in-app Browser panel with `Cmd+Shift+B`, create or focus a Browser tab with
`Cmd+T`, then open the `localhost:5173` local-server card or navigate to `http://localhost:5173`.

To print the current server and Codex Browser-card state without running the full media audit:

```bash
npm run status:browser
```

If Browser automation reports that no active Browser pane is available, the local site is still running but Codex has
not mounted a Browser tab for this thread yet. Open the Browser panel and tab manually first, then rerun the Browser
verification. The final visual/runtime checklist is in `BROWSER_VERIFICATION.md`.

To make the full goal gate executable, run:

```bash
npm run audit:goal
```

This stricter audit fails until the Codex Browser local-server card has been opened, or a fresh
`output/playwright/codex-browser-verification.json` proof has been written from an actual Codex Browser tab, and the
rest of the site/media checks pass.

To wait for that app-side state change while you open the card manually:

```bash
npm run wait:browser-card
```

After the Codex Browser tab is open, this command waits for the card/proof signal and then runs the strict final gate:

```bash
npm run verify:browser
```

## Manim animations

The linked 3Blue1Brown project installs as `manimgl`, not `manim`. It also expects FFmpeg and OpenGL locally.

On macOS, the upstream README recommends installing FFmpeg first. If `manimgl` is already on your PATH, no
extra setup is needed:

```bash
brew install ffmpeg
python3 -m pip install manimgl
```

If you prefer to keep ManimGL local to this project, use a virtual environment:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install manimgl "setuptools<81"
```

After that, render the included scenes:

```bash
npm run render:manim
```

Rendered clips are copied into:

```text
public/media/manim/
```

That directory is generated output and is ignored by Git. GitHub Actions regenerates it before deploying GitHub Pages.

The webpage detects those files automatically. Until they exist, it shows the live browser-native animation for each concept.

## Files

- `index.html`: article structure
- `styles.css`: Distill-inspired typography and layout
- `src/main.js`: interactive simulations and animation loops
- `scripts/build_site.mjs`: static GitHub Pages build helper
- `manim/quantum_scenes.py`: ManimGL scenes
- `scripts/render_manim.sh`: render helper for ManimGL
- `scripts/audit_project.mjs`: static/server/media audit helper
- `scripts/browser_gate_helpers.mjs`: shared Codex Browser card/proof validation helper
- `scripts/codex_browser_proof_runtime.mjs`: Codex Browser runtime proof writer for direct-navigation verification
- `scripts/fallback_visual_smoke.mjs`: fallback Playwright visual smoke helper
- `scripts/verify_media_refs.mjs`: generated media reference and duration helper
- `scripts/verify_document_integrity.mjs`: HTML ID/link/accessibility structure helper
- `scripts/verify_syllabus_map.mjs`: syllabus-to-artifact consistency helper
- `SYLLABUS_MAP.md`: Griffiths-style topic-to-artifact coverage map
- `STUDY_PATH.md`: six-pass study sequence with derivation checkpoints
- `PROBLEM_SET.md`: derivation-heavy exercise set keyed to the study path
- `FINAL_VERIFICATION.md`: current evidence and final in-app Browser procedure
- `custom_config.yml`: project-local ManimGL output/cache settings
