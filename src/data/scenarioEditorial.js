import { scenarioBlock01 } from "./scenarioBlock01.js";
import { scenarioBlock02 } from "./scenarioBlock02.js";
import { scenarioBlock03 } from "./scenarioBlock03.js";
import { scenarioRemaining } from "./scenarioRemaining.js";
import { scenarioGlobalCorrections } from "./scenarioGlobalCorrections.js";

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
  1835: "Nel 1966 il boom economico aveva ampliato consumi e autonomia degli adolescenti italiani: jukebox, 45 giri e programmi televisivi acceleravano la circolazione delle novità. La vittoria dell’Equipe 84 al Cantagiro mostrò come le manifestazioni itineranti potessero trasformare un adattamento della British Invasion in un successo nazionale.",
  1836: "Nel 1967 il beat italiano stava superando la stagione delle semplici cover, mentre radio e studi di registrazione diventavano laboratori creativi. La collaborazione Battisti-Mogol e l’inserto del giornale radio legarono “29 settembre” a una cultura giovanile ormai pronta alla psichedelia.",
  1837: "Nel 1966 i giovani italiani cercavano linguaggi autonomi rispetto alla morale familiare, fra capelli lunghi, nuovi locali e riviste come Ciao amici. I Rokes, britannici attivi a Roma, trasformarono una canzone americana in un emblema del conflitto fra adolescenti e mondo adulto.",
  1838: "Nel 1966 televisione, festival estivi e 45 giri facevano del beat una lingua comune della gioventù italiana. I Rokes mostrarono come un gruppo immigrato dalla scena britannica potesse radicarsi a Roma e affidare a un adattamento di Mogol un messaggio collettivo di cambiamento.",
  1839: "Nel 1966 la California rappresentava per molti giovani italiani un altrove di libertà diffuso da cinema, radio e dischi d’importazione. La versione dei Dik Dik trasferì quel sogno nella lingua nazionale, secondo la pratica delle cover che alimentava rapidamente il mercato dei 45 giri.",
  1840: "Nel 1970 i grandi festival rock erano diventati simboli globali della controcultura, dalla memoria di Woodstock all’Isola di Wight. L’adattamento dei Dik Dik portò quell’immaginario comunitario nell’Italia segnata dalle proteste, quando l’utopia beat conviveva ormai con tensioni politiche più dure.",
  1841: "Nel 1967 il miracolo economico mostrava le proprie contraddizioni e una nuova generazione contestava consumismo, autorità e conformismo. La censura Rai e la trasmissione da parte di Radio Vaticana resero “Dio è morto” un caso pubblico nel passaggio verso il Sessantotto.",
  1842: "Nel 1972 la stagione beat era conclusa e l’Italia attraversava conflitti politici, migrazioni interne e nuovi modelli di vita. Radio, feste popolari e concerti permisero ai Nomadi di trasformare l’eredità generazionale degli anni Sessanta in un repertorio condiviso oltre le mode del 45 giri.",
  1843: "Nel 1966 concorsi come Un disco per l’estate affiancavano Sanremo e la televisione nel costruire il mercato giovanile. “Tema” portò nel pop italiano una voce adolescenziale quotidiana, mentre scuola, famiglia e primi consumi autonomi diventavano terreni centrali del confronto generazionale.",
  1844: "Nel 1965 i complessi italiani assimilavano rapidamente singoli britannici e americani attraverso cover destinate a jukebox e locali da ballo. I Giganti operarono in questa prima fase del beat milanese, quando l’adattamento in italiano era la via principale per raggiungere il nuovo pubblico adolescente.",
  1845: "Nel 1966 il Piper Club di Roma era un centro di moda, ballo e costume, frequentato da una gioventù che sperimentava minigonne e identità meno convenzionali. Il debutto di Patty Pravo nacque in quella scena e rese visibile una nuova autonomia femminile nel pop.",
  1846: "Nel 1968 contestazione studentesca ed emancipazione femminile mettevano in discussione ruoli familiari e sentimentali consolidati. Proveniente dal Piper, Patty Pravo portò questa trasformazione nella televisione e nel mercato internazionale, mentre moda e canzone diventavano strumenti di identità giovanile.",
  1847: "Sanremo 1966 mostrava l’ingresso della cultura beat nel principale rito televisivo italiano. Il caschetto, l’abbigliamento e l’atteggiamento di Caterina Caselli traducevano in immagine il desiderio di autonomia delle ragazze, in un paese ancora attraversato da forti norme morali.",
  1848: "Nel 1967 l’industria italiana continuava a importare successi angloamericani, affidandoli a parolieri capaci di adattarli al costume nazionale. Caterina Caselli trasformò il brano dei Monkees in un 45 giri legato alla nuova presenza femminile fra classifiche, televisione e riviste giovanili.",
  1849: "Nel 1968 il beat lasciava spazio a un pop più narrativo mentre le città italiane rendevano visibili fughe da casa, inquietudini adolescenziali e conflitto familiare. Il successo radiofonico di un lato B mostrò inoltre quanto pubblico e programmazione potessero rovesciare le gerarchie decise dalle case discografiche.",
  1850: "Nel 1971, dopo il Sessantotto e l’autunno caldo, il mercato italiano cercava canzoni capaci di parlare a un pubblico più largo della scena beat. Radio e televisione favorirono la nuova ballata orchestrale, mentre i Pooh entrarono nella stagione dell’album e della produzione pop professionale.",
  1851: "Nel 1965 Milano offriva ai complessi una rete di locali, concorsi e negozi di dischi collegata alle mode britanniche, raccontata anche dalla nascente stampa giovanile. I New Dada adottarono un’immagine mod e raggiunsero il pubblico nazionale proprio mentre il tour italiano dei Beatles consacrava il beat come fenomeno generazionale.",
  1852: "Nel 1965 i gruppi beat dipendevano dalla rapida successione di 45 giri, serate nei club e apparizioni televisive. I New Dada appartenevano alla scena milanese più vicina al rhythm and blues britannico, prima che cambi di formazione e nuove mode rendessero fragile la continuità dei complessi.",
  1853: "Nel 1966 il lato più ribelle del beat italiano trovava spazio nei 45 giri, nei festival e sulle pagine di Big, che metteva musica e costume in dialogo. I Corvi adattarono il garage americano alla cultura giovanile nazionale, usando un’immagine scura per distinguersi dal pop televisivo più rassicurante.",
  1854: "Nel 1967 le canzoni angloamericane circolavano in Italia attraverso versioni concorrenti, jukebox e programmi radiofonici. I Corvi inserirono il successo scritto da Sonny Bono nella scena garage nazionale, mostrando come una cover potesse cambiare carattere secondo pubblico, immagine e circuito d’esecuzione.",
  1855: "Nel 1967 il beat italiano si apriva al pop barocco e alla psichedelia che arrivavano dal Regno Unito. L’adattamento dei Procol Harum raggiunse un pubblico formato da radio, televisione e sale da ballo, mentre i complessi cercavano una maturità oltre i primi modelli rock and roll.",
  1856: "Nel 1968 contestazione e trasformazioni del costume convivevano con una televisione ancora centrale nella vita nazionale. I Camaleonti attraversarono il passaggio dal circuito dei complessi al pop melodico di massa, sostenuto da festival, rotocalchi e un mercato discografico ormai rivolto a più generazioni.",
  1857: "Nel 1967 il soul afroamericano offriva ai complessi italiani un’alternativa espressiva al beat più leggero. I Ribelli, cresciuti nell’orbita di Celentano e dei locali milanesi, portarono quella tensione nei 45 giri mentre il pubblico giovanile chiedeva interpreti e temi emotivamente meno convenzionali.",
  1858: "Nel 1968 la scena dei complessi stava cambiando sotto la pressione della contestazione, del soul e delle prime sperimentazioni rock. Con Demetrio Stratos, i Ribelli rappresentarono una via più adulta del beat, ancora affidata al 45 giri ma già proiettata oltre le formule televisive iniziali.",
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
  scenarioGlobalCorrections[track.id] || scenarioBlock01[track.id] || scenarioBlock02[track.id] || scenarioBlock03[track.id] || scenarioRemaining[track.id] || externalScenarioOverrides[track.id] || "";

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
