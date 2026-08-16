import historicalFacts from "./artistHistoricalFacts.js";
import artistBiographiesEditorial from "./artistBiographiesEditorial.js";
import artistExpansionBiographies from "./artistExpansionBiographies.js";
import artistBiographyCorrections from "./artistBiographyCorrections.js";

const sentenceParts = (value) => String(value ?? "").match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
const sentenceKey = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase();
const wordCount = (value) => value.trim().split(/\s+/).filter(Boolean).length;
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const serialOpeningVerbs = [
  "ha trasformato", "hanno trasformato", "trasformò", "trasformarono",
  "ha ridefinito", "hanno ridefinito", "ridefinì", "ridefinirono",
  "ha costruito", "hanno costruito", "costruì", "costruirono",
  "ha portato", "hanno portato", "portò", "portarono",
  "ha dato", "hanno dato", "diede", "diedero",
  "ha reso", "hanno reso", "rese", "resero",
];
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

const withoutSerialOpening = (name, biography) => {
  const sentences = sentenceParts(biography).map((sentence) => sentence.trim()).filter(Boolean);
  if (sentences.length < 2) return biography;
  const subject = `(?:(?:I|Gli|Le|La|Il|Lo)\\s+)?${escapeRegExp(name)}`;
  const verbs = serialOpeningVerbs.map(escapeRegExp).join("|");
  if (!new RegExp(`^${subject}\\s+(?:${verbs})(?=\\s|[,:;.!?]|$)`, "iu").test(sentences[0])) return biography;
  if (!/^\p{Lu}/u.test(sentences[1])) return biography;
  return sentences.slice(1).join(" ");
};

export const buildArtistBiography = ({ name, tracks, biography: suppliedBiography }) => {
  const editorialBiography = suppliedBiography ?? artistBiographyCorrections[name] ?? artistExpansionBiographies[name] ?? artistBiographiesEditorial[name];
  const biography = editorialBiography ?? evidenceBiography({ name, tracks });
  return withoutSerialOpening(name, biography);
};
