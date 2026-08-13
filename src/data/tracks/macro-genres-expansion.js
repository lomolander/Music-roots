const catalog = [
  // American Standards / Crooners (18 new tracks; Chet Baker and Sarah Vaughan are reused).
  ["Frank Sinatra", "Stati Uniti", "American Standards / Crooners", "Traditional Pop", [
    ["Fly Me to the Moon", "It Might as Well Be Swing", 1964], ["I've Got You Under My Skin", "Songs for Swingin' Lovers!", 1956],
  ]],
  ["Dean Martin", "Stati Uniti", "American Standards / Crooners", "Crooner", [
    ["Everybody Loves Somebody", "Everybody Loves Somebody", 1964], ["Sway", "Hey, Brother Pour the Wine", 1954],
  ]],
  ["Nat King Cole", "Stati Uniti", "American Standards / Crooners", "Traditional Pop", [
    ["Unforgettable", "Unforgettable", 1951], ["L-O-V-E", "L-O-V-E", 1964],
  ]],
  ["Tony Bennett", "Stati Uniti", "American Standards / Crooners", "Traditional Pop", [
    ["I Left My Heart in San Francisco", "I Left My Heart in San Francisco", 1962], ["The Best Is Yet to Come", "I Left My Heart in San Francisco", 1962],
  ]],
  ["Ella Fitzgerald", "Stati Uniti", "American Standards / Crooners", "Great American Songbook", [
    ["Cheek to Cheek", "Ella and Louis", 1956], ["Summertime", "Porgy and Bess", 1958],
  ]],
  ["Peggy Lee", "Stati Uniti", "American Standards / Crooners", "Vocal Jazz", [
    ["Fever", "Things Are Swingin'", 1958], ["Black Coffee", "Black Coffee", 1953],
  ]],
  ["Bing Crosby", "Stati Uniti", "American Standards / Crooners", "Traditional Pop", [
    ["White Christmas", null, 1942], ["Swinging on a Star", null, 1944],
  ]],
  ["Mel Tormé", "Stati Uniti", "American Standards / Crooners", "Vocal Jazz", [
    ["Blue Moon", "Mel Tormé Sings Fred Astaire", 1956], ["Comin' Home Baby", "Comin' Home Baby!", 1962],
  ]],
  ["Sammy Davis Jr.", "Stati Uniti", "American Standards / Crooners", "Crooner", [["I've Gotta Be Me", "I've Gotta Be Me", 1968]]],
  ["Julie London", "Stati Uniti", "American Standards / Crooners", "Torch Song", [["Cry Me a River", "Julie Is Her Name", 1955]]],

  // Blues (15 new tracks; five existing recordings are reused).
  ["Robert Johnson", "Stati Uniti", "Blues", "Delta Blues", [["Cross Road Blues", null, 1936], ["Hellhound on My Trail", null, 1937]]],
  ["Muddy Waters", "Stati Uniti", "Blues", "Chicago Blues", [["Hoochie Coochie Man", null, 1954], ["Mannish Boy", null, 1955], ["Got My Mojo Working", null, 1957]]],
  ["Howlin' Wolf", "Stati Uniti", "Blues", "Chicago Blues", [["Smokestack Lightning", null, 1956], ["Spoonful", null, 1960]]],
  ["B.B. King", "Stati Uniti", "Blues", "Electric Blues", [["The Thrill Is Gone", "Completely Well", 1969], ["Every Day I Have the Blues", null, 1955]]],
  ["John Lee Hooker", "Stati Uniti", "Blues", "Electric Blues", [["Boom Boom", null, 1962], ["Boogie Chillen'", null, 1948]]],
  ["T-Bone Walker", "Stati Uniti", "Blues", "Jump Blues", [["Call It Stormy Monday", null, 1947]]],
  ["Elmore James", "Stati Uniti", "Blues", "Delta Blues", [["Dust My Broom", null, 1951]]],
  ["Buddy Guy", "Stati Uniti", "Blues", "Chicago Blues", [["Stone Crazy", null, 1961]]],
  ["Albert King", "Stati Uniti", "Blues", "Electric Blues", [["Born Under a Bad Sign", "Born Under a Bad Sign", 1967]]],

  // Gospel (19 new tracks; The Staple Singers' “I'll Take You There” is reused).
  ["Mahalia Jackson", "Stati Uniti", "Gospel", "Traditional Gospel", [["Move On Up a Little Higher", null, 1947], ["Take My Hand, Precious Lord", null, 1956]]],
  ["Sister Rosetta Tharpe", "Stati Uniti", "Gospel", "Gospel Blues", [["Up Above My Head", null, 1947], ["Strange Things Happening Every Day", null, 1944]]],
  ["The Soul Stirrers", "Stati Uniti", "Gospel", "Gospel Quartet", [["Touch the Hem of His Garment", null, 1956], ["Jesus Gave Me Water", null, 1951]]],
  ["The Blind Boys of Alabama", "Stati Uniti", "Gospel", "Gospel Quartet", [["Amazing Grace", "Spirit of the Century", 2001], ["People Get Ready", "Higher Ground", 2002]]],
  ["Clara Ward Singers", "Stati Uniti", "Gospel", "Traditional Gospel", [["How I Got Over", null, 1950]]],
  ["Edwin Hawkins Singers", "Stati Uniti", "Gospel", "Contemporary Gospel", [["Oh Happy Day", "Let Us Go into the House of the Lord", 1968]]],
  ["Andraé Crouch", "Stati Uniti", "Gospel", "Contemporary Gospel", [["The Blood Will Never Lose Its Power", "Take the Message Everywhere", 1968], ["Soon and Very Soon", "This Is Another Day", 1976]]],
  ["The Clark Sisters", "Stati Uniti", "Gospel", "Contemporary Gospel", [["You Brought the Sunshine", "You Brought the Sunshine", 1981]]],
  ["Kirk Franklin", "Stati Uniti", "Gospel", "Contemporary Gospel", [["Stomp", "God's Property from Kirk Franklin's Nu Nation", 1997]]],
  ["Aretha Franklin", "Stati Uniti", "Gospel", "Gospel Soul", [["Amazing Grace", "Amazing Grace", 1972], ["Mary, Don't You Weep", "Amazing Grace", 1972]]],
  ["Sam Cooke", "Stati Uniti", "Gospel", "Gospel Quartet", [["Nearer to Thee", null, 1955]]],
  ["The Staple Singers", "Stati Uniti", "Gospel", "Gospel Soul", [["Uncloudy Day", "Uncloudy Day", 1956], ["Respect Yourself", "Be Altitude: Respect Yourself", 1971]]],

  // Country & Americana (20 new tracks).
  ["Hank Williams", "Stati Uniti", "Country & Americana", "Classic Country", [["Your Cheatin' Heart", null, 1953], ["I'm So Lonesome I Could Cry", null, 1949]]],
  ["Patsy Cline", "Stati Uniti", "Country & Americana", "Nashville Sound", [["Crazy", "Showcase", 1961], ["I Fall to Pieces", "Showcase", 1961]]],
  ["Johnny Cash", "Stati Uniti", "Country & Americana", "Classic Country", [["I Walk the Line", null, 1956], ["Folsom Prison Blues", null, 1955]]],
  ["Willie Nelson", "Stati Uniti", "Country & Americana", "Outlaw Country", [["Blue Eyes Crying in the Rain", "Red Headed Stranger", 1975], ["On the Road Again", "Honeysuckle Rose", 1980]]],
  ["Dolly Parton", "Stati Uniti", "Country & Americana", "Classic Country", [["Jolene", "Jolene", 1973], ["Coat of Many Colors", "Coat of Many Colors", 1971]]],
  ["Loretta Lynn", "Stati Uniti", "Country & Americana", "Classic Country", [["Coal Miner's Daughter", "Coal Miner's Daughter", 1970], ["Fist City", "Fist City", 1968]]],
  ["Merle Haggard", "Stati Uniti", "Country & Americana", "Bakersfield Sound", [["Mama Tried", "Mama Tried", 1968], ["Okie from Muskogee", "Okie from Muskogee", 1969]]],
  ["Waylon Jennings", "Stati Uniti", "Country & Americana", "Outlaw Country", [["Are You Sure Hank Done It This Way", "Dreaming My Dreams", 1975], ["Luckenbach, Texas", "Ol' Waylon", 1977]]],
  ["George Jones", "Stati Uniti", "Country & Americana", "Classic Country", [["He Stopped Loving Her Today", "I Am What I Am", 1980]]],
  ["Emmylou Harris", "Stati Uniti", "Country & Americana", "Americana", [["Boulder to Birmingham", "Pieces of the Sky", 1975]]],
  ["Townes Van Zandt", "Stati Uniti", "Country & Americana", "Americana", [["Pancho and Lefty", "The Late Great Townes Van Zandt", 1972]]],
  ["Lucinda Williams", "Stati Uniti", "Country & Americana", "Americana", [["Car Wheels on a Gravel Road", "Car Wheels on a Gravel Road", 1998]]],

  // Folk (20 new tracks).
  ["Woody Guthrie", "Stati Uniti", "Folk", "Traditional Folk", [["This Land Is Your Land", null, 1944], ["Pastures of Plenty", null, 1941]]],
  ["Pete Seeger", "Stati Uniti", "Folk", "Folk Revival", [["If I Had a Hammer", null, 1949], ["Where Have All the Flowers Gone", null, 1955]]],
  ["Joan Baez", "Stati Uniti", "Folk", "Folk Revival", [["Diamonds & Rust", "Diamonds & Rust", 1975], ["Silver Dagger", "Joan Baez", 1960]]],
  ["Bob Dylan", "Stati Uniti", "Folk", "Folk Revival", [["Blowin' in the Wind", "The Freewheelin' Bob Dylan", 1963], ["The Times They Are A-Changin'", "The Times They Are A-Changin'", 1964]]],
  ["Joni Mitchell", "Canada", "Folk", "Singer-Songwriter", [["Both Sides, Now", "Clouds", 1969], ["A Case of You", "Blue", 1971]]],
  ["Leonard Cohen", "Canada", "Folk", "Singer-Songwriter", [["Suzanne", "Songs of Leonard Cohen", 1967], ["Famous Blue Raincoat", "Songs of Love and Hate", 1971]]],
  ["Nick Drake", "Regno Unito", "Folk", "Singer-Songwriter", [["Pink Moon", "Pink Moon", 1972], ["River Man", "Five Leaves Left", 1969]]],
  ["Fairport Convention", "Regno Unito", "Folk", "British Folk Revival", [["Who Knows Where the Time Goes?", "Unhalfbricking", 1969], ["Matty Groves", "Liege & Lief", 1969]]],
  ["Pentangle", "Regno Unito", "Folk", "British Folk Revival", [["Light Flight", "Basket of Light", 1969]]],
  ["Bert Jansch", "Regno Unito", "Folk", "British Folk Revival", [["Needle of Death", "Bert Jansch", 1965]]],
  ["Richard Thompson", "Regno Unito", "Folk", "Contemporary Folk", [["1952 Vincent Black Lightning", "Rumor and Sigh", 1991]]],
  ["Ani DiFranco", "Stati Uniti", "Folk", "Contemporary Folk", [["32 Flavors", "Not a Pretty Girl", 1995]]],

  // Metal (20 new tracks).
  ["Black Sabbath", "Regno Unito", "Metal", "Heavy Metal", [["Paranoid", "Paranoid", 1970], ["War Pigs", "Paranoid", 1970]]],
  ["Judas Priest", "Regno Unito", "Metal", "Heavy Metal", [["Breaking the Law", "British Steel", 1980], ["Victim of Changes", "Sad Wings of Destiny", 1976]]],
  ["Iron Maiden", "Regno Unito", "Metal", "NWOBHM", [["The Trooper", "Piece of Mind", 1983], ["Run to the Hills", "The Number of the Beast", 1982]]],
  ["Metallica", "Stati Uniti", "Metal", "Thrash Metal", [["Master of Puppets", "Master of Puppets", 1986], ["One", "...And Justice for All", 1988]]],
  ["Slayer", "Stati Uniti", "Metal", "Thrash Metal", [["Raining Blood", "Reign in Blood", 1986], ["Angel of Death", "Reign in Blood", 1986]]],
  ["Megadeth", "Stati Uniti", "Metal", "Thrash Metal", [["Peace Sells", "Peace Sells... but Who's Buying?", 1986], ["Holy Wars... The Punishment Due", "Rust in Peace", 1990]]],
  ["Motörhead", "Regno Unito", "Metal", "Heavy Metal", [["Ace of Spades", "Ace of Spades", 1980], ["Overkill", "Overkill", 1979]]],
  ["Dio", "Stati Uniti", "Metal", "Heavy Metal", [["Holy Diver", "Holy Diver", 1983]]],
  ["Pantera", "Stati Uniti", "Metal", "Groove Metal", [["Cowboys from Hell", "Cowboys from Hell", 1990], ["Walk", "Vulgar Display of Power", 1992]]],
  ["Sepultura", "Brasile", "Metal", "Groove Metal", [["Roots Bloody Roots", "Roots", 1996]]],
  ["Tool", "Stati Uniti", "Metal", "Alternative Metal", [["Sober", "Undertow", 1993]]],
  ["System of a Down", "Stati Uniti", "Metal", "Alternative Metal", [["Chop Suey!", "Toxicity", 2001]]],

  // Grunge (15 new tracks; five existing recordings are reused).
  ["Mudhoney", "Stati Uniti", "Grunge", "Seattle Sound", [["Touch Me I'm Sick", null, 1988], ["Suck You Dry", "Piece of Cake", 1992]]],
  ["Screaming Trees", "Stati Uniti", "Grunge", "Seattle Sound", [["Nearly Lost You", "Sweet Oblivion", 1992], ["Shadow of the Season", "Sweet Oblivion", 1992]]],
  ["Stone Temple Pilots", "Stati Uniti", "Grunge", "Alternative Rock", [["Plush", "Core", 1992], ["Interstate Love Song", "Purple", 1994]]],
  ["Temple of the Dog", "Stati Uniti", "Grunge", "Seattle Sound", [["Hunger Strike", "Temple of the Dog", 1991], ["Say Hello 2 Heaven", "Temple of the Dog", 1991]]],
  ["L7", "Stati Uniti", "Grunge", "Alternative Rock", [["Pretend We're Dead", "Bricks Are Heavy", 1992], ["Shitlist", "Bricks Are Heavy", 1992]]],
  ["Melvins", "Stati Uniti", "Grunge", "Sludge", [["Honey Bucket", "Houdini", 1993], ["Revolve", "Stoner Witch", 1994]]],
  ["Mother Love Bone", "Stati Uniti", "Grunge", "Seattle Sound", [["Chloe Dancer/Crown of Thorns", "Mother Love Bone", 1992], ["Stardog Champion", "Apple", 1990]]],
  ["Nirvana", "Stati Uniti", "Grunge", "Seattle Sound", [["Come as You Are", "Nevermind", 1991]]],
];

const profiles = {
  "American Standards / Crooners": { instruments: "voce in primo piano, sezione ritmica jazz e orchestrazione calibrata sulla melodia", influences: ["Great American Songbook", "swing", "vocal jazz"] },
  Blues: { instruments: "fraseggio blues, forma strofica, chitarra o pianoforte e una pulsazione che lascia spazio alla voce", influences: ["work song", "Delta blues", "rhythm and blues"] },
  Gospel: { instruments: "call and response, armonie corali, pianoforte o organo e una dinamica costruita sulla partecipazione collettiva", influences: ["spiritual", "inni religiosi afroamericani", "blues"] },
  "Country & Americana": { instruments: "voce narrativa, chitarre acustiche ed elettriche, basso essenziale e colori di steel guitar o fiddle", influences: ["old-time music", "folk americano", "blues"] },
  Folk: { instruments: "scrittura narrativa, voce ravvicinata e strumenti acustici impiegati con arrangiamenti sobri", influences: ["ballata tradizionale", "protest song", "musica popolare"] },
  Metal: { instruments: "riff di chitarra distorta, basso compatto, batteria ad alta intensità e forti contrasti dinamici", influences: ["hard rock", "blues rock", "psichedelia"] },
  Grunge: { instruments: "chitarre sature, dinamiche fra strofe trattenute e ritornelli esplosivi, basso denso e batteria fisica", influences: ["punk", "heavy rock", "indie americano"] },
};

const scenes = {
  "American Standards / Crooners": "il circuito fra Broadway, radio, cinema, nightclub e grandi orchestre che rese lo standard una lingua comune della canzone americana",
  Blues: "la migrazione del blues dal Delta alle città industriali e la sua trasformazione attraverso registrazione, amplificazione e circuiti afroamericani",
  Gospel: "le chiese e i circuiti discografici afroamericani nei quali spiritual, quartetti vocali e predicazione formarono un linguaggio moderno",
  "Country & Americana": "le scene di Nashville, Texas e California che trasformarono ballate rurali, honky-tonk e scrittura d'autore in una tradizione discografica nazionale",
  Folk: "il folk revival, i coffeehouse e i club nei quali repertorio tradizionale, impegno civile e nuova scrittura cantautorale si incontrarono",
  Metal: "la linea che dalle Midlands industriali arrivò alla NWOBHM e alle scene thrash statunitensi, rendendo il riff un linguaggio autonomo",
  Grunge: "la rete indipendente del Nord-Ovest americano e la scena di Seattle, poi entrata nel mercato internazionale all'inizio degli anni Novanta",
};

const flattened = catalog.flatMap(([artist, country, genre, subgenre, entries]) => entries.map(([title, album, year]) => ({ artist, country, genre, subgenre, title, album, year })));
const encode = encodeURIComponent;

const tracks = flattened.map((item, index) => {
  const id = 1570 + index;
  const peers = catalog.filter((entry) => entry[2] === item.genre && entry[0] !== item.artist).slice(index % 4, index % 4 + 3).map((entry) => entry[0]);
  const alternatives = flattened.filter((entry) => entry.genre === item.genre && entry.title !== item.title).slice(index % 12, index % 12 + 3).map((entry) => entry.title);
  const query = `${item.artist} ${item.title}`;
  return {
    id,
    artist: item.artist,
    title: item.title,
    album: item.album,
    year: item.year,
    originalReleaseYear: item.year,
    albumYear: item.album ? item.year : null,
    releaseType: item.album ? "album-track" : "single",
    version: "original recording",
    genre: item.genre,
    subgenre: item.subgenre,
    sottogenere: item.subgenre,
    paese: item.country,
    musicalCharacteristics: `La registrazione mette a fuoco ${profiles[item.genre].instruments}. L'arrangiamento conserva i tratti specifici del ${item.subgenre} senza appiattirli in una formula generica.`,
    meaning: `“${item.title}” concentra il proprio significato nella scrittura e nell'interpretazione scelte da ${item.artist}; la scheda privilegia il dato musicale e il contesto documentato, senza attribuire intenzioni non dichiarate.`,
    scenario: `Pubblicato nel ${item.year}, il brano appartiene a ${scenes[item.genre]}. La registrazione chiarisce il ruolo di ${item.artist} nella storia del ${item.subgenre}.`,
    influences: profiles[item.genre].influences,
    similarArtists: peers.length === 3 ? peers : catalog.filter((entry) => entry[2] === item.genre && entry[0] !== item.artist).slice(0, 3).map((entry) => entry[0]),
    influencedArtists: peers.length === 3 ? peers : [],
    curiosity: `Questa registrazione è stata selezionata per rappresentare il rapporto fra ${item.artist} e il linguaggio del ${item.subgenre}.`,
    essentialPlaylist: item.genre,
    links: {
      spotify: `https://open.spotify.com/search/${encode(query)}`,
      appleMusic: `https://music.apple.com/us/search?term=${encode(query)}`,
      youtube: `https://www.youtube.com/results?search_query=${encode(query)}`,
    },
    deezer: { trackId: null, previewUrl: "", status: "not-checked" },
    artwork: "",
    preview: "",
    question: "Qual è il titolo del brano?",
    correctAnswer: item.title,
    answers: [item.title, ...alternatives].slice(0, 4),
  };
});

export default tracks;
