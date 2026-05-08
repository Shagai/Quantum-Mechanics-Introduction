import { existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { getHtmlPageNames } from "./html_pages.mjs";

export const expectedTitle = "Quantum Physics Course Map";
export const expectedHeroHeading = "Quantum physics starts when probability gets a phase.";
export const requiredBrowserPhrases = [
  "Start with the mathematical spine.",
  "Follow the course in focused chapters.",
  "Perturbation theory, variational estimates, WKB, scattering, and transitions.",
];

export function normalizeUrl(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

export function browserProofPathForRoot(root) {
  return path.join(root, "output", "playwright", "codex-browser-verification.json");
}

export function browserRegistryPath() {
  return path.join(homedir(), "Library", "Application Support", "Codex", "browser-sidebar-local-servers.json");
}

export function readCodexBrowserCard({ url }) {
  const normalizedUrl = normalizeUrl(url);
  const registryPath = browserRegistryPath();

  if (!existsSync(registryPath)) {
    return {
      checked: false,
      registryPath,
      reason: "Codex local-server registry not found.",
    };
  }

  try {
    const registry = JSON.parse(readFileSync(registryPath, "utf8"));
    const card = Array.isArray(registry.servers)
      ? registry.servers.find((entry) => entry?.url === normalizedUrl || entry?.url === url) ?? null
      : null;

    return {
      checked: true,
      registryPath,
      url: normalizedUrl,
      found: card != null,
      title: card?.title ?? null,
      lastOpenedAt: card?.lastOpenedAt ?? null,
      lastSeenAt: card?.lastSeenAt ?? null,
      lastRunningAt: card?.lastRunningAt ?? null,
      openedInCodexBrowser: card?.lastOpenedAt != null,
    };
  } catch (error) {
    return {
      checked: false,
      registryPath,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function readCodexBrowserProof({ root, url }) {
  const proofPath = browserProofPathForRoot(root);
  if (!existsSync(proofPath)) {
    return {
      checked: true,
      proofPath,
      found: false,
      ok: false,
      blockers: ["Codex Browser proof file was not found."],
    };
  }

  try {
    const proof = JSON.parse(readFileSync(proofPath, "utf8"));
    return validateCodexBrowserProof({ proof, proofPath, root, url });
  } catch (error) {
    return {
      checked: true,
      proofPath,
      found: true,
      ok: false,
      blockers: [error instanceof Error ? error.message : String(error)],
    };
  }
}

export function validateCodexBrowserProof({ proof, proofPath, root, url }) {
  const normalizedUrl = normalizeUrl(url);
  const proofUrl = typeof proof.url === "string" ? proof.url : "";
  const sourceOk = proof.source === "codex-in-app-browser";
  const urlOk =
    proofUrl === url ||
    proofUrl === normalizedUrl ||
    proofUrl.startsWith(`${normalizedUrl}#`) ||
    proofUrl.startsWith(`${normalizedUrl}?`);
  const titleOk = proof.title === expectedTitle;
  const h1Ok = proof.h1 === expectedHeroHeading;
  const counts = proof.counts ?? {};
  const countsOk =
    Number(counts.interactivePanels) === 0 &&
    Number(counts.canvases) >= 1 &&
    Number(counts.videos) === 0;
  const checkedPhrases = Array.isArray(proof.checkedPhrases) ? proof.checkedPhrases : [];
  const missingPhrases = requiredBrowserPhrases.filter((phrase) => !checkedPhrases.includes(phrase));
  const consoleErrorCount = Number(proof.consoleErrorCount ?? proof.consoleErrors?.length ?? NaN);
  const consoleOk = Number.isFinite(consoleErrorCount) && consoleErrorCount === 0;
  const generatedAtMs = Date.parse(proof.generatedAt ?? "");
  const latestRuntimeArtifactMtimeMs = Math.max(
    ...getHtmlPageNames(root).map((file) => statSync(path.join(root, file)).mtimeMs),
    statSync(path.join(root, "src", "main.js")).mtimeMs,
    statSync(path.join(root, "manim", "quantum_scenes.py")).mtimeMs,
  );
  const proofFresh = Number.isFinite(generatedAtMs) && generatedAtMs >= latestRuntimeArtifactMtimeMs;
  const blockers = [
    ...(!sourceOk ? ["Browser proof did not identify the Codex in-app Browser source."] : []),
    ...(!urlOk ? ["Browser proof URL does not match the local target."] : []),
    ...(!titleOk ? ["Browser proof title does not match the article title."] : []),
    ...(!h1Ok ? ["Browser proof hero heading does not match the article hero."] : []),
    ...(!countsOk ? ["Browser proof does not report the expected interactive, canvas, and video counts."] : []),
    ...(missingPhrases.length > 0 ? [`Browser proof is missing required page phrases: ${missingPhrases.join("; ")}`] : []),
    ...(!consoleOk ? ["Browser proof reports console errors or lacks a zero-error check."] : []),
    ...(!proofFresh ? ["Browser proof is older than the current article/runtime artifacts."] : []),
  ];

  return {
    checked: true,
    proofPath,
    found: true,
    ok: blockers.length === 0,
    source: proof.source ?? null,
    url: proofUrl || null,
    title: proof.title ?? null,
    h1: proof.h1 ?? null,
    generatedAt: proof.generatedAt ?? null,
    counts,
    consoleErrorCount: Number.isFinite(consoleErrorCount) ? consoleErrorCount : null,
    missingPhrases,
    blockers,
  };
}

export function isCodexBrowserVerified(codexBrowserCard, codexBrowserProof) {
  return codexBrowserCard?.openedInCodexBrowser === true || codexBrowserProof?.ok === true;
}
