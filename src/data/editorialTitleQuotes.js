const normalize = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/gi, " ")
  .trim()
  .toLowerCase();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const letterOrNumber = /[\p{L}\p{N}]/u;
const workCue = /(?:album|ep|singol[oa]|brano|canzone|traccia|incisione|versione|cover|reinterpretazione|titolo|successo|colonna sonora)/iu;
const workPredicate = /^(?:\s|[,;:–—-]){0,8}(?:fu|è|era|uscì|apparve|comparve|aprì|apriva|anticipò|include|conteneva|divenne|resta|rimane|concentra|appartiene|venne|registrat|incis|pubblicat|prodotto)/iu;
// Collaborazioni, produzioni e dischi di gruppi collegati citati in biografie
// diverse da quella dell'artista accreditato nel catalogo. Sono eccezioni
// verificate, non un allargamento del matching lessicale.
const verifiedExternalTitles = new Set([
  "Elis & Tom", "Get Loose", "Beautiful Days", "Infant Eyes",
  "Don't Leave Me This Way", "The Age of Consent", "From the Mind of Lil Louis",
  "Another Side", "Vroom Vroom", "Diamond Life", "The Chronic",
  "I Am Somebody", "Two Sevens Clash", "In Colour", "World Clique",
].map(normalize));

const isAlreadyQuoted = (text, start, length) => {
  const before = text.slice(Math.max(0, start - 2), start);
  const after = text.slice(start + length, start + length + 2);
  if (/[“"]\s*$/.test(before) && /^\s*[”"]/.test(after)) return true;
  const openCurly = text.lastIndexOf("“", start);
  const closeCurly = text.lastIndexOf("”", start);
  if (openCurly > closeCurly && text.indexOf("”", start + length) >= 0) return true;
  return (text.slice(0, start).match(/"/g)?.length ?? 0) % 2 === 1;
};

const hasEditorialContext = (text, start, length, sameArtist) => {
  const prefix = text.slice(Math.max(0, start - (sameArtist ? 120 : 32)), start);
  const suffix = text.slice(start + length, start + length + 90);
  const cue = prefix.match(new RegExp(`${workCue.source}[^.!?]{0,${sameArtist ? 100 : 18}}$`, "iu"));
  return Boolean(cue || (sameArtist && workPredicate.test(suffix)));
};

export const buildMusicTitleReferences = (tracks, excludedLabels = []) => {
  const excluded = new Set(excludedLabels.map(normalize));
  const references = new Map();
  for (const track of tracks) {
    for (const value of [track.title, track.album]) {
      if (!value || /^\d+$/.test(value.trim()) || excluded.has(normalize(value))) continue;
      const key = `${value}\u0000${track.artist}`;
      if (!references.has(key)) references.set(key, { value, artist: track.artist });
    }
  }
  const result = [...references.values()].sort((left, right) => right.value.length - left.value.length);
  result.byArtist = new Map();
  for (const reference of result) {
    const key = normalize(reference.artist);
    const artistReferences = result.byArtist.get(key) ?? [];
    artistReferences.push(reference);
    result.byArtist.set(key, artistReferences);
  }
  return result;
};

export const findUnquotedMusicTitles = (text, references, artist = "") => {
  if (!text) return [];
  const findings = [];
  const seenRanges = [];
  const relevantReferences = artist && references.byArtist
    ? [
        ...(references.byArtist.get(normalize(artist)) ?? []),
        ...references.filter((reference) => verifiedExternalTitles.has(normalize(reference.value))),
      ]
    : references.filter((reference) => reference.value.length >= 8 && reference.value.trim().split(/\s+/).length >= 2);
  for (const reference of relevantReferences) {
    const pattern = new RegExp(escapeRegExp(reference.value), "giu");
    for (const match of text.matchAll(pattern)) {
      const start = match.index;
      const end = start + match[0].length;
      if (letterOrNumber.test(text[start - 1] ?? "") || letterOrNumber.test(text[end] ?? "")) continue;
      if (seenRanges.some(([from, to]) => start >= from && end <= to) || isAlreadyQuoted(text, start, match[0].length)) continue;
      const sameArtist = Boolean(artist && (
        normalize(reference.artist) === normalize(artist)
        || verifiedExternalTitles.has(normalize(reference.value))
      ));
      if (!hasEditorialContext(text, start, match[0].length, sameArtist)) continue;
      findings.push({ ...reference, matched: match[0], start, end });
      seenRanges.push([start, end]);
    }
  }
  return findings.sort((left, right) => left.start - right.start);
};

export const quoteKnownMusicTitles = (text, references, artist = "") => {
  const findings = findUnquotedMusicTitles(text, references, artist);
  if (!findings.length) return text;
  let result = text;
  for (const finding of [...findings].sort((left, right) => right.start - left.start)) {
    result = `${result.slice(0, finding.start)}“${result.slice(finding.start, finding.end)}”${result.slice(finding.end)}`;
  }
  return result;
};
