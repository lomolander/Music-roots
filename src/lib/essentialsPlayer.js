const REMOVABLE_VERSION = /\b(remaster(?:ed)?(?:\s+\d{2,4})?|radio edit|single version|extended version)\b/gi;
const UNSAFE_VERSION = /\b(instrumental|karaoke|tribute|cover|live|remix|sped[ -]?up|slowed)\b/i;

export const validPreview = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
};

export const normalizePreviewLookup = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\b(?:feat(?:uring)?|ft)\.?\s+.*$/gi, " ")
  .replace(/[([][^)\]]*\b(remaster(?:ed)?|radio edit|single version|extended version)\b[^)\]]*[)\]]/gi, " ")
  .replace(REMOVABLE_VERSION, " ")
  .replace(/[()[\]]/g, " ")
  .replace(/[–—-]+/g, " ")
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9\s]/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

export const previewSearchTerm = (track) => [track?.title, track?.artist, track?.album]
  .map(normalizePreviewLookup)
  .filter(Boolean)
  .join(" ");

export const previewSearchQueries = (track) => {
  const title = normalizePreviewLookup(track?.title);
  const artist = normalizePreviewLookup(track?.artist);
  const album = normalizePreviewLookup(track?.album);
  return {
    deezer: [title && `track:"${title}"`, artist && `artist:"${artist}"`, album && `album:"${album}"`].filter(Boolean).join(" "),
    apple: [title, artist, album].filter(Boolean).join(" "),
  };
};

const artistParts = (value) => normalizePreviewLookup(value)
  .split(/\s+(?:and|feat(?:uring)?|ft|x)\s+/)
  .map((part) => part.replace(/^the\s+/, "").trim())
  .filter(Boolean);

export const previewArtistsMatch = (expected, actual) => {
  const left = artistParts(expected);
  const right = artistParts(actual);
  return left.length > 0 && left.every((part) => right.some((candidate) => candidate === part || candidate.includes(part) || part.includes(candidate)));
};

export const previewResultMatches = (track, result) => {
  const expectedTitle = normalizePreviewLookup(track?.title);
  const resultTitle = normalizePreviewLookup(result?.title);
  if (!expectedTitle || expectedTitle !== resultTitle) return false;
  if (!previewArtistsMatch(track?.artist, result?.artist)) return false;
  const rawCandidate = `${result?.title ?? ""} ${result?.album ?? ""}`;
  const rawExpected = `${track?.title ?? ""} ${track?.album ?? ""}`;
  if (UNSAFE_VERSION.test(rawCandidate) && !UNSAFE_VERSION.test(rawExpected)) return false;
  return true;
};

const rankResult = (track, result) => {
  let score = 0;
  if (normalizePreviewLookup(track?.album) && normalizePreviewLookup(track?.album) === normalizePreviewLookup(result?.album)) score += 6;
  if (normalizePreviewLookup(track?.artist) === normalizePreviewLookup(result?.artist)) score += 4;
  if (!REMOVABLE_VERSION.test(`${result?.title ?? ""} ${result?.album ?? ""}`)) score += 1;
  REMOVABLE_VERSION.lastIndex = 0;
  return score;
};

export const choosePreviewResult = (track, results) => (results ?? [])
  .filter((result) => validPreview(result.previewUrl) && previewResultMatches(track, result))
  .sort((left, right) => rankResult(track, right) - rankResult(track, left))[0] ?? null;

const storedSource = (track, key) => {
  if (key === "deezer" && validPreview(track?.deezer?.previewUrl)) {
    return {
      id: track.deezer.trackId ?? null,
      title: track.deezer.trackName ?? track.title,
      artist: track.deezer.artistName ?? track.artist,
      album: track.deezer.albumName ?? track.album,
      previewUrl: track.deezer.previewUrl,
    };
  }
  const appleUrl = track?.preview || (track?.appleMatchStatus === "verified" ? track.applePreviewUrl : "");
  if (key === "apple" && validPreview(appleUrl) && (track?.appleMatchStatus === "verified" || track?.previewValidated === true || (!track?.appleMatchStatus && track?.preview))) {
    return {
      id: track.appleTrackId ?? null,
      title: track.appleTrackName ?? track.title,
      artist: track.appleArtistName ?? track.artist,
      album: track.appleCollectionName ?? track.album,
      previewUrl: appleUrl,
    };
  }
  return null;
};

const fetchJson = async (url, fetchImpl) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

export async function resolvePreviewSource(track, key, fetchImpl = fetch) {
  const queries = previewSearchQueries(track);
  let results = [];
  let searchError = null;
  try {
    if (key === "deezer") {
      const url = `https://api.deezer.com/search?q=${encodeURIComponent(queries.deezer)}&limit=25`;
      const payload = await fetchJson(url, fetchImpl);
      results = (payload.data ?? []).map((item) => ({ id: item.id, title: item.title, artist: item.artist?.name, album: item.album?.title, previewUrl: item.preview }));
    } else {
      const params = new URLSearchParams({ term: queries.apple, country: "IT", media: "music", entity: "song", limit: "25" });
      const payload = await fetchJson(`https://itunes.apple.com/search?${params}`, fetchImpl);
      results = (payload.results ?? []).map((item) => ({ id: item.trackId, title: item.trackName, artist: item.artistName, album: item.collectionName, previewUrl: item.previewUrl }));
    }
  } catch (error) {
    searchError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }

  const remoteMatch = choosePreviewResult(track, results);
  const stored = storedSource(track, key);
  const chosen = remoteMatch ?? (stored && previewResultMatches(track, stored) ? stored : null);
  const rejected = results.filter((result) => validPreview(result.previewUrl) && !previewResultMatches(track, result));
  return {
    key,
    source: key === "deezer" ? "Deezer" : "Apple Music",
    query: queries[key],
    result: chosen,
    url: chosen?.previewUrl ?? "",
    rejected,
    searchError,
    usedStoredResult: Boolean(!remoteMatch && chosen),
  };
}

export const previewSources = (track) => {
  if (!track) return [];
  return ["deezer", "apple"].map((key) => {
    const result = storedSource(track, key);
    return result ? { key, url: result.previewUrl, source: key === "deezer" ? "Deezer" : "Apple Music" } : null;
  }).filter(Boolean);
};

export const essentialPreviewStatus = (track) => {
  const deezerValid = validPreview(track?.deezer?.previewUrl) && (
    track?.deezer?.previewValidated === true ||
    track?.deezer?.status === "verified" ||
    track?.deezer?.previewValidationStatus === "verified"
  );
  if (deezerValid) return { playable: true, source: "Deezer", reason: "" };
  const appleUrl = track?.preview || track?.applePreviewUrl;
  const appleValid = validPreview(appleUrl) && (
    track?.previewValidated === true ||
    track?.appleMatchStatus === "verified" ||
    track?.previewValidationStatus === "verified"
  );
  if (appleValid) return { playable: true, source: "Apple Music", reason: "" };
  return { playable: false, source: null, reason: "assenza di preview valida su Deezer e Apple Music" };
};

export const isEssentialPlayable = (track) => essentialPreviewStatus(track).playable;

const essentialValidationCache = new Map();

export function validateAudioPreview(url, { AudioConstructor = globalThis.Audio, timeoutMs = 5_000 } = {}) {
  if (!validPreview(url)) return Promise.resolve({ valid: false, reason: "URL vuoto o non valido" });
  if (typeof AudioConstructor !== "function") return Promise.resolve({ valid: false, reason: "Audio API non disponibile" });
  return new Promise((resolve) => {
    const audio = new AudioConstructor();
    let settled = false;
    const finish = (valid, reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      ["loadedmetadata", "canplay", "canplaythrough", "error", "stalled", "abort"].forEach((event) => audio.removeEventListener(event, handlers[event]));
      try { audio.pause(); } catch { /* Oggetto di validazione già chiuso. */ }
      audio.removeAttribute?.("src");
      resolve({ valid, reason, duration: Number.isFinite(audio.duration) ? audio.duration : 0 });
    };
    const playable = () => {
      const duration = Number(audio.duration);
      if (Number.isFinite(duration) && duration > 0) finish(true, "preview caricabile");
      else if (audio.readyState >= 1) finish(false, "durata uguale a 0 o non valida");
    };
    const handlers = {
      loadedmetadata: playable,
      canplay: playable,
      canplaythrough: playable,
      error: () => finish(false, `error${audio.error?.code ? ` codice ${audio.error.code}` : ""}`),
      stalled: () => finish(false, "stalled"),
      abort: () => finish(false, "abort"),
    };
    Object.entries(handlers).forEach(([event, handler]) => audio.addEventListener(event, handler));
    const timer = setTimeout(() => finish(false, "timeout dopo 5 secondi"), timeoutMs);
    audio.preload = "metadata";
    audio.src = url;
    try { audio.load(); } catch (error) { finish(false, `load exception: ${error instanceof Error ? error.message : String(error)}`); }
  });
}

export function validateEssentialTrack(track, options = {}) {
  const cacheKey = String(track?.id ?? `${track?.artist}\u0000${track?.title}`);
  if (!options.force && essentialValidationCache.has(cacheKey)) return essentialValidationCache.get(cacheKey);
  const validation = (async () => {
    const attempts = [];
    for (const key of ["deezer", "apple"]) {
      const resolved = await resolvePreviewSource(track, key, options.fetchImpl ?? globalThis.fetch);
      const audioTest = resolved.url
        ? await validateAudioPreview(resolved.url, options)
        : { valid: false, reason: resolved.searchError || "preview non trovata", duration: 0 };
      attempts.push({ key, source: resolved.source, url: resolved.url, result: resolved.result, audioTest, rejected: resolved.rejected });
      console.info("[Playlist Essentials] Verifica reale", {
        titolo: track.title,
        artista: track.artist,
        fonte: resolved.source,
        previewTrovata: resolved.url,
        esitoTest: audioTest.valid ? "valida" : "non valida",
        motivo: audioTest.reason,
      });
      if (audioTest.valid) {
        const result = { playable: true, key, source: resolved.source, url: resolved.url, attempts, reason: "" };
        console.info("[Playlist Essentials] Brano mantenuto", { titolo: track.title, artista: track.artist, fonte: resolved.source });
        return result;
      }
    }
    const reason = attempts.map((attempt) => `${attempt.source}: ${attempt.audioTest.reason}`).join("; ");
    console.warn("[Playlist Essentials] Brano rimosso", { titolo: track.title, artista: track.artist, motivo: reason });
    return { playable: false, key: null, source: null, url: "", attempts, reason };
  })();
  essentialValidationCache.set(cacheKey, validation);
  return validation;
}

export async function prepareEssentialPlaylist(tracks, options = {}) {
  const results = new Array(tracks.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < tracks.length) {
      const position = cursor++;
      const validation = await validateEssentialTrack(tracks[position], options);
      results[position] = validation.playable ? { ...tracks[position], essentialPreview: validation } : null;
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, tracks.length) }, worker));
  return { tracks: results.filter(Boolean), results };
}

export const previewFor = (track, attempted = new Set()) => previewSources(track)
  .find((candidate) => !(attempted instanceof Set ? attempted : new Set()).has(candidate.key)) ?? null;

export const findPlayableIndex = (playlist, from, direction) => {
  for (let position = from; position >= 0 && position < playlist.length; position += direction) {
    if (previewFor(playlist[position])) return position;
  }
  return -1;
};
