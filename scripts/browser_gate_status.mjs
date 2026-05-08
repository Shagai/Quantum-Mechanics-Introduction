import { isCodexBrowserVerified, normalizeUrl, readCodexBrowserCard, readCodexBrowserProof } from "./browser_gate_helpers.mjs";

const url = process.env.AUDIT_URL || "http://localhost:5173";
const normalizedUrl = normalizeUrl(url);
const root = process.cwd();

async function checkServer() {
  try {
    const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(3000) });
    return {
      ok: response.ok,
      status: response.status,
      url,
    };
  } catch (error) {
    return {
      ok: false,
      url,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const server = await checkServer();
const codexBrowserCard = readCodexBrowserCard({ url });
const codexBrowserProof = readCodexBrowserProof({ root, url });
const readyForFinalAudit = server.ok && isCodexBrowserVerified(codexBrowserCard, codexBrowserProof);

console.log(
  JSON.stringify(
    {
      server,
      codexBrowserCard,
      codexBrowserProof,
      readyForFinalAudit,
      nextCommand: readyForFinalAudit ? "npm run audit:goal" : "npm run verify:browser",
      manualSteps: readyForFinalAudit
        ? []
        : [
            "Open the Codex Browser panel with Cmd+Shift+B or View > Toggle Browser Panel.",
            "Create or focus a Browser tab with Cmd+T or View > Open Browser Tab.",
            `Open the local-server card for ${normalizedUrl} or navigate to ${url}.`,
          ],
    },
    null,
    2,
  ),
);
