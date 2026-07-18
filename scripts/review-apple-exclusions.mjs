import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const APPLE_REPORT = path.join(ROOT, "scripts", "apple-preview-report.json");
const LEGACY_CACHE = path.join(ROOT, "scripts", ".preview-cache.json");
const OUTPUT = path.join(ROOT, "scripts", "apple-exclusions-review.json");
const ORIGINAL_EXCLUDED_COUNT = 161;
const ORIGINAL_VALID_COUNT = 139;

async function validateAudio(url) {
  if (typeof url !== "string" || !url.startsWith("https://audio-ssl.itunes.apple.com/")) {
    return { valid: false, reason: "URL assente o non appartenente ad Apple/iTunes" };
  }
  try {
    const response = await fetch(url, {
      headers: { Accept: "audio/*", Range: "bytes=0-8191" },
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
    const mime = response.headers.get("content-type") ?? "";
    const bytes = (await response.arrayBuffer()).byteLength;
    const valid = [200, 206].includes(response.status) && mime.startsWith("audio/") && bytes > 0;
    return valid
      ? { valid, status: response.status, mime, bytes }
      : { valid, reason: `HTTP ${response.status}, MIME ${mime || "assente"}, ${bytes} byte` };
  } catch (error) {
    return { valid: false, reason: error instanceof Error ? error.message : "Errore di rete" };
  }
}

async function mapWithConcurrency(values, concurrency, callback) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await callback(values[index]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

const appleReport = JSON.parse(await readFile(APPLE_REPORT, "utf8"));
const legacyResults = JSON.parse(await readFile(LEGACY_CACHE, "utf8")).results;

const reviewed = await mapWithConcurrency(appleReport.excluded, 3, async (record) => {
  const legacy = legacyResults[String(record.id)];
  const priorCertainAppleMatch =
    legacy?.source === "itunes" &&
    legacy?.doubtful === false &&
    legacy?.preview?.startsWith("https://audio-ssl.itunes.apple.com/");

  if (priorCertainAppleMatch) {
    const audioValidation = await validateAudio(legacy.preview);
    if (audioValidation.valid) {
      return {
        category: "MATCH CERTO",
        original: { id: record.id, artist: record.artist, title: record.title },
        appleResult: {
          artist: legacy.artist,
          title: legacy.title,
          previewUrl: legacy.preview,
        },
        reason: "Corrispondenza iTunes esatta già acquisita; esclusa dal nuovo passaggio soltanto per errore temporaneo Apple 403; URL audio riconvalidato",
        audioValidation,
      };
    }
    return {
      category: "MATCH PROBABILE DA REVISIONARE",
      original: { id: record.id, artist: record.artist, title: record.title },
      appleResult: { artist: legacy.artist, title: legacy.title, previewUrl: legacy.preview },
      reason: `La corrispondenza storica era esatta, ma la preview non è stata riconvalidata: ${audioValidation.reason}`,
    };
  }

  if ((record.doubtfulCandidates?.length ?? 0) > 0) {
    return {
      category: "MATCH PROBABILE DA REVISIONARE",
      original: { id: record.id, artist: record.artist, title: record.title },
      appleCandidates: record.doubtfulCandidates,
      reason: record.reason,
    };
  }

  return {
    category: "MATCH NON VALIDO",
    original: { id: record.id, artist: record.artist, title: record.title },
    reason: record.reason === "403 Forbidden"
      ? "Nessuna corrispondenza verificabile disponibile: Apple Search ha rifiutato la richiesta e non esiste una precedente corrispondenza iTunes affidabile"
      : record.reason,
  };
});

const categories = {
  certain: reviewed.filter((item) => item.category === "MATCH CERTO"),
  review: reviewed.filter((item) => item.category === "MATCH PROBABILE DA REVISIONARE"),
  invalid: reviewed.filter((item) => item.category === "MATCH NON VALIDO"),
};
const output = {
  generatedAt: new Date().toISOString(),
  originallyExcludedTracks: ORIGINAL_EXCLUDED_COUNT,
  certainMatchesRecoveredByAppleRetry:
    appleReport.validAppleMatches - ORIGINAL_VALID_COUNT,
  additionalCertainMatchesFromValidatedCache: categories.certain.length,
  certainMatches:
    appleReport.validAppleMatches - ORIGINAL_VALID_COUNT + categories.certain.length,
  probableMatchesForReview: categories.review.length,
  invalidOrNoVerifiableMatch: categories.invalid.length,
  note: "I match probabili non sono stati inseriti nel quiz. Il database e il pool non sono stati modificati da questa revisione.",
  categories,
};

await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  originallyExcludedTracks: output.originallyExcludedTracks,
  certainMatches: output.certainMatches,
  probableMatchesForReview: output.probableMatchesForReview,
  invalidOrNoVerifiableMatch: output.invalidOrNoVerifiableMatch,
}, null, 2));
