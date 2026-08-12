const catalog = [
  ["Joan Thiele", "Italia", ["Le vacanze", "Atti", 2022, "Alternative Pop", "Contemporary R&B"], ["Eco", "Atti", 2022, "Contemporary R&B", "Neo Soul"]],
  ["Frah Quintale", "Italia", ["Craterì", "Regardez Moi", 2017, "Indie Pop", "Hip Hop Italiano"], ["8 miliardi di persone", "Banzai (Lato blu)", 2020, "Hip Hop Italiano", "Indie Pop"]],
  ["Willie Peyote", "Italia", ["Ottima scusa", "Educazione sabauda", 2015, "Rap Italiano", "Hip Hop Italiano"], ["Mai dire mai (La locura)", "Pornostalgia", 2021, "Hip Hop Italiano", "Rap Italiano"]],
  ["Franco126", "Italia", ["Stanza singola", "Stanza singola", 2019, "Cantautorato Italiano", "Indie Pop"], ["Frigobar", "Stanza singola", 2019, "Indie Pop", "Cantautorato Italiano"]],
  ["Cosmo", "Italia", ["L’ultima festa", "L’ultima festa", 2016, "Elettronica Italiana", "House"], ["Turbo", "Cosmotronic", 2018, "House", "Electro"]],
  ["Tropico", "Italia", ["Non esiste amore a Napoli", "Non esiste amore a Napoli", 2021, "Alternative Pop", "Cantautorato Italiano"], ["Che mme lassat’ a fa", "Non esiste amore a Napoli", 2021, "Indie Pop", "Alternative Pop"]],
  ["Margherita Vicario", "Italia", ["Mandela", "Bingo", 2021, "Indie Pop", "Cantautorato Italiano"], ["Giubbottino", "Bingo", 2021, "Alternative Pop", "Indie Pop"]],
  ["Subsonica", "Italia", ["Tutti i miei sbagli", "Microchip emozionale", 1999, "Indie Rock", "Elettronica Italiana"], ["Nuova ossessione", "Amorematico", 2002, "Electro", "Alternative Pop"]],
  ["Piero Umiliani", "Italia", ["Lady Magnolia", "To-Day’s Sound", 1973, "Library Music", "Jazz Funk"], ["Crepuscolo sul mare", "La legge dei gangsters", 1969, "Cinematic Music", "Library Music"]],
  ["Calibro 35", "Italia", ["Notte in Bovisa", "Calibro 35", 2008, "Funk Italiano", "Cinematic Music"], ["Eurocrime!", "Ritornano quelli di... Calibro 35", 2010, "Jazz Funk", "Library Music"]],
  ["Casino Royale", "Italia", ["Sempre più vicini", "Sempre più vicini", 1995, "Hip Hop Italiano", "Funk Italiano"], ["Suona ancora", "Sempre più vicini", 1995, "Rap Italiano", "Elettronica Italiana"]],
  ["Colapesce", "Italia", ["Satellite", "Un meraviglioso declino", 2012, "Cantautorato Italiano", "Indie Rock"], ["Totale", "Infedele", 2017, "Psychedelic Pop", "Alternative Pop"]],
  ["Dimartino", "Italia", ["Come una guerra la primavera", "Un paese ci vuole", 2015, "Indie Rock", "Cantautorato Italiano"], ["Una storia del mare", "Afrodite", 2019, "Cantautorato Italiano", "Alternative Pop"]],
  ["Nu Genea", "Italia", ["Je vulesse", "Nuova Napoli", 2018, "Disco Italiana", "Jazz Funk"], ["Marechià", "Bar Mediterraneo", 2021, "Balearic", "Nu Disco"]],
  ["LNDFK", "Italia", ["Hana-bi", "Kuni", 2022, "Nu Soul", "Neo Soul"], ["Takeshi", "Kuni", 2022, "Neo Soul", "Contemporary R&B"]],
  ["Mace", "Italia", ["La canzone nostra", "OBE", 2021, "Hip Hop Italiano", "Psychedelic Pop"], ["Senza fiato", "OBE", 2021, "Elettronica Italiana", "Alternative Pop"]],
  ["Venerus", "Italia", ["Love Anthem, No. 1", "Magica musica", 2021, "Contemporary R&B", "Neo Soul"], ["Ogni pensiero vola", "Magica musica", 2021, "Neo Soul", "Psychedelic Pop"]],
  ["La Rappresentante di Lista", "Italia", ["Questo corpo", "Go Go Diva", 2018, "Alternative Pop", "Indie Rock"], ["Ciao ciao", "My Mamma", 2022, "Electro", "Cantautorato Italiano"]],
];

const profiles = {
  "Alternative Pop": ["scrittura pop non convenzionale", "elettronica", "cantautorato"],
  "Contemporary R&B": ["neo soul", "produzione elettronica", "R&B contemporaneo"],
  "Indie Pop": ["cantautorato", "hip hop", "pop indipendente"],
  "Hip Hop Italiano": ["rap", "campionamento", "cultura hip hop italiana"],
  "Rap Italiano": ["hip hop", "scrittura ritmica", "cantautorato urbano"],
  "Cantautorato Italiano": ["canzone d’autore", "pop italiano", "scrittura narrativa"],
  "Elettronica Italiana": ["house", "sintetizzatori", "club culture"],
  "House": ["disco", "elettronica da club", "cassa in quattro quarti"],
  "Indie Rock": ["post-punk", "rock indipendente", "cantautorato"],
  "Electro": ["sintetizzatori", "ritmi elettronici", "new wave"],
  "Library Music": ["jazz", "musica per immagini", "sperimentazione in studio"],
  "Cinematic Music": ["colonna sonora", "jazz orchestrale", "musica per immagini"],
  "Funk Italiano": ["funk", "library music", "jazz-funk"],
  "Jazz Funk": ["jazz", "funk", "groove strumentale"],
  "Psychedelic Pop": ["psichedelia", "pop", "produzione elettronica"],
  "Disco Italiana": ["disco", "funk mediterraneo", "boogie"],
  "Nu Disco": ["disco", "house", "produzione contemporanea"],
  "Balearic": ["disco mediterranea", "downtempo", "cultura del club"],
  "Nu Soul": ["neo soul", "jazz", "beat music"],
  "Neo Soul": ["soul", "jazz", "R&B contemporaneo"],
};

const flattened = catalog.flatMap(([artist, country, ...tracks]) => tracks.map(([title, album, year, genre, subgenre]) => ({ artist, country, title, album, year, genre, subgenre })));
const encode = (value) => encodeURIComponent(value);

export default flattened.map((item, index) => {
  const peers = catalog.filter(([artist]) => artist !== item.artist).slice(index % 12, index % 12 + 3).map(([artist]) => artist);
  const alternatives = flattened.filter((track) => track.title !== item.title).slice((index * 3) % 24, ((index * 3) % 24) + 3).map((track) => track.title);
  const influences = profiles[item.genre] ?? ["musica italiana", "produzione contemporanea"];
  const query = `${item.artist} ${item.title}`;
  return {
    id: 1534 + index, artist: item.artist, title: item.title, album: item.album, year: item.year, genre: item.genre, subgenre: item.subgenre, sottogenere: item.subgenre, paese: item.country,
    musicalCharacteristics: `Il brano sviluppa ${influences.join(", ")} attraverso un arrangiamento coerente con la scena italiana del periodo. Ritmo, timbro e forma sostengono l’identità specifica dell’artista.`,
    meaning: `La scrittura usa immagini personali e culturali per osservare relazioni, identità e trasformazioni della vita contemporanea senza separare esperienza individuale e contesto collettivo.`,
    scenario: `Pubblicato nel ${item.year}, il brano documenta il dialogo della musica italiana con ${item.subgenre.toLocaleLowerCase("it")}, produzione indipendente e nuovi circuiti di ascolto.`,
    influences, similarArtists: peers, influencedArtists: peers, curiosity: `È una registrazione rappresentativa del percorso di ${item.artist} e del ponte fra tradizione italiana e linguaggi contemporanei.`,
    essentialPlaylist: item.genre,
    links: { spotify: `https://open.spotify.com/search/${encode(query)}`, appleMusic: `https://music.apple.com/it/search?term=${encode(query)}`, youtube: `https://www.youtube.com/results?search_query=${encode(query)}` },
    deezer: { trackId: null, previewUrl: "", status: "not-checked" }, artwork: "", preview: "",
    question: "Qual è il titolo del brano?", correctAnswer: item.title, answers: [item.title, ...alternatives].slice(0, 4),
  };
});
