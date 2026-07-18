const EDITORIAL_TERMS =
  /\b(remaster(?:ed)?(?:\s+\d{4})?|radio edit|single version|feat(?:uring)?\.?\s+[^()[\]-]+)\b/gi;
const FORBIDDEN_TERMS = /\b(karaoke|tribute|cover|as made famous by)\b/i;

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

export function normalizeAppleTitle(value) {
  return normalizeBase(
    String(value ?? "")
      .replace(/[([][^)\]]*\b(remaster(?:ed)?|radio edit|single version)\b[^)\]]*[)\]]/gi, " ")
      .replace(EDITORIAL_TERMS, " "),
  );
}

function requiresVersion(title, version) {
  return new RegExp(`\\b${version}\\b`, "i").test(title);
}

export function isExactAppleMusicMatch(track, candidate) {
  const expectedTitle = String(track.title);
  const candidateTitle = String(candidate.trackName);
  if (FORBIDDEN_TERMS.test(`${candidateTitle} ${candidate.artistName} ${candidate.collectionName}`)) {
    return false;
  }
  if (!requiresVersion(expectedTitle, "live") && requiresVersion(candidateTitle, "live")) {
    return false;
  }
  if (!requiresVersion(expectedTitle, "remix") && requiresVersion(candidateTitle, "remix")) {
    return false;
  }
  return (
    normalizeAppleArtist(track.artist) === normalizeAppleArtist(candidate.artistName) &&
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
      status: doubtfulCandidates.length ? "doubtful" : "excluded",
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
        status: "validated",
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
    status: "unplayable",
    reason: "Le corrispondenze esatte non hanno una preview audio riproducibile",
    failedPreviews,
    doubtfulCandidates: [],
  };
}
