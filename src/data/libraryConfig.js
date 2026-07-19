export const allowedGenres = [
  "Acid House", "Acid Jazz", "Ambient House", "Ambient Techno", "Big Beat",
  "Bossa Nova", "Chicago House", "Colonna sonora italiana", "Dance",
  "Deep House", "Detroit Techno", "Disco", "Downtempo", "Drum and Bass",
  "Electro", "Electro House", "Electroclash", "Electronic", "French House",
  "Funk", "Hip Hop", "House", "IDM", "Indie Dance", "Italo Disco",
  "Jazz Fusion", "Jazz Rap", "Library Music", "Madchester", "Neo Soul",
  "New Wave", "Nu Disco", "Nu Jazz", "Pop elettronico", "Post-disco",
  "Progressive House", "Spiritual Jazz", "Synth-pop", "Techno", "Trip Hop",
  "UK Garage",
  "Soul", "R&B", "Post Punk", "Indie", "Jazz",
  "Garage House", "Boogie", "Motown", "Philadelphia Soul",
  "Punk", "Indie Rock", "Alternative Rock", "Shoegaze", "Dream Pop",
  "Ambient", "Electropop", "Dance Pop",
  "Reggae", "Dub", "Latin", "MPB", "Musica brasiliana", "World Music",
  "Musica italiana",
];

const essentialPlaylistLinks = {
  "Chicago House": {
    fullPlaylistUrl: "https://music.youtube.com/playlist?list=PLOxQxYfIUUSg&si=yMS2fNidSz2XARcl",
    service: "YouTube Music",
  },
};

export const essentialPlaylists = Object.fromEntries(
  allowedGenres.map((genre) => [genre, {
    id: genre,
    label: `Essenziali: ${genre}`,
    externalUrl: "",
    service: "",
    ...(essentialPlaylistLinks[genre] ?? {}),
  }]),
);
