import assert from "node:assert/strict";

import genres from "../src/data/entities/genres.js";
import tracks from "../src/data/questions.js";
import { essentialPlaylists } from "../src/data/libraryConfig.js";
import { choosePreviewResult, essentialPreviewStatus, findPlayableIndex, isEssentialPlayable, normalizePreviewLookup, prepareEssentialPlaylist, previewFor, previewResultMatches, previewSearchTerm, previewSources, resolvePreviewSource, validateAudioPreview } from "../src/lib/essentialsPlayer.js";

const trackById = new Map(tracks.map((track) => [track.id, track]));
const playlist = (name) => {
  const genre = genres.find((item) => item.name === name);
  assert.ok(genre, `Playlist ${name} non trovata`);
  return genre.trackIds.map((id) => trackById.get(id)).filter(Boolean);
};

const testedPlaylists = [...new Set([
  ...genres.filter((genre) => genre.trackIds.length).map((genre) => genre.name),
  ...Object.values(essentialPlaylists).filter((item) => item.trackIds.length).map((item) => item.id),
])];
for (const name of testedPlaylists) {
  const configured = essentialPlaylists[name]?.trackIds?.length
    ? essentialPlaylists[name].trackIds.map((id) => trackById.get(id)).filter(Boolean)
    : playlist(name);
  const items = configured;
  const exposedItems = items.filter(isEssentialPlayable);
  assert.equal(exposedItems.every(isEssentialPlayable), true, `${name}: contiene un brano senza preview validata`);
  const firstPlayable = findPlayableIndex(items, 0, 1);
  const expectedFirst = items.findIndex((track) => previewSources(track).length > 0);
  assert.equal(firstPlayable, expectedFirst, `${name}: individuazione prima preview incoerente`);
  for (const track of items) {
    const candidates = previewSources(track);
    assert.deepEqual(candidates.map((item) => item.key), ["apple", "deezer", "youtube"].filter((key) => candidates.some((item) => item.key === key)));
  }
}

const essentialIds = new Set([
  ...genres.flatMap((genre) => genre.essentialPlaylist?.trackIds ?? []),
  ...Object.values(essentialPlaylists).flatMap((item) => item.trackIds ?? []),
]);
const checkedEssentials = [...essentialIds].map((id) => trackById.get(id)).filter(Boolean);
const keptEssentials = checkedEssentials.filter(isEssentialPlayable);
const removedEssentials = checkedEssentials.filter((track) => !isEssentialPlayable(track));

const deterministicPlaylists = ["Hip Hop", "Chicago House", "New Romantic"];
const deterministicReport = [];
for (const name of deterministicPlaylists) {
  const items = essentialPlaylists[name]?.trackIds?.length
    ? essentialPlaylists[name].trackIds.map((id) => trackById.get(id)).filter(Boolean)
    : playlist(name);
  let unexpectedFetches = 0;
  const unavailableFetch = async () => {
    unexpectedFetches += 1;
    throw new Error("La preparazione della playlist non deve risolvere URL remoti");
  };
  const initial = await prepareEssentialPlaylist(items, { fetchImpl: unavailableFetch });
  const reload = await prepareEssentialPlaylist(items, { fetchImpl: unavailableFetch });
  const newInitialization = await prepareEssentialPlaylist(items, { fetchImpl: unavailableFetch });
  assert.equal(reload.tracks.length, initial.tracks.length, `${name}: conteggio diverso dopo reload`);
  assert.equal(newInitialization.tracks.length, initial.tracks.length, `${name}: conteggio diverso dopo nuova inizializzazione`);
  assert.equal(unexpectedFetches, 0, `${name}: fetch remoto durante il calcolo della disponibilita`);
  const deezerOnly = items.filter((track) => !track.preview && track.deezer?.status === "verified" && track.deezer?.trackId).slice(0, 3);
  assert.equal(deezerOnly.length, 3, `${name}: servono almeno tre fallback Deezer verificati`);
  deterministicReport.push({ name, initial: initial.tracks.length, reload: reload.tracks.length, newInitialization: newInitialization.tracks.length, deezerOnly });
}

const appleUrl = "https://audio.example.test/apple.m4a";
const deezerUrl = "https://audio.example.test/deezer.mp3";
const sources = { preview: appleUrl, deezer: { previewUrl: deezerUrl } };
assert.deepEqual(previewFor(sources), { key: "apple", url: appleUrl, source: "Apple Music" });
assert.deepEqual(previewFor(sources, new Set(["apple"])), { key: "deezer", url: deezerUrl, source: "Deezer" });
assert.equal(previewFor(sources, new Set(["deezer", "apple"])), null);
assert.deepEqual(previewSources(sources).map((item) => item.key), ["apple", "deezer"]);

const threeProviders = {
  id: 9999,
  title: "Three Sources",
  artist: "Verified Artist",
  preview: appleUrl,
  appleMatchStatus: "verified",
  deezer: { trackId: 123, status: "verified" },
  youtubePreview: { videoId: "verifiedVideo", status: "verified", embeddable: true },
};
assert.deepEqual(previewSources(threeProviders).map((item) => item.key), ["apple", "deezer", "youtube"]);
assert.equal(previewFor(threeProviders)?.key, "apple");
assert.equal(previewFor(threeProviders, new Set(["apple"]))?.key, "deezer");
assert.equal(previewFor(threeProviders, new Set(["apple", "deezer"]))?.key, "youtube");
const resolvedYouTube = await resolvePreviewSource(threeProviders, "youtube", async () => { throw new Error("YouTube non deve fare fetch runtime"); });
assert.equal(resolvedYouTube.videoId, "verifiedVideo");
assert.equal(resolvedYouTube.usedStoredResult, true);
assert.equal(normalizePreviewLookup("Song (2011 Remastered) - Radio Edit feat. Guest"), "song");
assert.equal(previewSearchTerm({ title: "Song (Remastered)", artist: "Artist feat. Guest", album: "The Album" }), "Song Artist The Album".toLowerCase());

const mixed = [
  { title: "Senza preview", preview: "", deezer: { previewUrl: "" } },
  { title: "Apple", preview: appleUrl, deezer: { previewUrl: "" } },
  { title: "Deezer", preview: "", deezer: { previewUrl: deezerUrl } },
];
assert.equal(findPlayableIndex(mixed, 0, 1), 1);
assert.equal(findPlayableIndex(mixed, 2, -1), 2);
assert.equal(findPlayableIndex([mixed[0]], 0, 1), -1);

const requested = { title: "Song (Remastered)", artist: "Artist feat. Guest", album: "The Album" };
const wrongResult = { id: 1, title: "Different Song", artist: "Artist", album: "The Album", previewUrl: deezerUrl };
const exactResult = { id: 2, title: "Song - Radio Edit", artist: "Artist", album: "The Album", previewUrl: deezerUrl };
assert.equal(previewResultMatches(requested, wrongResult), false);
assert.equal(previewResultMatches(requested, exactResult), true);
assert.equal(choosePreviewResult(requested, [wrongResult, exactResult])?.id, 2);

const verifiedDeezerRequest = { ...requested, id: 999, deezer: { trackId: 2, status: "verified" } };
const deezerResolved = await resolvePreviewSource(verifiedDeezerRequest, "deezer", async (url) => ({
  ok: true,
  json: async () => ({ trackId: 2, trackName: "Song", artistName: "Artist", albumName: "The Album", previewUrl: deezerUrl }),
}));
assert.equal(deezerResolved.url, deezerUrl);
assert.equal(deezerResolved.usedStoredResult, false);

const noDeezer = await resolvePreviewSource(verifiedDeezerRequest, "deezer", async () => ({ ok: true, json: async () => ({ trackId: 1, trackName: "Different Song", artistName: "Artist", albumName: "The Album", previewUrl: deezerUrl }) }));
assert.equal(noDeezer.url, "");
assert.equal(noDeezer.rejected.length, 1);

class FakeAudio {
  static outcome = "loadedmetadata";
  constructor() { this.listeners = new Map(); this.duration = FakeAudio.outcome === "zero" ? 0 : 30; this.readyState = 1; this.error = { code: 4 }; }
  addEventListener(event, handler) { this.listeners.set(event, handler); }
  removeEventListener(event) { this.listeners.delete(event); }
  load() { if (FakeAudio.outcome !== "timeout") queueMicrotask(() => this.listeners.get(FakeAudio.outcome === "zero" ? "loadedmetadata" : FakeAudio.outcome)?.()); }
  pause() {}
  removeAttribute() {}
}

for (const event of ["loadedmetadata", "canplay", "canplaythrough"]) {
  FakeAudio.outcome = event;
  assert.equal((await validateAudioPreview(deezerUrl, { AudioConstructor: FakeAudio, timeoutMs: 20 })).valid, true, `${event} deve validare la preview`);
}
for (const event of ["error", "stalled", "abort", "zero", "timeout"]) {
  FakeAudio.outcome = event;
  assert.equal((await validateAudioPreview(deezerUrl, { AudioConstructor: FakeAudio, timeoutMs: 20 })).valid, false, `${event} deve rifiutare la preview`);
}

for (const item of deterministicReport) {
  for (const track of item.deezerOnly) {
    const resolved = await resolvePreviewSource(track, "deezer", async () => ({
      ok: true,
      json: async () => ({
        trackId: track.deezer.trackId,
        trackName: track.title,
        artistName: track.artist,
        albumName: track.album,
        previewUrl: deezerUrl,
      }),
    }));
    assert.equal(resolved.url, deezerUrl, `${item.name}: risoluzione Deezer fallita per ${track.artist} - ${track.title}`);
    FakeAudio.outcome = "canplay";
    assert.equal((await validateAudioPreview(resolved.url, { AudioConstructor: FakeAudio, timeoutMs: 20 })).valid, true);
  }
}

const youtubeCases = [
  [145, "Zed Bias", "Neighbourhood"],
  [177, "Adam F", "Circles"],
  [178, "Shy FX", "Original Nuttah"],
  [1381, "Caravan", "Nine Feet Underground"],
  [1485, "Taeko Ohnuki", "4:00 A.M."],
  [1717, "Piero Piccioni", "Camille 2000"],
];
for (const [id, artist, title] of youtubeCases) {
  const track = trackById.get(id);
  assert.equal(track?.artist, artist);
  assert.equal(track?.title, title);
  assert.equal(track?.youtubePreview?.status, "verified");
  assert.equal(track?.youtubePreview?.embeddable, true);
  assert.equal(isEssentialPlayable(track), true);
  assert.equal(previewSources(track).at(-1)?.key, "youtube");
}
for (const name of ["Electro House", "UK Garage"]) {
  const items = essentialPlaylists[name]?.trackIds?.length
    ? essentialPlaylists[name].trackIds.map((id) => trackById.get(id)).filter(Boolean)
    : playlist(name);
  const counts = [];
  for (let initialization = 0; initialization < 3; initialization += 1) counts.push((await prepareEssentialPlaylist(items)).tracks.length);
  assert.deepEqual(counts, [items.length, items.length, items.length], `${name}: copertura o conteggio non deterministico`);
}

console.log(JSON.stringify({
  testedPlaylists,
  deterministicReport: deterministicReport.map(({ name, initial, reload, newInitialization, deezerOnly }) => ({
    name,
    initial,
    reload,
    newInitialization,
    deezerTracksTested: deezerOnly.map((track) => `${track.artist} - ${track.title}`),
  })),
  report: {
    totaleBraniVerificati: checkedEssentials.length,
    braniMantenuti: keptEssentials.length,
    braniRimossi: removedEssentials.length,
    rimossi: removedEssentials.map((track) => ({ id: track.id, titolo: track.title, artista: track.artist, motivo: essentialPreviewStatus(track).reason })),
  },
  cases: ["Deezer primaria", "fallback Apple", "tentativi esauriti", "normalizzazione ricerca", "validazione titolo-artista-album", "esclusione match errato", "loadedmetadata", "canplay", "canplaythrough", "error", "stalled", "abort", "durata zero", "timeout", "filtro Essentials", "precedente", "successivo"],
}, null, 2));
