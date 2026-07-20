import applePreviewMetadata from "../apple-preview-metadata.js";
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
  importance: "",
  influenzeMusicali: [],
  influences: [],
  artistiInfluenzati: [],
  influencedArtists: [],
  influencingArtists: [],
  similarArtists: [],
  links: { spotify: "", appleMusic: "", youtube: "" },
  deezer: { trackId: null, previewUrl: "", status: "not-checked" },
};

const tracks = Object.entries(trackModules).flatMap(([sourceModule, moduleTracks]) =>
  moduleTracks.map((track) => {
  const apple = applePreviewMetadata[track.id] ?? {};
  const subgenre = track.subgenre || track.sottogenere || "";
  const scenario = track.scenario || track.scenarioCulturale || "";
  const meaning = track.meaning || track.significato || "";
  const influences = track.influences || track.influenzeMusicali || [];
  const similarArtists = track.similarArtists || track.artistiInfluenzati || [];
  const influencedArtists = track.influencedArtists || track.artistiInfluenzati || [];
  const revisedEditorial = editorial001100[track.id] ?? editorial101200[track.id] ?? editorial201300[track.id] ?? editorial301400[track.id] ?? editorial401500[track.id] ?? editorial501600[track.id] ?? editorial601700[track.id] ?? editorial701800[track.id] ?? editorial801900[track.id] ?? editorial9011000[track.id] ?? editorial10011100[track.id] ?? {};

  return {
    ...editorialDefaults,
    ...track,
    sourceModule,
    subgenre,
    scenario,
    meaning,
    influences,
    similarArtists,
    influencedArtists,
    essentialPlaylist: track.essentialPlaylist ?? essentialPlaylists[track.genre]?.id ?? "",
    artistId: entityId(track.artist),
    albumId: entityId(track.artist, track.album),
    genreId: entityId(track.genre),
    question: track.question || "Qual è il titolo del brano?",
    correctAnswer: track.correctAnswer || track.title,
    answers: track.answers?.length ? track.answers : [track.title],
    ...apple,
    ...revisedEditorial,
    artwork: apple.appleArtworkUrl || track.artwork || track.cover || "",
    cover: track.cover || apple.appleArtworkUrl || "",
    preview: apple.appleMatchStatus === "verified" && apple.applePreviewUrl ? apple.applePreviewUrl : "",
  };
}));

export default tracks;
