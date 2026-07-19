import { writeFile } from "node:fs/promises";
import path from "node:path";

import tracks from "../src/data/questions.js";
import metadata from "../src/data/apple-preview-metadata.js";
import { appleArtistsMatch } from "../src/lib/appleMusicValidation.js";

const output = path.resolve("src/data/apple-preview-metadata.js");
const normalize = (value) => String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/\b(single|singolo|ep|album)\b/gi, " ").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase();
const mainArtist = (value) => String(value).split(/\s+(?:feat\.?|featuring|&)\s+/i)[0];
const artworkArtistMatches = (expected, actual) => appleArtistsMatch(expected, actual) || appleArtistsMatch(mainArtist(expected), actual) || normalize(actual).includes(normalize(mainArtist(expected)));
const serialize = (values) => `const applePreviewMetadata = {\n${Object.entries(values).sort(([left], [right]) => Number(left) - Number(right)).map(([id, value]) => `  ${id}: ${JSON.stringify(value)},`).join("\n")}\n};\n\nexport default applePreviewMetadata;\n`;

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) return { results: [] };
  return response.json();
}

for (const track of tracks.filter((item) => item.id >= 301 && !metadata[item.id]?.appleArtworkUrl)) {
  let candidates = [];
  const trackId = metadata[track.id]?.appleTrackId;
  if (trackId) candidates = (await getJson(`https://itunes.apple.com/lookup?id=${trackId}&country=US`)).results ?? [];
  if (!candidates.some((candidate) => candidate.artworkUrl100)) {
    const params = new URLSearchParams({ term: `${track.artist} ${track.album}`, country: "US", media: "music", entity: "album", limit: "25" });
    candidates = (await getJson(`https://itunes.apple.com/search?${params}`)).results ?? [];
  }
  if (!candidates.some((candidate) => candidate.artworkUrl100 && artworkArtistMatches(track.artist, candidate.artistName))) {
    const params = new URLSearchParams({ term: `${mainArtist(track.artist)} ${track.title}`, country: "US", media: "music", entity: "song", limit: "25" });
    candidates = (await getJson(`https://itunes.apple.com/search?${params}`)).results ?? [];
  }
  const expectedAlbum = normalize(track.album);
  const candidate = candidates.find((item) =>
    item.artworkUrl100 && artworkArtistMatches(track.artist, item.artistName) &&
    (normalize(item.collectionName) === expectedAlbum || normalize(item.collectionName).includes(expectedAlbum) || expectedAlbum.includes(normalize(item.collectionName)))
  ) ?? candidates.find((item) => item.artworkUrl100 && artworkArtistMatches(track.artist, item.artistName));
  if (candidate) metadata[track.id] = { ...metadata[track.id], appleArtworkUrl: candidate.artworkUrl100 };
  console.log(`${track.id} ${track.artist} — ${track.title}: ${candidate ? "artwork" : "missing"}`);
}

await writeFile(output, serialize(metadata), "utf8");
