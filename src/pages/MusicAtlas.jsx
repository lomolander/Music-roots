import { useState } from "react";
import { ChevronLeft, Compass, MapPin, Music2, Users, X } from "lucide-react";

import tracks from "../data/questions.js";
import { artists } from "../data/entities/index.js";
import { musicAtlasCities, musicAtlasConnections, musicAtlasVenues } from "../data/musicAtlas.js";

const cityById = new Map(musicAtlasCities.map((city) => [city.id, city]));

function MusicAtlas({ onBack, onExplore }) {
  const [selectedId, setSelectedId] = useState(null);
  const [panel, setPanel] = useState(null);
  const [venueScope, setVenueScope] = useState(null);
  const selected = cityById.get(selectedId);

  const selectCity = (id) => {
    setSelectedId(id);
    setPanel(null);
    setVenueScope(null);
  };

  const closeCity = () => {
    setSelectedId(null);
    setPanel(null);
    setVenueScope(null);
  };

  return (
    <main className="app-shell atlas-screen page-enter">
      <header className="explore-header">
        <button className="back-button" type="button" onClick={onBack}>← Indietro</button>
        <span className="explore-count">{musicAtlasCities.length} città</span>
      </header>

      <section className="atlas-intro">
        <p className="eyebrow">GEOGRAFIE DEL SUONO</p>
        <h1>Atlante musicale</h1>
        <p>Luoghi, scene e percorsi che hanno fatto viaggiare la musica nel mondo.</p>
      </section>

      <section className={`atlas-map-shell${selected ? " has-selection" : ""}`} aria-label="Rete delle città musicali">
        <div
          className="atlas-map-stage"
          style={{ "--atlas-pan-x": `${selected?.panX ?? 0}px`, "--atlas-pan-y": `${selected?.panY ?? 0}px` }}
        >
          <svg className="atlas-world" viewBox="0 0 100 52" role="img" aria-labelledby="atlas-map-title atlas-map-description">
            <title id="atlas-map-title">Rete astratta delle città musicali</title>
            <desc id="atlas-map-description">Una costellazione di connessioni collega undici città importanti per la storia della musica.</desc>
            <g className="atlas-routes" aria-hidden="true">
              {musicAtlasConnections.map(([fromId, toId]) => {
                const from = cityById.get(fromId);
                const to = cityById.get(toId);
                return <path key={`${fromId}-${toId}`} d={routePath(from, to)} />;
              })}
            </g>
            <g className="atlas-pulses" aria-hidden="true">
              <circle r=".28"><animateMotion dur="14s" repeatCount="indefinite" path={routePath(cityById.get("new-york"), cityById.get("london"))} /><animate attributeName="opacity" values="0;.65;.65;0" dur="14s" repeatCount="indefinite" /></circle>
              <circle r=".24"><animateMotion dur="17s" begin="4s" repeatCount="indefinite" path={routePath(cityById.get("kingston"), cityById.get("london"))} /><animate attributeName="opacity" values="0;.55;.55;0" dur="17s" begin="4s" repeatCount="indefinite" /></circle>
            </g>
          </svg>

          <div className="atlas-nodes">
            {musicAtlasCities.map((city) => (
              <button
                className={`atlas-node relevance-${city.relevance}${selectedId === city.id ? " active" : ""}`}
                style={{ left: `${city.x}%`, top: `${city.y}%` }}
                type="button"
                key={city.id}
                onClick={() => selectCity(city.id)}
                aria-pressed={selectedId === city.id}
                aria-label={`Seleziona ${city.name}`}
              >
                <span aria-hidden="true" />
                <strong>{city.name}</strong>
              </button>
            ))}
          </div>
        </div>

        {selected && !panel && <CityCard city={selected} closeCity={closeCity} setPanel={setPanel} onExplore={onExplore} />}
        {selected && panel && (
          <AtlasPanel
            city={selected}
            panel={panel}
            venueScope={venueScope}
            setPanel={setPanel}
            setVenueScope={setVenueScope}
          />
        )}
      </section>
    </main>
  );
}

function routePath(from, to) {
  const bend = Math.max(1.5, Math.abs(to.x - from.x) * .12);
  const cx = (from.x + to.x) / 2;
  const cy = Math.min(from.y, to.y) - bend;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

function CityCard({ city, closeCity, setPanel, onExplore }) {
  return (
    <article className="atlas-city-card glass-panel page-enter">
      <button className="atlas-close" type="button" onClick={closeCity} aria-label="Chiudi la scheda della città"><X /></button>
      <p className="eyebrow">{city.period}</p>
      <h2>{city.name}</h2>
      <p>{city.description}</p>
      <div className="atlas-actions">
        <button type="button" onClick={() => setPanel("venues")}><MapPin />Luoghi</button>
        <button type="button" onClick={() => setPanel("artists")}><Users />Artisti</button>
        <button type="button" onClick={() => setPanel("tracks")}><Music2 />Brani</button>
        <button type="button" onClick={onExplore}><Compass />Esplora</button>
      </div>
    </article>
  );
}

function AtlasPanel({ city, panel, venueScope, setPanel, setVenueScope }) {
  const venues = musicAtlasVenues.filter((venue) => venue.cityId === city.id);
  const scopedVenue = venueScope ? venues.find((venue) => venue.id === venueScope) : null;
  const artistNames = scopedVenue?.artistNames ?? city.artistNames;
  const trackIds = scopedVenue?.trackIds ?? city.trackIds;
  const cityArtists = artistNames.map((name) => artists.find((artist) => artist.name === name)).filter(Boolean);
  const cityTracks = trackIds.map((id) => tracks.find((track) => track.id === id)).filter(Boolean);

  const goBack = () => {
    if (venueScope) setVenueScope(null);
    setPanel(null);
  };

  return (
    <section className="atlas-panel glass-panel page-enter">
      <header><button type="button" onClick={goBack}><ChevronLeft />{city.name}</button><span>{panelLabel(panel)}</span></header>
      {scopedVenue && <p className="atlas-scope">Collegamenti da {scopedVenue.name}</p>}
      {panel === "venues" && (
        venues.length ? <div className="atlas-venue-list">{venues.map((venue) => (
          <article key={venue.id}>
            <p className="eyebrow">{venue.cityId === city.id ? city.name : venue.cityId} · {venue.period}</p>
            <h3>{venue.name}</h3><p>{venue.description}</p>
            <div><button type="button" onClick={() => { setVenueScope(venue.id); setPanel("artists"); }}>Artisti</button><button type="button" onClick={() => { setVenueScope(venue.id); setPanel("tracks"); }}>Brani</button></div>
          </article>
        ))}</div> : <p className="atlas-empty">Nessun luogo storico è ancora documentato per questa città.</p>
      )}
      {panel === "artists" && (
        <div className="atlas-entity-grid">{cityArtists.map((artist) => <article key={artist.id}>{artist.image ? <img src={artist.image} alt="" /> : <span><Users /></span>}<strong>{artist.name}</strong><small>{artist.genres.join(" · ")}</small></article>)}</div>
      )}
      {panel === "tracks" && (
        <div className="atlas-track-list">{cityTracks.map((track) => <article key={track.id}>{track.artwork ? <img src={track.artwork} alt="" /> : <span><Music2 /></span>}<div><strong>{track.title}</strong><small>{track.artist} · {track.year}</small></div></article>)}</div>
      )}
    </section>
  );
}

const panelLabel = (panel) => ({ venues: "Luoghi", artists: "Artisti", tracks: "Brani" }[panel]);

export default MusicAtlas;
