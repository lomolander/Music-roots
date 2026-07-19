const EDITORIAL_TERMS =
  /\b(remaster(?:ed)?(?:\s+\d{4})?|radio edit|single version|feat(?:uring)?\.?\s+[^()[\]-]+)\b/gi;
const FORBIDDEN_TERMS =
  /\b(karaoke|tribute|cover|as made famous by|sped[ -]?up|slowed(?:\s*(?:and|&)\s*reverb)?|instrumental)\b/i;
const VERSION_TERMS = ["remix", "live", "karaoke", "cover", "tribute", "sped up", "slowed", "instrumental"];

function normalizeBase(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

export function normalizeAppleArtist(value) {
  return normalizeBase(value);
}

function artistParts(value) {
  return String(value ?? "")
    .split(/\s*(?:,|&|\band\b|\bfeat(?:uring)?\.?\b|\bft\.?\b|\bx\b)\s*/i)
    .map(normalizeBase)
    .filter(Boolean);
}

function artistAcronym(value) {
  return normalizeBase(value)
    .split(" ")
    .filter((word) => !["the", "and", "of", "in"].includes(word))
    .map((word) => word[0])
    .join("");
}

export function appleArtistsMatch(expected, actual) {
  const left = normalizeAppleArtist(expected).replace(/^the /, "");
  const right = normalizeAppleArtist(actual).replace(/^the /, "");
  if (left === right) return true;
  if (artistAcronym(left).length >= 3 && artistAcronym(left) === right.replace(/ /g, "")) return true;
  if (artistAcronym(right).length >= 3 && artistAcronym(right) === left.replace(/ /g, "")) return true;

  const expectedParts = artistParts(expected);
  const actualParts = artistParts(actual);
  return expectedParts.every((part) => actualParts.includes(part));
}

export function normalizeAppleTitle(value) {
  return normalizeBase(
    String(value ?? "")
      .replace(/[([][^)\]]*\b(remaster(?:ed)?|radio edit|single version)\b[^)\]]*[)\]]/gi, " ")
      .replace(EDITORIAL_TERMS, " "),
  );
}

export function normalizeAppleAlbum(value) {
  return normalizeBase(String(value ?? "")
    .replace(/[([][^)\]]*\b(remaster(?:ed)?|expanded edition)\b[^)\]]*[)\]]/gi, " ")
    .replace(/\b(remaster(?:ed)?)(?:\s+\d{4})?\b/gi, " ")
    .replace(/\s+-\s+(single|ep)$/gi, ""));
}

function includesVersion(title, version) {
  return new RegExp(`\\b${version.replace(" ", "[ -]?")}\\b`, "i").test(title);
}

export function hasWrongAppleVersion(expectedTitle, candidateTitle, candidate = {}) {
  const searchable = `${candidateTitle} ${candidate.artistName ?? ""} ${candidate.collectionName ?? ""}`;
  if (FORBIDDEN_TERMS.test(searchable) && !FORBIDDEN_TERMS.test(expectedTitle)) return true;
  return VERSION_TERMS.some(
    (version) => !includesVersion(expectedTitle, version) && includesVersion(candidateTitle, version),
  );
}

export function isExactAppleMusicMatch(track, candidate) {
  const expectedTitle = String(track.title);
  const candidateTitle = String(candidate.trackName);
  if (hasWrongAppleVersion(expectedTitle, candidateTitle, candidate)) return false;
  if (track.requireOriginalAlbum && normalizeAppleAlbum(track.album) !== normalizeAppleAlbum(candidate.collectionName)) return false;
  return (
    appleArtistsMatch(track.artist, candidate.artistName) &&
    normalizeAppleTitle(track.title) === normalizeAppleTitle(candidate.trackName)
  );
}

function rankCandidate(track, candidate) {
  let score = 0;
  if (normalizeBase(track.album) === normalizeBase(candidate.collectionName)) score += 4;
  if (!/\b(remaster|radio edit|single version)\b/i.test(candidate.trackName)) score += 2;
  if (!/\b(deluxe|greatest hits|compilation)\b/i.test(candidate.collectionName)) score += 1;
  return score;
}

export async function validateAppleMusicTrack(
  track,
  { searchApple, validatePreview },
) {
  const candidates = await searchApple(track);
  const exactCandidates = candidates
    .filter((candidate) => isExactAppleMusicMatch(track, candidate))
    .sort((left, right) => rankCandidate(track, right) - rankCandidate(track, left));

  if (exactCandidates.length === 0) {
    const doubtfulCandidates = candidates
      .filter(
        (candidate) =>
          normalizeAppleTitle(track.title) === normalizeAppleTitle(candidate.trackName) ||
          normalizeAppleArtist(track.artist) === normalizeAppleArtist(candidate.artistName),
      )
      .slice(0, 8)
      .map(({ trackId, artistName, trackName, collectionName }) => ({
        appleTrackId: trackId,
        appleArtistName: artistName,
        appleTrackName: trackName,
        appleCollectionName: collectionName,
      }));
    return {
      valid: false,
      status: candidates.some((candidate) =>
        appleArtistsMatch(track.artist, candidate.artistName) &&
        hasWrongAppleVersion(track.title, candidate.trackName, candidate)
      ) ? "wrong-version" : doubtfulCandidates.length ? "needs-review" : "no-match",
      reason: doubtfulCandidates.length
        ? "Nessuna corrispondenza esatta; trovati soltanto candidati ambigui"
        : "Nessuna corrispondenza Apple Music/iTunes",
      doubtfulCandidates,
    };
  }

  const failedPreviews = [];
  for (const candidate of exactCandidates) {
    const previewValidation = await validatePreview(candidate.previewUrl);
    if (previewValidation.valid) {
      return {
        valid: true,
        status: "verified",
        candidate,
        previewValidation,
        doubtfulCandidates: [],
      };
    }
    failedPreviews.push({
      appleTrackId: candidate.trackId,
      appleArtistName: candidate.artistName,
      appleTrackName: candidate.trackName,
      reason: previewValidation.reason,
    });
  }

  return {
    valid: false,
    status: "missing-preview",
    reason: "Le corrispondenze esatte non hanno una preview audio riproducibile",
    failedPreviews,
    doubtfulCandidates: [],
  };
}
