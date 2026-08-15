const catalog = [
  ["Joan Thiele", "Italia", ["Le vacanze", "Atti", 2022, "Alternative Pop", "Contemporary R&B"], ["Eco", "Atti", 2022, "Contemporary R&B", "Neo Soul"]],
  ["Frah Quintale", "Italia", ["Craterì", "Regardez Moi", 2017, "Indie Pop", "Hip Hop Italiano"], ["8 miliardi di persone", "Banzai (Lato blu)", 2020, "Hip Hop Italiano", "Indie Pop"]],
  ["Willie Peyote", "Italia", ["Ottima scusa", "Educazione sabauda", 2015, "Rap Italiano", "Hip Hop Italiano"], ["Mai dire mai (La locura)", "Pornostalgia", 2021, "Hip Hop Italiano", "Rap Italiano"]],
  ["Franco126", "Italia", ["Stanza singola", "Stanza singola", 2019, "Cantautorato Italiano", "Indie Pop"], ["Frigobar", "Stanza singola", 2019, "Indie Pop", "Cantautorato Italiano"]],
  ["Cosmo", "Italia", ["L’ultima festa", "L’ultima festa", 2016, "Elettronica Italiana", "Indietronica"], ["Turbo", "Cosmotronic", 2018, "House", "Electro"]],
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

const meanings = [
  "Paragona una relazione finita ai crateri lasciati da un impatto: anche dopo la separazione, i segni dell'incontro restano visibili.",
  "Osserva un sistema dello spettacolo che trasforma polemica e ribellione in prodotti televisivi, confondendo libertà d'espressione e ricerca di consenso.",
  "Due persone condividono un'intimità provvisoria, sapendo che la loro stanza non possiede ancora la stabilità di una casa comune.",
  "Fra alcol, insonnia e oggetti di una camera anonima, una relazione conclusa continua a occupare la mente di chi è rimasto solo.",
  "Invita a vivere la notte come ultima occasione per incontrarsi e ballare; dietro l'euforia affiora la paura che restino soltanto distanza e rimpianto.",
  "Le parole funzionano come comandi e lampi d'immagine: traducono l'accelerazione fisica e mentale della pista senza costruire una storia lineare.",
  "Nega provocatoriamente l'amore a Napoli mentre continua a cercarlo nei ricordi e nelle strade di una città inseparabile dalla relazione.",
  "Chi è stato lasciato chiede perché il rapporto sia finito se il legame continua a farsi sentire, fra rimprovero, nostalgia e desiderio di ricominciare.",
  "Usa Mandela come emblema paradossale della pazienza richiesta da una relazione logorante, fino a rivendicare il diritto di non sopportare tutto.",
  "Un giubbottino diventa il dettaglio concreto con cui ricordare un incontro; desiderio, posa e insicurezza vengono osservati con ironia.",
  "Riconosce l'arrivo di un desiderio che invade ogni pensiero: non un amore sereno, ma una presenza capace di sedurre e destabilizzare.",
  "Composizione strumentale: il titolo suggerisce una figura elegante e cinematografica, delineata dal tema e dal groove senza azioni o personaggi definiti.",
  "Composizione strumentale: evoca il passaggio dalla luce alla sera come momento di sospensione, con una funzione paesaggistica e cinematografica.",
  "Brano strumentale: immagina la Bovisa notturna come scenario noir di movimento, attesa e tensione, senza raccontare eventi determinati.",
  "Brano strumentale concepito come omaggio ai polizieschi europei: mette in scena inseguimento, pericolo e ironia attraverso codici cinematografici.",
  "Descrive persone che cercano uno spazio comune malgrado pressioni e differenze; la vicinanza è affettiva ma anche bisogno di comunità.",
  "La richiesta di suonare ancora è rivolta alla musica come forza di memoria e coesione, capace di mantenere vivo il contatto con una comunità.",
  "La persona desiderata è un satellite: vicina nell'orbita dei pensieri, ma irraggiungibile. Le immagini astronomiche traducono attrazione e separazione.",
  "Cerca un abbandono completo che interrompa il controllo razionale; le immagini frammentarie registrano il desiderio di essere assorbiti dall'esperienza.",
  "La primavera irrompe come una guerra, accompagnando una relazione segnata da assenza e conflitto: il ritorno della vita è desiderabile e doloroso.",
  "Il mare custodisce il ricordo di un legame e ne racconta distanza, ritorni e trasformazioni, come una storia che cambia a ogni passaggio.",
  "La voce esprime in napoletano desideri rivolti alla persona amata, insistendo sulla volontà di condividere tempo, corpo e quotidianità.",
  "Celebra un incontro estivo fra mare, calore e ballo; napoletano e francese evocano una libertà mediterranea senza chiuderla in una trama.",
  "Il titolo richiama i fuochi d'artificio e una bellezza intensa ma fugace; voce e frammenti affidano ad atmosfera e durata il senso del brano.",
  "Il testo procede per immagini intime e allusive; il nome del titolo è il riferimento privato attorno a cui si raccolgono ricordo e identità.",
  "Tre voci raccontano un rapporto consumato che riemerge attraverso una canzone comune, alternando nostalgia, orgoglio e bisogno di essere ricordati.",
  "La mancanza di respiro descrive l'effetto fisico di un legame fra attrazione e inquietudine, registrato attraverso immagini brevi e sensoriali.",
  "Presenta l'amore come esperienza quotidiana e imperfetta: la voce cerca autenticità mentre riconosce esitazioni e fragilità del rapporto.",
  "Desidera liberarsi dal peso mentale e lasciare volare i pensieri; amore, immaginazione e alterazione percettiva finiscono per sovrapporsi.",
  "Rivendica il corpo come territorio vissuto, vulnerabile e politico, sottraendolo allo sguardo di chi pretende di definirlo o controllarlo.",
  "Davanti a un mondo prossimo al collasso, reagisce con un saluto danzante: festa e allegria rendono ancora più evidente l'assurdità della catastrofe.",
];

export default flattened.map((item, index) => {
  const peers = catalog.filter(([artist]) => artist !== item.artist).slice(index % 12, index % 12 + 3).map(([artist]) => artist);
  const alternatives = flattened.filter((track) => track.title !== item.title).slice((index * 3) % 24, ((index * 3) % 24) + 3).map((track) => track.title);
  const influences = profiles[item.genre] ?? ["musica italiana", "produzione contemporanea"];
  const query = `${item.artist} ${item.title}`;
  return {
    id: 1534 + index, artist: item.artist, title: item.title, album: item.album, year: item.year, genre: item.genre, subgenre: item.subgenre, sottogenere: item.subgenre, paese: item.country,
    musicalCharacteristics: `Il brano sviluppa ${influences.join(", ")} attraverso un arrangiamento coerente con la scena italiana del periodo. Ritmo, timbro e forma sostengono l’identità specifica dell’artista.`,
    meaning: meanings[index] ?? "",
    scenario: `Pubblicato nel ${item.year}, il brano documenta il dialogo della musica italiana con ${item.subgenre.toLocaleLowerCase("it")}, produzione indipendente e nuovi circuiti di ascolto.`,
    influences, similarArtists: peers, influencedArtists: peers, curiosity: `È una registrazione rappresentativa del percorso di ${item.artist} e del ponte fra tradizione italiana e linguaggi contemporanei.`,
    essentialPlaylist: item.genre,
    links: { spotify: `https://open.spotify.com/search/${encode(query)}`, appleMusic: `https://music.apple.com/it/search?term=${encode(query)}`, youtube: `https://www.youtube.com/results?search_query=${encode(query)}` },
    deezer: { trackId: null, previewUrl: "", status: "not-checked" }, artwork: "", preview: "",
    question: "Qual è il titolo del brano?", correctAnswer: item.title, answers: [item.title, ...alternatives].slice(0, 4),
  };
});
