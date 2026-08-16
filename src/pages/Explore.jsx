import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Disc3, ListMusic, Music, Pause, Play, Search, SkipBack, SkipForward, Tags, Users } from "lucide-react";

import tracks from "../data/questions.js";
import { albums, artists, genres } from "../data/entities/index.js";
import ArtworkFallback from "../components/ArtworkFallback.jsx";
import { essentialPlaylistDescriptions, essentialPlaylists, exploreGenreNames, subgenreDescriptions } from "../data/libraryConfig.js";
import { musicAtlasCities } from "../data/musicAtlas.js";
import { prepareEssentialPlaylist, previewSearchQueries, resolvePreviewSource } from "../lib/essentialsPlayer.js";

const tabs = [
  ["genres", "Generi", Tags],
  ["subgenres", "Sottogeneri", Music],
  ["artists", "Artisti", Users],
  ["albums", "Album", Disc3],
  ["playlists", "Essentials", ListMusic],
];

const normalize = (value) => String(value ?? "").toLocaleLowerCase("it");
const alphabeticalCollator = new Intl.Collator("it", { sensitivity: "base", ignorePunctuation: true });
const exploreGenreSet = new Set(exploreGenreNames);
const contemporaryItalyTracks = tracks.filter((track) => track.sourceModule === "italy-contemporary-scene");
const contemporaryItalySubgenres = new Set(contemporaryItalyTracks.map((track) => track.subgenre).filter(Boolean));
const categoryMicroDescriptionOverrides = {
  "Acid House": "TB-303 e groove ipnotici",
  "Acid Jazz": "Jazz, funk e groove club",
  "Alternative R&B": "Soul obliquo e digitale",
  "Art Pop": "Ricerca pop tra arte e avanguardia",
  Balearic: "Eclettismo mediterraneo da club",
};

const categoryMicroDescription = (name) => categoryMicroDescriptionOverrides[name]
  ?? essentialPlaylistDescriptions[name]
  ?? subgenreDescriptions[name].replace(/[.!?].*$/s, "").split(/\s+/).slice(0, 5).join(" ");

const visibleGenreTrackIds = (genre) => genre.name === "Musica italiana"
  ? [...new Set([...genre.trackIds, ...contemporaryItalyTracks.map((track) => track.id)])]
  : genre.trackIds;

function Explore({ initialView = null, onBack, exitOnInitialBack = false, onOpenAtlasCity }) {
  const [tab, setTab] = useState("genres");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState(() => initialView ? [initialView] : []);
  const historyRef = useRef(history);
  const scrollPositionsRef = useRef([0]);
  const restoreScrollRef = useRef(true);
  const current = history.at(-1);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    const baseDepth = historyRef.current.length;
    window.history.replaceState({ ...window.history.state, musicRootsExploreDepth: baseDepth }, "");

    const handlePopState = (event) => {
      const items = historyRef.current;
      const targetDepth = event.state?.musicRootsExploreDepth;
      if (!Number.isInteger(targetDepth) || targetDepth >= items.length) return;
      restoreScrollRef.current = true;
      setHistory(items.slice(0, targetDepth));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useLayoutEffect(() => {
    const depth = history.length;
    if (restoreScrollRef.current) {
      window.scrollTo({ top: scrollPositionsRef.current[depth] ?? 0, behavior: "auto" });
      restoreScrollRef.current = false;
    }
  }, [history]);

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
    const essentials = Object.values(essentialPlaylists).map((playlist) => {
      const genre = genres.find((item) => item.name === playlist.id);
      return {
        key: `essential-${playlist.id}`,
        name: playlist.id,
        image: playlist.trackIds.map((id) => trackById.get(id)?.artwork).find(Boolean)
          ?? artworkByGenre.get(playlist.id)
          ?? "",
        viewType: genre ? "playlist" : "subgenre-playlist",
        viewId: genre?.id ?? playlist.id,
      };
    }).sort((left, right) => alphabeticalCollator.compare(left.name, right.name));
    return { trackById, artistById, albumById, genreById, artworkByGenre, subgenres, essentials };
  }, []);

  const navigate = (type, id) => {
    const depth = historyRef.current.length;
    scrollPositionsRef.current[depth] = window.scrollY;
    scrollPositionsRef.current[depth + 1] = 0;
    window.history.pushState({ ...window.history.state, musicRootsExploreDepth: depth + 1 }, "");
    restoreScrollRef.current = true;
    setHistory((items) => [...items, { type, id }]);
  };

  const goBack = () => {
    if (history.length > 1 || (history.length === 1 && !exitOnInitialBack)) window.history.back();
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
        <Detail view={current} data={data} navigate={navigate} openTrack={openTrack} onOpenAtlasCity={onOpenAtlasCity} />
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
            {tab === "genres" && genres.filter((genre) => exploreGenreSet.has(genre.name) && visible(genre.name)).map((genre) => (
              <ArchiveButton key={genre.id} image={genre.trackIds.map((id) => data.trackById.get(id)?.artwork).find(Boolean)} title={genre.name} meta={categoryMicroDescription(genre.name)} onClick={() => navigate("genre", genre.id)} />
            ))}
            {tab === "subgenres" && data.subgenres.filter((item) => !contemporaryItalySubgenres.has(item.name) && visible(item.name)).map((item) => (
              <ArchiveButton key={item.name} image={item.tracks.map((track) => track.artwork).find(Boolean) || data.artworkByGenre.get(item.tracks[0]?.genre)} title={item.name} meta={categoryMicroDescription(item.name)} onClick={() => navigate("subgenre", item.name)} />
            ))}
            {tab === "artists" && artists.filter((artist) => visible(artist.name)).map((artist) => (
              <ArchiveButton key={artist.id} image={artist.image} title={artist.name} meta={`${artist.trackIds.length} brani · ${artist.genres.join(", ")}`} onClick={() => navigate("artist", artist.id)} />
            ))}
            {tab === "albums" && albums.filter((album) => visible(`${album.title} ${album.artist}`)).map((album) => (
              <ArchiveButton key={album.id} image={album.cover} title={album.title} meta={`${album.artist} · ${album.year}`} onClick={() => navigate("album", album.id)} />
            ))}
            {tab === "playlists" && data.essentials.filter((item) => visible(item.name)).map((item) => (
              <ArchiveButton key={item.key} image={item.image} title={`Essenziali: ${item.name}`} meta={essentialPlaylistDescriptions[item.name]} onClick={() => navigate(item.viewType, item.viewId)} />
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
      {image && failedImage !== image ? <img src={image} alt="" loading="lazy" onError={() => setFailedImage(image)} /> : <ArtworkFallback title={title} compact />}
      <span><strong>{title}</strong><small>{meta}</small></span>
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

function Detail({ view, data, navigate, openTrack, onOpenAtlasCity }) {
  if (view.type === "track") return <TrackDetail track={data.trackById.get(view.id)} data={data} navigate={navigate} />;

  let title = "";
  let description = "";
  let itemTracks = [];
  let links = null;
  let cityLinks = null;
  let essentialPlaylist = null;

  if (view.type === "genre" || view.type === "playlist") {
    const genre = data.genreById.get(view.id);
    if (!genre) return null;
    title = view.type === "playlist" ? `Essenziali: ${genre.name}` : genre.name;
    description = genre.description || `${genre.name}: ${genre.trackIds.length} brani presenti nell'archivio Music Roots.`;
    essentialPlaylist = genre.essentialPlaylist;
    const playlistTrackIds = essentialPlaylist?.trackIds?.length ? essentialPlaylist.trackIds : genre.trackIds;
    itemTracks = (view.type === "playlist" ? playlistTrackIds : visibleGenreTrackIds(genre)).map((id) => data.trackById.get(id)).filter(Boolean);
    links = view.type === "genre" && (
      <>
        <LinkSection title="Artisti" items={[...new Set(itemTracks.map((track) => track.artistId))].map((id) => data.artistById.get(id)).filter(Boolean)} label={(item) => item.name} onClick={(item) => navigate("artist", item.id)} />
        <LinkSection title="Album" items={[...new Set(itemTracks.map((track) => track.albumId))].map((id) => data.albumById.get(id)).filter(Boolean)} label={(item) => `${item.title} · ${item.artist}`} onClick={(item) => navigate("album", item.id)} />
        <LinkSection title="Sottogeneri" items={[...new Set(itemTracks.map((track) => track.subgenre).filter(Boolean))]} label={(item) => item} onClick={(item) => navigate("subgenre", item)} />
        <button className="inline-link essentials-cta" type="button" onClick={() => navigate("playlist", genre.id)}>Ascolta Essentials →</button>
      </>
    );
  } else if (view.type === "subgenre" || view.type === "subgenre-playlist") {
    const subgenre = data.subgenres.find((item) => item.name === view.id);
    const subgenrePlaylist = essentialPlaylists[view.id];
    title = view.type === "subgenre-playlist" ? `Essenziali: ${view.id}` : view.id;
    itemTracks = view.type === "subgenre-playlist"
      ? (subgenrePlaylist?.trackIds ?? []).map((id) => data.trackById.get(id)).filter(Boolean)
      : subgenre?.tracks ?? [];
    description = subgenreDescriptions[view.id] ?? `${itemTracks.length} brani collegati a questo sottogenere.`;
    essentialPlaylist = subgenrePlaylist;
    links = view.type === "subgenre" && <><LinkSection title="Generi collegati" items={[...new Set(itemTracks.map((track) => track.genreId))].map((id) => data.genreById.get(id)).filter(Boolean)} label={(item) => item.name} onClick={(item) => navigate("genre", item.id)} /><LinkSection title="Artisti" items={artists.filter((artist) => artist.subgenres?.includes(view.id))} label={(item) => item.name} onClick={(item) => navigate("artist", item.id)} />{subgenrePlaylist?.trackIds?.length ? <button className="inline-link essentials-cta" type="button" onClick={() => navigate("subgenre-playlist", view.id)}>Ascolta Essentials →</button> : null}</>;
  } else if (view.type === "artist") {
    const artist = data.artistById.get(view.id);
    if (!artist) return null;
    title = artist.name;
    itemTracks = artist.trackIds.map((id) => data.trackById.get(id)).filter(Boolean);
    description = artist.biography || `${artist.name} è presente in Music Roots con ${itemTracks.length} ${itemTracks.length === 1 ? "brano" : "brani"}.`;
    const artistCities = musicAtlasCities.filter((city) => artist.cityIds.includes(city.id));
    cityLinks = artistCities.length && onOpenAtlasCity
      ? <LinkSection title="Città" items={artistCities} label={(item) => item.name} onClick={(item) => onOpenAtlasCity(item.id)} />
      : null;
    links = <><LinkSection title="Generi" items={artist.genres.map((name) => [...data.genreById.values()].find((genre) => genre.name === name)).filter(Boolean)} label={(item) => item.name} onClick={(item) => navigate("genre", item.id)} />{artist.subgenres?.length ? <LinkSection title="Sottogeneri" items={artist.subgenres} label={(item) => item} onClick={(item) => navigate("subgenre", item)} /> : null}<LinkSection title="Album" items={[...new Set(itemTracks.map((track) => track.albumId))].map((id) => data.albumById.get(id)).filter(Boolean)} label={(item) => `${item.title} · ${item.year}`} onClick={(item) => navigate("album", item.id)} /></>;
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
      <p className="eyebrow">{view.type === "playlist" || view.type === "subgenre-playlist" ? "PLAYLIST ESSENTIALS" : view.type.toUpperCase()}</p>
      <h1>{title}</h1>
      {view.type !== "playlist" && view.type !== "subgenre-playlist" && <p className="detail-description">{description}</p>}
      {cityLinks}
      {view.type !== "playlist" && view.type !== "subgenre-playlist" && links}
      {(view.type === "playlist" || view.type === "subgenre-playlist") ? (
        <VerifiedEssentialsPlaylist tracks={itemTracks} openTrack={openTrack} essentialPlaylist={essentialPlaylist} />
      ) : <TrackList tracks={itemTracks} openTrack={openTrack} />}
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

const essentialsDebugReport = new Map();

function VerifiedEssentialsPlaylist({ tracks: candidates, openTrack, essentialPlaylist }) {
  const [verifiedTracks, setVerifiedTracks] = useState(null);
  const [preparationStage, setPreparationStage] = useState("selecting");
  useEffect(() => {
    let cancelled = false;
    let preparationTimer;
    const selectionTimer = window.setTimeout(() => {
      setVerifiedTracks(null);
      setPreparationStage("selecting");
      preparationTimer = window.setTimeout(() => {
        if (cancelled) return;
        setPreparationStage("audio");
        prepareEssentialPlaylist(candidates)
          .then(({ tracks, results }) => {
            if (cancelled) return;
            setVerifiedTracks(tracks);
            const removed = results.map((result, index) => ({ result, track: candidates[index] })).filter(({ result }) => !result?.playable);
            console.groupCollapsed("[Playlist Essentials] Report controllo reale");
            console.info({ totaleBraniVerificati: candidates.length, braniMantenuti: tracks.length, braniRimossi: removed.length });
            console.table(removed.map(({ result, track }) => ({
              titolo: track?.title,
              artista: track?.artist,
              motivo: result?.reason ?? "assenza di preview audio caricabile",
            })));
            console.groupEnd();
          })
          .catch((error) => {
            if (cancelled) return;
            console.error("[Playlist Essentials] Preparazione non riuscita", error);
            setVerifiedTracks([]);
          });
      }, 140);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(selectionTimer);
      window.clearTimeout(preparationTimer);
    };
  }, [candidates]);

  let playerContent;
  if (!verifiedTracks) {
    playerContent = (
      <div className="essentials-preparing" role="status" aria-live="polite">
        <div className="essentials-equalizer" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <p>{preparationStage === "selecting" ? "Selezione dei brani…" : "Preparazione degli ascolti…"}</p>
      </div>
    );
  } else if (!verifiedTracks.length) {
    playerContent = <p className="atlas-empty">Nessuna anteprima riproducibile disponibile.</p>;
  } else {
    const removeInvalidTrack = (trackId) => setVerifiedTracks((items) => items.filter((track) => track.id !== trackId));
    playerContent = <EssentialsPlayer tracks={verifiedTracks} openTrack={openTrack} onInvalidate={removeInvalidTrack} />;
  }
  return (
    <>
      {playerContent}
      {validExternalUrl(essentialPlaylist?.fullPlaylistUrl) && (
        <a className="essentials-external-link" href={essentialPlaylist.fullPlaylistUrl} target="_blank" rel="noreferrer">
          ASCOLTA PLAYLIST COMPLETA
          {essentialPlaylist.service && <span>su {essentialPlaylist.service}</span>}
        </a>
      )}
      <TrackList tracks={candidates} openTrack={openTrack} />
    </>
  );
}

function printEssentialsReport() {
  const rows = [...essentialsDebugReport.values()];
  console.groupCollapsed("[Essentials Audio] Riepilogo preview");
  console.table(rows.filter((row) => row.esito === "Deezer"));
  console.table(rows.filter((row) => row.esito === "Solo Apple Music"));
  console.table(rows.filter((row) => row.esito === "Nessuna anteprima"));
  console.table(rows.filter((row) => row.matchErrati > 0));
  console.groupEnd();
}

function EssentialsPlayer({ tracks: playlist, openTrack, onInvalidate }) {
  const audioRef = useRef(null);
  const sessionRef = useRef(0);
  const attemptedRef = useRef(new Set());
  const wantsPlaybackRef = useRef(false);
  const stalledTimerRef = useRef(null);
  const switchingSourceRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [, setPlayerError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failedArtwork, setFailedArtwork] = useState("");
  const current = playlist[index];

  const setPlaybackIntent = useCallback((value) => {
    wantsPlaybackRef.current = value;
  }, []);

  const debugTrack = useCallback((track, extra = {}) => {
    if (!track) return;
    const queries = previewSearchQueries(track);
    console.info("[Essentials Audio]", {
      titoloRichiesto: track.title,
      artistaRichiesto: track.artist,
      albumRichiesto: track.album ?? "",
      queryDeezer: queries.deezer,
      queryAppleMusic: queries.apple,
      fontiTentate: [...attemptedRef.current],
      ...extra,
    });
  }, []);

  const move = useCallback((direction, autoplay = wantsPlaybackRef.current) => {
    const next = index + direction;
    if (next < 0 || next >= playlist.length) {
      setPlaybackIntent(false);
      setPlaying(false);
      return;
    }
    setPlaybackIntent(autoplay);
    setIndex(next);
  }, [index, playlist.length, setPlaybackIntent]);

  const markUnavailable = useCallback((reason, matchErrati = 0) => {
    const failedId = current?.id;
    essentialsDebugReport.set(current?.id, { titolo: current?.title, artista: current?.artist, esito: "Nessuna anteprima", matchErrati, motivo: reason });
    debugTrack(current, { fonteEffettiva: "nessuna", tipoErrore: reason, motivoRimozione: "Deezer e Apple Music non riproducibili" });
    printEssentialsReport();
    setPreview(null);
    setLoading(false);
    setPlaying(false);
    setPlayerError(reason);
    setIndex((position) => position >= playlist.length - 1 ? Math.max(0, position - 1) : position);
    if (failedId) onInvalidate(failedId);
  }, [current, debugTrack, onInvalidate, playlist.length]);

  const tryNextSource = useCallback(async (reason, session = sessionRef.current, rejectedSoFar = 0) => {
    if (!current || session !== sessionRef.current) return false;
    let rejectedTotal = rejectedSoFar;
    let lastReason = reason;
    for (const key of ["deezer", "apple"]) {
      if (attemptedRef.current.has(key)) continue;
      attemptedRef.current.add(key);
      setLoading(true);
      setPlayerError("");
      const validated = current.essentialPreview?.key === key ? current.essentialPreview : null;
      const resolved = validated ? {
        key,
        source: validated.source,
        query: previewSearchQueries(current)[key],
        result: null,
        url: validated.url,
        rejected: [],
        searchError: null,
        usedStoredResult: true,
      } : await resolvePreviewSource(current, key);
      if (session !== sessionRef.current) return false;

      console.info("[Essentials Audio] Ricerca preview", {
        titoloRichiesto: current.title,
        artistaRichiesto: current.artist,
        fonte: resolved.source,
        queryInviata: resolved.query,
        risultatoScelto: resolved.result ? { id: resolved.result.id, titolo: resolved.result.title, artista: resolved.result.artist, album: resolved.result.album } : null,
        urlPreview: resolved.url,
        risultatoMemorizzato: resolved.usedStoredResult,
        matchErratiEsclusi: resolved.rejected.map((item) => ({ id: item.id, titolo: item.title, artista: item.artist, album: item.album })),
        erroreRicerca: resolved.searchError,
      });

      rejectedTotal += resolved.rejected.length;
      if (!resolved.url) {
        lastReason = `${resolved.source}: ${resolved.searchError || (resolved.rejected.length ? "risultati esclusi per match errato" : "preview assente")}`;
        continue;
      }

      switchingSourceRef.current = true;
      setElapsed(0);
      setDuration(0);
      setMessage("");
      setPlaying(false);
      setPreview({ key, source: resolved.source, url: resolved.url, rejectedTotal });
      setLoading(true);
      debugTrack(current, { fonteTentata: resolved.source, urlPreview: resolved.url, motivoTentativo: lastReason });
      return true;
    }
    markUnavailable(lastReason, rejectedTotal);
    return false;
  }, [current, debugTrack, markUnavailable]);

  const failActiveSource = useCallback((type, detail = "") => {
    if (!preview) return;
    clearTimeout(stalledTimerRef.current);
    const failed = preview;
    setLoading(false);
    setPlaying(false);
    setPreview(null);
    setPlayerError(`${type}${detail ? `: ${detail}` : ""}`);
    debugTrack(current, { fonteEffettiva: failed.source, tipoErrore: type, dettaglioErrore: detail, azione: failed.key === "deezer" ? "fallback Apple Music" : "fonti esaurite" });
    void tryNextSource(`${failed.source}: ${type}${detail ? ` (${detail})` : ""}`, sessionRef.current, failed.rejectedTotal);
  }, [current, debugTrack, preview, tryNextSource]);

  const requestPlay = useCallback(async (reason) => {
    const audio = audioRef.current;
    if (!audio || !preview) return;
    const session = sessionRef.current;
    try {
      await audio.play();
      if (session === sessionRef.current) debugTrack(current, { fonteEffettiva: preview.source, evento: reason });
    } catch (playError) {
      if (session !== sessionRef.current) return;
      const name = playError?.name ?? "PlayError";
      const detail = playError?.message ?? "";
      if (name === "NotAllowedError" || name === "AbortError") {
        setPlaybackIntent(false);
        setLoading(false);
        setPlaying(false);
        setPlayerError(`play rejected: ${name}`);
        debugTrack(current, { fonteEffettiva: preview.source, tipoErrore: "play rejected", dettaglioErrore: `${name}: ${detail}`, motivoSalto: "nessuno" });
      } else {
        failActiveSource("play rejected", `${name}: ${detail}`);
      }
    }
  }, [current, debugTrack, failActiveSource, preview, setPlaybackIntent]);

  useEffect(() => {
    const session = ++sessionRef.current;
    clearTimeout(stalledTimerRef.current);
    attemptedRef.current = new Set(current?.essentialPreview?.key === "apple" ? ["deezer"] : []);
    switchingSourceRef.current = true;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      try { audio.currentTime = 0; } catch { /* Nessun media caricato. */ }
    }
    queueMicrotask(() => {
      if (session !== sessionRef.current) return;
      setPreview(null);
      setElapsed(0);
      setDuration(0);
      setMessage("");
      setPlayerError("");
      setLoading(false);
      setPlaying(false);
      debugTrack(current, { evento: "cambio brano", resetCompleto: true });
      void tryNextSource("inizio brano", session);
    });
    return () => {
      clearTimeout(stalledTimerRef.current);
    };
    // Il reset deve dipendere esclusivamente dall'identità del brano.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !preview?.url) return;
    switchingSourceRef.current = true;
    audio.pause();
    try { audio.currentTime = 0; } catch { /* Metadata non ancora disponibili. */ }
    audio.src = preview.url;
    audio.load();
  }, [preview?.url]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || message) return;
    if (!audio.paused) {
      setPlaybackIntent(false);
      audio.pause();
      return;
    }
    setPlaybackIntent(true);
    if (!preview) await tryNextSource("pressione Play");
    else await requestPlay("pressione Play");
  };

  if (!playlist.length) return null;
  return (
    <section className="essentials-player glass-card" aria-label="Player della playlist Essentials">
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => { setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0); setPlayerError(""); debugTrack(current, { fonteEffettiva: preview?.source, evento: "loadedmetadata" }); }}
        onCanPlay={() => { clearTimeout(stalledTimerRef.current); switchingSourceRef.current = false; setLoading(false); setPlayerError(""); debugTrack(current, { fonteEffettiva: preview?.source, evento: "canplay" }); if (wantsPlaybackRef.current && audioRef.current?.paused) void requestPlay("canplay"); }}
        onPlay={() => { setPlaying(true); debugTrack(current, { fonteEffettiva: preview?.source, evento: "play" }); }}
        onPlaying={() => { setPlaying(true); setLoading(false); if (current) { essentialsDebugReport.set(current.id, { titolo: current.title, artista: current.artist, esito: preview?.key === "deezer" ? "Deezer" : "Solo Apple Music", matchErrati: preview?.rejectedTotal ?? 0, motivo: "" }); printEssentialsReport(); } }}
        onPause={() => { setPlaying(false); debugTrack(current, { fonteEffettiva: preview?.source, evento: "pause" }); }}
        onEnded={() => { setPlaying(false); debugTrack(current, { fonteEffettiva: preview?.source, evento: "ended", motivoSalto: "fine naturale" }); move(1, true); }}
        onError={(event) => { const mediaError = event.currentTarget.error; const failedUrl = event.currentTarget.currentSrc || event.currentTarget.src; if (!preview?.url || failedUrl !== preview.url) { debugTrack(current, { evento: "onError ignorato", failedUrl, activeUrl: preview?.url ?? "" }); return; } failActiveSource("error", `MediaError ${mediaError?.code ?? "sconosciuto"}: ${mediaError?.message ?? ""}`); }}
        onStalled={() => { clearTimeout(stalledTimerRef.current); setLoading(true); debugTrack(current, { fonteEffettiva: preview?.source, evento: "stalled", azione: "attesa 6 secondi" }); stalledTimerRef.current = setTimeout(() => failActiveSource("stalled", "nessun avanzamento per 6 secondi"), 6000); }}
        onAbort={() => { debugTrack(current, { fonteEffettiva: preview?.source, evento: "abort", cambioSorgente: switchingSourceRef.current }); if (!switchingSourceRef.current) { setLoading(false); setPlaying(false); setPlayerError("abort"); } }}
      />
      <button className="essentials-now-playing" type="button" onClick={() => openTrack(current.id)} aria-label={`Apri la scheda di ${current.title}`}>
        {current.artwork && failedArtwork !== current.artwork ? <img src={current.artwork} alt="" onError={() => setFailedArtwork(current.artwork)} /> : <ArtworkFallback title={current.title} compact />}
        <span><small>{message ? message.toUpperCase() : `IN RIPRODUZIONE · ${preview?.source ?? (loading ? "CARICAMENTO" : "ANTEPRIMA")}`}</small><strong>{current.title}</strong><em>{current.artist}</em></span>
        <ChevronRight aria-hidden="true" />
      </button>
      <div className="essentials-progress">
        <input aria-label="Avanzamento anteprima" type="range" min="0" max={duration || 0} step="0.1" value={Math.min(elapsed, duration || 0)} disabled={!preview || loading || Boolean(message)} onChange={(event) => { const time = Number(event.target.value); audioRef.current.currentTime = time; setElapsed(time); }} />
        <div><span>{formatTime(elapsed)}</span><span>{formatTime(duration)}</span></div>
      </div>
      <div className="essentials-controls">
        <button type="button" onClick={() => move(-1, playing)} disabled={index <= 0} aria-label="Brano precedente"><SkipBack /></button>
        <button className="essentials-play" type="button" onClick={toggle} disabled={Boolean(message)} aria-label={playing ? "Pausa" : "Riproduci"}>{playing ? <Pause /> : <Play />}</button>
        <button type="button" onClick={() => move(1, playing)} disabled={index >= playlist.length - 1} aria-label="Brano successivo"><SkipForward /></button>
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
  return <section className="detail-tracks"><h2>Brani <span>{list.length}</span></h2>{list.map((track) => <ArchiveButton key={track.id} image={track.artwork} title={track.title} meta={[track.artist, track.album, track.year].filter(Boolean).join(" · ")} onClick={() => openTrack(track.id)} />)}</section>;
}

function TrackDetail({ track, data, navigate }) {
  const [failedArtwork, setFailedArtwork] = useState(false);
  if (!track) return null;
  const artist = data.artistById.get(track.artistId);
  const album = data.albumById.get(track.albumId);
  const genre = data.genreById.get(track.genreId);
  const detailArtwork = /mzstatic\.com/.test(track.artwork)
    ? track.artwork.replace(/\/\d+x\d+bb\.(jpg|png)$/i, "/600x600bb.$1")
    : track.artwork;
  return (
    <article className="archive-detail track-detail page-enter">
      {detailArtwork && !failedArtwork ? <img className="track-cover" src={detailArtwork} alt={track.artworkType === "editorial" ? `Artwork editoriale Music Roots per ${track.title}` : track.album ? `Copertina di ${track.album}` : `Copertina di ${track.title}`} onError={() => setFailedArtwork(true)} /> : <ArtworkFallback className="track-cover" title={track.title} artist={track.artist} />}
      <p className="eyebrow">SCHEDA DEL BRANO</p><h1>{track.title}</h1>
      <button className="inline-link" type="button" onClick={() => navigate("artist", artist.id)}>{track.artist} →</button>
      <p className="detail-meta">{track.year}{album ? <> · <button type="button" onClick={() => navigate("album", album.id)}>{track.album}</button></> : null}</p>
      <LinkSection title="Classificazione" items={[genre, track.subgenre].filter(Boolean)} label={(item) => typeof item === "string" ? item : item.name} onClick={(item) => typeof item === "string" ? navigate("subgenre", item) : navigate("genre", item.id)} />
      <section className="track-editorial">
        {track.musicalCharacteristics ? <><h2>Caratteristiche musicali</h2><p>{track.musicalCharacteristics}</p><h2>Significato</h2><p>{track.meaning}</p></> : <><h2>Curiosità</h2><p>{track.curiosity}</p><h2>Significato</h2><p>{track.meaning}</p></>}
        <h2>Influenze</h2><p>{Array.isArray(track.influences) ? track.influences.join(", ") : track.influences}</p><h2>Scenario storico e culturale</h2><p>{track.scenario}</p>
      </section>
      <button className="inline-link" type="button" onClick={() => navigate("playlist", genre.id)}>Essenziali: {genre.name} →</button>
      <div className="external-links">{track.links?.spotify && <a href={track.links.spotify} target="_blank" rel="noreferrer">Spotify</a>}{track.links?.appleMusic && <a href={track.links.appleMusic} target="_blank" rel="noreferrer">Apple Music</a>}{track.links?.youtube && <a href={track.links.youtube} target="_blank" rel="noreferrer">YouTube</a>}</div>
    </article>
  );
}

export default Explore;
