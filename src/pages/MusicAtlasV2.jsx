import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Building2, ChevronLeft, LocateFixed, MapPin, Music2, Search, Users, X } from "lucide-react";

import tracks from "../data/questions.js";
import { artists } from "../data/entities/index.js";
import { musicAtlasCities, musicAtlasVenues } from "../data/musicAtlas.js";
import AtlasMetroMap from "./atlas-v2/AtlasMetroMap.jsx";

const countries = {
  chicago: "Stati Uniti", detroit: "Stati Uniti", "new-york": "Stati Uniti", london: "Regno Unito", manchester: "Regno Unito", liverpool: "Regno Unito", bristol: "Regno Unito", berlin: "Germania", paris: "Francia", kingston: "Giamaica", rio: "Brasile", napoli: "Italia", roma: "Italia", milano: "Italia", genova: "Italia", venezia: "Italia", bologna: "Italia", torino: "Italia", glasgow: "Regno Unito", "los-angeles": "Stati Uniti", "san-francisco": "Stati Uniti", birmingham: "Regno Unito", canterbury: "Regno Unito", newcastle: "Regno Unito", boston: "Stati Uniti", seattle: "Stati Uniti", jacksonville: "Stati Uniti", austin: "Stati Uniti", sydney: "Australia", melbourne: "Australia", toronto: "Canada", hannover: "Germania", belfast: "Regno Unito", topeka: "Stati Uniti", tokyo: "Giappone", osaka: "Giappone", kyoto: "Giappone", yokohama: "Giappone", hiroshima: "Giappone", kanazawa: "Giappone",
};
const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it").trim();
const artistById = new Map(artists.map((artist) => [artist.id, artist]));
const artistByName = new Map(artists.map((artist) => [normalize(artist.name), artist]));
const trackById = new Map(tracks.map((track) => [track.id, track]));

function MusicAtlasV2({ onBack, onOpenArtist, initialCityId = null, initialFocusCityId = null, initialScrollLeft = null, onRememberScroll }) {
  const mapRef = useRef(null);
  const savedScrollRef = useRef(initialScrollLeft);
  const [query, setQuery] = useState("");
  const [currentView, setCurrentView] = useState(() => initialCityId ? { type: "city", cityId: initialCityId } : { type: "map" });
  const [targetSection, setTargetSection] = useState(null);
  const [showHint, setShowHint] = useState(true);

  const atlas = useMemo(() => musicAtlasCities.map((city) => {
    const venues = musicAtlasVenues.filter((venue) => venue.cityId === city.id);
    const linkedArtists = new Map();
    city.artistIds.forEach((id) => { const artist = artistById.get(id); if (artist) linkedArtists.set(artist.id, artist); });
    venues.flatMap((venue) => venue.artistNames).forEach((name) => { const artist = artistByName.get(normalize(name)); if (artist) linkedArtists.set(artist.id, artist); });
    const cityArtists = [...linkedArtists.values()].sort((a, b) => a.name.localeCompare(b.name, "it"));
    const heroImage = city.trackIds.map((id) => trackById.get(id)?.artwork).find(Boolean) || cityArtists.map((artist) => artist.image).find(Boolean) || "";
    return { ...city, country: countries[city.id] ?? "", venues, artists: cityArtists, heroImage };
  }), []);
  const cityById = useMemo(() => new Map(atlas.map((city) => [city.id, city])), [atlas]);
  const selectedCity = currentView.cityId ? cityById.get(currentView.cityId) : null;
  const selectedVenue = currentView.type === "venue" ? selectedCity?.venues.find((venue) => venue.id === currentView.venueId) : null;
  const results = useMemo(() => {
    const term = normalize(query);
    if (!term) return [];
    const found = [];
    atlas.forEach((city) => {
      if (normalize(city.name).includes(term)) found.push({ type: "city", label: city.name, city });
      city.venues.forEach((venue) => { if (normalize(venue.name).includes(term)) found.push({ type: "venues", label: venue.name, city }); });
      city.artists.forEach((artist) => { if (normalize(artist.name).includes(term)) found.push({ type: "artists", label: artist.name, city }); });
    });
    return found.slice(0, 8);
  }, [atlas, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHint(false), 3200);
    const centerTimer = window.setTimeout(() => {
      if (initialFocusCityId) mapRef.current?.centerCity(initialFocusCityId, "auto");
      else if (!initialCityId && initialScrollLeft === null) mapRef.current?.centerDefault("auto");
    }, 0);
    return () => { window.clearTimeout(timer); window.clearTimeout(centerTimer); };
  }, [initialCityId, initialFocusCityId, initialScrollLeft]);
  useEffect(() => {
    if (currentView.type === "map" && !initialFocusCityId && savedScrollRef.current !== null) {
      const timer = window.setTimeout(() => mapRef.current?.restoreScrollLeft(savedScrollRef.current), 0);
      return () => window.clearTimeout(timer);
    }
  }, [currentView.type, initialFocusCityId]);

  const openCity = (city, section = null) => {
      console.log("1 - OPEN CITY RICEVUTA:", city);
      if (!city?.id || !cityById.has(city.id)) {
    console.log("2 - CITTÀ NON TROVATA:", city?.id);
    return;
  }
    const nextView = { type: "city", cityId: city.id };
    savedScrollRef.current = mapRef.current?.getScrollLeft() ?? savedScrollRef.current;
    onRememberScroll?.(savedScrollRef.current);
     console.log("3 - CAMBIO VISTA:", nextView);
    setCurrentView(nextView);
    setTargetSection(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const chooseResult = (result) => {
    setQuery("");
    mapRef.current?.centerCity(result.city.id);
    const section = result.type === "city" ? null : result.type;
    window.setTimeout(() => openCity(result.city, section), 320);
  };
  const goBack = () => {
    if (currentView.type === "venue") setCurrentView({ type: "city", cityId: currentView.cityId });
    else if (currentView.type === "city") { setCurrentView({ type: "map" }); setTargetSection(null); }
    else onBack();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="atlas-v2 app-shell page-enter">
      <header className="atlas-v2-header"><button className="back-button" type="button" onClick={goBack}>← Indietro</button><span><MapPin /> Atlante V2</span></header>
      {selectedVenue ? (
        <VenueDetail city={selectedCity} venue={selectedVenue} onCity={() => setCurrentView({ type: "city", cityId: selectedCity.id })} onArtist={(id) => onOpenArtist(id, selectedCity.id)} />
      ) : currentView.type === "city" && selectedCity ? (
        <CityDetail city={selectedCity} targetSection={targetSection} onVenue={(venueId) => setCurrentView({ type: "venue", cityId: selectedCity.id, venueId })} onArtist={(id) => onOpenArtist(id, selectedCity.id)} />
      ) : (
        <>
          <section className="atlas-v2-intro"><p className="eyebrow">ATLANTE MUSICALE · V2</p><h1>Geografie in movimento.</h1><p>Quaranta città, raccontate come fermate di una rete musicale.</p></section>
          <div className="atlas-v2-search-wrap">
            <label className="atlas-v2-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca città, luogo o artista" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Cancella ricerca"><X /></button>}</label>
            {query && <div className="atlas-v2-results glass-panel">{results.map((result) => <button type="button" key={`${result.type}-${result.city.id}-${result.label}`} onClick={() => chooseResult(result)}><span><small>{result.type === "city" ? "CITTÀ" : result.type === "venues" ? "LUOGO" : "ARTISTA"}</small><strong>{result.label}</strong></span><em>{result.city.name}</em><ArrowRight /></button>)}{!results.length && <p>Nessun risultato nei dati dell’Atlante.</p>}</div>}
          </div>
          <section className="atlas-v2-map-shell glass-panel">
            {showHint && <div className="atlas-v2-hint">Scorri per esplorare le città</div>}
            <button className="atlas-v2-recenter" type="button" onClick={() => mapRef.current?.centerDefault()}><LocateFixed /> Ricentra</button>
            <AtlasMetroMap ref={mapRef} cities={atlas} onCity={openCity} />
          </section>
          <p className="atlas-v2-note">Le linee riuniscono esclusivamente città appartenenti alla stessa area geografica documentata.</p>
        </>
      )}
    </main>
  );
}

function CityDetail({ city, targetSection, onVenue, onArtist }) {
  const venuesRef = useRef(null);
  const artistsRef = useRef(null);
  useEffect(() => {
    if (targetSection === "venues") venuesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (targetSection === "artists") artistsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [targetSection]);
  return <article className="atlas-v2-detail page-enter">
    <header className={`atlas-v2-city-hero${city.heroImage ? " has-image" : ""}`} style={city.heroImage ? { "--city-image": `url("${city.heroImage}")` } : undefined}><div><p className="eyebrow">CITTÀ · {city.country.toUpperCase()}</p><h1>{city.name}</h1><p>{city.description}</p><span><Building2 /> {city.venues.length} luoghi <Users /> {city.artists.length} artisti</span></div></header>
    <section className="atlas-v2-section" ref={venuesRef}><p className="eyebrow">LUOGHI</p><h2>Spazi della città</h2><div className="atlas-v2-venue-grid">{city.venues.map((venue) => <article className="atlas-v2-venue-card glass-card" key={venue.id} onClick={() => onVenue(venue.id)}><button className="atlas-v2-venue-open" type="button" onClick={(event) => { event.stopPropagation(); onVenue(venue.id); }} aria-label={`Apri ${venue.name}`}><span><small>{venue.period}</small><strong>{venue.name}</strong></span><ArrowRight /></button><p>{venue.description}</p><VenueArtists venue={venue} onArtist={onArtist} /></article>)}</div>{!city.venues.length && <p className="atlas-empty">Nessun luogo documentato per questa città.</p>}</section>
    <section className="atlas-v2-section" ref={artistsRef}><p className="eyebrow">ARTISTI COLLEGATI</p><h2>Voci e protagonisti</h2><div className="atlas-v2-artists">{city.artists.map((artist) => <button className="glass-card" type="button" key={artist.id} onClick={() => onArtist(artist.id)}><strong>{artist.name}</strong><ArrowRight /></button>)}</div>{!city.artists.length && <p className="atlas-empty">Nessun artista associato nei dati attuali.</p>}</section>
  </article>;
}

function VenueDetail({ city, venue, onCity, onArtist }) {
  return <article className="atlas-v2-detail page-enter"><button className="atlas-breadcrumb" type="button" onClick={onCity}><ChevronLeft /> {city.name}</button><header className="atlas-v2-place-hero glass-panel"><p className="eyebrow">LUOGO · {city.name.toUpperCase()}</p><h1>{venue.name}</h1><p>{venue.description}</p><span>{venue.period}</span></header><section className="atlas-v2-section"><p className="eyebrow">ARTISTI COLLEGATI</p><h2>Protagonisti documentati</h2><div className="atlas-v2-artists">{venue.artistNames.map((name) => { const artist = artistByName.get(normalize(name)); return artist ? <button className="glass-card" type="button" key={name} onClick={() => onArtist(artist.id)}><Music2 /><strong>{name}</strong><ArrowRight /></button> : null; })}</div></section></article>;
}

function VenueArtists({ venue, onArtist }) {
  const linkedArtists = venue.artistNames.map((name) => ({ name, artist: artistByName.get(normalize(name)) })).filter((item) => item.artist);
  if (!linkedArtists.length) return null;
  return <div className="atlas-v2-venue-artists"><small>ARTISTI COLLEGATI</small><div>{linkedArtists.map(({ name, artist }) => <button type="button" key={name} onClick={(event) => { event.stopPropagation(); onArtist(artist.id); }}><Music2 />{name}</button>)}</div></div>;
}

export default MusicAtlasV2;
