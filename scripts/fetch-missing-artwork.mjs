import { writeFile } from "node:fs/promises";
import path from "node:path";

import tracks from "../src/data/questions.js";
import metadata from "../src/data/apple-preview-metadata.js";
import { essentialPlaylists } from "../src/data/libraryConfig.js";
import { appleArtistsMatch } from "../src/lib/appleMusicValidation.js";

const output = path.resolve("src/data/apple-preview-metadata.js");
const reportOutput = path.resolve("artwork-enrichment-report.json");
const countries = ["IT", "US", "JP", "GB"];
const diagnosticIds = new Set([317, 319, 326, 340, 417, 459, 465, 506, 511, 565, 569, 683, 706, 719, 724, 810, 832, 921, 1086, 1113, 1772]);
const diagnosticMode = process.argv.includes("--diagnostic");
const verboseDiagnostic = process.argv.includes("--verbose");
const requestedIds = new Set((process.argv.find((argument) => argument.startsWith("--ids="))?.slice(6) ?? "")
  .split(",")
  .filter(Boolean)
  .map(Number)
  .filter(Number.isFinite));
const approvedArtworkAuditMode = process.argv.includes("--approved-artwork-audit");
const includeEditorialArtwork = process.argv.includes("--include-editorial");
const retryManualArtwork = process.argv.includes("--retry-manual");
const pass2Mode = process.argv.includes("--pass2");
const appleAlbumOnly = process.argv.includes("--apple-album-only");
const directMastersOnly = process.argv.includes("--direct-masters-only");
const manualArtworkIds = new Set([921, 1176, 1183, 1189, 1199, 1217, 1228, 1229, 1230, 1458, 1468, 1703, 1730, 1757]);
const musicBrainzUserAgent = "MusicRoots/1.0 (artwork audit; contact: local-development)";
const directDiscogsMasterByTrackId = new Map(Object.entries({
  16: [695, "Strings Of Life"],
  26: [1893120, "Together"],
  110: [5405, "No UFO's"],
  174: [20487, "Horizons"],
  724: [30129, "Doggystyle"],
  1176: [278976, "Ferry Cross The Mersey"],
  1217: [63446, "Kings Of The Wild Frontier"],
  1237: [53198, "Madchester Rave On"],
  1256: [249750, "Emozioni"],
  1275: [521913, "Paolo Conte"],
  1297: [363964, "Mina"],
  1314: [182111, "I Maschi"],
  1484: [965114, "Timely!!"],
  1492: [473998, "Cobalt Hour"],
  1495: [431087, "Kyōiku"],
  1508: [3719037, "834.194"],
  1617: [209416, "Amazing Grace"],
  1618: [209416, "Amazing Grace"],
  1629: [134010, "Honeysuckle Rose"],
  1680: [1181, "Undertow"],
  1723: [97135, "The Rhythm Of The Night"],
  1726: [98938, "Finally"],
  1729: [92381, "Hypnotica"],
  1752: [66263, "93 'Til Infinity"],
  1783: [620408, "Cupid Deluxe"],
}).map(([id, value]) => [Number(id), value]));

const normalize = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/gi, " ")
  .trim()
  .toLowerCase();

const editorialEditionWords = /\b(?:deluxe(?: edition)?|expanded(?: edition)?|remaster(?:ed)?(?: \d{4})?|\d{4} remaster|anniversary edition|\d+(?:st|nd|rd|th) anniversary(?: edition)?|reissue(?: \d{4})?|\d{4} reissue)\b/gi;
const releaseFormatWords = /\b(?:single|singolo|ep|album)\b/gi;
const incompatibleVersionWords = /\b(?:live|remix|acoustic|demo|radio edit|extended mix|tribute|karaoke|cover)\b/i;
const artistAliases = new Map([
  ["bohannon", "hamilton bohannon"],
  ["evelyn king", "evelyn king"],
  ["evelyn champagne king", "evelyn king"],
  ["jr walker", "junior walker"],
  ["snoop doggy dogg", "snoop dogg"],
]);

const stripEdition = (value) => normalize(value)
  .replace(editorialEditionWords, " ")
  .replace(releaseFormatWords, " ")
  .replace(/\b(?:edition|version)\b/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const mainArtist = (value) => String(value ?? "").split(/\s+(?:feat\.?|featuring|with|&|,\s*)\s+/i)[0];
const canonicalArtist = (value) => {
  const normalized = normalize(mainArtist(value)).replace(/\bthe\b/g, " ").replace(/\s+/g, " ").trim();
  return artistAliases.get(normalized) ?? normalized;
};
const artistsMatch = (expected, actual) =>
  appleArtistsMatch(expected, actual) ||
  appleArtistsMatch(mainArtist(expected), actual) ||
  canonicalArtist(expected) === canonicalArtist(actual);
const titlesMatch = (expected, actual) => {
  const left = normalize(expected);
  const right = normalize(actual).replace(/\b(feat|featuring|with)\b.*$/, "").trim();
  return left === right;
};
const albumsMatch = (expected, actual) => Boolean(expected && actual && stripEdition(expected) === stripEdition(actual));
const versionWords = (value) => new Set(normalize(value).match(/\b(live|remix|mix|edit|acoustic|instrumental|karaoke|demo|radio|mono|stereo|extended|tribute|cover)\b/g) ?? []);
const versionsCompatible = (expected, actual) => {
  const expectedWords = versionWords(expected);
  const actualWords = versionWords(actual);
  if (!expectedWords.size) return !actualWords.size;
  return [...expectedWords].every((word) => actualWords.has(word));
};
const yearCompatible = (expected, actual) => !expected || !actual || Math.abs(Number(expected) - Number(actual)) <= 1;
const releaseYear = (release) => Number(String(release?.date ?? release?.["release-group"]?.["first-release-date"] ?? "").slice(0, 4)) || null;
const isIncompatibleRelease = (value) => incompatibleVersionWords.test(String(value ?? ""));
const serialize = (values) => `const applePreviewMetadata = {\n${Object.entries(values)
  .sort(([left], [right]) => Number(left) - Number(right))
  .map(([id, value]) => `  ${id}: ${JSON.stringify(value)},`)
  .join("\n")}\n};\n\nexport default applePreviewMetadata;\n`;

async function getJson(url, headers = {}) {
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function searchApple(term, country, entity) {
  const params = new URLSearchParams({ term, country, media: "music", entity, limit: "50" });
  return (await getJson(`https://itunes.apple.com/search?${params}`))?.results ?? [];
}

function rejectReason(track, candidate) {
  if (!artistsMatch(track.artist, candidate.artistName)) return "artist-mismatch";
  if (!titlesMatch(track.title, candidate.trackName)) return "title-mismatch";
  if (!versionsCompatible(track.title, candidate.trackName)) return "version-mismatch";
  if (track.album && !albumsMatch(track.album, candidate.collectionName)) return "album-mismatch";
  return null;
}

async function findAppleArtwork(track, attempts) {
  for (const country of countries) {
    const songQueries = [`${track.artist} ${track.title} ${track.album ?? ""}`, `${mainArtist(track.artist)} ${track.title}`];
    for (const query of songQueries) {
      const candidates = await searchApple(query, country, "song");
      if (!candidates.length) attempts.push({ provider: `Apple ${country}`, query, result: "provider-no-result" });
      for (const candidate of candidates) {
        if (!candidate.artworkUrl100) continue;
        const reason = rejectReason(track, candidate);
        attempts.push({ provider: `Apple ${country}`, query, release: candidate.collectionName, result: reason ?? "accepted" });
        if (!reason) return { provider: "Apple", candidate, country, confidence: track.album ? "artist-title-album" : "artist-title", attempts };
      }
    }
  }
  return null;
}

const mbEscape = (value) => String(value ?? "").replace(/([+\-&|!(){}[\]^"~*?:\\/])/g, "\\$1");
async function searchMusicBrainz(track) {
  const query = [`recording:\"${mbEscape(track.title)}\"`, `artist:\"${mbEscape(mainArtist(track.artist))}\"`].join(" AND ");
  const params = new URLSearchParams({ query, fmt: "json", limit: "100" });
  const data = await getJson(`https://musicbrainz.org/ws/2/recording/?${params}`, { "User-Agent": musicBrainzUserAgent, Accept: "application/json" });
  return data?.recordings ?? [];
}

function evaluateMusicBrainzRelease(track, recording, release) {
  const credit = recording["artist-credit"]?.map((entry) => entry.name).join(" ") ?? "";
  if (!artistsMatch(track.artist, credit)) return "artist-mismatch";
  if (!titlesMatch(track.title, recording.title)) return "title-mismatch";
  if (!versionsCompatible(track.title, recording.title) || isIncompatibleRelease(release.title)) return "version-mismatch";
  const albumContext = track.album && albumsMatch(track.album, release.title);
  const singleContext = titlesMatch(track.title, release.title);
  if (track.album && !albumContext && !singleContext) return "album-mismatch";
  if (!yearCompatible(track.year, releaseYear(release))) return "album-mismatch";
  return null;
}

async function findMusicBrainzArtwork(track, attempts) {
  const recordings = await searchMusicBrainz(track);
  if (!recordings.length) {
    attempts.push({ provider: "MusicBrainz", query: `${track.artist} — ${track.title}`, result: "provider-no-result" });
    return null;
  }
  const releases = [];
  for (const recording of recordings) {
    for (const release of recording.releases ?? []) {
      const reason = evaluateMusicBrainzRelease(track, recording, release);
      attempts.push({ provider: "MusicBrainz", query: recording.id, release: release.title, mbid: release.id, result: reason ?? "candidate" });
      if (!reason) releases.push({ recording, release });
    }
  }
  // Una registrazione può elencare decine di ristampe della stessa pubblicazione.
  // Per l'artwork basta verificare una release rappresentativa per release-group.
  const unique = [...new Map(releases.map((item) => [item.release["release-group"]?.id ?? item.release.id, item])).values()]
    .sort((left, right) =>
      Number(Boolean(right.release.date)) - Number(Boolean(left.release.date)) ||
      Math.abs((releaseYear(left.release) ?? track.year) - track.year) - Math.abs((releaseYear(right.release) ?? track.year) - track.year)
    )
    .slice(0, 12);
  const covered = [];
  for (const item of unique) {
    const archive = await getJson(`https://coverartarchive.org/release/${item.release.id}`);
    const image = archive?.images?.find((candidate) => candidate.front) ?? archive?.images?.[0];
    if (!image?.image) {
      attempts.push({ provider: "Cover Art Archive", query: item.release.id, release: item.release.title, result: "no-cover-art" });
      continue;
    }
    attempts.push({ provider: "Cover Art Archive", query: item.release.id, release: item.release.title, result: "candidate" });
    covered.push({ ...item, image });
  }
  if (!covered.length) return null;
  const exactAlbum = covered.filter((item) => track.album && albumsMatch(track.album, item.release.title));
  const pool = exactAlbum.length ? exactAlbum : covered;
  const releaseGroups = new Set(pool.map((item) => item.release["release-group"]?.id ?? item.release.title));
  if (releaseGroups.size > 1) {
    attempts.push({ provider: "MusicBrainz", query: `${track.artist} — ${track.title}`, result: "ambiguous-release" });
    return { ambiguous: true, attempts };
  }
  const selected = pool.sort((left, right) => Number(Boolean(right.image.front)) - Number(Boolean(left.image.front)))[0];
  return {
    provider: "MusicBrainz / Cover Art Archive",
    artworkUrl: selected.image.image,
    release: selected.release.title,
    mbid: selected.release.id,
    confidence: "artist-title-release-year",
    attempts,
  };
}

const discogsReleaseTitle = (value) => String(value ?? "").replace(/\s*\((?:singolo|single|ep|album)\)\s*$/i, "").trim();
const discogsResultTitle = (value) => String(value ?? "").replace(/^.*?\s+-\s+/, "").trim();
async function findDiscogsArtwork(track, attempts) {
  const releaseTitle = discogsReleaseTitle(track.album) || track.title;
  const params = new URLSearchParams({ artist: mainArtist(track.artist), release_title: releaseTitle, type: "release", per_page: "100" });
  const data = await getJson(`https://api.discogs.com/database/search?${params}`, {
    "User-Agent": musicBrainzUserAgent,
    Accept: "application/json",
  });
  const results = data?.results ?? [];
  if (!results.length) {
    attempts.push({ provider: "Discogs", query: `${track.artist} — ${releaseTitle}`, result: "provider-no-result" });
    return null;
  }
  const candidates = results.filter((candidate) => {
    const formats = candidate.format ?? [];
    const releaseMatches = albumsMatch(releaseTitle, discogsResultTitle(candidate.title)) || titlesMatch(releaseTitle, discogsResultTitle(candidate.title));
    const candidateArtist = String(candidate.title ?? "").split(/\s+-\s+/)[0];
    const valid = artistsMatch(track.artist, candidateArtist) && releaseMatches &&
      yearCompatible(track.albumYear ?? track.year, candidate.year) &&
      !formats.some((format) => /compilation|unofficial|bootleg/i.test(format)) &&
      !isIncompatibleRelease(candidate.title);
    attempts.push({ provider: "Discogs", query: candidate.id, release: candidate.title, result: valid ? "candidate" : "album-mismatch" });
    return valid;
  });
  if (!candidates.length) return null;
  const workKeys = new Set(candidates.map((candidate) => candidate.master_id || normalize(discogsResultTitle(candidate.title))));
  if (workKeys.size > 1) {
    attempts.push({ provider: "Discogs", query: `${track.artist} — ${releaseTitle}`, result: "ambiguous-release" });
    return { ambiguous: true, attempts };
  }
  const selected = candidates.sort((left, right) =>
    Number(Boolean(right.master_id)) - Number(Boolean(left.master_id)) ||
    Math.abs(Number(left.year || track.year) - Number(track.albumYear ?? track.year)) - Math.abs(Number(right.year || track.year) - Number(track.albumYear ?? track.year))
  )[0];
  const imageSource = selected.master_id
    ? await getJson(`https://api.discogs.com/masters/${selected.master_id}`, { "User-Agent": musicBrainzUserAgent, Accept: "application/json" })
    : await getJson(`https://api.discogs.com/releases/${selected.id}`, { "User-Agent": musicBrainzUserAgent, Accept: "application/json" });
  const image = imageSource?.images?.find((candidate) => candidate.type === "primary") ?? imageSource?.images?.[0];
  if (!image?.uri) {
    attempts.push({ provider: "Discogs", query: selected.master_id || selected.id, release: selected.title, result: "no-cover-art" });
    return null;
  }
  return {
    provider: "Discogs",
    artworkUrl: image.uri,
    release: discogsResultTitle(selected.title),
    discogsReleaseId: selected.id,
    confidence: "artist-release-year",
    attempts,
  };
}

const releaseCandidates = (track) => [...new Set([
  discogsReleaseTitle(track.title),
  discogsReleaseTitle(track.album),
].filter(Boolean))];

async function findDiscogsMasterArtwork(track, attempts) {
  for (const releaseTitle of releaseCandidates(track)) {
    const params = new URLSearchParams({ q: `${mainArtist(track.artist)} ${releaseTitle}`, type: "master", per_page: "50" });
    const results = (await getJson(`https://api.discogs.com/database/search?${params}`, {
      "User-Agent": musicBrainzUserAgent,
      Accept: "application/json",
    }))?.results ?? [];
    const candidates = results.filter((candidate) => {
      const candidateArtist = String(candidate.title ?? "").split(/\s+-\s+/)[0];
      const candidateRelease = discogsResultTitle(candidate.title);
      const valid = artistsMatch(track.artist, candidateArtist) &&
        (albumsMatch(releaseTitle, candidateRelease) || titlesMatch(releaseTitle, candidateRelease)) &&
        !isIncompatibleRelease(candidate.title);
      attempts.push({ provider: "Discogs master", query: candidate.id, release: candidate.title, result: valid ? "candidate" : "release-mismatch" });
      return valid;
    });
    if (!candidates.length) continue;
    const workKeys = new Set(candidates.map((candidate) => candidate.master_id || candidate.id));
    if (workKeys.size > 1) {
      attempts.push({ provider: "Discogs master", query: `${track.artist} — ${releaseTitle}`, result: "ambiguous-release" });
      continue;
    }
    const selected = candidates[0];
    const masterId = selected.master_id || selected.id;
    const master = await getJson(`https://api.discogs.com/masters/${masterId}`, { "User-Agent": musicBrainzUserAgent, Accept: "application/json" });
    const image = master?.images?.find((candidate) => candidate.type === "primary") ?? master?.images?.[0];
    if (image?.uri) return { provider: "Discogs master", artworkUrl: image.uri, release: discogsResultTitle(selected.title), discogsReleaseId: masterId, confidence: "artist-master-release", attempts };
  }
  return null;
}

async function findDirectDiscogsMasterArtwork(track, attempts) {
  const direct = directDiscogsMasterByTrackId.get(Number(track.id));
  if (!direct) return null;
  const [masterId, verifiedRelease] = direct;
  const master = await getJson(`https://api.discogs.com/masters/${masterId}`, { "User-Agent": musicBrainzUserAgent, Accept: "application/json" });
  const image = master?.images?.find((candidate) => candidate.type === "primary") ?? master?.images?.[0];
  attempts.push({ provider: "Discogs master diretto", query: masterId, release: master?.title ?? verifiedRelease, result: image?.uri ? "candidate" : "no-cover-art" });
  if (!image?.uri) return null;
  return { provider: "Discogs master diretto", artworkUrl: image.uri, release: verifiedRelease, discogsReleaseId: masterId, confidence: "verified-direct-master", attempts };
}

async function findMusicBrainzReleaseGroupArtwork(track, attempts) {
  for (const releaseTitle of releaseCandidates(track)) {
    const query = [`release:\"${mbEscape(releaseTitle)}\"`, `artist:\"${mbEscape(mainArtist(track.artist))}\"`].join(" AND ");
    const params = new URLSearchParams({ query, fmt: "json", limit: "50" });
    const groups = (await getJson(`https://musicbrainz.org/ws/2/release-group/?${params}`, { "User-Agent": musicBrainzUserAgent, Accept: "application/json" }))?.["release-groups"] ?? [];
    const candidates = groups.filter((group) => {
      const credit = group["artist-credit"]?.map((entry) => entry.name).join(" ") ?? "";
      const valid = artistsMatch(track.artist, credit) && (albumsMatch(releaseTitle, group.title) || titlesMatch(releaseTitle, group.title)) && !isIncompatibleRelease(group.title);
      attempts.push({ provider: "MusicBrainz release-group", query: group.id, release: group.title, result: valid ? "candidate" : "release-mismatch" });
      return valid;
    });
    if (!candidates.length) continue;
    const uniqueIds = new Set(candidates.map((candidate) => candidate.id));
    if (uniqueIds.size > 1) continue;
    const selected = candidates[0];
    const archive = await getJson(`https://coverartarchive.org/release-group/${selected.id}`);
    const image = archive?.images?.find((candidate) => candidate.front) ?? archive?.images?.[0];
    if (image?.image) return { provider: "MusicBrainz / Cover Art Archive", artworkUrl: image.image, release: selected.title, mbid: selected.id, confidence: "artist-release-group", attempts };
  }
  return null;
}

async function findAppleAlbumArtwork(track, attempts) {
  for (const releaseTitle of releaseCandidates(track)) {
    for (const country of countries) {
      const query = `${mainArtist(track.artist)} ${releaseTitle}`;
      const candidates = await searchApple(query, country, "album");
      const accepted = candidates.filter((candidate) => {
        const valid = artistsMatch(track.artist, candidate.artistName) && albumsMatch(releaseTitle, candidate.collectionName) && Boolean(candidate.artworkUrl100);
        attempts.push({ provider: `Apple album ${country}`, query, release: candidate.collectionName, result: valid ? "candidate" : "release-mismatch" });
        return valid;
      });
      const works = new Set(accepted.map((candidate) => stripEdition(candidate.collectionName)));
      if (accepted.length && works.size === 1) {
        const selected = accepted.sort((left, right) =>
          Math.abs((Number(String(left.releaseDate ?? "").slice(0, 4)) || track.year) - track.year) -
          Math.abs((Number(String(right.releaseDate ?? "").slice(0, 4)) || track.year) - track.year)
        )[0];
        return { provider: "Apple album", candidate: selected, country, confidence: "artist-album-release", attempts };
      }
    }
  }
  return null;
}

async function findArtworkPass2(track) {
  const attempts = [];
  if (appleAlbumOnly) {
    const apple = await findAppleAlbumArtwork(track, attempts);
    return apple ?? { rejected: true, attempts };
  }
  const directDiscogs = await findDirectDiscogsMasterArtwork(track, attempts);
  if (directDiscogs) return directDiscogs;
  if (directMastersOnly) return { rejected: true, attempts };
  const discogs = await findDiscogsMasterArtwork(track, attempts);
  if (discogs) return discogs;
  const musicBrainz = await findMusicBrainzReleaseGroupArtwork(track, attempts);
  if (musicBrainz) return musicBrainz;
  const apple = await findAppleAlbumArtwork(track, attempts);
  if (apple) return apple;
  return { rejected: true, attempts };
}

async function findArtwork(track) {
  const attempts = [];
  const apple = await findAppleArtwork(track, attempts);
  if (apple) return apple;
  const musicBrainz = await findMusicBrainzArtwork(track, attempts);
  if (musicBrainz) return musicBrainz;
  if (approvedArtworkAuditMode) {
    const discogs = await findDiscogsArtwork(track, attempts);
    if (discogs) return discogs;
  }
  return { rejected: true, attempts };
}

const essentialTrackIds = new Set(Object.values(essentialPlaylists).flatMap((playlist) => playlist.trackIds ?? []));
const artworkPriority = (track) => essentialTrackIds.has(track.id)
  ? 0
  : track.id >= 1781
    ? 1
    : ["Beat Italiano", "British Beat"].includes(track.subgenre)
      ? 2
      : 3;
const selectedTracks = (approvedArtworkAuditMode
  ? tracks.filter((track) => (!track.artwork || (includeEditorialArtwork && track.artworkType !== "official")) && (retryManualArtwork || !manualArtworkIds.has(Number(track.id))) && (!requestedIds.size || requestedIds.has(Number(track.id))))
  : requestedIds.size
  ? tracks.filter((track) => requestedIds.has(Number(track.id)) && !track.artwork)
  : diagnosticMode
    ? tracks.filter((track) => diagnosticIds.has(Number(track.id)))
    : tracks.filter((track) => !track.artwork))
  .sort((left, right) => artworkPriority(left) - artworkPriority(right) || left.id - right.id);
const report = { before: selectedTracks.length, recovered: [], fallbackRequired: [] };

for (const [index, track] of selectedTracks.entries()) {
  const match = pass2Mode ? await findArtworkPass2(track) : await findArtwork(track);
  const strong = match && !match.ambiguous && !match.rejected;
  const status = strong ? "FORTE" : match?.ambiguous ? "AMBIGUO" : "RIFIUTATO";
  const artworkUrl = match?.candidate?.artworkUrl100 ?? match?.artworkUrl ?? "";
  const release = match?.candidate?.collectionName ?? match?.release ?? "";
  if (strong) {
    report.recovered.push({ id: track.id, artist: track.artist, title: track.title, provider: match.provider, release, artworkUrl, confidence: match.confidence, attempts: match.attempts });
    if (!diagnosticMode) {
      metadata[track.id] = {
        ...metadata[track.id],
        appleArtworkUrl: artworkUrl,
        artworkProvider: match.provider,
        artworkSourceRelease: release,
        artworkSourceMbid: match.mbid ?? null,
        artworkSourceDiscogsId: match.discogsReleaseId ?? null,
        artworkMatchConfidence: match.confidence,
        artworkMatchCountry: match.country ?? null,
      };
    }
  } else {
    report.fallbackRequired.push({ id: track.id, artist: track.artist, title: track.title, status, attempts: match?.attempts ?? [] });
  }
  console.log(`[${index + 1}/${selectedTracks.length}] ${track.artist} — ${track.title} | ${match?.provider ?? "nessuno"} | ${release || "—"} | ${status} | ${artworkUrl || "—"}`);
  if (diagnosticMode && verboseDiagnostic) console.log(JSON.stringify(match?.attempts ?? [], null, 2));
}

if (!diagnosticMode) {
  await writeFile(output, serialize(metadata), "utf8");
  if (!requestedIds.size) await writeFile(reportOutput, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
console.log(`${diagnosticMode ? "Diagnostic" : "Recovered"} ${report.recovered.length}/${report.before}; fallback-required ${report.fallbackRequired.length}.`);
