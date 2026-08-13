import { scenarioBlock01 } from "./scenarioBlock01.js";
import { scenarioBlock02 } from "./scenarioBlock02.js";
import { scenarioRemaining } from "./scenarioRemaining.js";

const specialScenarios = {
  "Blue Monday": "Nel 1983 Manchester portava ancora le ferite della deindustrializzazione: fabbriche chiuse e disoccupazione convivevano con la vitalità di Factory Records e dell’Haçienda. Il club, inaugurato l’anno precedente, stava trasformando il post-punk in una nuova cultura del ballo. Blue Monday nacque dentro questo passaggio, mentre drum machine e sequencer rendevano possibile un’elettronica indipendente capace di viaggiare ben oltre il Nord dell’Inghilterra.",
  "Karma Chameleon": "La Gran Bretagna del 1983 era segnata dal secondo governo Thatcher, dalla disoccupazione e da forti conflitti sociali, ma la televisione offriva un’immagine molto più colorata. MTV, arrivata da poco, premiava artisti dall’identità visiva immediata. Boy George divenne così una figura centrale del pop: il suo stile androgino portò nelle case discussioni su genere, moda e libertà personale, oltre i confini del New Romantic.",
  "Street Fighting Man": "Il 1968 trasformò la protesta in un linguaggio internazionale. Il Maggio francese occupò università e fabbriche, negli Stati Uniti cresceva l’opposizione alla guerra del Vietnam e le mobilitazioni studentesche attraversavano anche Londra. In ottobre, una grande marcia davanti all’ambasciata americana di Grosvenor Square sfociò in scontri con la polizia. Street Fighting Man entrò in questo clima di barricate reali, immagini televisive e acceso dibattito generazionale.",
  "Born in the U.S.A.": "Nel 1984 Ronald Reagan cercava la rielezione raccontando un’America nuovamente forte e ottimista. Dietro quella narrazione restavano però disoccupazione industriale, disuguaglianze e il difficile reinserimento dei reduci del Vietnam, spesso trascurati dalle istituzioni. Organizzazioni di veterani chiedevano riconoscimento per traumi, disabilità ed esposizione all’Agent Orange. Born in the U.S.A. uscì proprio mentre memoria della guerra e patriottismo diventavano temi centrali del dibattito pubblico.",
  "Imagine": "Nel 1971 la guerra del Vietnam continuava e il movimento pacifista riempiva piazze, campus e mezzi di comunicazione. Le rivelazioni dei Pentagon Papers alimentarono la sfiducia verso il governo statunitense, mentre la controcultura cercava forme di convivenza alternative alla logica dei blocchi della Guerra Fredda. Imagine arrivò in questo passaggio: l’utopia dei tardi anni Sessanta stava lasciando il posto a un pacifismo più disilluso, ma ancora globale.",
};

const externalScenarioOverrides = {
  1639: "Nel 1975 il country statunitense non coincideva più soltanto con Nashville: la scena californiana, l’outlaw country e il nuovo cantautorato avevano allargato linguaggi e pubblico. “Boulder to Birmingham”, scritto dopo la morte di Gram Parsons, entrò in questo passaggio mentre gli Stati Uniti assistevano alla conclusione della guerra del Vietnam e riconsideravano un decennio di conflitti e disillusione.",
  1720: "Nel Belgio del 1989 la new beat usciva dai club per incontrare il mercato pop internazionale, sostenuta da videoclip e televisioni musicali. “Pump Up the Jam” rese visibile quella trasformazione, ma la promozione mostrò la modella Felly mentre la voce e il rap della registrazione erano di Ya Kid K: un caso emblematico del modo in cui l’industria dance costruiva l’immagine dei propri interpreti.",
};

const eraContexts = [
  [1959, [
    "La radio, i jukebox e i primi programmi televisivi stavano creando un pubblico giovanile autonomo, mentre il disco a 45 giri accelerava la circolazione della musica popolare.",
    "La Guerra Fredda divideva l’Europa e gli Stati Uniti vivevano ancora la segregazione razziale; parallelamente, rhythm and blues e rock and roll mettevano in contatto pubblici prima separati.",
  ]],
  [1964, [
    "Il boom economico allargava i consumi e la televisione entrava stabilmente nelle case; moda, riviste e dischi davano agli adolescenti una visibilità senza precedenti.",
    "Il movimento per i diritti civili statunitense cambiava il linguaggio pubblico, mentre le radio transatlantiche facevano circolare soul, jazz e nuove forme di pop giovanile.",
  ]],
  [1969, [
    "Le proteste contro la guerra del Vietnam, i movimenti studenteschi e le lotte per i diritti civili trasformavano le strade in spazi politici e culturali.",
    "La controcultura metteva in discussione autorità, costume e morale; festival, stampa alternativa e radio libere costruivano una comunità giovanile internazionale.",
    "Dopo le contestazioni del 1968, musica e immagine pubblica degli artisti venivano lette anche come prese di posizione sul presente.",
  ]],
  [1974, [
    "La fine dell’ottimismo dei Sessanta coincise con guerra del Vietnam, scandalo Watergate e crisi petrolifera, che rese più visibili precarietà e conflitti sociali.",
    "Televisori a colori, impianti hi-fi e album a lunga durata cambiarono il consumo culturale, mentre le sottoculture urbane crearono codici propri di abbigliamento e appartenenza.",
  ]],
  [1979, [
    "Crisi industriale, inflazione e tensioni politiche segnavano molte città occidentali; punk, disco e nuove comunità di club offrivano risposte molto diverse allo stesso senso di rottura.",
    "La disco culture rese la pista uno spazio di emancipazione per comunità nere, latine e LGBTQ+, proprio mentre una reazione conservatrice cercava di ridimensionarne la visibilità.",
    "Etichette indipendenti, fanzine e piccoli locali dimostravano che una scena poteva organizzarsi fuori dai grandi mezzi di comunicazione.",
  ]],
  [1984, [
    "I governi Reagan e Thatcher accompagnavano liberalizzazioni, disoccupazione industriale e una nuova retorica del successo individuale; il pop offriva un osservatorio privilegiato su queste contraddizioni.",
    "MTV trasformò il videoclip in un passaporto internazionale: immagine, moda e regia divennero importanti quanto la presenza radiofonica.",
    "Sintetizzatori più accessibili, drum machine e registrazione multitraccia spostarono parte della produzione dai grandi studi verso nuovi laboratori indipendenti.",
  ]],
  [1989, [
    "La fase finale della Guerra Fredda culminò nella caduta del Muro di Berlino, mentre globalizzazione dei media e cultura giovanile rendevano più permeabili i confini musicali.",
    "Il compact disc avanzava nei negozi e i videoclip dominavano la promozione; allo stesso tempo cassette e radio locali mantenevano viva la circolazione sotterranea.",
    "Rave, hip-hop e club culture trasformavano magazzini, periferie e locali in luoghi di socialità, dando voce a comunità poco rappresentate dai media tradizionali.",
  ]],
  [1994, [
    "Dopo la fine della Guerra Fredda, televisione satellitare e grandi marchi parlavano a un pubblico sempre più globale, mentre le scene locali difendevano accenti e identità specifiche.",
    "Campionatori digitali, home studio e compact disc modificarono produzione e ascolto; il confine tra musicista, DJ e produttore diventò più mobile.",
    "L’espansione dei club e dei festival rese la notte un’economia culturale riconoscibile, ma aprì anche discussioni pubbliche su sicurezza, droghe e controllo degli spazi urbani.",
  ]],
  [1999, [
    "Internet entrava nelle case attraverso modem e primi portali, mentre MTV conservava un enorme potere nel trasformare estetiche locali in fenomeni internazionali.",
    "La globalizzazione discografica conviveva con etichette indipendenti, negozi specializzati e culture del remix che collegavano città lontane.",
    "Alla vigilia del nuovo millennio, tecnologia digitale e cultura pop alimentavano insieme entusiasmo futurista e timori per l’omologazione commerciale.",
  ]],
  [2004, [
    "Masterizzatori, file MP3 e reti peer-to-peer mettevano in crisi il modello del compact disc; per molti ascoltatori la scoperta musicale passava ormai dal computer.",
    "I primi social network e la diffusione della banda larga avvicinavano artisti e pubblico, riducendo il monopolio promozionale di radio e televisione.",
    "Festival internazionali, blog e forum musicali costruivano comunità oltre i confini nazionali, mentre l’industria cercava nuove risposte alla condivisione digitale.",
  ]],
  [2009, [
    "La crisi finanziaria del 2008 segnava lavoro e consumi giovanili, mentre smartphone, YouTube e social network cambiavano rapidamente la vita quotidiana.",
    "Download, blog e piattaforme video acceleravano la scoperta musicale; una scena locale poteva raggiungere ascoltatori globali senza attendere radio o televisioni.",
    "Laptop e software di produzione sempre più economici rendevano l’home studio una realtà comune, modificando ruoli e tempi dell’industria discografica.",
  ]],
  [2014, [
    "Lo streaming iniziava a sostituire download e supporti fisici, imponendo playlist, ascolto mobile e nuove misure del successo commerciale.",
    "Instagram, YouTube e Tumblr rendevano identità visiva e rapporto diretto con i fan parte integrante della carriera di un artista.",
    "Dopo la crisi economica, precarietà e disuguaglianze convivevano con una cultura digitale capace di amplificare movimenti sociali e nuove rappresentazioni.",
  ]],
  [2019, [
    "Lo smartphone era ormai il principale punto d’accesso alla musica: streaming, playlist algoritmiche e social media accorciavano la distanza tra scena locale e pubblico mondiale.",
    "Movimenti come Black Lives Matter, #MeToo e le mobilitazioni climatiche rendevano identità, rappresentazione e giustizia sociale centrali nella conversazione culturale.",
    "La rinascita del vinile conviveva con l’ascolto smaterializzato, mostrando il desiderio di oggetti e rituali dentro un mercato governato dalle piattaforme.",
  ]],
  [2024, [
    "La pandemia aveva accelerato concerti in streaming, social video e comunità online; con la riapertura, festival e club tornarono a essere luoghi decisivi di incontro fisico.",
    "TikTok e le playlist potevano riportare in classifica cataloghi lontani o lanciare un brano in pochi giorni, rendendo meno lineare il rapporto fra uscita e successo.",
    "Il dibattito sull’intelligenza artificiale generativa si aggiungeva alle questioni su compensi dello streaming, copyright e sostenibilità del lavoro creativo.",
  ]],
];

const sceneContexts = [
  [/house|garage|dance|disco/i, [
    "La pista era anche uno spazio sociale: DJ, remix e impianti sonori univano comunità nere, latine e queer spesso marginalizzate altrove.",
    "White label, versioni su dodici pollici e negozi specializzati permettevano ai DJ di sperimentare prima che le novità arrivassero nelle classifiche.",
    "Il club funzionava come un laboratorio collettivo, dove la risposta del pubblico poteva cambiare arrangiamento, durata e fortuna di una registrazione.",
  ]],
  [/techno|electro|electronic|ambient|downtempo|trip.?hop/i, [
    "Macchine nate per accompagnare i musicisti venivano usate in modo creativo: sequencer, campionatori e sintetizzatori favorivano piccoli studi e nuove figure di produttore.",
    "L’immaginario tecnologico permetteva di parlare insieme di futuro, vita urbana e alienazione, senza dipendere dalla forma tradizionale della band.",
    "Etichette indipendenti e programmi radio notturni collegavano laboratori elettronici lontani, facendo circolare dischi prima della loro consacrazione commerciale.",
  ]],
  [/hip.?hop|rap|grime|trap/i, [
    "Mixtape, radio locali e competizioni dal vivo erano infrastrutture culturali decisive: documentavano quartieri e linguaggi che la televisione nazionale mostrava raramente.",
    "Campionamento, DJing e rap trasformavano archivi sonori e cronaca quotidiana in strumenti di memoria collettiva e autorappresentazione.",
    "Moda di strada, danza e produzione musicale appartenevano allo stesso ecosistema, capace di creare economie indipendenti prima del riconoscimento mainstream.",
  ]],
  [/punk|new wave|rock|metal|grunge|britpop|indie/i, [
    "Sale da concerto, fanzine e radio universitarie sostenevano una rete alternativa ai grandi media, facendo della musica anche un segno di appartenenza generazionale.",
    "L’estetica del fai-da-te ridusse la distanza tra pubblico e palco: abiti, grafica e piccole etichette contavano quanto la promozione tradizionale.",
    "La chitarra rimase un simbolo culturale conteso fra ribellione, industria e identità locale, in dialogo costante con televisione e moda giovanile.",
  ]],
  [/soul|funk|r&b|gospel|motown|neo.?soul/i, [
    "Radio nere, chiese, sale da ballo e piccole etichette costituivano una rete essenziale per artisti spesso esclusi dai principali canali promozionali.",
    "La musica afroamericana accompagnava trasformazioni nei diritti civili, nella rappresentazione pubblica e nell’idea stessa di eleganza popolare.",
    "Produzione, moda e coreografia rendevano visibile una modernità nera capace di influenzare il costume ben oltre il mercato musicale.",
  ]],
  [/jazz|bossa|brazil|latin|afrobeat|reggae|dub/i, [
    "Migrazioni, radio internazionali e circuiti dei festival mettevano in contatto tradizioni locali e pubblico globale, non senza discussioni su appropriazione e riconoscimento.",
    "Club, studi e programmi culturali facevano viaggiare ritmi nati in contesti diasporici, trasformandoli in un lessico condiviso fra continenti.",
    "L’incontro tra musicisti, tecnici e comunità migranti mostrava come l’innovazione nascesse spesso ai margini delle categorie commerciali.",
  ]],
  [/pop|synth|new romantic|soundtrack/i, [
    "Televisione, moda e industria discografica costruivano icone immediatamente riconoscibili, mentre il pubblico giovanile usava quelle immagini per definire la propria identità.",
    "Classifiche radiofoniche e programmi musicali trasformavano il singolo in un appuntamento collettivo, prima della frammentazione introdotta dalle piattaforme digitali.",
    "Videoclip, copertine e styling ampliarono il racconto pop oltre il suono, facendo dialogare musica, pubblicità e costume.",
  ]],
];

const countryContexts = {
  "Regno Unito": "Nel Regno Unito, stampa musicale, BBC e una fitta rete di club potevano trasformare rapidamente un fenomeno locale in una questione nazionale.",
  "Stati Uniti": "Negli Stati Uniti, le forti differenze fra città e comunità producevano scene autonome, poi collegate da radio, tournée e mercato discografico.",
  "Italia": "In Italia, televisione generalista, Festivalbar e radio private convivevano con club e centri sociali, creando percorsi diversi verso il pubblico.",
  "Francia": "In Francia, politiche culturali, radio e vita notturna parigina favorivano il dialogo fra tradizione nazionale, culture migranti e nuove tecnologie.",
  "Germania": "In Germania, memoria della divisione, ricostruzione urbana e spazi industriali riconvertiti diedero alle culture giovanili un significato particolare.",
  "Brasile": "In Brasile, musica popolare, televisione e identità regionale partecipavano a un intenso confronto su modernità, disuguaglianze e democrazia.",
  "Giamaica": "In Giamaica, sound system, studi indipendenti e competizione fra produttori rendevano la musica un laboratorio popolare con influenza internazionale.",
};

// Conservati come repertorio editoriale per future revisioni puntuali; il fallback
// non li applica più automaticamente in base al solo anno o genere.
void eraContexts;
void sceneContexts;
void countryContexts;

const wordCount = (value) => value.trim().split(/\s+/).length;

const scenarioOverrideFor = (track) =>
  scenarioBlock01[track.id] || scenarioBlock02[track.id] || scenarioRemaining[track.id] || externalScenarioOverrides[track.id] || "";

const isEditorialScenario = (value) => wordCount(String(value ?? "")) > 18;

export const historicalScenario = (track) => {
  const editorialOverride = scenarioOverrideFor(track);
  if (isEditorialScenario(editorialOverride)) return editorialOverride;
  if (specialScenarios[track.title]) return specialScenarios[track.title];
  const classification = track.subgenre || track.sottogenere || track.genre;
  const release = track.album ? `“${track.album}”` : "singolo autonomo";
  // Quando non esiste un contesto documentabile, una nota discografica
  // essenziale è più corretta di una falsa cornice storico-culturale.
  return `“${track.title}” — ${track.artist}; ${release}; ${track.year}; ${classification}.`;
};

export const historicalScenarioOverride = (track) =>
  isEditorialScenario(scenarioOverrideFor(track)) ? scenarioOverrideFor(track) : "";

const genericScenario = /paesaggio culturale|trasformazione dei consumi|riflettevano tensioni sociali|guardare oltre le classifiche|modi di ascoltare|pubblicazione originale indicata|documenta la scena|documenta la stagione|documenta l'evoluzione|permette di seguirne l'evoluzione|la sua circolazione documenta|si colloca nel contesto di|si colloca nel quadro storico descritto|ne documenta una fase significativa attraverso|il brano documenta l'incontro fra|il brano documenta il dialogo della|il brano documenta la trasformazione del|^pubblicat[oa] nel \d{4},? (?:il brano|la registrazione)|^uscito nel \d{4},? (?:il brano|la registrazione)|^nel \d{4},? (?:il brano|la registrazione) (?:documenta|appartiene|si colloca)/i;
const normalizeSentence = (value) => value.trim().replace(/\s+/g, " ").replace(/([.!?])?$/, ".");

export const reviewedHistoricalScenario = (track, value) => {
  const scenario = String(value ?? "").trim();
  if (!scenario || genericScenario.test(scenario)) {
    const specificLead = scenario.split(/\s+Pubblicato nel\s+\d{4}/i)[0]?.trim();
    if (specificLead && !genericScenario.test(specificLead) && wordCount(specificLead) >= 8) return normalizeSentence(specificLead);
    return historicalScenario(track);
  }
  if (wordCount(scenario) <= 80) return scenario;
  const sentences = scenario.match(/[^.!?]+[.!?]+/g) ?? [scenario];
  return sentences.slice(0, 2).join(" ").trim();
};
