import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import questions from "../src/data/questions.js";
import existingAppleMetadata from "../src/data/apple-preview-metadata.js";
import {
  appleArtistsMatch,
  hasWrongAppleVersion,
  isExactAppleMusicMatch,
  validateAppleMusicTrack,
} from "../src/lib/appleMusicValidation.js";

const ROOT = process.cwd();
const METADATA_FILE = path.join(ROOT, "src", "data", "apple-preview-metadata.js");
const PREVIEWS_FILE = path.join(ROOT, "src", "data", "preview-urls.js");
const CACHE_FILE = path.join(ROOT, "scripts", ".apple-preview-cache.json");
const REPORT_FILE = path.join(ROOT, "scripts", "apple-preview-report.json");
const COUNTRIES = (process.env.APPLE_COUNTRIES ?? "IT,US,GB").split(",").map((country) => country.trim()).filter(Boolean);
const REQUEST_DELAY_MS = Number(process.env.APPLE_REQUEST_DELAY_MS ?? 850);
const CACHE_ONLY = process.env.APPLE_CACHE_ONLY === "1";
const cliArguments = process.argv.slice(2);
const cliValue = (name) => cliArguments.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3);
const forceValidation = cliArguments.includes("--force");

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
  const searchTerm = [track.artist, track.title, track.album, track.year]
    .filter((value) => value !== undefined && value !== null && String(value).trim())
    .join(" ");
  for (const country of COUNTRIES) {
    const params = new URLSearchParams({
      term: searchTerm,
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

function appleSearchTerm(track) {
  return [track.artist, track.title, track.album, track.year]
    .filter((value) => value !== undefined && value !== null && String(value).trim())
    .join(" ");
}

function fingerprint(track) {
  return `${appleSearchTerm(track)}\u0000v2`;
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
  const serialized = `${JSON.stringify(cache, null, 2)}\n`;
  await writeFile(temporaryFile, serialized, "utf8");
  try {
    await rename(temporaryFile, CACHE_FILE);
  } catch (error) {
    if (error?.code !== "EPERM" && error?.code !== "EEXIST") throw error;
    await writeFile(CACHE_FILE, serialized, "utf8");
    await unlink(temporaryFile).catch(() => {});
  }
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
  const metadata = { ...existingAppleMetadata };
  const excluded = [];
  let needsReview = 0;
  let missingPreviews = 0;
  let checkedThisRun = 0;
  let recoveredFromCache = 0;
  const requestedStatus = cliValue("status");
  const requestedGenre = cliValue("genre");
  const requestedFile = cliValue("file")?.replace(/\.js$/i, "");
  const explicitAll = cliArguments.includes("--all") || forceValidation || CACHE_ONLY;
  const onlyNew = cliArguments.includes("--new") || (!explicitAll && !requestedStatus && !requestedGenre && !requestedFile);
  const selectedQuestions = questions.filter((track) => {
    if (onlyNew && existingAppleMetadata[track.id]?.appleMatchStatus) return false;
    if (requestedStatus && existingAppleMetadata[track.id]?.appleMatchStatus !== requestedStatus) return false;
    if (requestedGenre && track.genre.toLowerCase() !== requestedGenre.toLowerCase()) return false;
    if (requestedFile && track.sourceModule.toLowerCase() !== requestedFile.toLowerCase()) return false;
    return true;
  });

  for (const [index, track] of selectedQuestions.entries()) {
    const key = String(track.id);
    const trackFingerprint = fingerprint(track);
    let cached = cache.results[key];

    if (!forceValidation && existingAppleMetadata[key]?.appleMatchStatus === "verified" && existingAppleMetadata[key].applePreviewUrl?.startsWith("https://")) {
      recoveredFromCache += 1;
      console.log(`[${index + 1}/${selectedQuestions.length}] ${track.artist} — ${track.title}: cache verified`);
      continue;
    }

    if (!CACHE_ONLY && (forceValidation || !cached || cached.fingerprint !== trackFingerprint || isRetryableCacheEntry(cached))) {
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
      checkedThisRun += 1;
    } else if (!CACHE_ONLY && cached.validation.valid) {
      recoveredFromCache += 1;
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

    if (!cached) {
      cached = { validation: { valid: false, status: "no-match", reason: "Nessun risultato Apple in cache" } };
    }
    let validation = cached.validation;
    if (validation.valid && !isExactAppleMusicMatch(track, validation.candidate)) {
      validation = {
        valid: false,
        status: "wrong-version",
        reason: "La versione Apple salvata non rispetta più i criteri di affidabilità",
        doubtfulCandidates: [{
          appleTrackId: validation.candidate.trackId,
          appleArtistName: validation.candidate.artistName,
          appleTrackName: validation.candidate.trackName,
          appleCollectionName: validation.candidate.collectionName,
        }],
      };
    }
    if (!validation.valid && validation.doubtfulCandidates?.some((candidate) =>
      appleArtistsMatch(track.artist, candidate.appleArtistName) &&
      hasWrongAppleVersion(track.title, candidate.appleTrackName, {
        artistName: candidate.appleArtistName,
        collectionName: candidate.appleCollectionName,
      })
    )) {
      validation = { ...validation, status: "wrong-version" };
    }
    const legacyStatuses = { validated: "verified", doubtful: "needs-review", excluded: "no-match", unplayable: "missing-preview" };
    validation = { ...validation, status: legacyStatuses[validation.status] ?? validation.status };
    if (validation.valid) {
      const candidate = validation.candidate;
      metadata[key] = {
        appleSearchTerm: appleSearchTerm(track),
        previewSource: "apple",
        previewValidated: true,
        appleMatchStatus: "verified",
        appleTrackId: candidate.trackId,
        appleArtistName: candidate.artistName,
        appleTrackName: candidate.trackName,
        appleCollectionName: candidate.collectionName,
        appleArtworkUrl: candidate.artworkUrl100 ?? candidate.artworkUrl60 ?? "",
        applePreviewUrl: candidate.previewUrl,
        previewLastVerifiedAt: new Date().toISOString(),
        previewValidationStatus: "verified",
      };
    } else {
      if (validation.status === "needs-review") needsReview += 1;
      if (validation.status === "missing-preview") missingPreviews += 1;
      const candidate = validation.candidate ?? validation.doubtfulCandidates?.[0] ?? {};
      metadata[key] = {
        appleSearchTerm: appleSearchTerm(track),
        previewSource: "apple",
        previewValidated: false,
        appleMatchStatus: validation.status,
        appleTrackId: candidate.trackId ?? candidate.appleTrackId ?? null,
        appleArtistName: candidate.artistName ?? candidate.appleArtistName ?? "",
        appleTrackName: candidate.trackName ?? candidate.appleTrackName ?? "",
        appleCollectionName: candidate.collectionName ?? candidate.appleCollectionName ?? "",
        appleArtworkUrl: candidate.artworkUrl100 ?? existingAppleMetadata[key]?.appleArtworkUrl ?? "",
        applePreviewUrl: "",
        previewValidationStatus: validation.status,
      };
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
    console.log(`[${index + 1}/${selectedQuestions.length}] ${track.artist} — ${track.title}: ${validation.valid ? "verified" : validation.status}`);
  }

  const previewUrls = Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value.appleMatchStatus === "verified" && value.applePreviewUrl)
      .map(([id, value]) => [id, value.applePreviewUrl]),
  );
  await writeFile(
    METADATA_FILE,
    serializeObject("applePreviewMetadata", metadata),
    "utf8",
  );
  await writeFile(PREVIEWS_FILE, serializeObject("previewUrls", previewUrls), "utf8");

  const statuses = ["verified", "needs-review", "wrong-version", "no-match", "missing-preview"];
  const statusCounts = Object.fromEntries(statuses.map((status) => [status, questions.filter((track) => metadata[track.id]?.appleMatchStatus === status).length]));
  const byGenre = Object.fromEntries([...new Set(questions.map((track) => track.genre))].sort().map((genre) => {
    const genreTracks = questions.filter((track) => track.genre === genre);
    return [genre, { total: genreTracks.length, ...Object.fromEntries(statuses.map((status) => [status, genreTracks.filter((track) => metadata[track.id]?.appleMatchStatus === status).length])) }];
  }));
  const unverified = questions.filter((track) => metadata[track.id]?.appleMatchStatus !== "verified").map((track) => ({
    id: track.id, artist: track.artist, requestedTitle: track.title, genre: track.genre,
    status: metadata[track.id]?.appleMatchStatus ?? "no-match",
    foundResult: { appleTrackId: metadata[track.id]?.appleTrackId ?? null, artist: metadata[track.id]?.appleArtistName ?? "", title: metadata[track.id]?.appleTrackName ?? "", album: metadata[track.id]?.appleCollectionName ?? "" },
  }));
  const report = {
    generatedAt: new Date().toISOString(), totalTracks: questions.length,
    verified: statusCounts.verified,
    verifiedPercentage: Number(((statusCounts.verified / questions.length) * 100).toFixed(2)),
    ...statusCounts, checkedThisRun, recoveredFromCache,
    selectedThisRun: selectedQuestions.length,
    filters: { onlyNew, status: requestedStatus ?? null, genre: requestedGenre ?? null, file: requestedFile ?? null, force: forceValidation },
    byGenre, unverified,
  };
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`\nApple Music: ${report.verified}/${report.totalTracks} verified (${report.verifiedPercentage}%)`);
  console.log(`needs-review ${report["needs-review"]} | wrong-version ${report["wrong-version"]} | no-match ${report["no-match"]} | missing-preview ${report["missing-preview"]}`);
  console.log(`Controllati ora: ${checkedThisRun} | letti dalla cache: ${recoveredFromCache} | selezionati: ${selectedQuestions.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
