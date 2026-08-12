import { writeFile } from "node:fs/promises";
import path from "node:path";

import tracks from "../src/data/questions.js";
import metadata from "../src/data/apple-preview-metadata.js";
import { appleArtistsMatch } from "../src/lib/appleMusicValidation.js";

const output = path.resolve("src/data/apple-preview-metadata.js");
const reportOutput = path.resolve("artwork-enrichment-report.json");
const countries = ["IT", "US", "JP", "GB"];
const normalize = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\b(single|singolo|ep|album|deluxe|edition|remaster(?:ed)?|anniversary)\b/gi, " ")
  .replace(/[^a-z0-9]+/gi, " ")
  .trim()
  .toLowerCase();
const mainArtist = (value) => String(value ?? "").split(/\s+(?:feat\.?|featuring|with|&|,\s*)\s+/i)[0];
const artistsMatch = (expected, actual) => appleArtistsMatch(expected, actual) || appleArtistsMatch(mainArtist(expected), actual);
const titlesMatch = (expected, actual) => {
  const left = normalize(expected);
  const right = normalize(actual).replace(/\b(feat|featuring|with)\b.*$/, "").trim();
  return left === right;
};
const albumsMatch = (expected, actual) => {
  if (!expected) return false;
  return normalize(expected) === normalize(actual);
};
const versionWords = (value) => new Set(normalize(value).match(/\b(live|remix|mix|edit|acoustic|instrumental|karaoke|demo|radio|mono|stereo)\b/g) ?? []);
const versionsCompatible = (expected, actual) => {
  const expectedWords = versionWords(expected);
  const actualWords = versionWords(actual);
  if (!expectedWords.size) return !actualWords.size;
  return [...expectedWords].every((word) => actualWords.has(word));
};
const serialize = (values) => `const applePreviewMetadata = {\n${Object.entries(values)
  .sort(([left], [right]) => Number(left) - Number(right))
  .map(([id, value]) => `  ${id}: ${JSON.stringify(value)},`)
  .join("\n")}\n};\n\nexport default applePreviewMetadata;\n`;

async function getJson(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) return { results: [] };
    return response.json();
  } catch {
    return { results: [] };
  }
}

async function search(term, country, entity) {
  const params = new URLSearchParams({ term, country, media: "music", entity, limit: "50" });
  return (await getJson(`https://itunes.apple.com/search?${params}`)).results ?? [];
}

async function findArtwork(track) {
  for (const country of countries) {
    const songQueries = [
      `${track.artist} ${track.title} ${track.album ?? ""}`,
      `${mainArtist(track.artist)} ${track.title}`,
    ];
    for (const query of songQueries) {
      const candidates = await search(query, country, "song");
      const exact = candidates.find((candidate) =>
        candidate.artworkUrl100 &&
        artistsMatch(track.artist, candidate.artistName) &&
        titlesMatch(track.title, candidate.trackName) &&
        versionsCompatible(track.title, candidate.trackName) &&
        (!track.album || albumsMatch(track.album, candidate.collectionName))
      );
      if (exact) return { candidate: exact, country, confidence: track.album ? "artist-title-album" : "artist-title" };
    }

    if (track.album) {
      const albums = await search(`${track.artist} ${track.album}`, country, "album");
      const exactAlbum = albums.find((candidate) =>
        candidate.artworkUrl100 && artistsMatch(track.artist, candidate.artistName) && albumsMatch(track.album, candidate.collectionName)
      );
      if (exactAlbum) return { candidate: exactAlbum, country, confidence: "artist-album" };
    }
  }
  return null;
}

const missing = tracks.filter((track) => !track.artwork);
const report = { before: missing.length, recovered: [], fallbackRequired: [] };

for (const [index, track] of missing.entries()) {
  const match = await findArtwork(track);
  if (match) {
    metadata[track.id] = {
      ...metadata[track.id],
      appleArtworkUrl: match.candidate.artworkUrl100,
      artworkMatchConfidence: match.confidence,
      artworkMatchCountry: match.country,
    };
    report.recovered.push({ id: track.id, artist: track.artist, title: track.title, module: track.sourceModule, ...match });
  } else {
    report.fallbackRequired.push({ id: track.id, artist: track.artist, title: track.title, module: track.sourceModule });
  }
  console.log(`[${index + 1}/${missing.length}] ${track.id} ${track.artist} — ${track.title}: ${match ? match.confidence : "fallback-required"}`);
}

await writeFile(output, serialize(metadata), "utf8");
await writeFile(reportOutput, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Recovered ${report.recovered.length}/${report.before}; fallback-required ${report.fallbackRequired.length}.`);
