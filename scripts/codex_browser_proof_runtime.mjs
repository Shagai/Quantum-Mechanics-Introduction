import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  browserProofPathForRoot,
  expectedHeroHeading,
  expectedTitle,
  readCodexBrowserProof,
  requiredBrowserPhrases,
} from "./browser_gate_helpers.mjs";

export async function writeCodexBrowserProofFromTab({ tab, root, url = "http://localhost:5173" }) {
  if (tab == null) {
    throw new Error("A Codex Browser tab handle is required.");
  }
  if (typeof root !== "string" || root.length === 0) {
    throw new Error("A project root path is required.");
  }

  const currentUrl = (await tab.url()) ?? "";
  if (!isExpectedUrl(currentUrl, url)) {
    await tab.goto(url);
    await tab.playwright.waitForLoadState({ state: "domcontentloaded", timeoutMs: 10000 });
  }

  const title = (await tab.title()) ?? null;
  const finalUrl = (await tab.url()) ?? null;
  const heroLocator = tab.playwright.getByRole("heading", { name: expectedHeroHeading, exact: true });
  const heroCount = await heroLocator.count();
  const h1 = heroCount === 1 ? await heroLocator.innerText({ timeoutMs: 5000 }) : null;
  const checkedPhrases = [];

  for (const phrase of requiredBrowserPhrases) {
    const phraseCount = await tab.playwright.getByText(phrase, { exact: false }).count();
    if (phraseCount > 0) {
      checkedPhrases.push(phrase);
    }
  }

  const consoleErrors = await readConsoleErrors(tab);
  const proof = {
    source: "codex-in-app-browser",
    generatedAt: new Date().toISOString(),
    url: finalUrl,
    title,
    h1,
    expectedTitle,
    expectedHeroHeading,
    checkedPhrases,
    counts: {
      interactivePanels: await tab.playwright.locator(".interactive-panel").count(),
      canvases: await tab.playwright.locator("canvas").count(),
      videos: await tab.playwright.locator("video").count(),
    },
    consoleErrorCount: consoleErrors.length,
    consoleErrors,
  };

  const proofPath = browserProofPathForRoot(root);
  await mkdir(path.dirname(proofPath), { recursive: true });
  await writeFile(proofPath, `${JSON.stringify(proof, null, 2)}\n`, "utf8");

  return {
    proofPath,
    proof,
    validation: readCodexBrowserProof({ root, url }),
  };
}

function isExpectedUrl(candidate, url) {
  const normalizedUrl = url.endsWith("/") ? url : `${url}/`;
  return candidate === url || candidate === normalizedUrl || candidate.startsWith(`${normalizedUrl}#`) || candidate.startsWith(`${normalizedUrl}?`);
}

async function readConsoleErrors(tab) {
  try {
    const entries = await tab.dev.logs({ levels: ["error"], limit: 100 });
    return entries.map((entry) => ({
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp,
      url: entry.url,
    }));
  } catch (error) {
    return [
      {
        level: "error",
        message: `Could not read Browser console logs: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}
