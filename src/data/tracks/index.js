import applePreviewMetadata from "../apple-preview-metadata.js";
import editorialArtwork from "../editorial-artwork.js";
import { essentialPlaylists } from "../libraryConfig.js";
import { entityId } from "../entityIds.js";
import editorial001100 from "../editorial/tracks-001-100.js";
import editorial101200 from "../editorial/tracks-101-200.js";
import editorial201300 from "../editorial/tracks-201-300.js";
import editorial301400 from "../editorial/tracks-301-400.js";
import editorial401500 from "../editorial/tracks-401-500.js";
import editorial501600 from "../editorial/tracks-501-600.js";
import editorial601700 from "../editorial/tracks-601-700.js";
import editorial701800 from "../editorial/tracks-701-800.js";
import editorial801900 from "../editorial/tracks-801-900.js";
import editorial9011000 from "../editorial/tracks-901-1000.js";
import editorial10011100 from "../editorial/tracks-1001-1100.js";
import correctedTrackEditorial from "../editorial/corrected-track-editorial.js";
import { historicalScenario } from "../scenarioEditorial.js";
import { editorialMeaning } from "../meaningEditorial.js";
import houseTechno from "./house-techno.js";
import discoFunk from "./disco-funk.js";
import soulRnb from "./soul-rnb.js";
import popSynthpop from "./pop-synthpop.js";
import hiphopGarage from "./hiphop-garage.js";
import electronicDowntempo from "./electronic-downtempo.js";
import jazzBossaBrazil from "./jazz-bossa-brazil.js";
import rockScenesSoundtracks from "./rock-scenes-soundtracks.js";
import expansion301400 from "./expansion-301-400.js";
import expansion401500 from "./expansion-401-500.js";
import expansion501600 from "./expansion-501-600.js";
import expansion601700 from "./expansion-601-700.js";
import expansion701800 from "./expansion-701-800.js";
import expansion801900 from "./expansion-801-900.js";
import expansion9011000 from "./expansion-901-1000.js";
import expansion10011100 from "./expansion-1001-1100.js";
import expansion11011314 from "./expansion-1101-1314.js";
import rockExpansionPhase1 from "./rock-expansion-phase-1.js";
import jpopShibuyaPhase2 from "./jpop-shibuya-phase-2.js";
import italyContemporaryScene from "./italy-contemporary-scene.js";
import macroGenresExpansion from "./macro-genres-expansion.js";

export const trackModules = {
  "house-techno": houseTechno,
  "disco-funk": discoFunk,
  "soul-rnb": soulRnb,
  "pop-synthpop": popSynthpop,
  "hiphop-garage": hiphopGarage,
  "electronic-downtempo": electronicDowntempo,
  "jazz-bossa-brazil": jazzBossaBrazil,
  "rock-scenes-soundtracks": rockScenesSoundtracks,
  "expansion-301-400": expansion301400,
  "expansion-401-500": expansion401500,
  "expansion-501-600": expansion501600,
  "expansion-601-700": expansion601700,
  "expansion-701-800": expansion701800,
  "expansion-801-900": expansion801900,
  "expansion-901-1000": expansion9011000,
  "expansion-1001-1100": expansion10011100,
  "expansion-1101-1314": expansion11011314,
  "rock-expansion-phase-1": rockExpansionPhase1,
  "jpop-shibuya-phase-2": jpopShibuyaPhase2,
  "italy-contemporary-scene": italyContemporaryScene,
  "macro-genres-expansion": macroGenresExpansion,
};

const editorialDefaults = {
  album: "",
  sottogenere: "",
  subgenre: "",
  paese: "",
  cover: "",
  artwork: "",
  curiosity: "",
  scenarioCulturale: "",
  scenario: "",
  significato: "",
  meaning: "",
  musicalCharacteristics: "",
  influenzeMusicali: [],
  influences: [],
  artistiInfluenzati: [],
  influencedArtists: [],
  influencingArtists: [],
  similarArtists: [],
  links: { spotify: "", appleMusic: "", youtube: "" },
  deezer: { trackId: null, previewUrl: "", status: "not-checked" },
};

// Correzioni discografiche validate: `year` indica la prima pubblicazione del
// brano, mentre `album` indica esclusivamente l'album/EP ufficiale di
// appartenenza. `albumYear` viene conservato quando serve a distinguere le due
// date. Blue Monday (ID 2) resta intenzionalmente esclusa perché ambigua.
const discographicCorrections = {
  78: { year: 1993, originalReleaseYear: 1993, album: "Orbital 2", albumYear: 1993, releaseType: "album-track" },
  87: { year: 1995, originalReleaseYear: 1995, album: null, releaseType: "single" },
  91: { year: 1993, originalReleaseYear: 1993, album: "Incunabula", albumYear: 1993, releaseType: "album-track" },
  256: {
    artist: "A Guy Called Gerald",
    title: "FX",
    year: 1989,
    originalReleaseYear: 1989,
    album: null,
    albumYear: null,
    releaseType: "single",
    version: "original 1989 single version",
    question: "Qual è il titolo del brano?",
    answers: ["FX"],
    correctAnswer: "FX",
  },
  271: { year: 1964, originalReleaseYear: 1964, album: "Getz/Gilberto", albumYear: 1964, releaseType: "album-track" },
  277: { year: 1965, originalReleaseYear: 1965, album: "A Love Supreme", albumYear: 1965, releaseType: "album-track" },
  279: { year: 1971, originalReleaseYear: 1971, album: "Journey in Satchidananda", albumYear: 1971, releaseType: "album-track" },
  296: { year: 2015, originalReleaseYear: 2015, album: "Chaleur humaine", albumYear: 2015, releaseType: "album-track" },
  388: { year: 2000, originalReleaseYear: 2000, album: "Suzuki", albumYear: 2000, releaseType: "album-track" },
  634: { year: 1981, originalReleaseYear: 1981, album: "Come Away with ESG", albumYear: 1983, releaseType: "ep-then-album" },
  888: { year: 1999, originalReleaseYear: 1999, album: null, releaseType: "single" },
  1087: { year: 1971, originalReleaseYear: 1971, album: "Under Pompelmo", albumYear: 1971, releaseType: "ep-track" },
  1212: { year: 1979, originalReleaseYear: 1979, album: null, releaseType: "single" },
  1534: { year: 2019, originalReleaseYear: 2019, album: "Operazione Oro", albumYear: 2020, releaseType: "single-then-album" },
  1535: { year: 2025, originalReleaseYear: 2025, album: "Joanita", albumYear: 2025, releaseType: "single-then-album" },
  1537: { year: 2017, originalReleaseYear: 2017, album: "Regardez Moi", albumYear: 2017, releaseType: "single-then-album" },
  1538: { year: 2017, originalReleaseYear: 2017, album: "Sindrome di Tôret", albumYear: 2017, releaseType: "single-then-album" },
  1548: { year: 2000, originalReleaseYear: 2000, album: null, releaseType: "single" },
};

const tracks = Object.entries(trackModules).flatMap(([sourceModule, moduleTracks]) =>
  moduleTracks.map((track) => {
  const apple = applePreviewMetadata[track.id] ?? {};
  const subgenre = track.subgenre || track.sottogenere || "";
  const meaning = track.meaning || track.significato || "";
  const influences = track.influences || track.influenzeMusicali || [];
  const similarArtists = track.similarArtists || track.artistiInfluenzati || [];
  const influencedArtists = track.influencedArtists || track.artistiInfluenzati || [];
  const revisedEditorial = editorial001100[track.id] ?? editorial101200[track.id] ?? editorial201300[track.id] ?? editorial301400[track.id] ?? editorial401500[track.id] ?? editorial501600[track.id] ?? editorial601700[track.id] ?? editorial701800[track.id] ?? editorial801900[track.id] ?? editorial9011000[track.id] ?? editorial10011100[track.id] ?? {};
  const correctedEditorial = correctedTrackEditorial[track.id] ?? {};
  const discographicCorrection = discographicCorrections[track.id] ?? {};
  const editorialArtworkUrl = editorialArtwork[track.id] ?? "";
  const correctedArtist = discographicCorrection.artist ?? track.artist;
  const correctedAlbum = Object.hasOwn(discographicCorrection, "album") ? discographicCorrection.album : track.album;

  return {
    ...editorialDefaults,
    ...track,
    sourceModule,
    subgenre,
    scenario: revisedEditorial.scenario || track.scenario || historicalScenario({ ...track, subgenre }),
    influences,
    similarArtists,
    influencedArtists,
    essentialPlaylist: track.essentialPlaylist ?? essentialPlaylists[track.genre]?.id ?? "",
    genreId: entityId(track.genre),
    question: track.question || "Qual è il titolo del brano?",
    correctAnswer: track.correctAnswer || track.title,
    answers: track.answers?.length ? track.answers : [track.title],
    ...apple,
    ...revisedEditorial,
    meaning: revisedEditorial.meaning || meaning || editorialMeaning(track, ""),
    ...correctedEditorial,
    artwork: apple.appleArtworkUrl || track.artwork || track.cover || editorialArtworkUrl,
    artworkType: apple.appleArtworkUrl || track.artwork || track.cover ? "official" : editorialArtworkUrl ? "editorial" : "fallback",
    cover: track.cover || apple.appleArtworkUrl || "",
    preview: apple.appleMatchStatus === "verified" && apple.applePreviewUrl ? apple.applePreviewUrl : "",
    ...discographicCorrection,
    artistId: entityId(correctedArtist),
    albumId: correctedAlbum ? entityId(correctedArtist, correctedAlbum) : null,
  };
}));

export default tracks;
