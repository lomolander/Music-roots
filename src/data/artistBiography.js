import historicalFacts from "./artistHistoricalFacts.js";
import artistBiographiesEditorial from "./artistBiographiesEditorial.js";
import artistExpansionBiographies from "./artistExpansionBiographies.js";

const sentenceParts = (value) => String(value ?? "").match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
const sentenceKey = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase();
const wordCount = (value) => value.trim().split(/\s+/).filter(Boolean).length;
const genericEvidence = [
  /questa registrazione (?:e|è) stata selezionata/i,
  /la scheda (?:privilegia|documenta|presenta)/i,
  /senza attribuire intenzioni non dichiarate/i,
  /concentra il proprio significato/i,
  /l['’]arrangiamento conserva i tratti specifici/i,
];

const evidenceBiography = ({ name, tracks }) => {
  const fact = historicalFacts[name];
  const sources = [
    fact?.biography,
    fact?.description,
    ...tracks.flatMap((track) => [track.scenario, track.curiosity, track.musicalCharacteristics, track.meaning]),
  ];
  const seen = new Set();
  const sentences = [];

  for (const source of sources) {
    for (const rawSentence of sentenceParts(source)) {
      const sentence = rawSentence.trim();
      const key = sentenceKey(sentence);
      if (wordCount(sentence) < 7 || seen.has(key) || genericEvidence.some((pattern) => pattern.test(sentence))) continue;
      seen.add(key);
      sentences.push(sentence);
      if (wordCount(sentences.join(" ")) >= 65) return sentences.join(" ");
    }
  }
  return sentences.join(" ");
};

export const buildArtistBiography = ({ name, tracks }) => {
  const editorialBiography = artistExpansionBiographies[name] ?? artistBiographiesEditorial[name];
  if (editorialBiography) return editorialBiography;
  return evidenceBiography({ name, tracks });
};
