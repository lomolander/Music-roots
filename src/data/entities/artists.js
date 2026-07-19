import tracks from "../questions.js";
import { entityId } from "../entityIds.js";

const artists = [...new Set(tracks.map((track) => track.artist))].sort().map((name) => {
  const artistTracks = tracks.filter((track) => track.artist === name);
  return {
    id: entityId(name),
    name,
    nationality: artistTracks.find((track) => track.paese)?.paese ?? "",
    activeYears: "",
    biography: "",
    similarArtists: [...new Set(artistTracks.flatMap((track) => track.similarArtists ?? []))],
    genres: [...new Set(artistTracks.map((track) => track.genre))],
    image: artistTracks.find((track) => track.artwork)?.artwork ?? "",
    trackIds: artistTracks.map((track) => track.id),
  };
});

export default artists;
