import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "src", "data", "questions.js");
const BACKUP_FILE = `${DATA_FILE}.backup`;
const PREVIEWS_FILE = path.join(ROOT, "src", "data", "preview-urls.js");
const CACHE_FILE = path.join(ROOT, "scripts", ".preview-cache.json");
const REPORT_FILE = path.join(ROOT, "scripts", "preview-report.json");
const REQUEST_DELAY_MS = Number(process.env.PREVIEW_REQUEST_DELAY_MS ?? 250);

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(feat(?:uring)?|ft)\.?\s+[^()[\]-]+/gi, " ")
    .replace(
      /[([]\s*(?:\d{4}\s+)?(?:re)?master(?:ed)?(?:\s+\d{4})?|radio\s+(?:edit|mix|version)|single\s+(?:edit|mix|version)|album\s+version|edit|remix|mix|version|feat(?:uring)?\.?[^)\]]*?[)\]]/gi,
      " ",
    )
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function artistParts(value) {
  return String(value ?? "")
    .split(/\s*(?:,|&|\band\b|\bfeat(?:uring)?\.?\b|\bft\.?\b|\bx\b)\s*/i)
    .map(normalize)
    .filter(Boolean);
}

function artistMatches(expected, actual) {
  const expectedNormalized = normalize(expected);
  const actualNormalized = normalize(actual);
  if (expectedNormalized === actualNormalized) return true;

  const expectedParts = artistParts(expected);
  const actualParts = artistParts(actual);
  return expectedParts.every((part) =>
    actualParts.some(
      (candidate) =>
        candidate === part ||
        (part.length >= 5 && candidate.includes(part)) ||
        (candidate.length >= 5 && part.includes(candidate)),
    ),
  );
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function selectReliableMatch(track, candidates) {
  const exact = candidates.filter(
    (candidate) =>
      isHttpsUrl(candidate.preview) &&
      normalize(candidate.title) === normalize(track.title) &&
      artistMatches(track.artist, candidate.artist),
  );

  if (exact.length === 0) {
    const close = candidates.filter(
      (candidate) =>
        isHttpsUrl(candidate.preview) &&
        (normalize(candidate.title) === normalize(track.title) ||
          artistMatches(track.artist, candidate.artist)),
    );
    return { match: null, doubtful: close.length > 0 };
  }

  const identities = new Set(
    exact.map((candidate) => `${normalize(candidate.artist)}|${normalize(candidate.title)}`),
  );
  if (identities.size > 1) return { match: null, doubtful: true };

  return { match: exact[0], doubtful: false };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MusicRootsPreviewFetcher/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function searchItunes(track) {
  const params = new URLSearchParams({
    term: `${track.artist} ${track.title}`,
    country: "IT",
    media: "music",
    entity: "song",
    limit: "25",
  });
  const data = await fetchJson(`https://itunes.apple.com/search?${params}`);
  return (data.results ?? []).map((item) => ({
    artist: item.artistName,
    title: item.trackName,
    preview: item.previewUrl,
    source: "itunes",
  }));
}

async function searchDeezer(track) {
  const query = encodeURIComponent(`artist:\"${track.artist}\" track:\"${track.title}\"`);
  const data = await fetchJson(`https://api.deezer.com/search?q=${query}&limit=25`);
  return (data.data ?? []).map((item) => ({
    artist: item.artist?.name,
    title: item.title,
    preview: item.preview,
    source: "deezer",
  }));
}

async function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  return JSON.parse(await readFile(file, "utf8"));
}

async function persistCache(cache) {
  await writeFile(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

function serializePreviews(results) {
  const entries = Object.values(results)
    .filter((result) => result.preview)
    .sort((left, right) => left.id - right.id)
    .map((result) => `  ${JSON.stringify(result.id)}: ${JSON.stringify(result.preview)},`);
  return `const previewUrls = {\n${entries.join("\n")}\n};\n\nexport default previewUrls;\n`;
}

async function ensureDatasetIntegration() {
  let source = await readFile(DATA_FILE, "utf8");
  if (!source.includes('import previewUrls from "./preview-urls.js";')) {
    source = source.replace(
      'import previewUrls from "./preview-urls";',
      'import previewUrls from "./preview-urls.js";',
    );
    if (!source.includes('import previewUrls from "./preview-urls.js";')) {
      source = `import previewUrls from "./preview-urls.js";\n\n${source}`;
    }
  }
  source = source.replace(
    /preview: "",/,
    "preview: previewUrls[index + 1] ?? \"\",",
  );
  source = source.replace(
    /preview: "",/,
    "preview: previewUrls[track.id] ?? \"\",",
  );
  await writeFile(DATA_FILE, source, "utf8");
}

async function main() {
  await mkdir(path.dirname(CACHE_FILE), { recursive: true });
  const moduleUrl = `${pathToFileURL(DATA_FILE).href}?run=${Date.now()}`;
  const { default: tracks } = await import(moduleUrl);
  const cache = await readJson(CACHE_FILE, { version: 1, results: {} });
  const results = { ...cache.results };

  if (!existsSync(BACKUP_FILE)) await copyFile(DATA_FILE, BACKUP_FILE);

  for (const [index, track] of tracks.entries()) {
    const key = String(track.id);
    if (isHttpsUrl(track.preview)) {
      results[key] ??= {
        id: track.id,
        artist: track.artist,
        title: track.title,
        preview: track.preview,
        source: "existing",
        doubtful: false,
      };
      continue;
    }
    const cachedResult = results[key];
    const bothProvidersFailed = (cachedResult?.errors?.length ?? 0) >= 2;
    if (cachedResult?.completed && !bothProvidersFailed) continue;

    let selected = null;
    let doubtful = false;
    const errors = [];
    for (const provider of [searchItunes, searchDeezer]) {
      try {
        const selection = selectReliableMatch(track, await provider(track));
        doubtful ||= selection.doubtful;
        if (selection.match) {
          selected = selection.match;
          break;
        }
      } catch (error) {
        errors.push(error.message);
      }
      await sleep(REQUEST_DELAY_MS);
    }

    results[key] = {
      id: track.id,
      artist: track.artist,
      title: track.title,
      preview: selected?.preview ?? "",
      source: selected?.source ?? null,
      doubtful,
      completed: errors.length < 2,
      errors,
    };
    cache.results = results;
    await persistCache(cache);
    console.log(`[${index + 1}/${tracks.length}] ${track.artist} — ${track.title}: ${selected?.source ?? "missing"}`);
    await sleep(REQUEST_DELAY_MS);
  }

  await writeFile(PREVIEWS_FILE, serializePreviews(results), "utf8");
  await ensureDatasetIntegration();

  const allResults = tracks.map((track) => results[String(track.id)]);
  const found = allResults.filter((result) => isHttpsUrl(result?.preview));
  const missing = allResults.filter((result) => !isHttpsUrl(result?.preview));
  const report = {
    generatedAt: new Date().toISOString(),
    totalRecords: tracks.length,
    previewsFound: found.length,
    previewsMissing: missing.length,
    doubtfulMatchesExcluded: missing.filter((result) => result?.doubtful).length,
    sources: Object.fromEntries(
      found.map((result) => [String(result.id), result.source]),
    ),
    missingTracks: missing.map(({ id, artist, title, doubtful }) => ({
      id,
      artist,
      title,
      doubtful,
    })),
  };
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const invalidUrls = found.filter((result) => !isHttpsUrl(result.preview));
  if (invalidUrls.length > 0) throw new Error("Sono presenti URL non HTTPS.");
  const refreshed = await import(`${pathToFileURL(DATA_FILE).href}?verify=${Date.now()}`);
  if (refreshed.default.length !== tracks.length) {
    throw new Error("Il dataset aggiornato non conserva il numero di record.");
  }
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
