import tracks from "../questions.js";
import { entityId } from "../entityIds.js";

const albumMap = new Map();
for (const track of tracks) {
  const id = entityId(track.artist, track.album);
  const album = albumMap.get(id) ?? {
    id, title: track.album, artist: track.artist, artistId: entityId(track.artist),
    year: track.year, cover: track.artwork || track.cover || "",
    description: `Album di ${track.artist} rappresentato nell'archivio Music Roots da «${track.title}».`,
    historicalImportance: track.curiosity || "",
    trackIds: [],
  };
  album.year = Math.min(album.year, track.year);
  if (!album.cover) album.cover = track.artwork || track.cover || "";
  album.trackIds.push(track.id);
  albumMap.set(id, album);
}

export default [...albumMap.values()].sort((left, right) => left.artist.localeCompare(right.artist) || left.year - right.year);
