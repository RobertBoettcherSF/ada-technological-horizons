function L(en, de, es, fr) {
  return { "en-GB": en, de, es, fr };
}

export const LOCALES = ["en-GB", "de", "es", "fr"];

export const chapters = [
  { id: "dilemmas", kind: "book", title: L("Dilemmas", "Dilemmas", "Dilemas", "Dilemmes") },
  { id: "two-evolutions", kind: "book", title: L("Two Evolutions", "Zwei Evolutionen", "Dos evoluciones", "Deux évolutions") },
  { id: "cosmic-civilisations", kind: "book", title: L("Cosmic Civilisations", "Kosmische Zivilisationen", "Civilizaciones cósmicas", "Civilisations cosmiques") },
  { id: "intellectronics", kind: "book", title: L("Intellectronics", "Intellektronik", "Intelectrónica", "Intellectronique") },
  { id: "prolegomena-to-omnipotence", kind: "book", title: L("Prolegomena to Omnipotence", "Prolegomena zur Allmacht", "Prolegómenos a la omnipotencia", "Prolégomènes à la toute-puissance") },
  { id: "phantomology", kind: "book", title: L("Phantomology", "Phantomologie", "Fantomatología", "Phantomologie") },
  { id: "creating-worlds", kind: "book", title: L("Creating Worlds", "Welten erschaffen", "La creación de mundos", "Créer des mondes") },
  { id: "a-lampoon-of-evolution", kind: "book", title: L("A Lampoon of Evolution", "Eine Satire auf die Evolution", "Una sátira de la evolución", "Un pamphlet de l’évolution") },
  { id: "conclusion", kind: "closing", title: L("Conclusion", "Schluss", "Conclusión", "Conclusion") },
  { id: "afterword", kind: "closing", title: L("Afterword: Twenty Years Later", "Nachwort: Zwanzig Jahre später", "Epílogo: veinte años después", "Postface : vingt ans plus tard") },
  { id: "technical", kind: "technical", title: L("Technical demonstration", "Technische Demonstration", "Demostración técnica", "Démonstration technique") },
];

export const topics = [
  { id: "forecasting", title: L("Forecasting", "Vorausschau", "Prospectiva", "Prospective") },
  { id: "evolution", title: L("Evolution", "Evolution", "Evolución", "Évolution") },
  { id: "civilisations", title: L("Civilisations", "Zivilisationen", "Civilizaciones", "Civilisations") },
  { id: "intellect", title: L("Intellect", "Intellekt", "Intelecto", "Intellect") },
  { id: "construction", title: L("Construction", "Konstruktion", "Construcción", "Construction") },
  { id: "phantomatics", title: L("Phantomatics", "Phantommatik", "Fantomática", "Phantomatique") },
  { id: "worlds", title: L("Worlds", "Welten", "Mundos", "Mondes") },
  { id: "life", title: L("Life", "Leben", "Vida", "Vie") },
  { id: "retrospective", title: L("Retrospective", "Rückblick", "Retrospectiva", "Rétrospective") },
  { id: "boundary", title: L("Boundary", "Grenze", "Límite", "Frontière") },
];

const TYPE_OPTIONS = ["calculator", "explanation", "exploratory", "technical-demo", "planned"];

function book(chapterId, topicId, slug, title) {
  return {
    id: `${chapterId}/${slug}`,
    chapterId,
    topicId,
    type: "planned",
    availability: "planned",
    inBook: true,
    title,
    summaryKey: chapterId === "conclusion" || chapterId === "afterword" ? "summary.closing" : "summary.planned",
  };
}

const RAW = [
  book("dilemmas", "forecasting", "part-1", L("Part 1", "Teil 1", "Parte 1", "Partie 1")),
  book("dilemmas", "forecasting", "part-2", L("Part 2", "Teil 2", "Parte 2", "Partie 2")),
  book("dilemmas", "forecasting", "part-3", L("Part 3", "Teil 3", "Parte 3", "Partie 3")),

  book("two-evolutions", "evolution", "introduction", L("Introduction", "Einleitung", "Introducción", "Introduction")),
  book("two-evolutions", "evolution", "similarities", L("Similarities", "Ähnlichkeiten", "Semejanzas", "Similitudes")),
  book("two-evolutions", "evolution", "differences-1", L("Differences (1)", "Unterschiede (1)", "Diferencias (1)", "Différences (1)")),
  book("two-evolutions", "evolution", "differences-2", L("Differences (2)", "Unterschiede (2)", "Diferencias (2)", "Différences (2)")),
  book("two-evolutions", "evolution", "differences-3", L("Differences (3)", "Unterschiede (3)", "Diferencias (3)", "Différences (3)")),
  book("two-evolutions", "evolution", "differences-4", L("Differences (4)", "Unterschiede (4)", "Diferencias (4)", "Différences (4)")),
  book("two-evolutions", "evolution", "the-first-cause", L("The First Cause", "Die erste Ursache", "La causa primera", "La cause première")),
  book("two-evolutions", "evolution", "a-few-naive-questions", L("A Few Naïve Questions", "Einige naive Fragen", "Algunas preguntas ingenuas", "Quelques questions naïves")),

  book("cosmic-civilisations", "civilisations", "formulating-the-problem", L("Formulating the Problem", "Formulierung des Problems", "Formulación del problema", "Formulation du problème")),
  book("cosmic-civilisations", "civilisations", "formulating-the-method", L("Formulating the Method", "Formulierung der Methode", "Formulación del método", "Formulation de la méthode")),
  book("cosmic-civilisations", "civilisations", "statistics-of-cosmic-civilisations", L("Statistics of Cosmic Civilisations", "Statistik kosmischer Zivilisationen", "Estadística de las civilizaciones cósmicas", "Statistique des civilisations cosmiques")),
  book("cosmic-civilisations", "civilisations", "cosmic-catastrophism", L("Cosmic Catastrophism", "Kosmischer Katastrophismus", "Catastrofismo cósmico", "Catastrophisme cosmique")),
  book("cosmic-civilisations", "civilisations", "a-metatheory-of-miracles", L("A Metatheory of Miracles", "Eine Metatheorie der Wunder", "Una metateoría de los milagros", "Une métathéorie des miracles")),
  book("cosmic-civilisations", "civilisations", "human-uniqueness", L("Human Uniqueness", "Die Einzigartigkeit des Menschen", "La singularidad humana", "L’unicité humaine")),
  book("cosmic-civilisations", "civilisations", "intelligence-chance-or-necessity", L("Intelligence: Chance or Necessity?", "Intelligenz: Zufall oder Notwendigkeit?", "Inteligencia: ¿azar o necesidad?", "Intelligence : hasard ou nécessité ?")),
  book("cosmic-civilisations", "civilisations", "hypotheses", L("Hypotheses", "Hypothesen", "Hipótesis", "Hypothèses")),
  book("cosmic-civilisations", "civilisations", "a-dissenting-opinion", L("A Dissenting Opinion", "Eine abweichende Meinung", "Una opinión disidente", "Une opinion dissidente")),
  book("cosmic-civilisations", "civilisations", "prospects", L("Prospects", "Aussichten", "Perspectivas", "Perspectives")),

  book("intellectronics", "intellect", "return-to-earth", L("Return to Earth", "Rückkehr zur Erde", "Regreso a la Tierra", "Retour à la Terre")),
  book("intellectronics", "intellect", "the-megabit-bomb", L("The Megabit Bomb", "Die Megabit-Bombe", "La bomba del megabit", "La bombe du mégabit")),
  book("intellectronics", "intellect", "the-great-game", L("The Great Game", "Das große Spiel", "El gran juego", "Le grand jeu")),
  book("intellectronics", "intellect", "myths-of-science", L("Myths of Science", "Mythen der Wissenschaft", "Mitos de la ciencia", "Mythes de la science")),
  book("intellectronics", "intellect", "the-intelligence-amplifier", L("The Intelligence Amplifier", "Der Intelligenzverstärker", "El amplificador de inteligencia", "L’amplificateur d’intelligence")),
  book("intellectronics", "intellect", "the-black-box", L("The Black Box", "Der schwarze Kasten", "La caja negra", "La boîte noire")),
  book("intellectronics", "intellect", "on-the-morality-of-homeostats", L("On the Morality of Homeostats", "Über die Moral der Homöostaten", "Sobre la moral de los homeostatos", "De la morale des homéostats")),
  book("intellectronics", "intellect", "the-dangers-of-electrocracy", L("The Dangers of Electrocracy", "Die Gefahren der Elektrokratie", "Los peligros de la electrocracia", "Les dangers de l’électrocratie")),
  book("intellectronics", "intellect", "cybernetics-and-sociology", L("Cybernetics and Sociology", "Kybernetik und Soziologie", "Cibernética y sociología", "Cybernétique et sociologie")),
  book("intellectronics", "intellect", "faith-and-information", L("Faith and Information", "Glaube und Information", "Fe e información", "Foi et information")),
  book("intellectronics", "intellect", "experimental-metaphysics", L("Experimental Metaphysics", "Experimentelle Metaphysik", "Metafísica experimental", "Métaphysique expérimentale")),
  book("intellectronics", "intellect", "the-beliefs-of-electronic-brains", L("The Beliefs of Electronic Brains", "Der Glaube elektronischer Gehirne", "Las creencias de los cerebros electrónicos", "Les croyances des cerveaux électroniques")),
  book("intellectronics", "intellect", "the-ghost-in-the-machine", L("The Ghost in the Machine", "Der Geist in der Maschine", "El fantasma en la máquina", "Le fantôme dans la machine")),
  book("intellectronics", "intellect", "troubles-with-information", L("Troubles with Information", "Schwierigkeiten mit der Information", "Problemas con la información", "Difficultés avec l’information")),
  book("intellectronics", "intellect", "doubts-and-antinomies-1", L("Doubts and Antinomies (1)", "Zweifel und Antinomien (1)", "Dudas y antinomias (1)", "Doutes et antinomies (1)")),
  book("intellectronics", "intellect", "doubts-and-antinomies-2", L("Doubts and Antinomies (2)", "Zweifel und Antinomien (2)", "Dudas y antinomias (2)", "Doutes et antinomies (2)")),

  book("prolegomena-to-omnipotence", "construction", "before-chaos", L("Before Chaos", "Vor dem Chaos", "Antes del caos", "Avant le chaos")),
  book("prolegomena-to-omnipotence", "construction", "chaos-and-order", L("Chaos and Order", "Chaos und Ordnung", "Caos y orden", "Chaos et ordre")),
  book("prolegomena-to-omnipotence", "construction", "scylla-and-charybdis-or-on-moderation", L("Scylla and Charybdis, or On Moderation", "Skylla und Charybdis oder Über das Maß", "Escila y Caribdis, o sobre la moderación", "Scylla et Charybde, ou de la modération")),
  book("prolegomena-to-omnipotence", "construction", "the-constructors-silence", L("The Constructor’s Silence", "Das Schweigen des Konstrukteurs", "El silencio del constructor", "Le silence du constructeur")),
  book("prolegomena-to-omnipotence", "construction", "madness-with-a-method", L("Madness with a Method", "Wahnsinn mit Methode", "Locura con método", "Folie avec méthode")),
  book("prolegomena-to-omnipotence", "construction", "a-new-linnaeus-or-on-classification", L("A New Linnaeus, or On Classification", "Ein neuer Linné oder Über die Klassifikation", "Un nuevo Linneo, o sobre la clasificación", "Un nouveau Linné, ou de la classification")),
  book("prolegomena-to-omnipotence", "construction", "models-and-reality", L("Models and Reality", "Modelle und Wirklichkeit", "Modelos y realidad", "Modèles et réalité")),
  book("prolegomena-to-omnipotence", "construction", "plagiarisms-and-creations", L("Plagiarisms and Creations", "Plagiate und Schöpfungen", "Plagios y creaciones", "Plagiats et créations")),
  book("prolegomena-to-omnipotence", "construction", "the-domain-of-imitology", L("The Domain of Imitology", "Das Gebiet der Imitologie", "El dominio de la imitología", "Le domaine de l’imitologie")),

  book("phantomology", "phantomatics", "the-foundations-of-phantomatics", L("The Foundations of Phantomatics", "Die Grundlagen der Phantommatik", "Los fundamentos de la fantomática", "Les fondements de la phantomatique")),
  book("phantomology", "phantomatics", "the-phantomatic-machine", L("The Phantomatic Machine", "Die phantommatische Maschine", "La máquina fantomática", "La machine phantomatique")),
  book("phantomology", "phantomatics", "peripheral-and-central-phantomatics", L("Peripheral and Central Phantomatics", "Periphere und zentrale Phantommatik", "Fantomática periférica y central", "Phantomatique périphérique et centrale")),
  book("phantomology", "phantomatics", "the-limits-of-phantomatics", L("The Limits of Phantomatics", "Die Grenzen der Phantommatik", "Los límites de la fantomática", "Les limites de la phantomatique")),
  book("phantomology", "phantomatics", "cerebromatics", L("Cerebromatics", "Zerebromatik", "Cerebromática", "Cérébromatique")),
  book("phantomology", "phantomatics", "teletaxy-and-phantomultiplication", L("Teletaxy and Phantomultiplication", "Teletaxie und Phantomultiplikation", "Teletaxia y fantomultiplicación", "Télétaxie et phantomultiplication")),
  book("phantomology", "phantomatics", "personality-and-information", L("Personality and Information", "Persönlichkeit und Information", "Personalidad e información", "Personnalité et information")),

  book("creating-worlds", "worlds", "introduction", L("Introduction", "Einleitung", "Introducción", "Introduction")),
  book("creating-worlds", "worlds", "cultivating-information", L("Cultivating Information", "Information kultivieren", "Cultivar la información", "Cultiver l’information")),
  book("creating-worlds", "worlds", "linguistic-engineering", L("Linguistic Engineering", "Sprachtechnik", "Ingeniería lingüística", "Ingénierie linguistique")),
  book("creating-worlds", "worlds", "transcendence-engineering", L("Transcendence Engineering", "Transzendenztechnik", "Ingeniería de la trascendencia", "Ingénierie de la transcendance")),
  book("creating-worlds", "worlds", "cosmogonic-engineering", L("Cosmogonic Engineering", "Kosmogonische Technik", "Ingeniería cosmogónica", "Ingénierie cosmogonique")),

  book("a-lampoon-of-evolution", "life", "introduction", L("Introduction", "Einleitung", "Introducción", "Introduction")),
  book("a-lampoon-of-evolution", "life", "reconstructing-the-species", L("Reconstructing the Species", "Die Art rekonstruieren", "Reconstruir la especie", "Reconstruire l’espèce")),
  book("a-lampoon-of-evolution", "life", "constructing-life", L("Constructing Life", "Leben konstruieren", "Construir la vida", "Construire la vie")),
  book("a-lampoon-of-evolution", "life", "constructing-death", L("Constructing Death", "Den Tod konstruieren", "Construir la muerte", "Construire la mort")),
  book("a-lampoon-of-evolution", "life", "constructing-consciousness", L("Constructing Consciousness", "Bewusstsein konstruieren", "Construir la conciencia", "Construire la conscience")),
  book("a-lampoon-of-evolution", "life", "constructions-based-on-errors", L("Constructions Based on Errors", "Konstruktionen aus Fehlern", "Construcciones basadas en errores", "Constructions fondées sur des erreurs")),
  book("a-lampoon-of-evolution", "life", "bionics-and-biocybernetics", L("Bionics and Biocybernetics", "Bionik und Biokybernetik", "Biónica y biocibernética", "Bionique et biocybernétique")),
  book("a-lampoon-of-evolution", "life", "through-the-constructors-eyes", L("Through the Constructor’s Eyes", "Mit den Augen des Konstrukteurs", "Por los ojos del constructor", "Par les yeux du constructeur")),
  book("a-lampoon-of-evolution", "life", "reconstructing-the-human-being", L("Reconstructing the Human Being", "Den Menschen rekonstruieren", "Reconstruir al ser humano", "Reconstruire l’être humain")),
  book("a-lampoon-of-evolution", "life", "cyborgisation", L("Cyborgisation", "Cyborgisierung", "Ciborgización", "Cyborgisation")),
  book("a-lampoon-of-evolution", "life", "the-autoevolutionary-machine", L("The Autoevolutionary Machine", "Die autoevolutionäre Maschine", "La máquina autoevolutiva", "La machine autoévolutive")),
  book("a-lampoon-of-evolution", "life", "extrasensory-phenomena", L("Extrasensory Phenomena", "Außersinnliche Phänomene", "Fenómenos extrasensoriales", "Phénomènes extrasensoriels")),

  book("conclusion", "retrospective", "conclusion", L("Conclusion", "Schluss", "Conclusión", "Conclusion")),
  book("afterword", "retrospective", "part-i", L("Part I", "Teil I", "Parte I", "Partie I")),
  book("afterword", "retrospective", "part-ii", L("Part II", "Teil II", "Parte II", "Partie II")),
];

export const sections = RAW.map((entry, index) => {
  const withOrder = { ...entry, bookOrder: index + 1 };
  if (withOrder.id === "cosmic-civilisations/statistics-of-cosmic-civilisations") {
    return {
      ...withOrder,
      type: "calculator",
      availability: "available",
      summaryKey: "summary.lifetime",
    };
  }
  if (withOrder.id === "phantomology/teletaxy-and-phantomultiplication") {
    return {
      ...withOrder,
      type: "calculator",
      availability: "available",
      summaryKey: "summary.delay",
    };
  }
  if (withOrder.id === "a-lampoon-of-evolution/constructing-life") {
    return {
      ...withOrder,
      type: "calculator",
      availability: "available",
      summaryKey: "summary.throughput",
    };
  }
  if (withOrder.id === "creating-worlds/cultivating-information") {
    return {
      ...withOrder,
      type: "calculator",
      availability: "available",
      summaryKey: "summary.choice",
    };
  }
  if (withOrder.id === "intellectronics/return-to-earth") {
    return {
      ...withOrder,
      type: "calculator",
      availability: "available",
      summaryKey: "summary.growth",
    };
  }
  return withOrder;
});

export const technicalDemo = {
  id: "technical/binary64-addition",
  chapterId: "technical",
  topicId: "boundary",
  type: "technical-demo",
  availability: "available",
  inBook: false,
  bookOrder: 0,
  title: L("Binary64 addition", "Binary64-Addition", "Suma binary64", "Addition binary64"),
  summaryKey: "summary.technical",
};

export const entries = [technicalDemo, ...sections];

export const typeOptions = TYPE_OPTIONS;

export function chapterById(id) {
  return chapters.find((chapter) => chapter.id === id);
}

export function topicById(id) {
  return topics.find((topic) => topic.id === id);
}
