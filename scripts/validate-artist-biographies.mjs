import { artists } from "../src/data/entities/index.js";
import biographies from "../src/data/artistBiographiesEditorial.js";

const forbiddenPatterns = [
  /compare nella storia della musica/i,
  /fa parte della storia del/i,
  /questa produzione documenta/i,
  /è presente nel catalogo/i,
  /si colloca nel genere/i,
  /è riconoscibile per/i,
  /l’attività discografica di/i,
  /il percorso musicale di/i,
  /le registrazioni disponibili collocano/i,
];

const normalize = (value = "") => value
  .toLocaleLowerCase("it")
  .normalize("NFD")
  .replace(/\p{Diacritic}/gu, "")
  .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
  .replace(/\s+/g, " ")
  .trim();

const words = (value = "") => normalize(value).split(" ").filter(Boolean);
const signature = (value) => new Set(words(value).filter((word) => word.length > 4));
const similarity = (left, right) => {
  const a = signature(left);
  const b = signature(right);
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / (a.size + b.size - intersection);
};

const errors = [];
const artistNames = new Set(artists.map((artist) => artist.name));

for (const artist of artists) {
  const biography = biographies[artist.name];
  if (!biography) {
    errors.push(`${artist.name}: biografia editoriale assente`);
    continue;
  }
  const count = words(biography).length;
  if (count < 120 || count > 280) errors.push(`${artist.name}: ${count} parole (richieste 120–280)`);
  const forbidden = forbiddenPatterns.find((pattern) => pattern.test(biography));
  if (forbidden) errors.push(`${artist.name}: formula vietata ${forbidden}`);
}

for (const name of Object.keys(biographies)) {
  if (!artistNames.has(name)) errors.push(`${name}: chiave editoriale senza artista corrispondente`);
}

const names = Object.keys(biographies);
for (let index = 0; index < names.length; index += 1) {
  for (let other = index + 1; other < names.length; other += 1) {
    const score = similarity(biographies[names[index]], biographies[names[other]]);
    if (score >= 0.72) errors.push(`${names[index]} / ${names[other]}: testi troppo simili (${score.toFixed(2)})`);
  }
}

console.log(`Artisti nel database: ${artists.length}`);
console.log(`Biografie editoriali: ${Object.keys(biographies).length}`);
console.log(`Anomalie: ${errors.length}`);
if (errors.length) console.log(errors.slice(0, 120).join("\n"));
if (errors.length > 120) console.log(`…altre ${errors.length - 120} anomalie`);
if (errors.length) process.exitCode = 1;
