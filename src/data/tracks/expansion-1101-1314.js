const profiles = {
  Britpop: ["britpop", ["indie rock", "glam rock", "pop britannico"], "la stagione Britpop e il rinnovato dialogo fra identità britannica, chitarre e cultura pop"],
  Merseybeat: ["merseybeat", ["rock and roll", "skiffle", "rhythm and blues"], "la scena dei club di Liverpool che trasformò il rock britannico in un fenomeno mondiale"],
  "New Romantic": ["new romantic", ["synth-pop", "glam rock", "post-punk"], "l'incontro fra elettronica, moda e libertà d'immagine nella club culture britannica"],
  Madchester: ["madchester", ["acid house", "indie rock", "psichedelia"], "la fusione mancuniana fra band, groove dance e cultura rave"],
  "Musica italiana": ["cantautorato italiano", ["canzone d'autore", "pop", "tradizione italiana"], "l'evoluzione della canzone italiana attraverso scrittura, interpretazione e ricerca sonora"],
};

const catalog = {
  "Oasis": [["Supersonic","Definitely Maybe",1994],["Live Forever","Definitely Maybe",1994],["Rock 'n' Roll Star","Definitely Maybe",1994],["Some Might Say","(What's the Story) Morning Glory?",1995],["Wonderwall","(What's the Story) Morning Glory?",1995],["Don't Look Back in Anger","(What's the Story) Morning Glory?",1995],["Champagne Supernova","(What's the Story) Morning Glory?",1995]],
  "Blur": [["She's So High","Leisure",1990],["For Tomorrow","Modern Life Is Rubbish",1993],["Girls & Boys","Parklife",1994],["Parklife","Parklife",1994],["The Universal","The Great Escape",1995],["Beetlebum","Blur",1997],["Song 2","Blur",1997]],
  "Pulp": [["Babies","His 'n' Hers",1992],["Do You Remember the First Time?","His 'n' Hers",1994],["Common People","Different Class",1995],["Disco 2000","Different Class",1995],["Sorted for E's & Wizz","Different Class",1995],["This Is Hardcore","This Is Hardcore",1998]],
  "Suede": [["The Drowners","Suede",1992],["Metal Mickey","Suede",1992],["Animal Nitrate","Suede",1993],["Stay Together","Stay Together",1994],["The Wild Ones","Dog Man Star",1994],["Trash","Coming Up",1996]],
  "The Verve": [["She's a Superstar","Verve EP",1992],["Slide Away","A Storm in Heaven",1993],["This Is Music","A Northern Soul",1995],["The Drugs Don't Work","Urban Hymns",1997],["Bitter Sweet Symphony","Urban Hymns",1997],["Lucky Man","Urban Hymns",1997]],
  "Supergrass": [["Caught by the Fuzz","I Should Coco",1994],["Mansize Rooster","I Should Coco",1995],["Alright","I Should Coco",1995],["Richard III","In It for the Money",1997]],
  "Elastica": [["Stutter","Elastica",1993],["Line Up","Elastica",1994],["Connection","Elastica",1994],["Waking Up","Elastica",1995]],
  "Cast": [["Finetime","All Change",1995],["Alright","All Change",1995],["Sandstorm","All Change",1996],["Walkaway","All Change",1996]],
  "Ocean Colour Scene": [["The Riverboat Song","Moseley Shoals",1996],["The Day We Caught the Train","Moseley Shoals",1996],["The Circle","Moseley Shoals",1996],["Hundred Mile High City","Marchin' Already",1997]],
  "Kula Shaker": [["Tattva","K",1996],["Hey Dude","K",1996],["Govinda","K",1996],["Hush","K",1997]],
  "Gene": [["For the Dead","Olympian",1994],["Sleep Well Tonight","Olympian",1995],["Olympian","Olympian",1995],["Fighting Fit","To See the Lights",1997]],
  "Sleeper": [["Inbetweener","Smart",1995],["Vegas","Smart",1995],["Sale of the Century","The It Girl",1996],["What Do I Do Now?","The It Girl",1996]],
  "Menswear": [["I'll Manage Somehow","Nuisance",1995],["Daydreamer","Nuisance",1995],["Stardust","Nuisance",1995],["Being Brave","Nuisance",1996]],

  "The Beatles": [["I Saw Her Standing There","Please Please Me",1963],["She Loves You","Past Masters",1963],["A Hard Day's Night","A Hard Day's Night",1964],["Help!","Help!",1965],["In My Life","Rubber Soul",1965],["Tomorrow Never Knows","Revolver",1966],["A Day in the Life","Sgt. Pepper's Lonely Hearts Club Band",1967],["Come Together","Abbey Road",1969]],
  "Gerry & The Pacemakers": [["How Do You Do It?","How Do You Like It?",1963],["I Like It","How Do You Like It?",1963],["You'll Never Walk Alone","How Do You Like It?",1963],["Ferry Cross the Mersey","Ferry Cross the Mersey",1964]],
  "The Searchers": [["Sweets for My Sweet","Meet The Searchers",1963],["Sugar and Spice","Sugar and Spice",1963],["Needles and Pins","It's The Searchers",1964],["When You Walk in the Room","Sounds Like Searchers",1964]],
  "The Merseybeats": [["It's Love That Really Counts","The Merseybeats",1963],["I Think of You","The Merseybeats",1963],["Don't Turn Around","The Merseybeats",1964],["Wishin' and Hopin'","The Merseybeats",1964]],
  "Billy J. Kramer & The Dakotas": [["Do You Want to Know a Secret","Listen...",1963],["Bad to Me","Listen...",1963],["I'll Keep You Satisfied","Listen...",1963],["Little Children","Little Children",1964]],
  "The Swinging Blue Jeans": [["Hippy Hippy Shake","Blue Jeans a'Swinging",1963],["Good Golly Miss Molly","Blue Jeans a'Swinging",1964],["You're No Good","Blue Jeans a'Swinging",1964],["Don't Make Me Over","Don't Make Me Over",1966]],

  "Culture Club": [["Do You Really Want to Hurt Me","Kissing to Be Clever",1982],["Time (Clock of the Heart)","Kissing to Be Clever",1982],["Church of the Poison Mind","Colour by Numbers",1983],["Karma Chameleon","Colour by Numbers",1983],["Victims","Colour by Numbers",1983]],
  "Boy George": [["Everything I Own","Sold",1987],["The Crying Game","The Crying Game",1992],["Bow Down Mister","Cheapness and Beauty",1995]],
  "Spandau Ballet": [["To Cut a Long Story Short","Journeys to Glory",1980],["Chant No. 1 (I Don't Need This Pressure On)","Diamond",1981],["True","True",1983],["Gold","True",1983],["Only When You Leave","Parade",1984]],
  "Visage": [["Mind of a Toy","Visage",1980],["The Damned Don't Cry","The Anvil",1982],["Night Train","The Anvil",1982]],
  "Ultravox": [["Slow Motion","Systems of Romance",1978],["Sleepwalk","Vienna",1980],["Dancing with Tears in My Eyes","Lament",1984]],
  "Japan": [["Life in Tokyo","Assemblage",1979],["Nightporter","Gentlemen Take Polaroids",1980]],
  "Adam and the Ants": [["Cartrouble","Dirk Wears White Sox",1979],["Dog Eat Dog","Kings of the Wild Frontier",1980],["Antmusic","Kings of the Wild Frontier",1980],["Kings of the Wild Frontier","Kings of the Wild Frontier",1980],["Stand and Deliver","Prince Charming",1981]],
  "Classix Nouveaux": [["Guilty","Night People",1981],["Tokyo","Night People",1981],["Is It a Dream","La Verité",1982]],
  "Duran Duran": [["Planet Earth","Duran Duran",1981],["Girls on Film","Duran Duran",1981],["Hungry Like the Wolf","Rio",1982],["Rio","Rio",1982],["The Reflex","Seven and the Ragged Tiger",1983],["The Wild Boys","Arena",1984]],
  "Steve Strange": [["In the Dark","When Machines Ruled the World",2006],["Bolan Esq T. Rex Medley","Bolan Esq T. Rex Medley",2013],["Poison Within","Poison Within",2014]],

  "The Stone Roses": [["Sally Cinnamon","Sally Cinnamon",1987],["Elephant Stone","The Stone Roses",1988],["She Bangs the Drums","The Stone Roses",1989],["I Am the Resurrection","The Stone Roses",1989]],
  "Happy Mondays": [["24 Hour Party People","Squirrel and G-Man Twenty Four Hour Party People Plastic Face Carnt Smile (White Out)",1987],["Wrote for Luck","Bummed",1988],["Hallelujah","Hallelujah",1989],["Kinky Afro","Pills 'n' Thrills and Bellyaches",1990]],
  "Inspiral Carpets": [["Joe","Dung 4",1989],["Move","Life",1990],["She Comes in the Fall","Life",1990],["Saturn 5","Devil Hopping",1994]],
  "James": [["Hymn from a Village","Village Fire",1985],["Sit Down","Gold Mother",1989],["Born of Frustration","Seven",1992],["Laid","Laid",1993]],
  "The Charlatans": [["Then","Some Friendly",1990],["Weirdo","Between 10th and 11th",1992],["Can't Get Out of Bed","Up to Our Hips",1994],["One to Another","Tellin' Stories",1996]],
  "808 State": [["Pacific State","Quadrastate",1989],["Cubik","ex:el",1990],["In Yer Face","ex:el",1991],["Ooops","Gorgeous",1993]],

  "Lucio Battisti": [["Acqua azzurra, acqua chiara","Lucio Battisti",1969],["Fiori rosa, fiori di pesco","Emozioni",1970],["Pensieri e parole","Pensieri e parole",1971],["Il mio canto libero","Il mio canto libero",1972]],
  "Lucio Dalla": [["4/3/1943","Storie di casa mia",1971],["L'anno che verrà","Lucio Dalla",1979],["Futura","Dalla",1980],["Caruso","DallAmeriCaruso",1986]],
  "Fabrizio De André": [["La canzone di Marinella","Volume 1",1964],["Il pescatore","Il pescatore",1970],["La guerra di Piero","Volume 3",1964],["Crêuza de mä","Crêuza de mä",1984]],
  "Franco Battiato": [["La voce del padrone","La voce del padrone",1981],["Bandiera bianca","La voce del padrone",1981],["Voglio vederti danzare","L'arca di Noè",1982],["La cura","L'imboscata",1996]],
  "Pino Daniele": [["Je so' pazzo","Pino Daniele",1979],["A me me piace 'o blues","Nero a metà",1980],["Quanno chiove","Nero a metà",1980],["Yes I Know My Way","Vai mo'",1981]],
  "Paolo Conte": [["Onda su onda","Paolo Conte",1974],["Genova per noi","Paolo Conte",1975],["Via con me","Paris Milonga",1981],["Sparring Partner","Aguaplano",1987]],
  "Francesco De Gregori": [["Rimmel","Rimmel",1975],["Pablo","Rimmel",1975],["Generale","De Gregori",1978],["La donna cannone","La donna cannone",1983]],
  "Antonello Venditti": [["Roma capoccia","Theorius Campus",1972],["Lilly","Lilly",1975],["Sotto il segno dei pesci","Sotto il segno dei pesci",1978],["Notte prima degli esami","Cuore",1984]],
  "Rino Gaetano": [["Ma il cielo è sempre più blu","Ma il cielo è sempre più blu",1975],["Aida","Aida",1977],["Gianna","Nuntereggae più",1978],["Nuntereggae più","Nuntereggae più",1978]],
  "Ivano Fossati": [["La mia banda suona il rock","La mia banda suona il rock",1979],["Panama","Panama e dintorni",1981],["La costruzione di un amore","Panama e dintorni",1981],["Mio fratello che guardi il mondo","Lindbergh",1992]],
  "Mina": [["Tintarella di luna","Tintarella di luna",1959],["Se telefonando","Studio Uno 66",1966],["Grande grande grande","Mina",1972],["Ancora ancora ancora","Mina con bignè",1978]],
  "Adriano Celentano": [["Il tuo bacio è come un rock","Adriano Celentano con Giulio Libano e la sua orchestra",1959],["Azzurro","Azzurro / Una carezza in un pugno",1968],["Prisencolinensinainciusol","Nostalrock",1972],["Svalutation","Svalutation",1976]],
  "Vasco Rossi": [["Albachiara","Non siamo mica gli americani!",1979],["Vita spericolata","Bollicine",1983],["Siamo solo noi","Siamo solo noi",1981],["Sally","Nessun pericolo... per te",1996]],
  "Zucchero": [["Donne","Zucchero & The Randy Jackson Band",1985],["Senza una donna","Blue's",1987],["Diamante","Oro incenso & birra",1989],["Diavolo in me","Oro incenso & birra",1989]],
  "Gianna Nannini": [["America","California",1979],["Fotoromanza","Puzzle",1984],["Bello e impossibile","Profumo",1986],["I maschi","Maschi e altri",1987]],
};

const sceneByArtist = Object.fromEntries([
  [["Oasis","Blur","Pulp","Suede","The Verve","Supergrass","Elastica","Cast","Ocean Colour Scene","Kula Shaker","Gene","Sleeper","Menswear"],"Britpop"],
  [["The Beatles","Gerry & The Pacemakers","The Searchers","The Merseybeats","Billy J. Kramer & The Dakotas","The Swinging Blue Jeans"],"Merseybeat"],
  [["Culture Club","Boy George","Spandau Ballet","Visage","Ultravox","Japan","Adam and the Ants","Classix Nouveaux","Duran Duran","Steve Strange"],"New Romantic"],
  [["The Stone Roses","Happy Mondays","Inspiral Carpets","James","The Charlatans","808 State"],"Madchester"],
  [["Lucio Battisti","Lucio Dalla","Fabrizio De André","Franco Battiato","Pino Daniele","Paolo Conte","Francesco De Gregori","Antonello Venditti","Rino Gaetano","Ivano Fossati","Mina","Adriano Celentano","Vasco Rossi","Zucchero","Gianna Nannini"],"Musica italiana"],
].flatMap(([artists, scene]) => artists.map((artist) => [artist, scene])));

const rows = Object.entries(catalog).flatMap(([artist, songs]) => songs.map(([title, album, year]) => [artist, title, album, year, sceneByArtist[artist]]));
const searchLink = (service, artist, title) => {
  const query = encodeURIComponent(`${artist} ${title}`);
  if (service === "spotify") return `https://open.spotify.com/search/${query}`;
  if (service === "appleMusic") return `https://music.apple.com/it/search?term=${query}`;
  return `https://www.youtube.com/results?search_query=${query}`;
};

const editorialRevisions = {
  "Oasis|Supersonic": {
    meaning: "Il narratore rivendica il diritto di vivere secondo il proprio ritmo, opponendo sicurezza ostentata e bisogno di evasione. Le immagini surreali e i personaggi appena abbozzati non costruiscono una storia lineare: danno voce all'euforia insolente e alla confusione della giovinezza.",
    musicalCharacteristics: "Una chitarra discendente apre il brano, poi basso e batteria entrano con un passo medio, pesante e deliberatamente sicuro. Le chitarre sovrapposte occupano progressivamente lo spazio mentre Liam Gallagher canta con fraseggio nasale e distaccato, trasformando il ritornello in una dichiarazione collettiva.",
    scenario: "Singolo d'esordio degli Oasis nel 1994, annunciò una band estranea alla cautela dell'indie britannico dei primi anni Novanta. La sua sicurezza, nutrita dal rock dei Beatles e dalla scena di Manchester, anticipò il momento in cui il Britpop sarebbe passato dai piccoli club al centro della cultura pop nazionale.",
  },
  "Blur|Girls & Boys": {
    meaning: "Il testo osserva giovani britannici in vacanza mentre cercano sesso, identità e distrazione dentro relazioni trattate come consumo. Damon Albarn alterna partecipazione e sarcasmo: le categorie di genere si confondono, ma la libertà promessa dal turismo di massa resta meccanica e impersonale.",
    musicalCharacteristics: "Il basso elastico e quasi disco guida il brano sopra una cassa regolare, mentre sintetizzatori acidi e chitarre ridotte a lampi costruiscono un groove da club. Albarn canta in modo secco e teatrale; il ritornello accumula parole e incastri fino a imitare la frenesia che descrive.",
    scenario: "Pubblicato nel 1994, portò i Blur fuori dal solo circuito indie proprio mentre il Britpop diventava un racconto nazionale. Ispirato alle vacanze economiche nel Mediterraneo, univa osservazione sociale britannica e linguaggio dance, mostrando che la nuova scena chitarristica poteva dialogare con club, moda e cultura pop europea.",
  },
  "Pulp|Common People": {
    meaning: "Una studentessa benestante dichiara di voler vivere come la gente comune, ma il narratore le mostra che la povertà non è un travestimento da abbandonare a piacere. Il testo smonta il turismo di classe contrapponendo desiderio di autenticità e sicurezza economica, con rabbia crescente e humour tagliente.",
    musicalCharacteristics: "Un semplice giro di tastiera cresce per accumulo: entrano batteria, basso, chitarre e sintetizzatori finché la canzone assume la spinta di un inno. Jarvis Cocker passa dal racconto confidenziale a un canto quasi gridato; l'accelerazione emotiva dell'arrangiamento segue la trasformazione dell'ironia in indignazione.",
    scenario: "Nel 1995 il Britpop dominava classifiche e stampa, ma Pulp ne spostò il centro dalla nostalgia nazionale al conflitto di classe. Il brano trasformò anni di osservazione della vita quotidiana di Sheffield in un successo pop, offrendo alla stagione una voce più adulta, politica e consapevole delle disuguaglianze.",
  },
  "The Beatles|A Hard Day's Night": {
    meaning: "Dopo una giornata estenuante, il narratore trova sollievo tornando dalla persona amata. Il testo contrappone lavoro e intimità domestica con una semplicità diretta: la fatica acquista senso perché sostiene il legame, mentre l'incontro serale cancella momentaneamente ogni pressione.",
    musicalCharacteristics: "L'accordo iniziale, denso e sospeso, funziona come un segnale immediatamente riconoscibile. Chitarre a dodici corde, basso mobile e batteria serrata sostengono le strofe di Lennon; McCartney alza registro nel ponte, creando un contrasto luminoso prima dell'assolo compatto di chitarra e pianoforte raddoppiati.",
    scenario: "Nel 1964 il brano apriva il primo film dei Beatles e fissava in musica il ritmo febbrile della Beatlemania. Il Merseybeat nato nei club di Liverpool era ormai un fenomeno internazionale: la canzone traduceva tournée, cinema e nuova cultura giovanile in una forma pop rapida ma tecnicamente innovativa.",
  },
  "Gerry & The Pacemakers|Ferry Cross the Mersey": {
    meaning: "Il viaggio sul traghetto diventa una dichiarazione d'appartenenza a Liverpool. Il narratore riconosce nella città un luogo capace di accogliere chi cerca una casa e trasforma il paesaggio quotidiano del Mersey in conforto, memoria condivisa e orgoglio comunitario.",
    musicalCharacteristics: "La canzone procede come una ballata moderata, con chitarra pulita, basso regolare e batteria discreta che lasciano spazio alla melodia. Gerry Marsden canta senza virtuosismi, con calore colloquiale; archi e cori ampliano gradualmente l'orizzonte senza cancellare il carattere semplice del racconto.",
    scenario: "Scritta per il film omonimo del 1964, arrivò quando il successo dei gruppi cittadini aveva trasformato Liverpool in un'immagine esportabile. Rispetto all'energia da club del primo Merseybeat, offriva una celebrazione esplicita della città e contribuì a legare durevolmente la scena musicale al fiume e alla sua comunità.",
  },
  "The Searchers|Needles and Pins": {
    meaning: "Il narratore vede tornare la persona che ama, ma orgoglio e paura gli impediscono di confessare il proprio dolore. La sensazione fisica evocata dal titolo rappresenta gelosia, rimorso e vulnerabilità: fingere indifferenza diventa il modo con cui tenta inutilmente di proteggersi.",
    musicalCharacteristics: "Il riff di chitarra elettrica, brillante e leggermente tremolante, introduce una trama che anticipa il jangle pop. Batteria e basso mantengono un passo controllato, mentre le armonie vocali rendono il ritornello insieme limpido e inquieto; la produzione privilegia tensione melodica invece di potenza rock.",
    scenario: "La versione dei Searchers del 1964 mostrò come i gruppi di Liverpool potessero trasformare repertorio americano in un suono britannico distinto. Il successo internazionale allargò l'immagine del Merseybeat oltre i Beatles e rese la chitarra squillante del gruppo un riferimento per successive generazioni folk-rock e power pop.",
  },
  "Culture Club|Do You Really Want to Hurt Me": {
    meaning: "Il narratore si rivolge a una persona amata che lo respinge e continua a ferirlo, chiedendole se quel dolore sia davvero intenzionale. Alla richiesta di sincerità si intrecciano vulnerabilità, desiderio di essere accolto e paura dell'abbandono: l'amore appare come una resa emotiva priva di difese.",
    musicalCharacteristics: "Un basso rotondo e sincopato, chitarra in levare e percussioni leggere costruiscono un reggae-pop arioso, lontano dalla rigidità di molto synth-pop coevo. La voce soul di Boy George resta morbida ma esposta; cori, tastiere e piccoli interventi di sax accompagnano il ritornello senza sovraccaricarlo.",
    scenario: "Nel 1982 fu il singolo che trasformò Culture Club da presenza della nightlife londinese in fenomeno internazionale. In piena stagione New Romantic, il gruppo univa immagine androgina, sensibilità soul e ritmi caraibici: il successo rese Boy George una figura centrale nella ridefinizione pop di genere, stile e visibilità.",
  },
  "Spandau Ballet|True": {
    meaning: "Il narratore cerca parole adeguate per dichiarare un sentimento che percepisce come autentico, ma scopre che l'intimità resiste alle formule perfette. La canzone mette in scena esitazione e sincerità: l'amore è certo, mentre il linguaggio necessario per comunicarlo rimane fragile e incompleto.",
    musicalCharacteristics: "Il brano rallenta il passo con accordi morbidi di tastiera, basso levigato e una batteria controllata, lasciando ampio spazio alla voce. Tony Hadley alterna registro intimo e aperture potenti; il celebre assolo di sax prolunga la melodia del ritornello e consolida l'eleganza soul dell'arrangiamento.",
    scenario: "Pubblicata nel 1983, segnò il passaggio degli Spandau Ballet dall'urgenza elettronica dei club Blitz a un pop-soul destinato alle radio mondiali. Mentre l'estetica New Romantic entrava nel mainstream, il brano ne conservava raffinatezza visiva e ambizione, rendendo il gruppo competitivo nella nuova era di MTV.",
  },
  "Duran Duran|Rio": {
    meaning: "Rio è una figura femminile idealizzata, luminosa e irraggiungibile, osservata con desiderio mentre incarna evasione e successo. Più che raccontare una relazione concreta, il testo costruisce una fantasia di movimento, lusso e distanza in cui l'attrazione coincide con il sogno di una vita altrove.",
    musicalCharacteristics: "Il basso rapido e melodico di John Taylor dialoga con una batteria funk precisa, mentre chitarra ritmica e sintetizzatori riempiono gli spazi senza rallentare il movimento. Simon Le Bon usa una linea vocale ampia e teatrale; sax e dettagli di produzione accentuano il carattere brillante del ritornello.",
    scenario: "Nel 1982 Duran Duran trasformarono l'eredità dei club New Romantic in pop internazionale costruito anche per l'immagine. Il video girato nello Sri Lanka, trasmesso intensamente da MTV, associò il brano a colori, moda e viaggio: mostrò quanto televisione musicale e produzione visiva potessero ampliare l'identità di una band.",
  },
  "The Stone Roses|I Am the Resurrection": {
    meaning: "Il narratore respinge con durezza una persona giudicata falsa e distruttiva, fino a presentare la separazione come una rinascita. Arroganza e liberazione convivono: proclamarsi “resurrezione” significa riprendere controllo e identità dopo un rapporto consumato dal disprezzo.",
    musicalCharacteristics: "La prima metà poggia su basso melodico, batteria elastica e chitarre limpide, con Ian Brown che canta in tono quasi impassibile. Dopo l'ultima strofa il brano si apre in una lunga coda strumentale: il groove diventa più funk e John Squire moltiplica riff e assoli psichedelici.",
    scenario: "Collocata alla fine dell'album d'esordio del 1989, condensava la fiducia della nuova scena mancuniana prima della piena esplosione Madchester. L'incontro fra forma indie, psichedelia e ritmo ballabile avvicinava concerto e pista, riflettendo una città in cui band e cultura rave condividevano pubblico e immaginario.",
  },
  "Happy Mondays|24 Hour Party People": {
    meaning: "Il testo ritrae persone per cui la festa continua senza orari, fra euforia, abitudine e perdita di controllo. Shaun Ryder non celebra semplicemente l'eccesso: osserva con ironia una comunità che trasforma la notte in identità, mentre piacere e autodistruzione diventano difficili da separare.",
    musicalCharacteristics: "Basso e batteria costruiscono un funk storto e ripetitivo, attraversato da chitarre secche e tastiere minimali. Ryder declama più che cantare, piegando le parole al groove con accento mancuniano; la produzione ruvida conserva l'energia di una band che pensa già in termini di pista.",
    scenario: "Nel 1987 gli Happy Mondays raccontavano una Manchester in cui post-punk, droga e nuove abitudini notturne stavano convergendo attorno all'Haçienda. Prima che l'acid house definisse Madchester agli occhi dei media, il brano ne anticipava il personaggio collettivo: giovani, musica indipendente e festa continua come cultura urbana.",
  },
  "808 State|Pacific State": {
    meaning: "Brano strumentale: non presenta un racconto lirico, ma costruisce l'immagine di uno spazio pacifico e sospeso dentro l'energia del club. Il richiamo di uccelli e la linea di sax suggeriscono un altrove naturale, trasformando la danza in contemplazione e viaggio mentale.",
    musicalCharacteristics: "Una drum machine house sostiene accordi luminosi, basso sintetico e una linea di sax soprano campionata, mentre richiami d'uccelli attraversano il mix. Gli elementi entrano e scompaiono con gradualità: la pulsazione resta stabile, ma armonia e timbri creano una sensazione acquatica e aperta.",
    scenario: "Nata nella Manchester del 1989, portò l'elettronica locale nelle classifiche senza rinunciare alla logica del club. In piena espansione acid house, 808 State offrirono a Madchester una voce interamente elettronica: il brano collegò l'Haçienda, la radio nazionale e una nuova idea ambientale della musica da ballo.",
  },
  "Lucio Dalla|Futura": {
    meaning: "Due amanti immaginano una figlia, Futura, mentre si incontrano di nascosto in una Berlino divisa dal Muro. La promessa privata di una nascita diventa speranza politica: davanti alla paura e alla separazione, il futuro è pensato come possibilità concreta di superare confini e violenza.",
    musicalCharacteristics: "Il pianoforte introduce una narrazione raccolta che cresce lentamente con basso, batteria, tastiere e aperture orchestrali. Dalla alterna parlato, canto sommesso e slanci quasi teatrali; la dinamica segue il pensiero dei protagonisti, passando dall'intimità notturna a un finale ampio e fiducioso.",
    scenario: "Pubblicata nel 1980, nacque nell'Europa ancora divisa dalla Guerra fredda e trasformò Berlino in uno scenario emotivo accessibile al pubblico italiano. Nel percorso di Dalla segnò una sintesi matura fra canzone d'autore e produzione pop, capace di unire vicenda privata e immaginazione storica senza retorica.",
  },
  "Fabrizio De André|La guerra di Piero": {
    meaning: "Piero parte soldato e, davanti a un nemico solo e impaurito, esita a sparare; quell'atto di umanità gli costa la vita. Il racconto rifiuta l'eroismo bellico e mostra come uniformi e ordini trasformino uomini simili in avversari, lasciando alla vittima soltanto rimpianto e solitudine.",
    musicalCharacteristics: "La melodia procede con regolarità da ballata, sostenuta da chitarra acustica e un accompagnamento sobrio che richiama il canto popolare. De André usa una voce piana, quasi da narratore, mentre la ripetizione delle strofe rende inevitabile l'esito e concentra l'ascolto sulle immagini del testo.",
    scenario: "Incisa negli anni Sessanta, quando la memoria della guerra restava vicina e nuovi conflitti alimentavano il pacifismo giovanile, portò nella canzone italiana una prospettiva apertamente antimilitarista. De André recuperava la forma della ballata tradizionale per opporsi alla retorica celebrativa e raccontare la storia dal punto di vista dell'individuo sacrificato.",
  },
  "Franco Battiato|La cura": {
    meaning: "Una voce promette di proteggere la persona amata dalle paure, dalle ingiustizie e dalle fragilità del tempo. La cura non è possesso ma attenzione totale: un impegno a conoscere l'altro, accompagnarlo nelle trasformazioni e custodirne l'unicità oltre i limiti della vita quotidiana.",
    musicalCharacteristics: "L'arrangiamento unisce pianoforte, tastiere, archi e una pulsazione elettronica discreta, costruendo una crescita lenta senza esplosioni ritmiche. Battiato canta con misura quasi solenne; la melodia procede per frasi ampie e il crescendo orchestrale dà peso alla promessa mantenendo chiarezza e controllo.",
    scenario: "Uscita nel 1996, riportò Battiato al centro del pop italiano durante una fase dominata da produzioni più immediate e linguaggi giovanili. La collaborazione con il filosofo Manlio Sgalambro mostrava come scrittura colta e accessibilità potessero convivere, trasformando una meditazione sulla dedizione in una delle sue canzoni più condivise.",
  },
};

export default rows.map(([artist, title, album, year, genre], index) => {
  const [subgenre, influences, context] = profiles[genre];
  const peers = Object.keys(catalog).filter((name) => name !== artist && sceneByArtist[name] === genre).slice(0, 5);
  return {
    id: 1101 + index, artist, title, album, year, genre, subgenre,
    paese: genre === "Musica italiana" ? "Italia" : "Regno Unito",
    curiosity: `${title} concentra l'identità di ${artist} in una delle sue registrazioni essenziali.`,
    scenario: `Pubblicato nel ${year}, il brano documenta ${context}.`,
    meaning: `Testo, interpretazione e arrangiamento rendono «${title}» un passaggio centrale nel percorso di ${artist}.`,
    musicalCharacteristics: `Scrittura melodica, identità timbrica e produzione riflettono il linguaggio ${subgenre} dell'artista.`,
    importance: `È una delle opere indispensabili per comprendere il ruolo di ${artist} nella scena ${genre}.`,
    influences, similarArtists: peers, essentialPlaylist: genre, requireOriginalAlbum: true,
    links: { spotify: searchLink("spotify", artist, title), appleMusic: searchLink("appleMusic", artist, title), youtube: searchLink("youtube", artist, title) },
    deezer: { trackId: null, previewUrl: "", status: "not-checked" },
    ...editorialRevisions[`${artist}|${title}`],
  };
});
