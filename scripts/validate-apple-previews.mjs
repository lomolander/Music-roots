import { readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import questions from "../src/data/questions.js";
import {
  isExactAppleMusicMatch,
  validateAppleMusicTrack,
} from "../src/lib/appleMusicValidation.js";

const ROOT = process.cwd();
const METADATA_FILE = path.join(ROOT, "src", "data", "apple-preview-metadata.js");
const PREVIEWS_FILE = path.join(ROOT, "src", "data", "preview-urls.js");
const CACHE_FILE = path.join(ROOT, "scripts", ".apple-preview-cache.json");
const REPORT_FILE = path.join(ROOT, "scripts", "apple-preview-report.json");
const COUNTRIES = ["IT", "US", "GB"];
const REQUEST_DELAY_MS = Number(process.env.APPLE_REQUEST_DELAY_MS ?? 850);

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchJson(url) {
  for (let attempt = 0; attempt < 7; attempt += 1) {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "MusicRootsAppleValidator/1.0" },
      signal: AbortSignal.timeout(20_000),
    });
    if (response.ok) return response.json();
    if (response.status !== 403 && response.status !== 429 && response.status < 500) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    const backoff = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1_000
      : Math.min(45_000, 2_000 * (2 ** attempt));
    await sleep(backoff + Math.floor(Math.random() * 500));
  }
  throw new Error("Apple Search temporaneamente non disponibile dopo i retry");
}

async function searchApple(track) {
  const candidates = [];
  for (const country of COUNTRIES) {
    const params = new URLSearchParams({
      term: `${track.artist} ${track.title}`,
      country,
      media: "music",
      entity: "song",
      limit: "50",
    });
    const data = await fetchJson(`https://itunes.apple.com/search?${params}`);
    candidates.push(...(data.results ?? []));
    await sleep(REQUEST_DELAY_MS);
    if ((data.results ?? []).some((candidate) => isExactAppleMusicMatch(track, candidate))) {
      break;
    }
  }
  return [...new Map(
    candidates.map((candidate) => [String(candidate.trackId), candidate]),
  ).values()];
}

async function validatePreview(url) {
  if (typeof url !== "string" || !url.startsWith("https://")) {
    return { valid: false, reason: "URL assente o non HTTPS" };
  }
  try {
    const response = await fetch(url, {
      headers: { Accept: "audio/*", Range: "bytes=0-4095" },
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    const contentType = response.headers.get("content-type") ?? "";
    const bytes = (await response.arrayBuffer()).byteLength;
    if (response.status !== 200 && response.status !== 206) {
      return { valid: false, reason: `Status HTTP ${response.status}` };
    }
    if (!contentType.toLowerCase().startsWith("audio/")) {
      return { valid: false, reason: `MIME non audio: ${contentType || "assente"}` };
    }
    if (bytes === 0) return { valid: false, reason: "Nessun dato audio" };
    return { valid: true, status: response.status, contentType, bytes };
  } catch (error) {
    return { valid: false, reason: error instanceof Error ? error.message : "Errore di rete" };
  }
}

function fingerprint(track) {
  return `${track.artist}\u0000${track.title}\u0000${track.album ?? ""}`;
}

async function readCache() {
  if (!existsSync(CACHE_FILE)) return { version: 1, results: {} };
  try {
    return JSON.parse(await readFile(CACHE_FILE, "utf8"));
  } catch {
    return { version: 1, results: {} };
  }
}

async function writeCache(cache) {
  const temporaryFile = `${CACHE_FILE}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
  await rename(temporaryFile, CACHE_FILE);
}

function isRetryableCacheEntry(cached) {
  const reason = cached?.validation?.reason ?? "";
  return /403|429|temporaneamente|fetch failed|timeout/i.test(reason);
}

function serializeObject(name, values) {
  const entries = Object.entries(values)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([id, value]) => `  ${id}: ${JSON.stringify(value)},`);
  return `const ${name} = {\n${entries.join("\n")}\n};\n\nexport default ${name};\n`;
}

async function main() {
  const cache = await readCache();
  const metadata = {};
  const excluded = [];
  let doubtfulMatches = 0;
  let unplayablePreviews = 0;

  for (const [index, track] of questions.entries()) {
    const key = String(track.id);
    const trackFingerprint = fingerprint(track);
    let cached = cache.results[key];

    if (!cached || cached.fingerprint !== trackFingerprint || isRetryableCacheEntry(cached)) {
      let validation;
      try {
        validation = await validateAppleMusicTrack(track, {
          searchApple,
          validatePreview,
        });
      } catch (error) {
        validation = {
          valid: false,
          status: "excluded",
          reason: error instanceof Error ? error.message : "Errore Apple sconosciuto",
          doubtfulCandidates: [],
        };
      }
      cached = { fingerprint: trackFingerprint, validation };
      cache.results[key] = cached;
      await writeCache(cache);
    } else if (cached.validation.valid) {
      const currentUrlCheck = await validatePreview(cached.validation.candidate.previewUrl);
      if (!currentUrlCheck.valid) {
        cached.validation = {
          ...cached.validation,
          valid: false,
          status: "unplayable",
          reason: currentUrlCheck.reason,
        };
      } else {
        cached.validation.previewValidation = currentUrlCheck;
      }
    }

    const validation = cached.validation;
    if (validation.valid) {
      const candidate = validation.candidate;
      metadata[key] = {
        previewSource: "apple",
        previewValidated: true,
        appleTrackId: candidate.trackId,
        appleArtistName: candidate.artistName,
        appleTrackName: candidate.trackName,
        appleCollectionName: candidate.collectionName,
        applePreviewUrl: candidate.previewUrl,
        previewLastVerifiedAt: new Date().toISOString(),
        previewValidationStatus: "validated",
      };
    } else {
      if (validation.status === "doubtful") doubtfulMatches += 1;
      if (validation.status === "unplayable") unplayablePreviews += 1;
      excluded.push({
        id: track.id,
        artist: track.artist,
        title: track.title,
        reason: validation.reason,
        status: validation.status,
        doubtfulCandidates: validation.doubtfulCandidates ?? [],
        failedPreviews: validation.failedPreviews ?? [],
      });
    }
    console.log(`[${index + 1}/${questions.length}] ${track.artist} — ${track.title}: ${validation.valid ? "apple validated" : validation.status}`);
  }

  const previewUrls = Object.fromEntries(
    Object.entries(metadata).map(([id, value]) => [id, value.applePreviewUrl]),
  );
  await writeFile(
    METADATA_FILE,
    serializeObject("applePreviewMetadata", metadata),
    "utf8",
  );
  await writeFile(PREVIEWS_FILE, serializeObject("previewUrls", previewUrls), "utf8");

  const report = {
    generatedAt: new Date().toISOString(),
    totalTracks: questions.length,
    validAppleMatches: Object.keys(metadata).length,
    excludedTracks: excluded.length,
    doubtfulMatches,
    unplayablePreviews,
    excluded,
  };
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
