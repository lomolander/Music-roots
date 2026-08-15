import { useMemo, useState } from "react";
import { ArrowRight, Building2, ChevronLeft, MapPin, Music2, Search, Users } from "lucide-react";

import { artists } from "../data/entities/index.js";
import { musicAtlasCities, musicAtlasVenues } from "../data/musicAtlas.js";
import ArtworkFallback from "../components/ArtworkFallback.jsx";

const countries = {
  chicago: "Stati Uniti", detroit: "Stati Uniti", "new-york": "Stati Uniti",
  london: "Regno Unito", manchester: "Regno Unito", liverpool: "Regno Unito", bristol: "Regno Unito",
  berlin: "Germania", paris: "Francia", kingston: "Giamaica", rio: "Brasile",
  napoli: "Italia", roma: "Italia", milano: "Italia", genova: "Italia", venezia: "Italia", bologna: "Italia", torino: "Italia",
  glasgow: "Regno Unito", "los-angeles": "Stati Uniti", "san-francisco": "Stati Uniti",
  birmingham: "Regno Unito", canterbury: "Regno Unito", newcastle: "Regno Unito",
  boston: "Stati Uniti", seattle: "Stati Uniti", jacksonville: "Stati Uniti", austin: "Stati Uniti",
  sydney: "Australia", melbourne: "Australia", toronto: "Canada", hannover: "Germania",
  belfast: "Regno Unito", topeka: "Stati Uniti", tokyo: "Giappone", osaka: "Giappone",
  kyoto: "Giappone", yokohama: "Giappone", hiroshima: "Giappone", kanazawa: "Giappone",
  brescia: "Italia", palermo: "Italia", como: "Italia", siracusa: "Italia",
};

const normalize = (value) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("it")
  .trim();

const artistById = new Map(artists.map((artist) => [artist.id, artist]));
const artistByName = new Map(artists.map((artist) => [normalize(artist.name), artist]));
const cityMapModules = import.meta.glob("../assets/city-maps/*.svg", { eager: true, query: "?url", import: "default" });
const cityMapById = Object.fromEntries(Object.entries(cityMapModules).map(([filePath, source]) => [filePath.split("/").at(-1).replace(".svg", ""), source]));
const coastalCities = new Set(["belfast", "boston", "bristol", "genova", "hiroshima", "jacksonville", "kingston", "liverpool", "los-angeles", "melbourne", "napoli", "new-york", "rio", "san-francisco", "seattle", "sydney", "tokyo", "venezia", "yokohama"]);
const riverCities = new Set(["austin", "berlin", "birmingham", "london", "manchester", "newcastle", "paris", "roma", "torino"]);

function CityMapTexture({ cityId }) {
  const cityMap = cityMapById[cityId];
  if (cityMap) return <img className="atlas-city-map" src={cityMap} alt="" loading="lazy" aria-hidden="true" />;

  const seed = [...cityId].reduce((total, character) => total + character.charCodeAt(0), 0);
  const shiftX = seed % 19;
  const shiftY = seed % 13;
  const diagonal = seed % 2 === 0;
  const hasCoast = coastalCities.has(cityId);
  const hasRiver = riverCities.has(cityId);

  return <svg className="atlas-city-map" viewBox="0 0 320 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <g className="atlas-city-map-blocks">
      <path d={`M${18 + shiftX} 8V202M${78 + shiftX} 0V210M${151 + shiftX} 0V210M${232 + shiftX} 0V210M${290 + shiftX} 0V210`} />
      <path d={`M0 ${35 + shiftY}H320M0 ${88 + shiftY}H320M0 ${145 + shiftY}H320M0 ${187 + shiftY}H320`} />
      <path d={diagonal ? "M-20 176L150 6M88 230L330 -12" : "M-12 28L178 218M118 -20L332 194"} />
      <path d={`M${42 + shiftX} 0L${42 + shiftX} 68L${116 + shiftX} 68L${116 + shiftX} 132L${196 + shiftX} 132L${196 + shiftX} 210`} />
    </g>
    <g className="atlas-city-map-minor">
      <path d={`M${8 + shiftX} 57H${128 + shiftX}V112H${267 + shiftX}`} />
      <path d={`M${55 + shiftX} 18V165H${306 - shiftX}`} />
      <path d={`M0 ${118 - shiftY}H96V${178 - shiftY}H320`} />
      <circle cx={118 + shiftX} cy={91 + shiftY} r="24" />
      <circle cx={248 - shiftX} cy={151 - shiftY} r="17" />
    </g>
    {hasRiver && <path className="atlas-city-map-water" d={`M-12 ${128 + shiftY}C65 ${85 - shiftY},112 ${172 + shiftY},185 ${121 - shiftY}S282 ${91 + shiftY},334 ${132 - shiftY}`} />}
    {hasCoast && <path className="atlas-city-map-coast" d={`M${236 - shiftX} -10C${218 + shiftX} 42,280 72,246 119S278 177,${232 + shiftX} 224L340 224V-10Z`} />}
  </svg>;
}

function MusicAtlas({ onBack, onOpenArtist, initialCityId = null }) {
  const [query, setQuery] = useState("");
  const [selectedCityId, setSelectedCityId] = useState(initialCityId);
  const [selectedVenueId, setSelectedVenueId] = useState(null);

  const atlas = useMemo(() => musicAtlasCities.map((city) => {
    const venues = musicAtlasVenues.filter((venue) => venue.cityId === city.id);
    const linkedArtists = new Map();
    city.artistIds.forEach((id) => {
      const artist = artistById.get(id);
      if (artist) linkedArtists.set(artist.id, artist);
    });
    venues.flatMap((venue) => venue.artistNames).forEach((name) => {
      const artist = artistByName.get(normalize(name));
      if (artist) linkedArtists.set(artist.id, artist);
    });
    const cityArtists = [...linkedArtists.values()].sort((a, b) => a.name.localeCompare(b.name, "it"));
    return {
      ...city,
      country: countries[city.id] ?? "",
      venues,
      artists: cityArtists,
      searchText: normalize([city.name, countries[city.id], ...venues.flatMap((venue) => [venue.name, ...venue.artistNames]), ...cityArtists.map((artist) => artist.name)].join(" ")),
    };
  }).filter((city) => city.artists.length > 0 || city.trackIds.length > 0 || city.venues.length > 0), []);

  const selectedCity = atlas.find((city) => city.id === selectedCityId);
  const selectedVenue = selectedCity?.venues.find((venue) => venue.id === selectedVenueId);
  const visibleCities = atlas.filter((city) => city.searchText.includes(normalize(query)));

  const openCity = (cityId) => {
    setSelectedCityId(cityId);
    setSelectedVenueId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openArtist = (artistId) => onOpenArtist(artistId, selectedCity?.id);

  const goBack = () => {
    if (selectedVenue) {
      setSelectedVenueId(null);
    } else if (selectedCity) {
      setSelectedCityId(null);
    } else {
      onBack();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="app-shell atlas-screen page-enter">
      <header className="atlas-header">
        <button className="back-button" type="button" onClick={goBack}>← Indietro</button>
        <span className="atlas-header-mark"><MapPin aria-hidden="true" /> Music Roots</span>
      </header>

      {selectedVenue ? (
        <VenueDetail city={selectedCity} venue={selectedVenue} onCity={() => setSelectedVenueId(null)} onArtist={openArtist} />
      ) : selectedCity ? (
        <CityDetail city={selectedCity} onVenue={setSelectedVenueId} onArtist={openArtist} />
      ) : (
        <>
          <section className="atlas-hero glass-panel">
            <span className="atlas-orbit" aria-hidden="true"><span /></span>
            <p className="eyebrow">LUOGHI · STORIE · ARTISTI</p>
            <h1>Atlante musicale</h1>
            <p>Esplora i luoghi che hanno dato vita ai grandi artisti.</p>
          </section>

          <label className="atlas-search">
            <Search aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca città, luogo o artista" />
            {query && <span>{visibleCities.length}</span>}
          </label>

          <section className="atlas-city-grid" aria-label="Città dell'Atlante">
            {visibleCities.map((city, index) => (
              <button className="atlas-city-tile glass-card" style={{ "--card-delay": `${Math.min(index, 10) * 45}ms` }} type="button" key={city.id} onClick={() => openCity(city.id)}>
                <CityMapTexture cityId={city.id} />
                <span className="atlas-city-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="atlas-city-heading"><small>{city.country}</small><strong>{city.name}</strong></span>
                <span className="atlas-city-stats">
                  <span><Building2 aria-hidden="true" /><b>{city.venues.length}</b><small>luoghi</small></span>
                  <span><Users aria-hidden="true" /><b>{city.artists.length}</b><small>artisti</small></span>
                </span>
                <ArrowRight className="atlas-city-arrow" aria-hidden="true" />
              </button>
            ))}
          </section>
          <small className="atlas-map-attribution">Mappe derivate da <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>, dati ODbL.</small>
          {!visibleCities.length && <p className="atlas-empty">Nessuna città, luogo o artista corrisponde alla ricerca.</p>}
        </>
      )}
    </main>
  );
}

function CityDetail({ city, onVenue, onArtist }) {
  return (
    <article className="atlas-detail page-enter">
      <header className="atlas-detail-hero glass-panel">
        <p className="eyebrow">CITTÀ · {city.country.toUpperCase()}</p>
        <h1>{city.name}</h1>
        <p>{city.description}</p>
        <div className="atlas-detail-counts"><span><Building2 /> {city.venues.length} luoghi</span><span><Users /> {city.artists.length} artisti</span></div>
      </header>

      <section className="atlas-detail-section">
        <div className="atlas-section-title"><span>01</span><div><p className="eyebrow">LUOGHI</p><h2>Spazi che hanno lasciato il segno</h2></div></div>
        <div className="atlas-venue-grid">
          {city.venues.map((venue) => (
            <article className="atlas-venue-card glass-card" key={venue.id}>
              <button className="atlas-venue-open" type="button" onClick={() => onVenue(venue.id)} aria-label={`Apri ${venue.name}`}>
                <span><small>{venue.period}</small><strong>{venue.name}</strong></span><ArrowRight aria-hidden="true" />
              </button>
              <p>{venue.description}</p>
              <ArtistChips names={venue.artistNames} onArtist={onArtist} />
            </article>
          ))}
        </div>
        {!city.venues.length && <p className="atlas-empty">I luoghi di questa città saranno aggiunti presto.</p>}
      </section>

      <section className="atlas-detail-section">
        <div className="atlas-section-title"><span>02</span><div><p className="eyebrow">ARTISTI</p><h2>Voci legate alla città</h2></div></div>
        <div className="atlas-artist-grid">
          {city.artists.map((artist) => <ArtistCard artist={artist} key={artist.id} onClick={() => onArtist(artist.id)} />)}
        </div>
        {!city.artists.length && <p className="atlas-empty">Gli artisti collegati saranno aggiunti presto.</p>}
      </section>
    </article>
  );
}

function VenueDetail({ city, venue, onCity, onArtist }) {
  return (
    <article className="atlas-detail atlas-place-detail page-enter">
      <button className="atlas-breadcrumb" type="button" onClick={onCity}><ChevronLeft /> {city.name}</button>
      <section className="atlas-detail-hero glass-panel">
        <p className="eyebrow">LUOGO · {city.name.toUpperCase()}</p>
        <h1>{venue.name}</h1>
        <p>{venue.description}</p>
        <span className="atlas-period"><MapPin /> {city.name}, {city.country} · {venue.period}</span>
      </section>
      <section className="atlas-detail-section">
        <div className="atlas-section-title"><span>01</span><div><p className="eyebrow">ARTISTI</p><h2>Protagonisti collegati</h2></div></div>
        <ArtistChips names={venue.artistNames} onArtist={onArtist} large />
        {!venue.artistNames.length && <p className="atlas-empty">I collegamenti con gli artisti saranno aggiunti presto.</p>}
      </section>
      <button className="atlas-city-return glass-card" type="button" onClick={onCity}><MapPin /><span><small>TORNA ALLA CITTÀ</small><strong>{city.name}</strong></span><ArrowRight /></button>
    </article>
  );
}

function ArtistChips({ names, onArtist, large = false }) {
  if (!names.length) return null;
  return <div className={`atlas-chips${large ? " is-large" : ""}`}>{names.map((name) => {
    const artist = artistByName.get(normalize(name));
    return artist
      ? <button type="button" key={name} onClick={() => onArtist(artist.id)}><Music2 />{name}</button>
      : <span key={name}><Music2 />{name}</span>;
  })}</div>;
}

function ArtistCard({ artist, onClick }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <button className="atlas-artist-card glass-card" type="button" onClick={onClick}>
      {artist.image && !imageFailed ? <img src={artist.image} alt="" loading="lazy" onError={() => setImageFailed(true)} /> : <ArtworkFallback title={artist.name} compact />}
      <strong>{artist.name}</strong><ArrowRight aria-hidden="true" />
    </button>
  );
}

export default MusicAtlas;
