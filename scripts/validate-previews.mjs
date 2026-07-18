import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import questions from "../src/data/questions.js";
import previewUrls from "../src/data/preview-urls.js";

const ROOT = process.cwd();
const PREVIEWS_FILE = path.join(ROOT, "src", "data", "preview-urls.js");
const REPORT_FILE = path.join(ROOT, "scripts", "preview-validation-report.json");
const CONCURRENCY = 6;

async function validatePreview(track) {
  try {
    const response = await fetch(track.preview, {
      headers: {
        Accept: "audio/*",
        Range: "bytes=0-4095",
        "User-Agent": "MusicRootsPreviewValidator/1.0",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
    });
    const contentType = response.headers.get("content-type") ?? "";
    const bytes = (await response.arrayBuffer()).byteLength;

    if (response.status >= 300 && response.status < 400) {
      return { valid: false, reason: `Redirect HTTP ${response.status}` };
    }
    if (response.status !== 200 && response.status !== 206) {
      return { valid: false, reason: `Status HTTP ${response.status}` };
    }
    if (!contentType.toLowerCase().startsWith("audio/")) {
      return {
        valid: false,
        reason: `MIME non audio: ${contentType || "assente"}`,
      };
    }
    if (bytes === 0) {
      return { valid: false, reason: "Risposta audio priva di dati" };
    }
    return { valid: true, status: response.status, contentType, bytes };
  } catch (error) {
    return {
      valid: false,
      reason: error instanceof Error ? error.message : "Errore di rete sconosciuto",
    };
  }
}

async function mapWithConcurrency(items, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
      console.log(`[${index + 1}/${items.length}] ${items[index].artist} — ${items[index].title}: ${results[index].valid ? "valid" : results[index].reason}`);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, runWorker),
  );
  return results;
}

function serializePreviews(previews) {
  const entries = Object.entries(previews)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([id, preview]) => `  ${id}: ${JSON.stringify(preview)},`);
  return `const previewUrls = {\n${entries.join("\n")}\n};\n\nexport default previewUrls;\n`;
}

async function main() {
  const tracksToCheck = questions.filter((track) => track.preview);
  const validations = await mapWithConcurrency(tracksToCheck, validatePreview);
  const validTracks = [];
  const removedTracks = [];

  tracksToCheck.forEach((track, index) => {
    const validation = validations[index];
    if (validation.valid) {
      validTracks.push(track);
    } else {
      removedTracks.push({
        id: track.id,
        artist: track.artist,
        title: track.title,
        preview: track.preview,
        reason: validation.reason,
      });
    }
  });

  const validPreviewUrls = Object.fromEntries(
    validTracks.map((track) => [String(track.id), previewUrls[track.id]]),
  );
  await writeFile(PREVIEWS_FILE, serializePreviews(validPreviewUrls), "utf8");

  const report = {
    generatedAt: new Date().toISOString(),
    previewsChecked: tracksToCheck.length,
    previewsValid: validTracks.length,
    previewsRemoved: removedTracks.length,
    removedTracks,
  };
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));

  const reportRoundTrip = JSON.parse(await readFile(REPORT_FILE, "utf8"));
  if (reportRoundTrip.previewsChecked !== tracksToCheck.length) {
    throw new Error("Il report di validazione non è coerente.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
