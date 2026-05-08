import { browserProofPathForRoot, normalizeUrl, readCodexBrowserCard, readCodexBrowserProof } from "./browser_gate_helpers.mjs";

const url = process.env.AUDIT_URL || "http://localhost:5173";
const normalizedUrl = normalizeUrl(url);
const timeoutMs = Number(process.env.WAIT_TIMEOUT_MS || 120000);
const intervalMs = Number(process.env.WAIT_INTERVAL_MS || 1000);
const root = process.cwd();
const browserProofPath = browserProofPathForRoot(root);
const start = Date.now();

while (Date.now() - start <= timeoutMs) {
  const card = readCodexBrowserCard({ url });
  if (card.openedInCodexBrowser === true) {
    console.log(
      JSON.stringify(
        {
          opened: true,
          url: normalizedUrl,
          title: card.title ?? null,
          lastOpenedAt: card.lastOpenedAt,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  const proof = readCodexBrowserProof({ root, url });
  if (proof.ok === true) {
    console.log(
      JSON.stringify(
        {
          opened: true,
          proof: true,
          url: proof.url,
          title: proof.title,
          generatedAt: proof.generatedAt,
          proofPath: browserProofPath,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  await new Promise((resolve) => setTimeout(resolve, intervalMs));
}

console.log(
  JSON.stringify(
    {
      opened: false,
      url: normalizedUrl,
      registryPath: readCodexBrowserCard({ url }).registryPath,
      proofPath: browserProofPath,
      timeoutMs,
      manualSteps: [
        "Open the Codex Browser panel with Cmd+Shift+B or View > Toggle Browser Panel.",
        "Create or focus a Browser tab with Cmd+T or View > Open Browser Tab.",
        `Open the local-server card for ${normalizedUrl} or navigate to ${url}; direct navigation also needs a fresh Browser proof file.`,
      ],
    },
    null,
    2,
  ),
);
process.exit(1);
