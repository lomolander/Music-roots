import historicalFacts from "./artistHistoricalFacts.js";
import artistBiographiesEditorial from "./artistBiographiesEditorial.js";

const contexts = [
  { test: /shibuya-kei/i, identity: "scena Shibuya-kei sviluppata nella Tokyo degli anni Novanta", features: "campionamenti, pop anni Sessanta, bossa nova, lounge ed elettronica", contribution: "la costruzione di un pop giapponese cosmopolita legato a dischi, moda e design" },
  { test: /j-pop/i, identity: "pop giapponese moderno e della sua industria audiovisiva", features: "melodie concise, produzione elettronica e attenzione al rapporto fra musica e immagine", contribution: "l’evoluzione del J-Pop fra cultura idol, autori-interpreti e ricerca di studio" },
  { test: /acid jazz/i, identity: "scena acid jazz", features: "strumenti funk, armonie jazz, groove da club e campionamenti", contribution: "il collegamento fra jazz-funk, band dal vivo e cultura dei DJ" },
  { test: /trip hop/i, identity: "scena trip hop di Bristol", features: "bassi profondi, break rallentati, campionamenti e arrangiamenti atmosferici", contribution: "l’incontro fra dub, hip hop ed elettronica destinata anche all’ascolto domestico" },
  { test: /house|garage|dance|disco|boogie/i, identity: "cultura dei club e della produzione dance", features: "groove, arrangiamenti estesi e tecniche di studio destinate alla pista", contribution: "la definizione del ruolo moderno di DJ, remix e produzione elettronica" },
  { test: /techno|electro|idm|electronic|ambient|downtempo|big beat|drum and bass/i, identity: "ricerca elettronica e delle sue differenti scene internazionali", features: "sintetizzatori, campionamento, programmazione ritmica e progettazione del timbro", contribution: "lo sviluppo della musica elettronica come linguaggio autonomo da club e da ascolto" },
  { test: /hip hop|jazz rap/i, identity: "hip hop e delle sue scuole regionali", features: "rap, campionamento, beat e costruzione ritmica della produzione", contribution: "il consolidamento del rap come forma discografica e culturale internazionale" },
  { test: /soul|r&b|motown|funk|neo soul/i, identity: "tradizione afroamericana fra gospel, rhythm and blues, soul e funk", features: "interpretazione vocale, groove, arrangiamenti corali e dialogo fra sezione ritmica e melodia", contribution: "l’evoluzione della canzone soul e dei successivi linguaggi R&B e pop" },
  { test: /jazz|bossa|mpb|brasiliana|latin/i, identity: "dialogo fra jazz, improvvisazione e tradizioni musicali delle Americhe", features: "ricerca armonica, sensibilità ritmica e interazione fra composizione ed esecuzione", contribution: "la circolazione internazionale di nuovi modelli armonici, ritmici e interpretativi" },
  { test: /reggae|dub/i, identity: "musica giamaicana e della cultura dei sound system", features: "basso in primo piano, ritmo in levare, uso dello spazio e trattamento creativo del nastro", contribution: "la diffusione di pratiche di remix e produzione centrali per la musica contemporanea" },
  { test: /punk|post punk|new wave|indie|alternative|shoegaze|dream pop|britpop|madchester|merseybeat/i, identity: "scene rock indipendenti britanniche e statunitensi", features: "scrittura per chitarre, identità di gruppo e uso dello studio legato alle diverse culture locali", contribution: "la continuità fra punk, post-punk, indie e rock alternativo" },
  { test: /synth|electropop|pop elettronico|new romantic|italo disco/i, identity: "pop elettronico sviluppato fra sintetizzatori, club e cultura visiva", features: "sequencer, drum machine, melodie concise e produzione costruita intorno al timbro", contribution: "l’integrazione stabile dell’elettronica nella canzone pop" },
  { test: /rock/i, identity: "rock fra blues, psichedelia, ricerca d’album e grandi circuiti dal vivo", features: "chitarre elettriche, sezione ritmica, arrangiamento di gruppo e centralità della performance", contribution: "la trasformazione del rock in un linguaggio articolato fra album, concerto e produzione in studio" },
  { test: /musica italiana|colonna sonora|library music|soundtrack/i, identity: "musica italiana e della composizione applicata alle immagini", features: "scrittura melodica, orchestrazione e attenzione narrativa al rapporto fra musica, parola e immagine", contribution: "il rinnovamento della canzone e della musica per cinema e televisione" },
  { test: /world music/i, identity: "tradizioni musicali entrate nei circuiti discografici internazionali", features: "ritmi, strumenti e forme legati a specifiche culture locali", contribution: "l’ampliamento delle geografie rappresentate dalla produzione musicale contemporanea" },
];

const fallback = { identity: "musica popolare registrata del secondo Novecento e dell’età contemporanea", features: "scrittura, interpretazione e produzione legate al proprio contesto discografico", contribution: "la documentazione delle trasformazioni della canzone e della produzione moderna" };
const decade = (year) => `${Math.floor(year / 10) * 10}`;
const cleanCountry = (value) => value && value !== "Sconosciuto" ? value : "";
const variantFor = (value) => [...value].reduce((sum, character) => sum + character.codePointAt(0), 0) % 6;

export const buildArtistBiography = ({ name, genres, tracks, nationality }) => {
  const editorialBiography = artistBiographiesEditorial[name];
  if (editorialBiography) return editorialBiography;

  const fact = historicalFacts[name];
  const years = tracks.map((track) => track.year).filter(Number.isInteger).sort((a, b) => a - b);
  const firstYear = years[0];
  const lastYear = years.at(-1);
  const allLabels = [...genres, ...tracks.map((track) => track.subgenre).filter(Boolean)];
  const labels = allLabels.filter((label, index) => allLabels.findIndex((candidate) => candidate.toLocaleLowerCase("it") === label.toLocaleLowerCase("it")) === index);
  const context = contexts.find(({ test }) => test.test(labels.join(" · "))) ?? fallback;
  const country = cleanCountry(nationality);
  const representative = [...new Map(tracks.map((track) => [track.title, track])).values()].slice(0, 2);
  const works = representative.map((track) => `“${track.title}” (${track.year})`).join(" e ");
  const primaryLabel = labels[0]?.toLocaleLowerCase("it") ?? "";
  const scene = labels.filter((label, index) => index === 0 || !label.toLocaleLowerCase("it").startsWith(`${primaryLabel} e`)).slice(0, 2).join(" e ");
  const period = firstYear === lastYear ? `nel ${firstYear}` : `fra il ${firstYear} e il ${lastYear}`;
  const verifiedFact = fact?.formedYear && fact.formedYear <= firstYear && firstYear - fact.formedYear <= 60 ? fact : fact ? { ...fact, formedYear: null } : null;
  const variant = variantFor(name);
  const origin = verifiedFact?.origin ? ` a ${verifiedFact.origin}` : "";
  const start = verifiedFact?.formedYear
    ? verifiedFact.kind === "group"
      ? `${name} è una formazione musicale${country ? ` di area ${country}` : ""}, costituita${origin} nel ${verifiedFact.formedYear}.`
      : `${name} è un artista${country ? ` di area ${country}` : ""}, attivo professionalmente dal ${verifiedFact.formedYear}.`
    : [
      `L’attività discografica di ${name}${country ? `, sviluppata nell’area ${country},` : ""} è documentata almeno dagli anni ${decade(firstYear)}.`,
      `${name} compare nella storia della musica registrata almeno dagli anni ${decade(firstYear)}${country ? `, con un percorso legato all’area ${country}` : ""}.`,
      `Il percorso musicale di ${name}${country ? ` si sviluppa nell’area ${country} ed` : ""} è attestato su disco almeno dagli anni ${decade(firstYear)}.`,
      `La produzione di ${name}, documentata almeno dagli anni ${decade(firstYear)},${country ? ` appartiene al contesto ${country}` : " si colloca nel proprio contesto storico"}.`,
      `${name} è presente nel catalogo discografico almeno dagli anni ${decade(firstYear)}${country ? ` e opera nel contesto ${country}` : ""}.`,
      `Le registrazioni disponibili collocano l’attività di ${name}${country ? ` nell’area ${country}` : ""} almeno a partire dagli anni ${decade(firstYear)}.`,
    ][variant];
  const variants = [
    `Registrazioni come ${works} ne documentano il lavoro nell’ambito di ${scene}, con ${context.features}.`,
    `La selezione comprende ${works} e colloca il suo percorso fra ${scene}, riconoscibile per ${context.features}.`,
    `Nel catalogo, registrazioni come ${works} mostrano il rapporto con ${scene} attraverso ${context.features}.`,
    `La sua attività è rappresentata ${period} da ${works}: registrazioni legate a ${scene} e costruite su ${context.features}.`,
    `${works} sono due riferimenti del suo repertorio e documentano una ricerca fra ${scene}, basata su ${context.features}.`,
    `Il catalogo documenta il percorso ${period} attraverso ${works}, esempi del suo legame con ${scene} e con ${context.features}.`,
  ];
  const endings = [
    `Il suo rilievo storico riguarda ${context.contribution}, nell’ambito di ${context.identity}.`,
    `Questa produzione documenta ${context.contribution} e appartiene alla storia di ${context.identity}.`,
    `Il contributo documentato consiste in ${context.contribution}, entro il percorso di ${context.identity}.`,
    `In termini storici, il repertorio contribuisce a documentare ${context.contribution} nel contesto di ${context.identity}.`,
    `Il valore storico di questo percorso risiede in ${context.contribution}, nel campo di ${context.identity}.`,
    `Nel suo contesto, queste opere testimoniano ${context.contribution} e lo sviluppo di ${context.identity}.`,
  ];
  const biography = `${start} ${variants[variant]} ${endings[variant]}`;
  if (biography.trim().split(/\s+/).length <= 90) return biography;
  return `${start} ${variants[variantFor(name)]} Il suo contributo appartiene alla storia di ${context.identity}.`;
};
