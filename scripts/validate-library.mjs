import { readdir } from "node:fs/promises";
import path from "node:path";

import tracks from "../src/data/questions.js";
import { trackModules } from "../src/data/tracks/index.js";
import { allowedGenres, essentialPlaylists } from "../src/data/libraryConfig.js";
import { artists, albums, genres } from "../src/data/entities/index.js";
import { musicAtlasCities, musicAtlasVenues } from "../src/data/musicAtlas.js";
import artistContemporaryItaly from "../src/data/artistContemporaryItaly.js";

const errors = [];
const warnings = [];
const seenIds = new Map();
const seenIdentities = new Map();
const seenPreviews = new Map();
const required = ["id", "artist", "title", "year", "genre"];
const normalize = (value) => String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase();
const normalizeTaxonomyLabel = (value) => normalize(value).replace(/[\s'’-]+/g, "");
// Contenitori che nel catalogo distribuiscono le proprie tracce fra più sottogeneri.
// Le categorie musicali specifiche possono invece coincidere legittimamente nei due campi.
const GENERIC_GENRES_REQUIRING_SPECIFIC_SUBGENRE = new Set([
  "Electronic", "House", "Indie", "Hip Hop", "Rock", "Dance", "Funk",
].map(normalizeTaxonomyLabel));
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
  const normalizedGenre = normalizeTaxonomyLabel(track.genre);
  if (track.subgenre && GENERIC_GENRES_REQUIRING_SPECIFIC_SUBGENRE.has(normalizedGenre) && normalizedGenre === normalizeTaxonomyLabel(track.subgenre)) {
    errors.push(`ID ${track.id}: macrogenere generico richiede un sottogenere specifico (${track.genre} — ${track.artist} — ${track.title})`);
  }
  if (!essentialPlaylists[track.essentialPlaylist]) errors.push(`ID ${track.id}: playlist essenziale inesistente ${track.essentialPlaylist}`);
  for (const [provider, url] of Object.entries(track.links ?? {})) if (!validUrl(url)) errors.push(`ID ${track.id}: link ${provider} malformato`);
  if (track.appleMatchStatus === "verified" && (!track.applePreviewUrl?.startsWith("https://") || !track.previewValidated)) errors.push(`ID ${track.id}: verified senza preview Apple HTTPS validata`);
  if (track.applePreviewUrl) {
    const previous = seenPreviews.get(track.applePreviewUrl);
    if (previous && previous !== track.id) errors.push(`Preview duplicata per ID ${previous} e ${track.id}`); else seenPreviews.set(track.applePreviewUrl, track.id);
  }
  const editorialPending = track.editorialStatus === "needs-regeneration";
  if (!track.scenario || !track.meaning || !track.influences.length) {
    warnings.push(`ID ${track.id}: contenuti editoriali ${editorialPending ? "da rigenerare" : "incompleti"}`);
  }
  if ((!track.musicalCharacteristics || !track.meaning) && !editorialPending) errors.push(`ID ${track.id}: revisione editoriale v2 incompleta`);
  if (track.id >= 301) {
    for (const field of ["subgenre", "curiosity", "meaning", "scenario", "essentialPlaylist", "artistId", "genreId"]) {
      if (!track[field]) errors.push(`ID ${track.id}: campo editoriale ${field} mancante`);
    }
    if (!track.influences.length || !track.similarArtists.length) errors.push(`ID ${track.id}: influenze o artisti simili mancanti`);
    if (!track.artwork && !track.cover) warnings.push(`ID ${track.id}: copertina non disponibile da un match verificato`);
  }
}

const artistIds = new Set(artists.map((artist) => artist.id));
const trackIds = new Set(tracks.map((track) => track.id));
const cityIds = new Set(musicAtlasCities.map((city) => city.id));
const venueIds = new Set(musicAtlasVenues.map((venue) => venue.id));
for (const city of musicAtlasCities) {
  const cityVenues = musicAtlasVenues.filter((venue) => venue.cityId === city.id);
  if (!(city.artistIds?.length || city.trackIds?.length || cityVenues.length)) warnings.push(`Atlante: città definita senza collegamenti ${city.name}`);
  for (const artistId of city.artistIds) if (!artistIds.has(artistId)) errors.push(`Città ${city.id}: artista inesistente ${artistId}`);
  for (const trackId of city.trackIds) if (!trackIds.has(trackId)) errors.push(`Città ${city.id}: brano inesistente ${trackId}`);
}

for (const artist of artists) {
  const words = artist.biography.trim().split(/\s+/).length;
  if (words < 50 || words > 600) errors.push(`Artista ${artist.name}: biografia di ${words} parole`);
  for (const cityId of artist.cityIds ?? []) {
    const city = musicAtlasCities.find((item) => item.id === cityId);
    if (!cityIds.has(cityId) || !city?.artistIds.includes(artist.id)) errors.push(`Artista ${artist.name}: collegamento città non bidirezionale ${cityId}`);
  }
}

const biographyBoilerplate = [
  /compare nella storia della musica registrata/i,
  /con un percorso legato all(?:'|’)area/i,
  /riconoscibile per scrittura, interpretazione e produzione/i,
  /documenta la documentazione/i,
  /appartiene alla storia di musica popolare registrata/i,
  /la scheda (?:privilegia|documenta|presenta)/i,
  /senza attribuire intenzioni non dichiarate/i,
];
const editorialStopwords = new Set("a ad al all alla alle allo anche ancora attorno che chi come con da dal dall dalla dell delle degli dello di e ed era fra gli ha hanno il in inizio la le lo ma nel nell nella nello non o per piu quale quando questa questo si sia sono su sul tra un una uno fine musica musicale musicista musicisti gruppo artista band progetto album brano canzone voce chitarra suono scena anni esperienze provenienti".split(" "));
const biographyTokens = (value) => normalize(value).split(/\s+/).filter(Boolean);
const meaningfulSequence = (tokens) => tokens.filter((token) => token.length > 3 && !editorialStopwords.has(token)).length >= 6;
const normalizedBiography = (artist) => {
  let value = normalize(artist.biography).replace(/\b(?:18|19|20)\d{2}\b/g, " anno ");
  const replaceable = [artist.name, artist.nationality, artist.country, ...(artist.genres ?? []), ...(artist.subgenres ?? [])]
    .map(normalize).filter((item) => item.length >= 4).sort((a, b) => b.length - a.length);
  for (const item of replaceable) value = value.replace(new RegExp(`\\b${item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), " entita ");
  return value.replace(/\s+/g, " ").trim();
};
const biographyIssue = (left, right, type, excerpt) => `${left.name} | ${right.name} | ${type} | ${excerpt}`;
const biographyByExactText = new Map();
const biographyByNormalizedText = new Map();
const sequenceOwners = new Map();
const biographyProfiles = [];

for (const artist of artists) {
  for (const pattern of biographyBoilerplate) {
    const match = artist.biography.match(pattern);
    if (match) errors.push(`${artist.name} | ${artist.name} | BOILERPLATE VIETATO | ${match[0]}`);
  }
  const exact = normalize(artist.biography);
  const previousExact = biographyByExactText.get(exact);
  if (previousExact) errors.push(biographyIssue(previousExact, artist, "BIOGRAFIA DUPLICATA", artist.biography.slice(0, 140)));
  else biographyByExactText.set(exact, artist);

  const templateText = normalizedBiography(artist);
  const previousTemplate = biographyByNormalizedText.get(templateText);
  if (previousTemplate) errors.push(biographyIssue(previousTemplate, artist, "TEMPLATE NORMALIZZATO", templateText.slice(0, 140)));
  else biographyByNormalizedText.set(templateText, artist);

  const grams = new Set();
  for (const sentence of String(artist.biography).match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []) {
    const sentenceTokens = biographyTokens(sentence);
    for (let index = 0; index <= sentenceTokens.length - 8; index += 1) {
      const gramTokens = sentenceTokens.slice(index, index + 8);
      if (meaningfulSequence(gramTokens)) grams.add(gramTokens.join(" "));
    }
  }
  for (const gram of grams) {
    const owners = sequenceOwners.get(gram) ?? [];
    owners.push(artist);
    sequenceOwners.set(gram, owners);
  }
  const tokens = biographyTokens(artist.biography);
  const trigrams = new Set();
  for (let index = 0; index <= tokens.length - 3; index += 1) trigrams.add(tokens.slice(index, index + 3).join(" "));
  biographyProfiles.push({ artist, trigrams });
}

for (const [sequence, owners] of sequenceOwners) {
  if (owners.length < 2 || owners.length > 5) continue;
  for (let index = 1; index < owners.length; index += 1) errors.push(biographyIssue(owners[0], owners[index], "SEQUENZA CONDIVISA >=8 PAROLE", sequence));
}

for (let leftIndex = 0; leftIndex < biographyProfiles.length; leftIndex += 1) {
  const left = biographyProfiles[leftIndex];
  for (let rightIndex = leftIndex + 1; rightIndex < biographyProfiles.length; rightIndex += 1) {
    const right = biographyProfiles[rightIndex];
    const smaller = left.trigrams.size <= right.trigrams.size ? left.trigrams : right.trigrams;
    const larger = smaller === left.trigrams ? right.trigrams : left.trigrams;
    let intersection = 0;
    for (const gram of smaller) if (larger.has(gram)) intersection += 1;
    const union = left.trigrams.size + right.trigrams.size - intersection;
    if (union && intersection / union >= 0.82) errors.push(biographyIssue(left.artist, right.artist, "SIMILARITÀ TESTUALE ELEVATA", `Jaccard trigrammi ${(intersection / union).toFixed(3)}`));
  }
}
for (const [name, metadata] of Object.entries(artistContemporaryItaly)) {
  const artist = artists.find((item) => item.name === name);
  if (!artist) {
    errors.push(`Scena italiana: scheda artista mancante per ${name}`);
    continue;
  }
  if (artist.slug !== metadata.slug) errors.push(`Scena italiana: slug non indicizzato per ${name}`);
  if (!cityIds.has(metadata.cityId) || !artist.cityIds.includes(metadata.cityId)) errors.push(`Scena italiana: città non collegata per ${name}`);
  for (const genre of metadata.genres) if (!genres.some((item) => item.name === genre)) errors.push(`Scena italiana: genere orfano ${genre} per ${name}`);
  for (const relatedName of metadata.relatedArtists) if (!artists.some((item) => item.name === relatedName)) errors.push(`Scena italiana: artista correlato orfano ${relatedName} per ${name}`);
  for (const influencedName of metadata.influenced) if (!artists.some((item) => item.name === influencedName)) errors.push(`Scena italiana: artista influenzato orfano ${influencedName} per ${name}`);
  for (const venueId of metadata.venueIds) {
    const venue = musicAtlasVenues.find((item) => item.id === venueId);
    if (!venueIds.has(venueId) || !venue?.artistNames.includes(name)) errors.push(`Scena italiana: luogo non bidirezionale ${venueId} per ${name}`);
  }
  for (const albumTitle of metadata.fundamentalAlbums) if (!albums.some((album) => album.artist === name && album.title === albumTitle)) warnings.push(`Scena italiana: album fondamentale non presente nei brani (${name} — ${albumTitle})`);
  for (const trackTitle of metadata.recommendedTracks) if (!tracks.some((track) => track.artist === name && track.title === trackTitle)) warnings.push(`Scena italiana: brano consigliato non presente nel catalogo (${name} — ${trackTitle})`);
}
const curatedPlaylistIds = new Set(["Rock", "Classic Rock", "Psychedelic Rock", "Progressive Rock", "Hard Rock", "Blues Rock", "Glam Rock", "Arena Rock", "J-Pop", "Shibuya-kei"]);
const normalizedEssentialNames = new Map();
const essentialIds = new Map();
const essentialTracklists = new Map();
for (const playlist of Object.values(essentialPlaylists)) {
  const normalizedName = normalize(playlist.label.replace(/^Essenziali:\s*/i, ""));
  const previousName = normalizedEssentialNames.get(normalizedName);
  if (previousName) errors.push(`Essentials con nome duplicato: ${previousName.label} | ${playlist.label}`);
  else normalizedEssentialNames.set(normalizedName, playlist);

  const normalizedId = normalize(playlist.id);
  const previousId = essentialIds.get(normalizedId);
  if (previousId) errors.push(`Essentials con ID duplicato: ${previousId.id} | ${playlist.id}`);
  else essentialIds.set(normalizedId, playlist);

  const canonicalTracklist = [...new Set(playlist.trackIds ?? [])].sort((left, right) => left - right).join(",");
  if (canonicalTracklist) {
    const previousTracklist = essentialTracklists.get(canonicalTracklist);
    if (previousTracklist) errors.push(`Essentials con tracklist identica: ${previousTracklist.id} | ${playlist.id}`);
    else essentialTracklists.set(canonicalTracklist, playlist);
  }

  for (const trackId of playlist.trackIds ?? []) if (!trackIds.has(trackId)) errors.push(`Playlist ${playlist.id}: brano inesistente ${trackId}`);
  if (curatedPlaylistIds.has(playlist.id) && (playlist.trackIds.length < 12 || playlist.trackIds.length > 20)) errors.push(`Playlist ${playlist.id}: deve contenere 12–20 brani`);
}

const moduleDirectory = path.resolve("src/data/tracks");
const files = (await readdir(moduleDirectory)).filter((file) => file.endsWith(".js") && file !== "index.js").map((file) => file.replace(/\.js$/, ""));
for (const file of files) if (!Object.hasOwn(trackModules, file)) errors.push(`Modulo ${file}.js non incluso nell'aggregatore`);
for (const moduleName of Object.keys(trackModules)) if (!files.includes(moduleName)) errors.push(`Aggregatore riferisce il modulo inesistente ${moduleName}.js`);
if (Object.values(trackModules).flat().length !== tracks.length) errors.push("Il totale dei moduli non coincide con il catalogo aggregato");
for (const track of tracks) {
  if (!artists.some((artist) => artist.id === track.artistId)) errors.push(`ID ${track.id}: scheda artista mancante`);
  if (track.album && !albums.some((album) => album.id === track.albumId)) errors.push(`ID ${track.id}: scheda album mancante`);
  if (!genres.some((genre) => genre.id === track.genreId)) errors.push(`ID ${track.id}: scheda genere mancante`);
}

console.log(JSON.stringify({ tracks: tracks.length, artists: artists.length, albums: albums.length, genres: genres.length, modules: files.length, errors: errors.length, warnings: warnings.length }, null, 2));
if (warnings.length) console.warn(warnings.slice(0, 20).join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
}
