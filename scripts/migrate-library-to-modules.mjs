import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import questions from "../src/data/questions.js";

const outputDirectory = path.resolve("src/data/tracks");
const groups = {
  "house-techno": new Set(["House", "Chicago House", "French House", "Acid House", "Deep House", "Progressive House", "Electro House", "Detroit Techno", "Techno"]),
  "disco-funk": new Set(["Disco", "Dance", "Funk", "Post-disco", "Italo Disco", "Nu Disco"]),
  "soul-rnb": new Set(["Acid Jazz", "Neo Soul"]),
  "pop-synthpop": new Set(["Synth-pop", "Pop elettronico", "New Wave", "Electroclash"]),
  "hiphop-garage": new Set(["Hip Hop", "Jazz Rap", "UK Garage"]),
  "electronic-downtempo": new Set(["Electronic", "Electro", "IDM", "Trip Hop", "Downtempo", "Ambient House", "Ambient Techno", "Big Beat", "Drum and Bass", "Indie Dance"]),
  "jazz-bossa-brazil": new Set(["Bossa Nova", "Jazz Fusion", "Spiritual Jazz", "Nu Jazz"]),
  "rock-scenes-soundtracks": new Set(["Madchester", "Colonna sonora italiana", "Library Music"]),
};

const appleFields = new Set([
  "appleSearchTerm", "previewSource", "previewValidated", "appleMatchStatus",
  "appleTrackId", "appleArtistName", "appleTrackName", "appleCollectionName",
  "appleArtworkUrl", "applePreviewUrl", "previewLastVerifiedAt",
  "previewValidationStatus", "preview",
]);

function cleanTrack(track) {
  return Object.fromEntries(Object.entries(track).filter(([key]) => !appleFields.has(key)));
}

function moduleSource(name, tracks) {
  return `// Generated from the original 300-track catalog. Edit this file to add tracks in the ${name} family.\nconst tracks = ${JSON.stringify(tracks, null, 2)};\n\nexport default tracks;\n`;
}

await mkdir(outputDirectory, { recursive: true });
const assigned = new Set();
for (const [name, genres] of Object.entries(groups)) {
  const tracks = questions.filter((track) => genres.has(track.genre)).map(cleanTrack);
  tracks.forEach((track) => assigned.add(track.id));
  await writeFile(path.join(outputDirectory, `${name}.js`), moduleSource(name, tracks), "utf8");
}

const unassigned = questions.filter((track) => !assigned.has(track.id));
if (unassigned.length) {
  throw new Error(`Generi senza modulo: ${[...new Set(unassigned.map((track) => track.genre))].join(", ")}`);
}

console.log(`Creati ${Object.keys(groups).length} moduli per ${assigned.size} brani.`);
