import tracks from "../questions.js";
import { entityId } from "../entityIds.js";
import { buildArtistBiography } from "../artistBiography.js";
import { musicAtlasCities } from "../musicAtlas.js";
import { rockArtistSubgenres } from "../libraryConfig.js";
import artistContemporaryItaly from "../artistContemporaryItaly.js";

const artists = [...new Set(tracks.map((track) => track.artist))].sort().map((name) => {
  const artistTracks = tracks.filter((track) => track.artist === name);
  const metadata = artistContemporaryItaly[name];
  const genres = [...new Set([...artistTracks.map((track) => track.genre), ...(metadata?.genres ?? [])])];
  const subgenres = [...new Set([...artistTracks.map((track) => track.subgenre).filter(Boolean), ...(rockArtistSubgenres[name] ?? [])])];
  return {
    id: entityId(name),
    slug: metadata?.slug ?? entityId(name),
    name,
    nationality: metadata?.country ?? artistTracks.find((track) => track.paese)?.paese ?? "",
    country: metadata?.country ?? artistTracks.find((track) => track.paese)?.paese ?? "",
    primaryCityId: metadata?.cityId ?? "",
    coordinates: metadata?.coordinates ?? null,
    activeYears: metadata?.activeYears ?? "",
    description: metadata?.description ?? "",
    biography: buildArtistBiography({ name, genres, tracks: artistTracks, biography: metadata?.biography, nationality: artistTracks.find((track) => track.paese)?.paese ?? "" }),
    similarArtists: [...new Set([...(metadata?.relatedArtists ?? []), ...artistTracks.flatMap((track) => track.similarArtists ?? [])])],
    relatedArtists: metadata?.relatedArtists ?? [],
    relatedArtistIds: (metadata?.relatedArtists ?? []).map(entityId),
    influences: metadata?.influences ?? [],
    influencedArtists: metadata?.influenced ?? [],
    influencedArtistIds: (metadata?.influenced ?? []).map(entityId),
    fundamentalAlbums: metadata?.fundamentalAlbums ?? [],
    recommendedTracks: metadata?.recommendedTracks ?? [],
    curiosity: metadata?.curiosity ?? "",
    culturalScenario: metadata?.culturalScenario ?? "",
    venueIds: metadata?.venueIds ?? [],
    genres,
    subgenres,
    cityIds: musicAtlasCities.filter((city) => city.artistIds.includes(entityId(name))).map((city) => city.id),
    image: artistTracks.find((track) => track.artwork)?.artwork ?? "",
    trackIds: artistTracks.map((track) => track.id),
  };
});

export default artists;
