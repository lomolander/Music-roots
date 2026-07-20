import assert from "node:assert/strict";

import genres from "../src/data/entities/genres.js";
import tracks from "../src/data/questions.js";
import { findPlayableIndex, previewFor } from "../src/lib/essentialsPlayer.js";

const trackById = new Map(tracks.map((track) => [track.id, track]));
const playlist = (name) => {
  const genre = genres.find((item) => item.name === name);
  assert.ok(genre, `Playlist ${name} non trovata`);
  return genre.trackIds.map((id) => trackById.get(id)).filter(Boolean);
};

const testedPlaylists = ["Chicago House", "New Romantic", "Britpop", "Musica italiana"];
for (const name of testedPlaylists) {
  const items = playlist(name);
  const firstPlayable = findPlayableIndex(items, 0, 1);
  assert.notEqual(firstPlayable, -1, `${name} non contiene preview riproducibili`);
  assert.ok(previewFor(items[firstPlayable])?.url.startsWith("https://"));
}

const appleUrl = "https://audio.example.test/apple.m4a";
const deezerUrl = "https://audio.example.test/deezer.mp3";
const sources = { preview: appleUrl, deezer: { previewUrl: deezerUrl } };
assert.deepEqual(previewFor(sources), { url: appleUrl, source: "Apple Music" });
assert.deepEqual(previewFor(sources, true), { url: deezerUrl, source: "Deezer" });

const mixed = [
  { title: "Senza preview", preview: "", deezer: { previewUrl: "" } },
  { title: "Apple", preview: appleUrl, deezer: { previewUrl: "" } },
  { title: "Deezer", preview: "", deezer: { previewUrl: deezerUrl } },
];
assert.equal(findPlayableIndex(mixed, 0, 1), 1);
assert.equal(findPlayableIndex(mixed, 2, -1), 2);
assert.equal(findPlayableIndex([mixed[0]], 0, 1), -1);

console.log(JSON.stringify({ testedPlaylists, cases: ["Apple primaria", "fallback Deezer", "salto preview assente", "precedente", "successivo"] }, null, 2));
