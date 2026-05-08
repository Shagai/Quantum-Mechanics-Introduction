import { existsSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outDir = path.join(root, "output", "playwright");
const url = process.env.AUDIT_URL || "http://localhost:5173";
const normalizedUrl = url.endsWith("/") ? url.slice(0, -1) : url;

await mkdir(outDir, { recursive: true });

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const npxRoot = path.join(root, "output", "npm-cache", "_npx");
    const entries = await readdir(npxRoot, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const candidate = path.join(npxRoot, entry.name, "node_modules", "playwright", "index.mjs");
      if (existsSync(candidate)) return import(pathToFileURL(candidate));
    }
    throw new Error("Cannot find Playwright. Run the Playwright wrapper once or install the playwright package.");
  }
}

const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const consoleEntries = [];
page.on("console", (message) => {
  consoleEntries.push({
    type: message.type(),
    text: message.text(),
    location: message.location(),
  });
});
page.on("pageerror", (error) => {
  consoleEntries.push({
    type: "pageerror",
    text: error.message,
  });
});

async function pageState(label) {
  return page.evaluate((stateLabel) => {
    const overflowing = document.documentElement.scrollWidth > window.innerWidth + 1;
    return {
      label: stateLabel,
      url: location.href,
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
      interactivePanels: document.querySelectorAll(".interactive-panel").length,
      canvases: document.querySelectorAll("canvas").length,
      videos: document.querySelectorAll("video").length,
      innerWidth: window.innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      overflowing,
    };
  }, label);
}

async function heroMetrics(label) {
  return page.evaluate((stateLabel) => {
    const canvas = document.querySelector("#hero-wave");
    const figure = document.querySelector(".hero-figure");
    const canvasRect = canvas?.getBoundingClientRect();
    const figureRect = figure?.getBoundingClientRect();
    return {
      label: stateLabel,
      canvasCssHeight: canvasRect?.height ?? null,
      canvasCssWidth: canvasRect?.width ?? null,
      figureCssHeight: figureRect?.height ?? null,
      backingHeight: canvas?.height ?? null,
      backingWidth: canvas?.width ?? null,
    };
  }, label);
}

function metricsAreStable(before, after, tolerance = 1) {
  return (
    Math.abs(after.canvasCssHeight - before.canvasCssHeight) <= tolerance &&
    Math.abs(after.figureCssHeight - before.figureCssHeight) <= tolerance &&
    after.backingHeight === before.backingHeight &&
    after.backingWidth === before.backingWidth
  );
}

try {
  await page.goto(normalizedUrl, { waitUntil: "networkidle", timeout: 20000 });
  const desktop = await pageState("desktop");
  const heroBefore = await heroMetrics("hero-before");
  await page.waitForTimeout(1800);
  const heroAfter = await heroMetrics("hero-after");
  const heroStable = metricsAreStable(heroBefore, heroAfter);
  await page.screenshot({ path: path.join(outDir, "fallback-desktop.png"), fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(normalizedUrl, { waitUntil: "networkidle", timeout: 20000 });
  const mobile = await pageState("mobile");
  await page.screenshot({ path: path.join(outDir, "fallback-mobile.png"), fullPage: false });

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${normalizedUrl}/foundations.html#uncertainty`, { waitUntil: "networkidle", timeout: 20000 });
  await page.locator("#uncertainty").evaluate((element) => element.scrollIntoView({ block: "start" }));
  const foundations = {
    ...(await pageState("foundations")),
    hasUncertaintyHeading: await page.locator("#uncertainty").getByText("Uncertainty is a limit on jointly sharp descriptions.").count(),
    interactivePanels: await page.locator(".interactive-panel").count(),
  };
  await page.screenshot({ path: path.join(outDir, "fallback-foundations.png"), fullPage: false });

  await page.goto(`${normalizedUrl}/study.html#study-path`, { waitUntil: "networkidle", timeout: 20000 });
  await page.locator("#study-path").evaluate((element) => element.scrollIntoView({ block: "start" }));
  const studyPath = await pageState("study-path");
  await page.screenshot({ path: path.join(outDir, "fallback-study-path.png"), fullPage: false });

  await page.goto(`${normalizedUrl}/study.html#problems`, { waitUntil: "networkidle", timeout: 20000 });
  await page.locator("#problems").evaluate((element) => element.scrollIntoView({ block: "start" }));
  const problems = {
    ...(await pageState("problems")),
    hasProblemHeading: await page.locator("#problems").getByText("The fastest check is whether you can derive the next line.").count(),
    derivationCards: await page.locator("#problems .derivation-card").count(),
  };
  await page.screenshot({ path: path.join(outDir, "fallback-problems.png"), fullPage: false });

  await page.goto(`${normalizedUrl}/study.html#manim`, { waitUntil: "networkidle", timeout: 20000 });
  await page.locator("#manim").evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page
    .waitForFunction(() => [...document.querySelectorAll("video")].some((video) => video.getAttribute("src")), null, {
      timeout: 5000,
    })
    .catch(() => {});
  const manim = await page.evaluate(() => {
    const videos = [...document.querySelectorAll("video")];
    return {
      videoCount: videos.length,
      loadedNearbyVideos: videos.filter((video) => video.dataset.loaded === "true").length,
      videosWithSrc: videos.filter((video) => video.currentSrc || video.getAttribute("src")).length,
      metadataReadyVideos: videos.filter((video) => video.readyState >= 1).length,
    };
  });
  await page.screenshot({ path: path.join(outDir, "fallback-manim.png"), fullPage: false });

  const errors = consoleEntries.filter((entry) => entry.type === "error" || entry.type === "pageerror");
  const result = {
    ok:
      errors.length === 0 &&
      desktop.title === "Quantum Physics Course Map" &&
      desktop.canvases === 1 &&
      desktop.videos === 0 &&
      desktop.interactivePanels === 0 &&
      heroStable &&
      !desktop.overflowing &&
      !mobile.overflowing &&
      foundations.url.includes("foundations.html#uncertainty") &&
      foundations.hasUncertaintyHeading === 1 &&
      foundations.interactivePanels >= 10 &&
      studyPath.url.includes("study.html#study-path") &&
      problems.url.includes("study.html#problems") &&
      problems.hasProblemHeading === 1 &&
      problems.derivationCards === 6 &&
      manim.videoCount === 41 &&
      manim.loadedNearbyVideos > 0 &&
      manim.videosWithSrc > 0,
    url: normalizedUrl,
    desktop,
    hero: {
      before: heroBefore,
      after: heroAfter,
      stable: heroStable,
    },
    mobile,
    foundations,
    studyPath,
    problems,
    manim,
    console: {
      total: consoleEntries.length,
      errors: errors.length,
      entries: consoleEntries,
    },
    screenshots: [
      "output/playwright/fallback-desktop.png",
      "output/playwright/fallback-mobile.png",
      "output/playwright/fallback-foundations.png",
      "output/playwright/fallback-study-path.png",
      "output/playwright/fallback-problems.png",
      "output/playwright/fallback-manim.png",
    ],
  };

  await writeFile(path.join(outDir, "fallback-visual-smoke.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} finally {
  await browser.close();
}
