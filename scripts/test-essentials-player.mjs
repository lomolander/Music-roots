import assert from "node:assert/strict";

import genres from "../src/data/entities/genres.js";
import tracks from "../src/data/questions.js";
import { essentialPlaylists } from "../src/data/libraryConfig.js";
import { choosePreviewResult, essentialPreviewStatus, findPlayableIndex, isEssentialPlayable, normalizePreviewLookup, previewFor, previewResultMatches, previewSearchTerm, previewSources, resolvePreviewSource, validateAudioPreview } from "../src/lib/essentialsPlayer.js";

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
    assert.deepEqual(candidates.map((item) => item.key), candidates.some((item) => item.key === "deezer")
      ? (candidates.some((item) => item.key === "apple") ? ["deezer", "apple"] : ["deezer"])
      : (candidates.some((item) => item.key === "apple") ? ["apple"] : []));
  }
}

const essentialIds = new Set([
  ...genres.flatMap((genre) => genre.essentialPlaylist?.trackIds ?? []),
  ...Object.values(essentialPlaylists).flatMap((item) => item.trackIds ?? []),
]);
const checkedEssentials = [...essentialIds].map((id) => trackById.get(id)).filter(Boolean);
const keptEssentials = checkedEssentials.filter(isEssentialPlayable);
const removedEssentials = checkedEssentials.filter((track) => !isEssentialPlayable(track));

const appleUrl = "https://audio.example.test/apple.m4a";
const deezerUrl = "https://audio.example.test/deezer.mp3";
const sources = { preview: appleUrl, deezer: { previewUrl: deezerUrl } };
assert.deepEqual(previewFor(sources), { key: "deezer", url: deezerUrl, source: "Deezer" });
assert.deepEqual(previewFor(sources, new Set(["deezer"])), { key: "apple", url: appleUrl, source: "Apple Music" });
assert.equal(previewFor(sources, new Set(["deezer", "apple"])), null);
assert.deepEqual(previewSources(sources).map((item) => item.key), ["deezer", "apple"]);
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

const deezerResolved = await resolvePreviewSource(requested, "deezer", async (url) => ({
  ok: true,
  json: async () => ({ data: url.includes("api.deezer.com") ? [{ id: 2, title: "Song", artist: { name: "Artist" }, album: { title: "The Album" }, preview: deezerUrl }] : [] }),
}));
assert.equal(deezerResolved.url, deezerUrl);
assert.equal(deezerResolved.query.includes("album:"), true);

const noDeezer = await resolvePreviewSource(requested, "deezer", async () => ({ ok: true, json: async () => ({ data: [{ id: 1, title: "Different Song", artist: { name: "Artist" }, album: { title: "The Album" }, preview: deezerUrl }] }) }));
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

console.log(JSON.stringify({
  testedPlaylists,
  report: {
    totaleBraniVerificati: checkedEssentials.length,
    braniMantenuti: keptEssentials.length,
    braniRimossi: removedEssentials.length,
    rimossi: removedEssentials.map((track) => ({ id: track.id, titolo: track.title, artista: track.artist, motivo: essentialPreviewStatus(track).reason })),
  },
  cases: ["Deezer primaria", "fallback Apple", "tentativi esauriti", "normalizzazione ricerca", "validazione titolo-artista-album", "esclusione match errato", "loadedmetadata", "canplay", "canplaythrough", "error", "stalled", "abort", "durata zero", "timeout", "filtro Essentials", "precedente", "successivo"],
}, null, 2));
