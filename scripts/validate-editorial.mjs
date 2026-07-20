import tracks from "../src/data/tracks/index.js";

const fields = [
  { key: "meaning", label: "Significato", minimumWords: 35 },
  { key: "musicalCharacteristics", label: "Caratteristiche musicali", minimumWords: 35 },
  { key: "scenario", label: "Scenario storico", minimumWords: 40 },
];

const genericPatterns = [
  /testo, interpretazione e arrangiamento rendono/i,
  /scrittura melodica, identità timbrica e produzione riflettono/i,
  /pubblicato nel \d{4}, il brano documenta/i,
  /una sintesi particolarmente riconoscibile/i,
  /elementi decisivi per la sua identità/i,
];

const normalize = (value = "") => value
  .toLocaleLowerCase("it")
  .normalize("NFD")
  .replace(/\p{Diacritic}/gu, "")
  .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
  .replace(/\s+/g, " ")
  .trim();

const words = (value = "") => normalize(value).split(" ").filter(Boolean);
const signature = (value) => new Set(words(value).filter((word) => word.length > 3));
const similarity = (left, right) => {
  const a = signature(left);
  const b = signature(right);
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / (a.size + b.size - intersection);
};

const errors = [];
const duplicatePairs = [];

for (const field of fields) {
  const seen = new Map();
  for (const track of tracks) {
    const value = track[field.key] ?? "";
    const wordCount = words(value).length;
    const reference = `${track.id} · ${track.artist} — ${track.title}`;
    if (!value.trim()) errors.push(`${reference}: ${field.label} vuoto`);
    else if (wordCount < field.minimumWords) errors.push(`${reference}: ${field.label} troppo corto (${wordCount}/${field.minimumWords} parole)`);
    if (genericPatterns.some((pattern) => pattern.test(value))) errors.push(`${reference}: ${field.label} contiene una formula generica`);

    const normalized = normalize(value);
    if (seen.has(normalized)) errors.push(`${reference}: ${field.label} identico a ${seen.get(normalized)}`);
    else seen.set(normalized, reference);
  }

  for (let index = 0; index < tracks.length; index += 1) {
    const left = tracks[index];
    const leftValue = left[field.key] ?? "";
    if (words(leftValue).length < field.minimumWords) continue;
    for (let otherIndex = index + 1; otherIndex < tracks.length; otherIndex += 1) {
      const right = tracks[otherIndex];
      const rightValue = right[field.key] ?? "";
      if (words(rightValue).length < field.minimumWords) continue;
      const score = similarity(leftValue, rightValue);
      if (score >= 0.82) duplicatePairs.push(`${field.label}: ${left.id} e ${right.id} (${score.toFixed(2)})`);
    }
  }
}

console.log(`Schede controllate: ${tracks.length}`);
console.log(`Anomalie editoriali: ${errors.length}`);
console.log(`Coppie quasi duplicate: ${duplicatePairs.length}`);
if (errors.length) console.log(errors.slice(0, 80).join("\n"));
if (errors.length > 80) console.log(`…altre ${errors.length - 80} anomalie non mostrate`);
if (duplicatePairs.length) console.log(duplicatePairs.slice(0, 40).join("\n"));
if (duplicatePairs.length > 40) console.log(`…altre ${duplicatePairs.length - 40} coppie non mostrate`);

if (errors.length || duplicatePairs.length) process.exitCode = 1;
