import { useMemo, useState } from "react";
import { ChevronRight, Disc3, GitBranch, Music, Search, Users } from "lucide-react";

import tracks from "../data/questions.js";
import { albums, artists, genres } from "../data/entities/index.js";

const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase("it");
const decade = (year) => Math.floor(year / 10) * 10;

function Connections({ onBack }) {
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const current = history.at(-1);

  const graph = useMemo(() => buildGraph(), []);
  const navigate = (type, id) => {
    setHistory((items) => [...items, { type, id }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => history.length ? setHistory((items) => items.slice(0, -1)) : onBack();
  const term = normalize(query);
  const filtered = term ? tracks.filter((track) => normalize(`${track.title} ${track.artist} ${track.album} ${track.genre} ${track.subgenre}`).includes(term)) : tracks;

  return (
    <main className="app-shell connections-screen page-enter">
      <header className="explore-header"><button className="back-button" type="button" onClick={goBack}>← Indietro</button><span className="explore-count">{current ? "Navigazione collegata" : `${filtered.length} brani`}</span></header>
      {current ? <ConnectionView view={current} graph={graph} navigate={navigate} /> : <>
        <section className="explore-intro"><p className="eyebrow">RETE MUSICALE</p><h1>Collegamenti</h1><p>Parti da un brano e attraversa artisti, influenze documentate, album, generi e playlist Essentials.</p></section>
        <label className="explore-search connections-search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca un brano, artista, album o genere…" /></label>
        <section className="connections-list">{filtered.map((track) => <ConnectionRow key={track.id} track={track} onClick={() => navigate("track", track.id)} />)}</section>
      </>}
    </main>
  );
}

function buildGraph() {
  const trackById = new Map(tracks.map((track) => [track.id, track]));
  const artistById = new Map(artists.map((artist) => [artist.id, artist]));
  const artistByName = new Map(artists.map((artist) => [normalize(artist.name), artist]));
  const albumById = new Map(albums.map((album) => [album.id, album]));
  const genreById = new Map(genres.map((genre) => [genre.id, genre]));
  const genreByName = new Map(genres.map((genre) => [normalize(genre.name), genre]));

  const influencers = new Map();
  for (const track of tracks) {
    for (const influencedName of track.influencedArtists ?? []) {
      const target = normalize(influencedName);
      if (!influencers.has(target)) influencers.set(target, new Set());
      influencers.get(target).add(track.artist);
    }
  }

  return { trackById, artistById, artistByName, albumById, genreById, genreByName, influencers };
}

function ConnectionRow({ track, onClick }) {
  return <button className="connection-row glass-card" type="button" onClick={onClick}>{track.artwork ? <img src={track.artwork} alt="" loading="lazy" /> : <span className="archive-placeholder"><Music /></span>}<span><strong>{track.title}</strong><small>{track.artist} · {track.album}</small><em>{track.genre} · {track.year}</em></span><ChevronRight aria-hidden="true" /></button>;
}

function ConnectionView({ view, graph, navigate }) {
  if (view.type === "track") return <TrackConnections track={graph.trackById.get(view.id)} graph={graph} navigate={navigate} />;
  if (view.type === "artist") {
    const artist = graph.artistById.get(view.id);
    if (!artist) return null;
    const artistTracks = artist.trackIds.map((id) => graph.trackById.get(id)).filter(Boolean);
    return <EntityView eyebrow="ARTISTA" title={artist.name} description={`${artistTracks.length} brani presenti nella rete Music Roots.`}><CardLinks title="Generi" items={artist.genres.map((name) => graph.genreByName.get(normalize(name))).filter(Boolean)} label={(item) => item.name} onClick={(item) => navigate("genre", item.id)} /><TrackLinks tracks={artistTracks} navigate={navigate} /></EntityView>;
  }
  if (view.type === "album") {
    const album = graph.albumById.get(view.id);
    if (!album) return null;
    const albumTracks = album.trackIds.map((id) => graph.trackById.get(id)).filter(Boolean);
    return <EntityView eyebrow="ALBUM" title={album.title} description={`${album.artist} · ${album.year}`} image={album.cover}><button className="connection-primary-link" type="button" onClick={() => navigate("artist", album.artistId)}>{album.artist} →</button><TrackLinks tracks={albumTracks} navigate={navigate} /></EntityView>;
  }
  if (view.type === "genre" || view.type === "playlist") {
    const genre = graph.genreById.get(view.id);
    if (!genre) return null;
    const genreTracks = genre.trackIds.map((id) => graph.trackById.get(id)).filter(Boolean);
    return <EntityView eyebrow={view.type === "playlist" ? "PLAYLIST ESSENTIALS" : "GENERE"} title={view.type === "playlist" ? `Essenziali: ${genre.name}` : genre.name} description={genre.description || `${genreTracks.length} brani presenti nella libreria.`}>{view.type === "genre" && <button className="connection-primary-link" type="button" onClick={() => navigate("playlist", genre.id)}>Apri Essentials →</button>}<TrackLinks tracks={genreTracks} navigate={navigate} /></EntityView>;
  }
  return null;
}

function TrackConnections({ track, graph, navigate }) {
  if (!track) return null;
  const existingArtists = (names) => [...new Map(names.map((name) => graph.artistByName.get(normalize(name))).filter(Boolean).map((artist) => [artist.id, artist])).values()];
  const similar = existingArtists(track.similarArtists ?? []);
  const influenced = existingArtists(track.influencedArtists ?? []);
  const influencing = existingArtists([...(graph.influencers.get(normalize(track.artist)) ?? [])]);
  const relatedTracks = tracks.filter((candidate) => candidate.id !== track.id).map((candidate) => ({ candidate, score: (candidate.subgenre === track.subgenre ? 5 : 0) + (candidate.genre === track.genre ? 3 : 0) + (decade(candidate.year) === decade(track.year) ? 1 : 0) + (candidate.artist === track.artist ? 2 : 0) })).filter((item) => item.score >= 3).sort((left, right) => right.score - left.score || Math.abs(left.candidate.year - track.year) - Math.abs(right.candidate.year - track.year)).slice(0, 8).map((item) => item.candidate);
  const relatedAlbums = [...new Map(relatedTracks.map((item) => graph.albumById.get(item.albumId)).filter((album) => album && album.id !== track.albumId).map((album) => [album.id, album])).values()].slice(0, 6);
  const relatedGenres = [graph.genreById.get(track.genreId), ...(track.influences ?? []).map((name) => graph.genreByName.get(normalize(name))).filter(Boolean)].filter((item, index, list) => item && list.findIndex((other) => other.id === item.id) === index);

  return <article className="connection-detail page-enter">
    <div className="connection-hero">{track.artwork ? <img src={track.artwork} alt={`Copertina di ${track.album}`} /> : <span className="scenario-cover-placeholder"><Music /></span>}<div><p className="eyebrow">MAPPA DEL BRANO</p><h1>{track.title}</h1><button type="button" onClick={() => navigate("artist", track.artistId)}>{track.artist} →</button><p>{track.year} · {track.subgenre}</p></div></div>
    <CardLinks title="Artisti simili" icon={Users} items={similar} label={(item) => item.name} onClick={(item) => navigate("artist", item.id)} empty="Nessun artista simile presente nel database." />
    <CardLinks title="Artisti influenzati" icon={GitBranch} items={influenced} label={(item) => item.name} onClick={(item) => navigate("artist", item.id)} empty="Relazione direzionale non documentata per questo brano." />
    <CardLinks title="Artisti che lo hanno influenzato" icon={GitBranch} items={influencing} label={(item) => item.name} onClick={(item) => navigate("artist", item.id)} empty="Relazione inversa non documentata nel database." />
    <CardLinks title="Album correlati" icon={Disc3} items={relatedAlbums} label={(item) => `${item.title} · ${item.artist}`} onClick={(item) => navigate("album", item.id)} />
    <CardLinks title="Generi correlati" items={relatedGenres} label={(item) => item.name} onClick={(item) => navigate("genre", item.id)} />
    <section className="connection-section"><h2>Brani correlati</h2><TrackLinks tracks={relatedTracks} navigate={navigate} /></section>
    <button className="connection-essential" type="button" onClick={() => navigate("playlist", track.genreId)}>Essenziali: {track.genre} <ChevronRight /></button>
  </article>;
}

function EntityView({ eyebrow, title, description, image, children }) {
  return <article className="connection-detail entity-connection page-enter">{image && <img className="entity-cover" src={image} alt="" />}<p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="detail-description">{description}</p>{children}</article>;
}

function CardLinks({ title, icon: Icon, items, label, onClick, empty = "Nessun collegamento disponibile." }) {
  return <section className="connection-section"><h2>{Icon && <Icon aria-hidden="true" />}{title}</h2>{items.length ? <div className="connection-chips">{items.map((item, index) => <button key={`${label(item)}-${index}`} type="button" onClick={() => onClick(item)}>{label(item)}</button>)}</div> : <p className="connection-empty">{empty}</p>}</section>;
}

function TrackLinks({ tracks: list, navigate }) {
  return <div className="connection-track-list">{list.map((track) => <ConnectionRow key={track.id} track={track} onClick={() => navigate("track", track.id)} />)}</div>;
}

export default Connections;
