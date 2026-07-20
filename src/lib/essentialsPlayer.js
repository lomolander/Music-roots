export const validPreview = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
};

export const previewFor = (track, forceDeezer = false) => {
  if (!track) return null;
  const apple = track.preview || (track.appleMatchStatus === "verified" ? track.applePreviewUrl : "");
  const deezer = track.deezer?.previewUrl;
  if (!forceDeezer && validPreview(apple)) return { url: apple, source: "Apple Music" };
  if (validPreview(deezer)) return { url: deezer, source: "Deezer" };
  return null;
};

export const findPlayableIndex = (playlist, from, direction) => {
  for (let position = from; position >= 0 && position < playlist.length; position += direction) {
    if (previewFor(playlist[position])) return position;
  }
  return -1;
};
