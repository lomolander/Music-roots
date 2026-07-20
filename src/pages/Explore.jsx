import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Disc3, ListMusic, Music, Pause, Play, Search, SkipBack, SkipForward, Tags, Users } from "lucide-react";

import tracks from "../data/questions.js";
import { albums, artists, genres } from "../data/entities/index.js";
import { findPlayableIndex, previewFor, validPreview } from "../lib/essentialsPlayer.js";

const tabs = [
  ["genres", "Generi", Tags],
  ["subgenres", "Sottogeneri", Music],
  ["artists", "Artisti", Users],
  ["albums", "Album", Disc3],
  ["playlists", "Essentials", ListMusic],
];

const normalize = (value) => String(value ?? "").toLocaleLowerCase("it");

function Explore({ onBack }) {
  const [tab, setTab] = useState("genres");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const current = history.at(-1);

  const data = useMemo(() => {
    const trackById = new Map(tracks.map((track) => [track.id, track]));
    const artistById = new Map(artists.map((artist) => [artist.id, artist]));
    const albumById = new Map(albums.map((album) => [album.id, album]));
    const genreById = new Map(genres.map((genre) => [genre.id, genre]));
    const artworkByGenre = new Map(genres.map((genre) => [
      genre.name,
      genre.trackIds.map((id) => trackById.get(id)?.artwork).find(Boolean) ?? "",
    ]));
    const subgenres = [...new Set(tracks.map((track) => track.subgenre).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right, "it"))
      .map((name) => ({ name, tracks: tracks.filter((track) => track.subgenre === name) }));
    return { trackById, artistById, albumById, genreById, artworkByGenre, subgenres };
  }, []);

  const navigate = (type, id) => {
    setHistory((items) => [...items, { type, id }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (history.length) setHistory((items) => items.slice(0, -1));
    else onBack();
  };

  const openTrack = (id) => navigate("track", id);
  const visible = (value) => !query || normalize(value).includes(normalize(query.trim()));

  return (
    <main className="app-shell explore-screen page-enter">
      <header className="explore-header">
        <button className="back-button" type="button" onClick={goBack}>← Indietro</button>
        <span className="explore-count">{tracks.length} brani</span>
      </header>

      {current ? (
        <Detail view={current} data={data} navigate={navigate} openTrack={openTrack} />
      ) : (
        <>
          <section className="explore-intro">
            <p className="eyebrow">ARCHIVIO MUSICALE</p>
            <h1>Esplora</h1>
            <p>Naviga tra generi, protagonisti, album e playlist senza uscire dalla libreria Music Roots.</p>
          </section>

          <nav className="explore-tabs" aria-label="Categorie dell'archivio">
            {tabs.map(([id, label, Icon]) => (
              <button className={tab === id ? "active" : ""} key={id} type="button" onClick={() => { setTab(id); setQuery(""); }}>
                <Icon aria-hidden="true" />{label}
              </button>
            ))}
          </nav>

          <label className="explore-search">
            <Search aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Cerca in ${tabs.find(([id]) => id === tab)?.[1].toLowerCase()}…`} />
          </label>

          <section className="archive-list">
            {tab === "genres" && genres.filter((genre) => visible(genre.name)).map((genre) => (
              <ArchiveButton key={genre.id} image={genre.trackIds.map((id) => data.trackById.get(id)?.artwork).find(Boolean)} title={genre.name} meta={`${genre.trackIds.length} brani · ${genre.essentialArtists.length} artisti rappresentativi`} onClick={() => navigate("genre", genre.id)} />
            ))}
            {tab === "subgenres" && data.subgenres.filter((item) => visible(item.name)).map((item) => (
              <ArchiveButton key={item.name} image={item.tracks.map((track) => track.artwork).find(Boolean) || data.artworkByGenre.get(item.tracks[0]?.genre)} title={item.name} meta={`${item.tracks.length} brani · ${new Set(item.tracks.map((track) => track.artist)).size} artisti`} onClick={() => navigate("subgenre", item.name)} />
            ))}
            {tab === "artists" && artists.filter((artist) => visible(artist.name)).map((artist) => (
              <ArchiveButton key={artist.id} image={artist.image} title={artist.name} meta={`${artist.trackIds.length} brani · ${artist.genres.join(", ")}`} onClick={() => navigate("artist", artist.id)} />
            ))}
            {tab === "albums" && albums.filter((album) => visible(`${album.title} ${album.artist}`)).map((album) => (
              <ArchiveButton key={album.id} image={album.cover} title={album.title} meta={`${album.artist} · ${album.year}`} onClick={() => navigate("album", album.id)} />
            ))}
            {tab === "playlists" && genres.filter((genre) => genre.essentialPlaylist && visible(genre.name)).map((genre) => (
              <ArchiveButton key={genre.id} image={data.trackById.get(genre.trackIds.find((id) => data.trackById.get(id)?.artwork))?.artwork} title={`Essenziali: ${genre.name}`} meta={`${genre.trackIds.length} brani dalla libreria`} onClick={() => navigate("playlist", genre.id)} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}

function ArchiveButton({ image, title, meta, onClick }) {
  const [failedImage, setFailedImage] = useState("");
  return (
    <button className="archive-row glass-card" type="button" onClick={onClick}>
      {image && failedImage !== image ? <img src={image} alt="" loading="lazy" onError={() => setFailedImage(image)} /> : <span className="archive-placeholder"><Music /></span>}
      <span><strong>{title}</strong><small>{meta}</small></span>
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

function Detail({ view, data, navigate, openTrack }) {
  if (view.type === "track") return <TrackDetail track={data.trackById.get(view.id)} data={data} navigate={navigate} />;

  let title = "";
  let description = "";
  let itemTracks = [];
  let links = null;
  let essentialPlaylist = null;

  if (view.type === "genre" || view.type === "playlist") {
    const genre = data.genreById.get(view.id);
    if (!genre) return null;
    title = view.type === "playlist" ? `Essenziali: ${genre.name}` : genre.name;
    description = genre.description || `${genre.name}: ${genre.trackIds.length} brani presenti nell'archivio Music Roots.`;
    itemTracks = genre.trackIds.map((id) => data.trackById.get(id)).filter(Boolean);
    essentialPlaylist = genre.essentialPlaylist;
    links = view.type === "genre" && (
      <>
        <LinkSection title="Artisti" items={[...new Set(itemTracks.map((track) => track.artistId))].map((id) => data.artistById.get(id)).filter(Boolean)} label={(item) => item.name} onClick={(item) => navigate("artist", item.id)} />
        <LinkSection title="Album" items={[...new Set(itemTracks.map((track) => track.albumId))].map((id) => data.albumById.get(id)).filter(Boolean)} label={(item) => `${item.title} · ${item.artist}`} onClick={(item) => navigate("album", item.id)} />
        <LinkSection title="Sottogeneri" items={[...new Set(itemTracks.map((track) => track.subgenre).filter(Boolean))]} label={(item) => item} onClick={(item) => navigate("subgenre", item)} />
        <button className="inline-link" type="button" onClick={() => navigate("playlist", genre.id)}>Apri la playlist Essentials →</button>
      </>
    );
  } else if (view.type === "subgenre") {
    title = view.id;
    itemTracks = data.subgenres.find((item) => item.name === view.id)?.tracks ?? [];
    description = `${itemTracks.length} brani collegati a questo sottogenere.`;
    links = <LinkSection title="Generi collegati" items={[...new Set(itemTracks.map((track) => track.genreId))].map((id) => data.genreById.get(id)).filter(Boolean)} label={(item) => item.name} onClick={(item) => navigate("genre", item.id)} />;
  } else if (view.type === "artist") {
    const artist = data.artistById.get(view.id);
    if (!artist) return null;
    title = artist.name;
    itemTracks = artist.trackIds.map((id) => data.trackById.get(id)).filter(Boolean);
    description = artist.biography || `${artist.name} è presente in Music Roots con ${itemTracks.length} ${itemTracks.length === 1 ? "brano" : "brani"}.`;
    links = <><LinkSection title="Generi" items={artist.genres.map((name) => [...data.genreById.values()].find((genre) => genre.name === name)).filter(Boolean)} label={(item) => item.name} onClick={(item) => navigate("genre", item.id)} /><LinkSection title="Album" items={[...new Set(itemTracks.map((track) => track.albumId))].map((id) => data.albumById.get(id)).filter(Boolean)} label={(item) => `${item.title} · ${item.year}`} onClick={(item) => navigate("album", item.id)} /></>;
  } else if (view.type === "album") {
    const album = data.albumById.get(view.id);
    if (!album) return null;
    title = album.title;
    itemTracks = album.trackIds.map((id) => data.trackById.get(id)).filter(Boolean);
    description = album.description;
    links = <><button className="inline-link" type="button" onClick={() => navigate("artist", album.artistId)}>{album.artist} →</button><p className="detail-meta">{album.year} · {itemTracks.map((track) => track.genre).filter((value, index, list) => list.indexOf(value) === index).join(", ")}</p></>;
  }

  return (
    <article className="archive-detail page-enter">
      <p className="eyebrow">{view.type === "playlist" ? "PLAYLIST ESSENTIALS" : view.type.toUpperCase()}</p>
      <h1>{title}</h1>
      {view.type !== "playlist" && <p className="detail-description">{description}</p>}
      {view.type !== "playlist" && links}
      {view.type === "playlist" && <EssentialsPlayer tracks={itemTracks} openTrack={openTrack} />}
      {view.type === "playlist" && validExternalUrl(essentialPlaylist?.fullPlaylistUrl) && (
        <a className="essentials-external-link" href={essentialPlaylist.fullPlaylistUrl} target="_blank" rel="noreferrer">
          ASCOLTA PLAYLIST COMPLETA
          {essentialPlaylist.service && <span>su {essentialPlaylist.service}</span>}
        </a>
      )}
      <TrackList tracks={itemTracks} openTrack={openTrack} />
    </article>
  );
}

const validExternalUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
};
const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
};

function EssentialsPlayer({ tracks: playlist, openTrack }) {
  const audioRef = useRef(null);
  const [index, setIndex] = useState(() => {
    const first = playlist.findIndex((track) => previewFor(track));
    return first < 0 ? 0 : first;
  });
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [forceDeezer, setForceDeezer] = useState(false);
  const current = playlist[index];
  const preview = current ? previewFor(current, forceDeezer) : null;
  const previewUrl = preview?.url ?? "";

  const findPlayable = useCallback((from, direction) => {
    return findPlayableIndex(playlist, from, direction);
  }, [playlist]);

  const move = useCallback((direction, autoplay = playing) => {
    const next = findPlayable(index + direction, direction);
    if (next < 0) {
      setPlaying(false);
      return;
    }
    setIndex(next);
    setForceDeezer(false);
    setElapsed(0);
    setDuration(0);
    setPlaying(autoplay);
  }, [findPlayable, index, playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing, previewUrl]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !preview) return;
    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch (error) {
      if (!forceDeezer && validPreview(current?.deezer?.previewUrl)) {
        setForceDeezer(true);
        audio.src = current.deezer.previewUrl;
        audio.load();
        try {
          await audio.play();
          setPlaying(true);
          return;
        } catch (fallbackError) {
          console.warn("[Essentials] Preview Deezer non riproducibile", fallbackError);
        }
      } else {
        console.warn("[Essentials] Preview non riproducibile", error);
      }
      setPlaying(false);
      move(1, true);
    }
  };

  const handleError = () => {
    if (!forceDeezer && validPreview(current?.deezer?.previewUrl)) {
      setForceDeezer(true);
      setElapsed(0);
      setDuration(0);
      return;
    }
    move(1, true);
  };

  if (!playlist.length) return null;
  return (
    <section className="essentials-player glass-card" aria-label="Player della playlist Essentials">
      <audio
        ref={audioRef}
        src={preview?.url}
        preload="metadata"
        onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => move(1, true)}
        onError={handleError}
      />
      <button className="essentials-now-playing" type="button" onClick={() => openTrack(current.id)} aria-label={`Apri la scheda di ${current.title}`}>
        {current.artwork ? <img src={current.artwork} alt="" /> : <span className="archive-placeholder"><Music /></span>}
        <span><small>IN RIPRODUZIONE · {preview?.source ?? "ANTEPRIMA NON DISPONIBILE"}</small><strong>{current.title}</strong><em>{current.artist}</em></span>
        <ChevronRight aria-hidden="true" />
      </button>
      <div className="essentials-progress">
        <input aria-label="Avanzamento anteprima" type="range" min="0" max={duration || 0} step="0.1" value={Math.min(elapsed, duration || 0)} disabled={!preview} onChange={(event) => { const time = Number(event.target.value); audioRef.current.currentTime = time; setElapsed(time); }} />
        <div><span>{formatTime(elapsed)}</span><span>{formatTime(duration)}</span></div>
      </div>
      <div className="essentials-controls">
        <button type="button" onClick={() => move(-1)} disabled={findPlayable(index - 1, -1) < 0} aria-label="Brano precedente"><SkipBack /></button>
        <button className="essentials-play" type="button" onClick={toggle} disabled={!preview} aria-label={playing ? "Pausa" : "Riproduci"}>{playing ? <Pause /> : <Play />}</button>
        <button type="button" onClick={() => move(1)} disabled={findPlayable(index + 1, 1) < 0} aria-label="Brano successivo"><SkipForward /></button>
      </div>
      <p className="essentials-position">{index + 1} di {playlist.length}</p>
    </section>
  );
}

function LinkSection({ title, items, label, onClick }) {
  if (!items.length) return null;
  return <section className="detail-links"><h2>{title}</h2><div>{items.map((item, index) => <button key={`${label(item)}-${index}`} type="button" onClick={() => onClick(item)}>{label(item)}</button>)}</div></section>;
}

function TrackList({ tracks: list, openTrack }) {
  return <section className="detail-tracks"><h2>Brani <span>{list.length}</span></h2>{list.map((track) => <ArchiveButton key={track.id} image={track.artwork} title={track.title} meta={`${track.artist} · ${track.album} · ${track.year}`} onClick={() => openTrack(track.id)} />)}</section>;
}

function TrackDetail({ track, data, navigate }) {
  if (!track) return null;
  const artist = data.artistById.get(track.artistId);
  const album = data.albumById.get(track.albumId);
  const genre = data.genreById.get(track.genreId);
  return (
    <article className="archive-detail track-detail page-enter">
      {track.artwork ? <img className="track-cover" src={track.artwork} alt={`Copertina di ${track.album}`} /> : null}
      <p className="eyebrow">SCHEDA DEL BRANO</p><h1>{track.title}</h1>
      <button className="inline-link" type="button" onClick={() => navigate("artist", artist.id)}>{track.artist} →</button>
      <p className="detail-meta">{track.year} · <button type="button" onClick={() => navigate("album", album.id)}>{track.album}</button></p>
      <LinkSection title="Classificazione" items={[genre, track.subgenre].filter(Boolean)} label={(item) => typeof item === "string" ? item : item.name} onClick={(item) => typeof item === "string" ? navigate("subgenre", item) : navigate("genre", item.id)} />
      <section className="track-editorial">
        {track.musicalCharacteristics ? <><h2>Caratteristiche musicali</h2><p>{track.musicalCharacteristics}</p><h2>Significato</h2><p>{track.meaning}</p><h2>Perché è importante</h2><p>{track.importance}</p></> : <><h2>Curiosità</h2><p>{track.curiosity}</p><h2>Significato</h2><p>{track.meaning}</p></>}
        <h2>Influenze</h2><p>{Array.isArray(track.influences) ? track.influences.join(", ") : track.influences}</p><h2>Scenario storico e culturale</h2><p>{track.scenario}</p>
      </section>
      <button className="inline-link" type="button" onClick={() => navigate("playlist", genre.id)}>Essenziali: {genre.name} →</button>
      <div className="external-links">{track.links?.spotify && <a href={track.links.spotify} target="_blank" rel="noreferrer">Spotify</a>}{track.links?.appleMusic && <a href={track.links.appleMusic} target="_blank" rel="noreferrer">Apple Music</a>}{track.links?.youtube && <a href={track.links.youtube} target="_blank" rel="noreferrer">YouTube</a>}</div>
    </article>
  );
}

export default Explore;
