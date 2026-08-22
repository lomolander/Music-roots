import deezerPreviewMetadata from "../../src/data/deezer-preview-metadata.js";
import { previewResultMatches } from "../../src/lib/essentialsPlayer.js";

const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 4_000;
const cache = new Map();

const json = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders,
  },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "method_not_allowed" }, { Allow: "GET" });

  const catalogTrackId = Number(event.queryStringParameters?.trackId);
  const verified = deezerPreviewMetadata[catalogTrackId];
  if (!Number.isInteger(catalogTrackId) || !verified || verified.status !== "verified") {
    return json(404, { error: "preview_not_verified" });
  }

  const cached = cache.get(catalogTrackId);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return json(200, { ...cached.payload, cache: "hit" });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`https://api.deezer.com/track/${verified.trackId}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return json(502, { error: `deezer_http_${response.status}` });
    const item = await response.json();
    const candidate = {
      id: item.id,
      title: item.title,
      artist: item.artist?.name,
      album: item.album?.title,
      previewUrl: item.preview,
    };
    const expected = { title: verified.trackName, artist: verified.artistName, album: verified.albumName };
    if (Number(item.id) !== Number(verified.trackId) || !item.preview || !previewResultMatches(expected, candidate)) {
      return json(404, { error: "deezer_match_changed" });
    }
    const payload = {
      trackId: item.id,
      trackName: item.title,
      artistName: item.artist?.name,
      albumName: item.album?.title,
      previewUrl: item.preview,
    };
    cache.set(catalogTrackId, { savedAt: Date.now(), payload });
    return json(200, { ...payload, cache: "miss" });
  } catch (error) {
    return json(error?.name === "AbortError" ? 504 : 502, { error: error?.name === "AbortError" ? "deezer_timeout" : "deezer_unavailable" });
  } finally {
    clearTimeout(timer);
  }
};
