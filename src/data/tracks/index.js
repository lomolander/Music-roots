import applePreviewMetadata from "../apple-preview-metadata.js";
import deezerPreviewMetadata from "../deezer-preview-metadata.js";
import editorialArtwork from "../editorial-artwork.js";
import youtubeLinkMetadata from "../youtube-link-metadata.js";
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
import { historicalScenario, historicalScenarioOverride, reviewedHistoricalScenario } from "../scenarioEditorial.js";
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
import essentialsDepthExpansion from "./essentials-depth-expansion.js";
import alternativePopExpansion from "./alternative-pop-expansion.js";
import artistExpansionBatch from "./artist-expansion-batch.js";
import beatSceneExpansion from "./beat-scene-expansion.js";
import finalArtistExpansion from "./final-artist-expansion.js";
import dublinExpansion from "./dublin-expansion.js";

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
  "essentials-depth-expansion": essentialsDepthExpansion,
  "alternative-pop-expansion": alternativePopExpansion,
  "artist-expansion-batch": artistExpansionBatch,
  "beat-scene-expansion": beatSceneExpansion,
  "final-artist-expansion": finalArtistExpansion,
  "dublin-expansion": dublinExpansion,
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

const canonicalSubgenres = {
  "alternative rock": "Alternative Rock", "cantautorato italiano": "Cantautorato Italiano",
  electro: "Electro", electroclash: "Electroclash", electropop: "Electropop",
  "indie dance": "Indie Dance", "indie rock": "Indie Rock", "jazz rap": "Jazz Rap",
  "library music": "Library Music", madchester: "Madchester", "neo soul": "Neo Soul",
  "nu soul": "Neo Soul", "nu disco": "Nu Disco", "nu jazz": "Nu Jazz",
  "spiritual jazz": "Spiritual Jazz", "uk garage": "UK Garage", "electronic pop": "Electropop",
  "rap italiano": "Hip Hop Italiano", "dance pop": "Dance Pop", "post punk": "Post-Punk",
  "post-punk": "Post-Punk", "chicago house": "Chicago House", "detroit techno": "Detroit Techno",
  "italo disco": "Italo Disco", "philadelphia soul": "Philadelphia Soul", "indie electronic": "Indietronica",
  "acid house": "Acid House", "acid jazz": "Acid Jazz", ambient: "Ambient",
  "art pop elettronico": "Art Pop Elettronico", "big beat": "Big Beat", boogie: "Boogie",
  "bossa nova": "Bossa Nova", breakbeat: "Breakbeat", "deep house": "Deep House",
  disco: "Disco", downtempo: "Downtempo", "progressive house": "Progressive House",
  "post-disco": "Post-disco",
  "synth-pop": "Synth-pop", techno: "Techno", "trip hop": "Trip Hop",
  "house vocale": "Vocal House", "vocal house": "Vocal House",
};

const compoundSubgenreByTrackId = {
  4: "Acid Jazz", 61: "Acid Jazz", 62: "Acid Jazz", 63: "Acid Jazz", 64: "Acid Jazz",
  65: "Jazz Rap", 66: "Jazz Rap", 67: "Acid Jazz", 68: "Acid Jazz",
  77: "Ambient House", 78: "Ambient Techno", 258: "Acid House", 276: "Bossa Nova",
  144: "UK Garage", 200: "Boogie", 242: "Bossa Nova", 285: "Library Music",
  336: "Boogie", 337: "Post-disco", 338: "Post-disco",
};

const compoundSubgenreByValueAndGenre = {
  "big beat e breakbeat|Big Beat": "Big Beat", "disco e dance-pop|Disco": "Disco",
  "disco e dance-pop|Dance": "Dance Pop", "synth-pop e new wave|Synth-pop": "Synth-pop",
  "trip hop e blues elettronico|Trip Hop": "Trip Hop", "trip hop e downtempo|Trip Hop": "Trip Hop",
  "trip hop e downtempo|Downtempo": "Downtempo", "nu jazz e bossa|Nu Jazz": "Bossa Nova",
  "easy listening e soundtrack|Library Music": "Library Music",
  "IDM ed elettronica sperimentale|IDM": "IDM",
};

const specificSubgenreByTrackId = {
  1: "French House", 6: "Vocal House", 9: "Chicago House", 11: "Chicago House", 12: "Deep House",
  13: "Chicago House", 14: "Acid House", 15: "Acid House", 18: "Vocal House", 19: "Deep House",
  20: "Deep House", 21: "French House", 22: "French House", 23: "French House", 24: "French House",
  25: "French House", 26: "French House", 27: "French House", 28: "French House", 29: "Electro House",
  30: "Electro House", 85: "garage house", 86: "Vocal House", 99: "Progressive House", 100: "Deep House",
  16: "Detroit Techno", 17: "Detroit Techno", 98: "Techno", 38: "Art Pop Elettronico",
  32: "alternative hip hop", 64: "Jazz Rap", 74: "IDM",
  87: "Techno", 88: "Progressive House", 89: "Progressive House", 90: "IDM", 91: "IDM",
  92: "Ambient Techno", 93: "Synth-pop", 94: "Synth-pop", 95: "Ambient", 96: "Cinematic Music",
  97: "Ambient", 8: "Big Beat", 79: "Big Beat", 80: "Big Beat", 81: "Big Beat", 82: "Big Beat",
  83: "Big Beat", 84: "Breakbeat", 242: "Nu Jazz",
  189: "funk soul", 194: "soul funk",
  341: "funk soul", 342: "P-Funk", 343: "funk soul", 344: "soul funk",
  345: "Jazz Funk", 346: "jazz-funk fusion", 347: "psychedelic funk", 348: "jazz-funk fusion",
  701: "old school hip hop", 702: "electro hip-hop", 703: "old school hip hop",
  704: "old school hip hop", 705: "old school hip hop", 706: "old school hip hop",
  707: "old school hip hop", 708: "golden age hip hop", 709: "golden age hip hop",
  710: "political hip hop", 711: "golden age hip hop", 712: "golden age hip hop",
  713: "golden age hip hop", 714: "golden age hip hop", 715: "political hip hop",
  716: "political hip hop", 717: "alternative hip hop", 718: "Jazz Rap",
  719: "East Coast hip hop", 720: "golden age hip hop", 721: "East Coast hip hop",
  722: "alternative hip hop", 723: "East Coast hip hop", 724: "golden age hip hop",
  725: "East Coast hip hop", 726: "East Coast hip hop", 727: "alternative hip hop",
  728: "political hip hop", 729: "East Coast hip hop", 730: "Jazz Rap",
  731: "alternative hip hop", 732: "alternative hip hop", 733: "political hip hop",
  734: "alternative hip hop", 735: "East Coast hip hop", 736: "alternative hip hop",
  737: "alternative hip hop", 738: "alternative hip hop", 739: "political hip hop",
  740: "alternative hip hop",
  781: "funk soul", 782: "psychedelic funk", 783: "funk soul", 784: "P-Funk",
  785: "funk soul", 786: "Afro-funk", 787: "psychedelic funk", 788: "soul funk",
  789: "Jazz Funk", 790: "P-Funk",
  1720: "Dance Pop", 1721: "Dance Pop", 1722: "Dance Pop", 1723: "Dance Pop",
  1724: "Dance Pop", 1725: "Dance Pop", 1726: "Vocal House",
  1764: "Vocal House", 1765: "Vocal House",
};

const canonicalSubgenre = (track, raw) => specificSubgenreByTrackId[track.id]
  ?? compoundSubgenreByTrackId[track.id]
  ?? compoundSubgenreByValueAndGenre[`${raw}|${track.genre}`]
  ?? canonicalSubgenres[raw.toLocaleLowerCase("it")]
  ?? raw;

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
  const deezer = deezerPreviewMetadata[track.id] ?? null;
  const rawSubgenre = track.subgenre || track.sottogenere || "";
  const subgenre = canonicalSubgenre(track, rawSubgenre);
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
    sottogenere: subgenre,
    influences,
    similarArtists,
    influencedArtists,
    essentialPlaylist: track.essentialPlaylist ?? essentialPlaylists[track.genre]?.id ?? "",
    genreId: entityId(track.genre),
    question: track.question || "Qual è il titolo del brano?",
    correctAnswer: track.correctAnswer || track.title,
    answers: track.answers?.length ? track.answers : [track.title],
    ...apple,
    deezer: deezer ? { ...deezer, previewUrl: "" } : editorialDefaults.deezer,
    ...revisedEditorial,
    meaning: revisedEditorial.meaning || meaning || editorialMeaning(track, ""),
    ...correctedEditorial,
    scenario: reviewedHistoricalScenario(
      { ...track, ...discographicCorrection, subgenre },
      historicalScenarioOverride(track) || correctedEditorial.scenario || revisedEditorial.scenario || track.scenario || historicalScenario({ ...track, subgenre }),
    ),
    artwork: apple.appleArtworkUrl || track.artwork || track.cover || editorialArtworkUrl,
    artworkType: apple.appleArtworkUrl || track.artwork || track.cover ? "official" : editorialArtworkUrl ? "editorial" : "fallback",
    cover: track.cover || apple.appleArtworkUrl || "",
    preview: apple.appleMatchStatus === "verified" && apple.applePreviewUrl ? apple.applePreviewUrl : "",
    ...discographicCorrection,
    links: {
      ...editorialDefaults.links,
      ...track.links,
      youtube: youtubeLinkMetadata[track.id] ?? track.links?.youtube ?? "",
    },
    artistId: entityId(correctedArtist),
    albumId: correctedAlbum ? entityId(correctedArtist, correctedAlbum) : null,
  };
}));

export default tracks;
