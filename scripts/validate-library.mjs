import { readdir } from "node:fs/promises";
import path from "node:path";

import tracks from "../src/data/questions.js";
import { trackModules } from "../src/data/tracks/index.js";
import { allowedGenres, essentialPlaylists } from "../src/data/libraryConfig.js";
import { artists, albums, genres } from "../src/data/entities/index.js";

const errors = [];
const warnings = [];
const seenIds = new Map();
const seenIdentities = new Map();
const seenPreviews = new Map();
const required = ["id", "artist", "title", "album", "year", "genre"];
const normalize = (value) => String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase();
const validUrl = (value) => {
  if (!value) return true;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
};

for (const track of tracks) {
  for (const field of required) if (track[field] === undefined || track[field] === null || track[field] === "") errors.push(`ID ${track.id ?? "?"}: campo obbligatorio ${field} mancante`);
  if (!Number.isInteger(track.id) || track.id < 1) errors.push(`ID non valido: ${track.id}`);
  if (seenIds.has(track.id)) errors.push(`ID duplicato ${track.id}`); else seenIds.set(track.id, track);
  const identity = `${normalize(track.artist)}|${normalize(track.title)}`;
  if (seenIdentities.has(identity)) errors.push(`Artista-titolo duplicato: ${track.artist} — ${track.title}`); else seenIdentities.set(identity, track);
  if (!Number.isInteger(track.year) || track.year < 1900 || track.year > new Date().getFullYear() + 1) errors.push(`ID ${track.id}: anno non plausibile ${track.year}`);
  if (!allowedGenres.includes(track.genre)) errors.push(`ID ${track.id}: genere non riconosciuto ${track.genre}`);
  if (!essentialPlaylists[track.essentialPlaylist]) errors.push(`ID ${track.id}: playlist essenziale inesistente ${track.essentialPlaylist}`);
  for (const [provider, url] of Object.entries(track.links ?? {})) if (!validUrl(url)) errors.push(`ID ${track.id}: link ${provider} malformato`);
  if (track.appleMatchStatus === "verified" && (!track.applePreviewUrl?.startsWith("https://") || !track.previewValidated)) errors.push(`ID ${track.id}: verified senza preview Apple HTTPS validata`);
  if (track.applePreviewUrl) {
    const previous = seenPreviews.get(track.applePreviewUrl);
    if (previous && previous !== track.id) errors.push(`Preview duplicata per ID ${previous} e ${track.id}`); else seenPreviews.set(track.applePreviewUrl, track.id);
  }
  if (!track.scenario || !track.meaning || !track.influences.length) warnings.push(`ID ${track.id}: contenuti editoriali incompleti`);
  if (!track.musicalCharacteristics || !track.importance || !track.meaning) errors.push(`ID ${track.id}: revisione editoriale v2 incompleta`);
  if (track.id >= 301) {
    for (const field of ["subgenre", "curiosity", "meaning", "scenario", "essentialPlaylist", "artistId", "albumId", "genreId"]) {
      if (!track[field]) errors.push(`ID ${track.id}: campo editoriale ${field} mancante`);
    }
    if (!track.influences.length || !track.similarArtists.length) errors.push(`ID ${track.id}: influenze o artisti simili mancanti`);
    for (const provider of ["spotify", "appleMusic", "youtube"]) if (!track.links?.[provider]) errors.push(`ID ${track.id}: link ${provider} mancante`);
    if (!track.artwork && !track.cover) warnings.push(`ID ${track.id}: copertina non disponibile da un match verificato`);
  }
}

const moduleDirectory = path.resolve("src/data/tracks");
const files = (await readdir(moduleDirectory)).filter((file) => file.endsWith(".js") && file !== "index.js").map((file) => file.replace(/\.js$/, ""));
for (const file of files) if (!Object.hasOwn(trackModules, file)) errors.push(`Modulo ${file}.js non incluso nell'aggregatore`);
for (const moduleName of Object.keys(trackModules)) if (!files.includes(moduleName)) errors.push(`Aggregatore riferisce il modulo inesistente ${moduleName}.js`);
if (Object.values(trackModules).flat().length !== tracks.length) errors.push("Il totale dei moduli non coincide con il catalogo aggregato");
for (const track of tracks) {
  if (!artists.some((artist) => artist.id === track.artistId)) errors.push(`ID ${track.id}: scheda artista mancante`);
  if (!albums.some((album) => album.id === track.albumId)) errors.push(`ID ${track.id}: scheda album mancante`);
  if (!genres.some((genre) => genre.id === track.genreId)) errors.push(`ID ${track.id}: scheda genere mancante`);
}

console.log(JSON.stringify({ tracks: tracks.length, artists: artists.length, albums: albums.length, genres: genres.length, modules: files.length, errors: errors.length, warnings: warnings.length }, null, 2));
if (warnings.length) console.warn(warnings.slice(0, 20).join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
}
