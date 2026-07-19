import tracks from "../questions.js";
import { essentialPlaylists } from "../libraryConfig.js";
import { entityId } from "../entityIds.js";

const editorial = {
  Soul: { description: "Musica vocale afroamericana che pone interpretazione, ritmo e intensità emotiva al centro della forma-canzone.", origins: "Si sviluppa negli Stati Uniti tra anni Cinquanta e Sessanta dall'incontro di gospel e rhythm and blues.", characteristics: ["voce espressiva", "call and response", "sezione ritmica legata a gospel e R&B"] },
  "R&B": { description: "Evoluzione contemporanea del rhythm and blues, aperta al dialogo con soul, funk, hip-hop ed elettronica.", origins: "La definizione cambia nel tempo; dagli anni Ottanta identifica soprattutto nuove forme di soul e pop afroamericano.", characteristics: ["centralità della voce", "produzione ritmica", "scrittura soul contemporanea"] },
  "Post Punk": { description: "Area sperimentale nata dopo la prima esplosione punk, caratterizzata da approcci differenti a ritmo, studio e forma.", origins: "Emerge alla fine degli anni Settanta soprattutto nel Regno Unito e negli Stati Uniti.", characteristics: ["bassi in primo piano", "uso creativo dello studio", "influenze dub, funk ed elettroniche"] },
  Indie: { description: "Insieme di musiche nate attorno a etichette e circuiti indipendenti, più che un unico stile sonoro.", origins: "Si consolida tra anni Ottanta e Novanta attraverso scene locali, radio universitarie e distribuzione indipendente.", characteristics: ["autonomia produttiva", "forte identità autoriale", "pluralità di linguaggi rock e pop"] },
  Jazz: { description: "Tradizione musicale afroamericana fondata su improvvisazione, interazione collettiva e continua trasformazione del linguaggio.", origins: "Nasce negli Stati Uniti all'inizio del Novecento da culture musicali afroamericane, blues, ragtime e pratiche bandistiche.", characteristics: ["improvvisazione", "swing e articolazione ritmica", "dialogo tra composizione e performance"] },
};

const genres = [...new Set(tracks.map((track) => track.genre))].sort().map((name) => {
  const genreTracks = tracks.filter((track) => track.genre === name);
  const artists = [...new Set(genreTracks.map((track) => track.artist))];
  const albums = [...new Set(genreTracks.map((track) => `${track.artist} — ${track.album}`))];
  return {
    id: entityId(name), name,
    description: editorial[name]?.description ?? "",
    origins: editorial[name]?.origins ?? "",
    characteristics: editorial[name]?.characteristics ?? [],
    essentialArtists: artists.slice(0, 12),
    essentialAlbums: albums.slice(0, 12),
    essentialPlaylist: essentialPlaylists[name] ?? null,
    trackIds: genreTracks.map((track) => track.id),
  };
});

export default genres;
