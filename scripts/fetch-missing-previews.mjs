import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import questions from "../src/data/questions.js";
import existingPreviewUrls from "../src/data/preview-urls.js";

const ROOT = process.cwd();
const PREVIEWS_FILE = path.join(ROOT, "src", "data", "preview-urls.js");
const CACHE_FILE = path.join(ROOT, "scripts", ".missing-preview-cache.json");
const REPORT_FILE = path.join(ROOT, "scripts", "missing-preview-report.json");
const DELAY_MS = Number(process.env.PREVIEW_REQUEST_DELAY_MS ?? 280);
const COUNTRIES = ["IT", "US", "GB"];
const REJECTED_VERSION = /\b(karaoke|tribute|cover|instrumental|made famous by|as made famous by)\b/i;
const VERSION_WORDS = /\b(remaster(?:ed)?|radio edit|single version|extended mix|album version|original version)\b/gi;

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function stripSearchDecorations(value) {
  return String(value ?? "")
    .replace(/\b(feat(?:uring)?|ft)\.?\s+[^()[\]-]+/gi, " ")
    .replace(/[([][^)\]]*\b(remaster(?:ed)?|radio edit|single version|extended mix|feat(?:uring)?|ft\.?)\b[^)\]]*[)\]]/gi, " ")
    .replace(VERSION_WORDS, " ")
    .replace(/[()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return stripSearchDecorations(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function normalizeArtist(value) {
  return normalize(value).replace(/^the\s+/, "");
}

function hasRequiredVersion(expectedTitle, candidateTitle) {
  const required = String(expectedTitle).match(/\b(remix|mix|edit|version)\b[^)]*/i);
  if (!required) return true;
  return normalize(candidateTitle).includes(normalize(required[0]));
}

function reliableCandidate(track, candidate) {
  return (
    candidate.preview?.startsWith("https://") &&
    normalize(track.title) === normalize(candidate.title) &&
    normalizeArtist(track.artist) === normalizeArtist(candidate.artist) &&
    hasRequiredVersion(track.title, candidate.title) &&
    !REJECTED_VERSION.test(`${candidate.title} ${candidate.artist} ${candidate.album ?? ""}`)
  );
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MusicRootsDeepPreviewFetcher/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function searchItunes(term, country) {
  const params = new URLSearchParams({
    term,
    country,
    media: "music",
    entity: "song",
    limit: "50",
  });
  const data = await fetchJson(`https://itunes.apple.com/search?${params}`);
  return (data.results ?? []).map((item) => ({
    artist: item.artistName,
    title: item.trackName,
    album: item.collectionName,
    preview: item.previewUrl,
    source: "itunes",
    catalogId: item.trackId,
    query: `${term} [${country}]`,
  }));
}

async function searchDeezer(term) {
  const data = await fetchJson(
    `https://api.deezer.com/search?q=${encodeURIComponent(term)}&limit=50`,
  );
  return (data.data ?? []).map((item) => ({
    artist: item.artist?.name,
    title: item.title,
    album: item.album?.title,
    preview: item.preview,
    source: "deezer",
    catalogId: item.id,
    query: term,
  }));
}

async function isPlayableAudio(url) {
  try {
    const response = await fetch(url, {
      headers: { Range: "bytes=0-2047" },
      signal: AbortSignal.timeout(15_000),
    });
    const contentType = response.headers.get("content-type") ?? "";
    const bytes = (await response.arrayBuffer()).byteLength;
    return (
      (response.status === 200 || response.status === 206) &&
      contentType.toLowerCase().startsWith("audio/") &&
      bytes > 0
    );
  } catch {
    return false;
  }
}

function buildQueries(track) {
  const cleanArtist = stripSearchDecorations(track.artist);
  const cleanTitle = stripSearchDecorations(track.title);
  const artistWithoutThe = cleanArtist.replace(/^the\s+/i, "");
  const artistWithThe = /^the\s+/i.test(cleanArtist)
    ? cleanArtist
    : `The ${cleanArtist}`;
  return [...new Set([
    `${cleanArtist} ${track.title}`,
    `${cleanArtist} ${cleanTitle}`,
    `${artistWithoutThe} ${cleanTitle}`,
    `${artistWithThe} ${cleanTitle}`,
    cleanTitle,
  ])];
}

function candidateIdentity(candidate) {
  return `${candidate.source}:${candidate.catalogId ?? candidate.preview}`;
}

function summarizeCandidate(candidate, reason) {
  return {
    source: candidate.source,
    artist: candidate.artist,
    title: candidate.title,
    album: candidate.album,
    query: candidate.query,
    reason,
  };
}

async function findPreview(track) {
  const candidates = [];
  const errors = [];
  for (const query of buildQueries(track)) {
    for (const country of COUNTRIES) {
      try {
        candidates.push(...(await searchItunes(query, country)));
      } catch (error) {
        errors.push(`iTunes ${country}: ${error.message}`);
      }
      await sleep(DELAY_MS);
    }
  }

  let reliable = [...new Map(
    candidates.filter((candidate) => reliableCandidate(track, candidate))
      .map((candidate) => [candidateIdentity(candidate), candidate]),
  ).values()];

  if (reliable.length === 0) {
    for (const query of buildQueries(track)) {
      try {
        candidates.push(...(await searchDeezer(query)));
      } catch (error) {
        errors.push(`Deezer: ${error.message}`);
      }
      await sleep(DELAY_MS);
    }
    reliable = [...new Map(
      candidates.filter((candidate) => reliableCandidate(track, candidate))
        .map((candidate) => [candidateIdentity(candidate), candidate]),
    ).values()];
  }

  const playable = [];
  for (const candidate of reliable) {
    if (await isPlayableAudio(candidate.preview)) playable.push(candidate);
    await sleep(DELAY_MS);
  }

  const distinctMatches = new Set(
    playable.map((candidate) =>
      `${normalizeArtist(candidate.artist)}|${normalize(candidate.title)}`,
    ),
  );
  const selected = distinctMatches.size === 1 ? playable[0] : null;
  const doubtful = candidates
    .filter((candidate) => {
      const sameTitle = normalize(track.title) === normalize(candidate.title);
      const sameArtist = normalizeArtist(track.artist) === normalizeArtist(candidate.artist);
      return sameTitle || sameArtist;
    })
    .slice(0, 8)
    .map((candidate) =>
      summarizeCandidate(
        candidate,
        REJECTED_VERSION.test(`${candidate.title} ${candidate.artist} ${candidate.album ?? ""}`)
          ? "Cover, karaoke, tribute o versione strumentale"
          : !reliableCandidate(track, candidate)
            ? "Artista o titolo non corrispondono esattamente dopo la normalizzazione"
            : "URL non riproducibile o più risultati distinti",
      ),
    );
  return { selected, doubtful, errors };
}

function serializePreviews(previews) {
  const entries = Object.entries(previews)
    .filter(([, preview]) => preview)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([id, preview]) => `  ${id}: ${JSON.stringify(preview)},`);
  return `const previewUrls = {\n${entries.join("\n")}\n};\n\nexport default previewUrls;\n`;
}

async function readCache() {
  if (!existsSync(CACHE_FILE)) return { results: {} };
  return JSON.parse(await readFile(CACHE_FILE, "utf8"));
}

async function main() {
  const missingTracks = questions.filter((track) => !track.preview);
  const initialPreviewCount = Object.keys(existingPreviewUrls).length;
  const previews = { ...existingPreviewUrls };
  const cache = await readCache();

  for (const [index, track] of missingTracks.entries()) {
    const key = String(track.id);
    if (!cache.results[key]) {
      const result = await findPreview(track);
      cache.results[key] = {
        id: track.id,
        artist: track.artist,
        title: track.title,
        ...result,
      };
      await writeFile(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
    }
    const result = cache.results[key];
    if (result.selected?.preview?.startsWith("https://")) {
      previews[key] = result.selected.preview;
    }
    console.log(`[${index + 1}/${missingTracks.length}] ${track.artist} — ${track.title}: ${result.selected?.source ?? "missing"}`);
  }

  if (Object.keys(existingPreviewUrls).some((id) => previews[id] !== existingPreviewUrls[id])) {
    throw new Error("Una preview preesistente verrebbe modificata.");
  }
  await writeFile(PREVIEWS_FILE, serializePreviews(previews), "utf8");

  const newAssociations = missingTracks
    .filter((track) => previews[track.id])
    .map((track) => ({
      id: track.id,
      artist: track.artist,
      title: track.title,
      preview: previews[track.id],
      source: cache.results[String(track.id)].selected.source,
    }));
  const stillMissing = missingTracks
    .filter((track) => !previews[track.id])
    .map(({ id, artist, title }) => ({ id, artist, title }));
  const doubtfulExcluded = missingTracks
    .filter((track) => !previews[track.id] && cache.results[String(track.id)].doubtful.length)
    .map((track) => ({
      id: track.id,
      artist: track.artist,
      title: track.title,
      candidates: cache.results[String(track.id)].doubtful,
    }));
  const report = {
    generatedAt: new Date().toISOString(),
    recordsExamined: missingTracks.length,
    existingPreviewsPreserved: initialPreviewCount,
    newPreviewsFound: newAssociations.length,
    previewsStillMissing: stillMissing.length,
    newAssociations,
    stillMissing,
    doubtfulExcluded,
  };
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
