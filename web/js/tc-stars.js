// Astronomical examples for the technetium schematic. Not a list from the book.
// Wikipedia titles were taken from Wikidata sitelinks. "-" falls back to English.

const HOST = { en: "en", de: "de", es: "es", fr: "fr", pl: "pl" };

export const tcStars = [
  {
    id: "r-andromedae",
    name: "R Andromedae",
    note: "agb",
    wiki: { en: "R_Andromedae", de: "R_Andromedae", es: "R_Andromedae", fr: "R_Andromedae", pl: "R_Andromedae" },
  },
  {
    id: "chi-cygni",
    name: "Chi Cygni",
    note: "agb",
    wiki: { en: "Chi_Cygni", de: "Chi_Cygni", es: "Ji_Cygni", fr: "Chi_Cygni", pl: "-" },
  },
  {
    id: "mira",
    name: "Mira (o Ceti)",
    note: "agb",
    wiki: { en: "Mira", de: "Mira_(Stern)", es: "Mira_(estrella)", fr: "Mira_(étoile)", pl: "Mira_Ceti" },
  },
  {
    id: "r-hydrae",
    name: "R Hydrae",
    note: "agb",
    wiki: { en: "R_Hydrae", de: "R_Hydrae", es: "R_Hydrae", fr: "R_Hydrae", pl: "-" },
  },
  {
    id: "przybylski",
    name: "Przybylski’s Star (HD 101065)",
    note: "disputed",
    wiki: { en: "Przybylski's_Star", de: "-", es: "Estrella_de_Przybylski", fr: "Étoile_de_Przybylski", pl: "Gwiazda_Przybylskiego" },
  },
];

export function starHref(star, lang) {
  const code = lang === "en-GB" ? "en" : lang;
  const local = star.wiki[code];
  const chosen = local && local !== "-" ? { code, title: local } : { code: "en", title: star.wiki.en };
  const host = HOST[chosen.code] ?? "en";
  return `https://${host}.wikipedia.org/wiki/${encodeURI(chosen.title)}`;
}
