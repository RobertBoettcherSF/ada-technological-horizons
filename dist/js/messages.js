const LOCALES = ["en-GB", "de", "es", "fr"];

const ROWS = [
  ["app.title", "Ada Technological Horizons", "Ada Technological Horizons", "Ada Technological Horizons", "Ada Technological Horizons"],
  ["app.credit", "An independent interactive exploration inspired by Stanisław Lem’s Summa Technologiae.", "Eine unabhängige interaktive Erkundung, angeregt von Stanisław Lems Summa Technologiae.", "Una exploración interactiva independiente inspirada en Summa Technologiae de Stanisław Lem.", "Une exploration interactive indépendante inspirée de Summa Technologiae de Stanisław Lem."],
  ["app.disclaimer", "This is original educational software, not an official edition or an endorsed adaptation.", "Dies ist eigenständige Lernsoftware, keine offizielle Ausgabe und keine anerkannte Bearbeitung.", "Este es un programa educativo original, no una edición oficial ni una adaptación respaldada.", "Ceci est un logiciel éducatif original, et non une édition officielle ni une adaptation cautionnée."],
  ["app.invite", "Start with the addition card. Then open a chapter tile to see its planned sections. Nothing in the chapters calculates in this release.", "Beginnen Sie mit der Additionskarte. Öffnen Sie danach eine Kapitelkarte, um die geplanten Abschnitte zu sehen. In den Kapiteln wird in dieser Ausgabe nichts berechnet.", "Empiece por la ficha de la suma. Después abra una ficha de capítulo para ver sus secciones previstas. En esta entrega los capítulos no calculan nada.", "Commencez par la fiche d’addition. Ouvrez ensuite une fiche de chapitre pour voir ses sections prévues. Dans cette version, les chapitres ne calculent rien."],
  ["app.licence", "No code licence has been selected. Nothing on this page grants permission to copy or reuse the software. The literary attribution is not a licence.", "Für den Code ist keine Lizenz gewählt. Diese Seite erlaubt nicht, die Software zu kopieren oder weiterzuverwenden. Die literarische Nennung ist keine Lizenz.", "No se ha elegido una licencia para el código. Esta página no autoriza a copiar ni reutilizar el programa. La atribución literaria no es una licencia.", "Aucune licence logicielle n’a été choisie. Cette page n’autorise ni la copie ni la réutilisation du logiciel. L’attribution littéraire n’est pas une licence."],
  ["skip.content", "Skip to the addition", "Zur Addition springen", "Saltar a la suma", "Aller à l’addition"],
  ["lang.label", "Language", "Sprache", "Idioma", "Langue"],
  ["lang.en-GB", "English (United Kingdom)", "English (United Kingdom)", "English (United Kingdom)", "English (United Kingdom)"],
  ["lang.de", "Deutsch", "Deutsch", "Deutsch", "Deutsch"],
  ["lang.es", "Español", "Español", "Español", "Español"],
  ["lang.fr", "Français", "Français", "Français", "Français"],
  ["nav.chapters", "Chapters", "Kapitel", "Capítulos", "Chapitres"],
  ["chapters.note", "Each tile opens that part of the book. Planned tiles are not working calculators.", "Jede Karte öffnet diesen Teil des Buches. Geplante Karten sind keine funktionierenden Rechner.", "Cada ficha abre esa parte del libro. Las fichas previstas no son calculadoras en funcionamiento.", "Chaque fiche ouvre cette partie du livre. Les fiches prévues ne sont pas des calculateurs en service."],
  ["nav.previous", "Previous", "Zurück", "Anterior", "Précédent"],
  ["nav.next", "Next", "Weiter", "Siguiente", "Suivant"],
  ["nav.about", "About", "Über dieses Werk", "Acerca de", "À propos"],
  ["catalogue.heading", "Sections", "Abschnitte", "Secciones", "Sections"],
  ["catalogue.tools", "Search, order and filters", "Suche, Reihenfolge und Filter", "Búsqueda, orden y filtros", "Recherche, ordre et filtres"],
  ["catalogue.intro", "Book order is independent of this list. Sorting and filtering do not renumber the chapters.", "Die Buchreihenfolge ist von dieser Liste unabhängig. Sortieren und Filtern ändern die Kapitelnummerierung nicht.", "El orden del libro es independiente de esta lista. Ordenar y filtrar no renumeran los capítulos.", "L’ordre du livre est indépendant de cette liste. Le tri et les filtres ne renumérotent pas les chapitres."],
  ["catalogue.search", "Search titles, summaries and topics", "Titel, Kurztexte und Themen suchen", "Buscar títulos, resúmenes y temas", "Rechercher dans les titres, résumés et thèmes"],
  ["catalogue.sort", "Order", "Reihenfolge", "Orden", "Ordre"],
  ["catalogue.sort.reading", "Reading order", "Lesereihenfolge", "Orden de lectura", "Ordre de lecture"],
  ["catalogue.sort.calculators", "Calculators first", "Rechner zuerst", "Calculadoras primero", "Calculateurs d’abord"],
  ["catalogue.sort.topic", "Topic", "Thema", "Tema", "Thème"],
  ["catalogue.sort.title", "Title", "Titel", "Título", "Titre"],
  ["catalogue.filter.chapter", "Chapter", "Kapitel", "Capítulo", "Chapitre"],
  ["catalogue.filter.topic", "Topic", "Thema", "Tema", "Thème"],
  ["catalogue.filter.type", "Type", "Art", "Tipo", "Type"],
  ["catalogue.openAll", "Open all", "Alle öffnen", "Abrir todo", "Tout ouvrir"],
  ["catalogue.closeAll", "Close all", "Alle schließen", "Cerrar todo", "Tout fermer"],
  ["catalogue.clear", "Clear filters", "Filter löschen", "Borrar filtros", "Effacer les filtres"],
  ["catalogue.clearHelp", "Clears search, chapter, topic and type filters, and restores reading order.", "Löscht Suche, Kapitel-, Themen- und Artfilter und stellt die Lesereihenfolge wieder her.", "Borra la búsqueda y los filtros de capítulo, tema y tipo, y restaura el orden de lectura.", "Efface la recherche et les filtres de chapitre, de thème et de type, et rétablit l’ordre de lecture."],
  ["catalogue.results", "Results", "Treffer", "Resultados", "Résultats"],
  ["catalogue.activeFilters", "Active filters", "Aktive Filter", "Filtros activos", "Filtres actifs"],
  ["catalogue.workingCalculators", "Working calculators", "Funktionierende Rechner", "Calculadoras en funcionamiento", "Calculateurs en service"],
  ["catalogue.none", "No sections match these filters.", "Keine Abschnitte entsprechen diesen Filtern.", "Ninguna sección coincide con estos filtros.", "Aucune section ne correspond à ces filtres."],
  ["catalogue.noneHelp", "Clear the filters to return to reading order. Planned sections remain marked as not operational.", "Löschen Sie die Filter, um zur Lesereihenfolge zurückzukehren. Geplante Abschnitte bleiben als nicht betriebsbereit gekennzeichnet.", "Borre los filtros para volver al orden de lectura. Las secciones previstas siguen marcadas como no operativas.", "Effacez les filtres pour revenir à l’ordre de lecture. Les sections prévues restent indiquées comme non opérationnelles."],
  ["catalogue.plannedNote", "Planned sections are not operational and are not counted as working calculators.", "Geplante Abschnitte sind nicht betriebsbereit und zählen nicht als funktionierende Rechner.", "Las secciones previstas no están operativas y no se cuentan como calculadoras en funcionamiento.", "Les sections prévues ne sont pas opérationnelles et ne comptent pas comme calculateurs en service."],
  ["type.planned", "Planned", "Geplant", "Previsto", "Prévu"],
  ["type.calculator", "Calculator", "Rechner", "Calculadora", "Calculateur"],
  ["type.explanation", "Explanation", "Erklärung", "Explicación", "Explication"],
  ["type.exploratory", "Exploratory", "Erkundung", "Exploratorio", "Exploratoire"],
  ["type.technical-demo", "Technical demonstration", "Technische Demonstration", "Demostración técnica", "Démonstration technique"],
  ["availability.planned", "Not operational", "Nicht betriebsbereit", "No operativo", "Non opérationnel"],
  ["tile.planned", "Planned", "Geplant", "Previsto", "Prévu"],
  ["tile.retrospective", "Retrospective", "Rückblick", "Retrospectiva", "Rétrospective"],
  ["availability.available", "Operational", "Betriebsbereit", "Operativo", "Opérationnel"],
  ["section.open", "Open section", "Abschnitt öffnen", "Abrir la sección", "Ouvrir la section"],
  ["summary.planned", "Planned section. This release has no explanation and no calculator here.", "Geplanter Abschnitt. Diese Ausgabe enthält hier weder eine Erklärung noch einen Rechner.", "Sección prevista. Esta entrega no incluye aquí ni explicación ni calculadora.", "Section prévue. Cette version ne contient ici ni explication ni calculateur."],
  ["summary.closing", "Retrospective commentary, kept distinct from the eight chapters. No essay is published in this release.", "Rückblickender Kommentar, getrennt von den acht Kapiteln. In dieser Ausgabe steht hier kein Essay.", "Comentario retrospectivo, distinto de los ocho capítulos. Esta entrega no publica aquí ningún ensayo.", "Commentaire rétrospectif, distinct des huit chapitres. Cette version n’y publie aucun essai."],
  ["summary.technical", "A technical demonstration that Ada adds two finite binary64 values. It is not a scientific calculator.", "Eine technische Demonstration: Ada addiert zwei endliche Binary64-Werte. Das ist kein wissenschaftlicher Rechner.", "Una demostración técnica: Ada suma dos valores binary64 finitos. No es una calculadora científica.", "Une démonstration technique : Ada additionne deux valeurs binary64 finies. Ce n’est pas un calculateur scientifique."],
  ["demo.friendlyTitle", "Add two numbers", "Zwei Zahlen addieren", "Sumar dos números", "Additionner deux nombres"],
  ["demo.lead", "These two numbers are already filled in. Change either one and the sum updates. Ada does the addition. This card is a technical demonstration, not a scientific calculator.", "Diese beiden Zahlen sind schon eingetragen. Ändern Sie eine davon, und die Summe wird neu berechnet. Ada führt die Addition aus. Diese Karte ist eine technische Demonstration, kein wissenschaftlicher Rechner.", "Estos dos números ya están escritos. Cambie uno de ellos y la suma se actualiza. Ada hace la adición. Esta ficha es una demostración técnica, no una calculadora científica.", "Ces deux nombres sont déjà inscrits. Modifiez l’un d’eux et la somme se met à jour. Ada effectue l’addition. Cette fiche est une démonstration technique, pas un calculateur scientifique."],
  ["demo.jump", "Use the addition card at the top of the page.", "Benutzen Sie die Additionskarte oben auf der Seite.", "Use la ficha de la suma al principio de la página.", "Utilisez la fiche d’addition en haut de la page."],
  ["demo.left", "Left operand", "Linker Operand", "Operando izquierdo", "Opérande gauche"],
  ["demo.right", "Right operand", "Rechter Operand", "Operando derecho", "Opérande droit"],
  ["demo.compute", "Compute", "Berechnen", "Calcular", "Calculer"],
  ["demo.reset", "Reset example", "Beispiel zurücksetzen", "Restablecer el ejemplo", "Réinitialiser l’exemple"],
  ["demo.separator", "Use a dot as the decimal separator in every language. Ada receives the binary64 value, not translated text.", "Verwenden Sie in jeder Sprache einen Punkt als Dezimaltrennzeichen. Ada erhält den Binary64-Wert, nicht den übersetzten Text.", "Use un punto como separador decimal en todos los idiomas. Ada recibe el valor binary64, no el texto traducido.", "Utilisez un point comme séparateur décimal dans toutes les langues. Ada reçoit la valeur binary64, pas le texte traduit."],
  ["demo.result", "Result", "Ergebnis", "Resultado", "Résultat"],
  ["demo.status", "Status", "Status", "Estado", "Statut"],
  ["demo.loading", "Loading the Ada module…", "Das Ada-Modul wird geladen …", "Cargando el módulo Ada…", "Chargement du module Ada…"],
  ["demo.loadFailed", "The Ada module did not load. No result is shown, and this page will not replace it with JavaScript arithmetic. Check that ath_addition.wasm sits beside this page and that the browser can fetch it, then retry.", "Das Ada-Modul wurde nicht geladen. Es wird kein Ergebnis gezeigt, und diese Seite ersetzt es nicht durch JavaScript-Arithmetik. Prüfen Sie, ob ath_addition.wasm neben dieser Seite liegt und der Browser sie abrufen kann, und versuchen Sie es erneut.", "El módulo Ada no se cargó. No se muestra ningún resultado, y esta página no lo sustituye por aritmética en JavaScript. Compruebe que ath_addition.wasm está junto a esta página y que el navegador puede obtenerlo, y vuelva a intentarlo.", "Le module Ada n’a pas été chargé. Aucun résultat n’est affiché, et cette page ne le remplace pas par de l’arithmétique JavaScript. Vérifiez qu’ath_addition.wasm se trouve à côté de cette page et que le navigateur peut le récupérer, puis réessayez."],
  ["demo.retry", "Retry Ada module", "Ada-Modul erneut laden", "Reintentar el módulo Ada", "Réessayer le module Ada"],
  ["demo.simulate", "Simulate module loading failure", "Fehler beim Laden des Moduls simulieren", "Simular un fallo de carga del módulo", "Simuler un échec de chargement du module"],
  ["demo.empty", "Enter both operands. An empty operand is rejected before Ada runs, because there is no binary64 value to pass.", "Geben Sie beide Operanden ein. Ein leerer Operand wird abgewiesen, bevor Ada läuft, weil kein Binary64-Wert zu übergeben ist.", "Introduzca ambos operandos. Un operando vacío se rechaza antes de ejecutar Ada, porque no hay un valor binary64 que transmitir.", "Saisissez les deux opérandes. Un opérande vide est refusé avant l’exécution d’Ada, car il n’y a pas de valeur binary64 à transmettre."],
  ["demo.malformed", "This operand is not in canonical decimal form. Use digits, an optional sign, a dot and an optional exponent.", "Dieser Operand hat nicht die kanonische Dezimalform. Verwenden Sie Ziffern, ein optionales Vorzeichen, einen Punkt und einen optionalen Exponenten.", "Este operando no está en forma decimal canónica. Use cifras, un signo opcional, un punto y un exponente opcional.", "Cet opérande n’est pas en forme décimale canonique. Utilisez des chiffres, un signe facultatif, un point et un exposant facultatif."],
  ["demo.nonFinite", "Ada rejected a non-finite operand.", "Ada hat einen nicht endlichen Operanden zurückgewiesen.", "Ada rechazó un operando no finito.", "Ada a rejeté un opérande non fini."],
  ["demo.overflow", "Ada rejected the sum because it is not a finite binary64 value.", "Ada hat die Summe zurückgewiesen, weil sie kein endlicher Binary64-Wert ist.", "Ada rechazó la suma porque no es un valor binary64 finito.", "Ada a rejeté la somme parce qu’elle n’est pas une valeur binary64 finie."],
  ["demo.ok", "Ada returned this finite sum.", "Ada hat diese endliche Summe zurückgegeben.", "Ada devolvió esta suma finita.", "Ada a renvoyé cette somme finie."],
  ["demo.contract", "Contract: finite binary64 addition. A negative finite operand is an ordinary value. A non-finite operand or a non-finite sum is an error. Underflow to a finite result, including zero, is success. Tolerance for the published integer fixtures is exact binary64 equality.", "Vertrag: endliche Binary64-Addition. Ein negativer endlicher Operand ist ein gewöhnlicher Wert. Ein nicht endlicher Operand oder eine nicht endliche Summe ist ein Fehler. Unterlauf zu einem endlichen Ergebnis, einschließlich null, ist Erfolg. Die Toleranz der veröffentlichten ganzzahligen Beispiele ist exakte Binary64-Gleichheit.", "Contrato: suma binary64 finita. Un operando finito negativo es un valor ordinario. Un operando no finito o una suma no finita es un error. El subdesbordamiento a un resultado finito, incluido el cero, es un acierto. La tolerancia de los ejemplos enteros publicados es la igualdad binary64 exacta.", "Contrat : addition binary64 finie. Un opérande fini négatif est une valeur ordinaire. Un opérande non fini ou une somme non finie est une erreur. Un soupassement vers un résultat fini, y compris zéro, est un succès. La tolérance des exemples entiers publiés est l’égalité binary64 exacte."],
  ["demo.exampleTitle", "Binary64 addition", "Binary64-Addition", "Suma binary64", "Addition binary64"],
  ["diag.toggle", "Technical details", "Technische Angaben", "Detalles técnicos", "Détails techniques"],
  ["diag.heading", "Release identity", "Identität der Ausgabe", "Identidad de la entrega", "Identité de la version"],
  ["diag.version", "Release", "Ausgabe", "Entrega", "Version"],
  ["diag.commit", "Published commit", "Veröffentlichter Stand", "Revisión publicada", "Révision publiée"],
  ["diag.module", "Module fingerprint", "Modulkennzeichen", "Huella del módulo", "Empreinte du module"],
  ["diag.execution", "Execution", "Ausführung", "Ejecución", "Exécution"],
  ["diag.calls", "Ada calls", "Ada-Aufrufe", "Llamadas a Ada", "Appels Ada"],
  ["diag.locale", "Locale", "Gebietsschema", "Configuración regional", "Locale"],
  ["diag.mime", "Wasm response type", "Wasm-Antworttyp", "Tipo de respuesta Wasm", "Type de réponse Wasm"],
  ["diag.toolchain", "Toolchain", "Werkzeugkette", "Cadena de herramientas", "Chaîne d’outils"],
  ["exec.loading", "Loading", "Wird geladen", "Cargando", "Chargement"],
  ["exec.ready", "Ada WebAssembly", "Ada WebAssembly", "Ada WebAssembly", "Ada WebAssembly"],
  ["exec.failed", "Load failed", "Laden fehlgeschlagen", "Carga fallida", "Échec du chargement"],
  ["exec.idle", "Not loaded", "Nicht geladen", "No cargado", "Non chargé"],
  ["about.heading", "About this release", "Über diese Ausgabe", "Acerca de esta entrega", "À propos de cette version"],
  ["about.scope", "Version 0.1.1 keeps the scaffold and the Ada-to-WebAssembly boundary, with a clearer way to begin. Scientific calculators, including any civilisation-lifetime model, are not in this release.", "Version 0.1.1 behält das Gerüst und die Grenze von Ada zu WebAssembly, mit einem klareren Einstieg. Wissenschaftliche Rechner, einschließlich eines Modells für die Lebensdauer von Zivilisationen, gehören nicht zu dieser Ausgabe.", "La versión 0.1.1 conserva el andamiaje y la frontera entre Ada y WebAssembly, con un comienzo más claro. Las calculadoras científicas, incluido cualquier modelo de vida de las civilizaciones, no forman parte de esta entrega.", "La version 0.1.1 conserve l’échafaudage et la frontière entre Ada et WebAssembly, avec une entrée en matière plus claire. Les calculateurs scientifiques, y compris tout modèle de durée de vie des civilisations, sont absents de cette version."],
  ["about.queue", "The next implementation item remains the historical four-fate weighted mean. It is not available here.", "Der nächste Umsetzungspunkt bleibt das historische gewichtete Mittel der vier Schicksale. Es ist hier nicht verfügbar.", "El siguiente elemento de implementación sigue siendo la media ponderada histórica de los cuatro destinos. Aquí no está disponible.", "Le prochain élément à réaliser reste la moyenne pondérée historique des quatre destins. Il n’est pas disponible ici."],
  ["about.decimal", "Results are shown in canonical decimal form, with a dot separator and no grouping marks, so the digits do not change with the language.", "Ergebnisse erscheinen in kanonischer Dezimalform, mit Punkt und ohne Gruppierungszeichen, damit die Ziffern sich nicht mit der Sprache ändern.", "Los resultados se muestran en forma decimal canónica, con punto y sin separadores de millares, de modo que las cifras no cambian con el idioma.", "Les résultats sont affichés en forme décimale canonique, avec un point et sans séparateur de milliers, afin que les chiffres ne changent pas avec la langue."],
  ["footer.note", "Literary inspiration is acknowledged separately from any future software licence.", "Die literarische Anregung wird getrennt von einer künftigen Softwarelizenz genannt.", "La inspiración literaria se reconoce aparte de cualquier licencia futura del programa.", "L’inspiration littéraire est indiquée à part de toute licence logicielle future."],
  ["reading.prompt", "Select a chapter or a section. Previous and Next follow the book, whatever the catalogue order.", "Wählen Sie ein Kapitel oder einen Abschnitt. Zurück und Weiter folgen dem Buch, unabhängig von der Katalogreihenfolge.", "Elija un capítulo o una sección. Anterior y Siguiente siguen el libro, sea cual sea el orden del catálogo.", "Choisissez un chapitre ou une section. Précédent et Suivant suivent le livre, quel que soit l’ordre du catalogue."],
  ["reading.chapter", "Chapter", "Kapitel", "Capítulo", "Chapitre"],
  ["reading.notInBook", "This demonstration is not part of the book, so it has no Previous or Next step.", "Diese Demonstration gehört nicht zum Buch und hat daher keinen Schritt Zurück oder Weiter.", "Esta demostración no forma parte del libro, así que no tiene paso Anterior ni Siguiente.", "Cette démonstration ne fait pas partie du livre, elle n’a donc ni Précédent ni Suivant."],
  ["group.all", "All matching sections", "Alle passenden Abschnitte", "Todas las secciones coincidentes", "Toutes les sections correspondantes"],
  ["collapse.chapter", "Show or hide sections in this chapter", "Abschnitte in diesem Kapitel ein- oder ausblenden", "Mostrar u ocultar las secciones de este capítulo", "Afficher ou masquer les sections de ce chapitre"],
  ["collapse.card", "Show or hide this section", "Diesen Abschnitt ein- oder ausblenden", "Mostrar u ocultar esta sección", "Afficher ou masquer cette section"],
  ["chapter.technical", "Technical demonstration", "Technische Demonstration", "Demostración técnica", "Démonstration technique"],
  ["chapter.dilemmas.blurb", "Three opening parts on the limits of forecasting. Planned reading, with nothing to calculate yet.", "Drei einleitende Teile über die Grenzen des Vorausdenkens. Geplante Lektüre, noch ohne Rechnung.", "Tres partes iniciales sobre los límites de la previsión. Lectura prevista, todavía sin cálculo.", "Trois parties d’ouverture sur les limites de la prévision. Lecture prévue, encore sans calcul."],
  ["chapter.two-evolutions.blurb", "Biological evolution set beside technological change. Planned reading.", "Biologische Evolution neben technischem Wandel. Geplante Lektüre.", "La evolución biológica junto al cambio tecnológico. Lectura prevista.", "L’évolution biologique mise à côté du changement technique. Lecture prévue."],
  ["chapter.cosmic-civilisations.blurb", "How one might even talk about civilisations beyond Earth. Planned reading.", "Wie man überhaupt über Zivilisationen jenseits der Erde sprechen könnte. Geplante Lektüre.", "Cómo se podría siquiera hablar de civilizaciones más allá de la Tierra. Lectura prevista.", "Comment on pourrait même parler de civilisations au-delà de la Terre. Lecture prévue."],
  ["chapter.intellectronics.blurb", "Intelligence, information and machines that might extend them. Planned reading.", "Intelligenz, Information und Maschinen, die sie erweitern könnten. Geplante Lektüre.", "La inteligencia, la información y las máquinas que podrían ampliarlas. Lectura prevista.", "L’intelligence, l’information et les machines qui pourraient les prolonger. Lecture prévue."],
  ["chapter.prolegomena-to-omnipotence.blurb", "What a constructor could and could not control. Planned reading.", "Was ein Konstrukteur beherrschen könnte und was nicht. Geplante Lektüre.", "Qué podría controlar un constructor y qué no. Lectura prevista.", "Ce qu’un constructeur pourrait maîtriser, et ce qu’il ne pourrait pas. Lecture prévue."],
  ["chapter.phantomology.blurb", "Artificial experience and where illusion stops. Planned reading.", "Künstliche Erfahrung und wo die Täuschung endet. Geplante Lektüre.", "La experiencia artificial y dónde termina la ilusión. Lectura prevista.", "L’expérience artificielle et là où l’illusion s’arrête. Lecture prévue."],
  ["chapter.creating-worlds.blurb", "Information, language and the making of worlds. Planned reading.", "Information, Sprache und das Erschaffen von Welten. Geplante Lektüre.", "Información, lenguaje y la hechura de mundos. Lectura prevista.", "Information, langage et la fabrique des mondes. Lecture prévue."],
  ["chapter.a-lampoon-of-evolution.blurb", "Life, death and consciousness treated as constructions. Planned reading.", "Leben, Tod und Bewusstsein als Konstruktionen betrachtet. Geplante Lektüre.", "Vida, muerte y conciencia tratadas como construcciones. Lectura prevista.", "Vie, mort et conscience traitées comme des constructions. Lecture prévue."],
  ["chapter.conclusion.blurb", "The close of the main argument, kept apart from the eight chapters. No essay in this release.", "Der Schluss der Hauptdarlegung, getrennt von den acht Kapiteln. In dieser Ausgabe steht hier kein Essay.", "El cierre del argumento principal, aparte de los ocho capítulos. Esta entrega no publica aquí ningún ensayo.", "La fin de l’argument principal, tenue à l’écart des huit chapitres. Cette version n’y publie aucun essai."],
  ["chapter.afterword.blurb", "A later look back, in two parts. Retrospective, and not a working calculator.", "Ein späterer Rückblick in zwei Teilen. Retrospektiv und kein funktionierender Rechner.", "Una mirada posterior, en dos partes. Retrospectiva, y no una calculadora en funcionamiento.", "Un regard plus tardif, en deux parties. Rétrospectif, et non un calculateur en service."],
];

function buildMessages(rows) {
  const messages = { "en-GB": {}, de: {}, es: {}, fr: {} };
  for (const [key, en, de, es, fr] of rows) {
    const values = { "en-GB": en, de, es, fr };
    for (const locale of LOCALES) {
      if (typeof values[locale] !== "string" || values[locale].trim() === "") {
        throw new Error(`Empty translation ${locale} ${key}`);
      }
      messages[locale][key] = values[locale];
    }
  }
  return messages;
}

export const messages = buildMessages(ROWS);
export const messageKeys = ROWS.map((row) => row[0]);

export function t(lang, key) {
  const table = messages[lang];
  if (!table || !Object.prototype.hasOwnProperty.call(table, key)) {
    throw new Error(`Missing translation ${lang} ${key}`);
  }
  return table[key];
}
