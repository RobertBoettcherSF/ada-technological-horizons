# Ada Technological Horizons: interactive design document (step by step)

**Draft for review, 15 November 2026 (Europe/Berlin). Baseline: release 0.1.23. PR #1 is unmerged.**

This document gathers everything in *Summa technologiae* that Lem **himself** states in a way that can become a calculation, simulation or hands-on model. That includes numbers, estimates, formulas, thought experiments and the scientists' work he cites for them. Every item comes with a proposed child-friendly interactive. A step-by-step release plan from 0.1.24 onward follows the catalogue.

- Line locators are line numbers in the Polish e-text used for `data/scientists.tsv` (1184 lines). Each line is one paragraph, so the locator points to a paragraph. That e-text is not stored in this repository.
- Scientist names and line numbers were cross-checked against `data/scientists.tsv`.
- Quotes are short, at most 25 words, and only for internal review. The UI uses our own paraphrases plus, at most, a short attributed quote, as the existing quotation policy requires.
- Nothing in this document has been implemented or tested. The repo was only read (file tree and `catalogue-data.js` on branch `cursor/plan1-scaffold-ada-wasm-4489`).

## 0. Legend

| Tag | Meaning |
|---|---|
| **LEM-Q** | Lem's own quantitative content: numbers, estimates or results he states or reports from a named scientist. |
| **LEM-T** | Lem's own thought experiment or qualitative model, with no numbers, or with numbers that only illustrate. |
| **OURS** | Our illustration, reconstruction or toy rule. It must be labelled in the UI as "our illustration, not Lem's model". |
| **MODERN** | A collapsed note where present-day science differs. Lem's text is left unchanged. |
| **BUILT** | Already in the app as of 0.1.23. |
| ⭐ | High child-friendliness (direct manipulation, visible cause and effect, no reading needed for the default demo). |

Polish number words: **miliard = 10⁹, bilion = 10¹², trylion = 10¹⁸**. Lem points this out himself at line 26. Translations must not copy "bilion" as "billion". Superscripts were flattened in the transcription ("1033" means 10³³, "l021" means 10²¹, "1025" means 10²⁵), and every such value has to be confirmed before use.

---

## 1. Cross-cutting design principles

### 1.1 Child-friendly interaction pattern (every interactive)
1. **The demo plays on its own.** On first view, a 6–10 s animation runs with Lem's default values: dots blink, dice roll, a signal travels. It loops gently until the user touches something, then stops and hands over control.
2. **One big control first.** One large slider, dial or button with a thumb target of at least 44×44 px, labelled with a picture and a word (for example 🎲 "How many players?"). Other parameters stay under "More controls".
3. **Feedback within 100 ms.** Ada recalculates on every input event and JS animates the change. No "Calculate" button.
4. **A one-sentence caption that rewrites itself**, for example "With a billion players, someone almost surely rolls ten sixes." Ada returns a caption code plus numbers, and JS picks the localised sentence.
5. **Three layers:** (a) play, (b) "What Lem says", a short paraphrase with the line locator, a short quote and the scientist credit, (c) a collapsed "Technical details" layer with the formula, units, assumptions, MODERN note and test values.
6. **Comparisons a child knows:** football pitches, a school class, a lifetime of 70 years, one heartbeat per second, the distance to the Moon. Big numbers are always shown as a power of ten **and** as a picture (dots, stacked blocks or a zoomable scale).
7. **Safe to break.** Any input is allowed. Out-of-range values produce a friendly message from an Ada status code, never NaN or a blank chart. A big **Reset ↺** restores Lem's defaults.
8. **No scores for minds, morals or people.** Consciousness, intelligence quotients, "faith" and personal identity are shown as thought experiments, never as a computed rating (see IV-09 and IV-10).

### 1.2 Consistent visual language
- **Colours:** amber = Lem's value or Lem's line, blue = the user's value, grey dashed = our illustration or assumption, green = modern measurement. Each colour also has a pattern or shape so colour is never the only cue.
- **Badges** on every card: "Lem's numbers", "Lem's thought experiment" or "Our illustration". The Technical layer always shows "MODERN" when a note exists.
- **Charts** always have labelled axes with units, a legend, an accessible data table and a text summary. Use log axes for astronomical ranges, labelled "×10 per step".
- **Reusable widgets:** `Slider-big`, `Counter-odometer`, `Dot-field` (galaxy, eggs, players), `Timeline-zoom`, `Spectrum-strip` (exists), `Signal-travel` (exists in delay), `Dice/Card-roller`, `Power-of-ten ladder`.

### 1.3 Accessibility and motion
- Full keyboard operation: arrow keys on sliders, Space to play or pause, R to reset. Visible focus.
- `prefers-reduced-motion` plus a site toggle "Calm mode". Animations become instant state changes, auto-play is off, and stepping uses ⏭.
- Every animation has a Pause button and a "Show steps" text alternative. Nothing flashes more than 3 times per second.
- Screen-reader live region announces the caption after input settles (debounced to 500 ms).
- Works at **320 px**. Controls stack vertically, charts scroll inside their card, and large numbers wrap.

### 1.4 Engineering invariants (acceptance criteria for every increment)
- **Ada computes everything:** values, captions, chart series, random draws (seeded PRNG in Ada) and validation status. **JS only renders** and does not duplicate formulas.
- Native Ada tests plus Node/Wasm fixture parity. Browser test passes under both `application/wasm` and `application/octet-stream`.
- Five locales (en-GB default, de, es, fr, pl) are complete. The missing-key test fails the build on any gap, and switching locale keeps state. Polish numbers are displayed with a decimal comma and grouping spaces, while input accepts a dot.
- Persistent Debug button and F9 dialog are kept and show the new module.
- Choosing a chapter shows only that chapter. Syllabus styling, no overflow at 320 px, and screenshots for desktop and 320 px.
- The scientist credit block for the chapter links each cited scientist with locale-dependent Wikipedia links and the English fallback.
- MODERN notes sit collapsed and are sourced. Lem's text and figures are never "corrected" in place.
- Delivery as an immutable rawcdn.githack preview. **No merge without approval.**

---

## 2. Catalogue: what Lem gives us, chapter by chapter

Format per item: **ID · Subsection · lines · tag · status**, then the Polish quote with an English paraphrase, the scientists, Lem's claim, the proposed interactive, and a MODERN note where one applies.

### Chapter I: Dylematy (lines 10–38)
Little quantitative content. It is mostly forecasting history.

**I-01 · Part 2 · l. 26 · LEM-Q · planned (late)**
- *„około roku 1955 sądzono, że … synteza wodoru w hel da energię przemysłową w najbliższej przyszłości.”* Around 1955 people expected fusion power soon; now it is placed in the 1990s.
- Scientists: Blackett (wrong 1948 forecast to 1960), Thirring (1946 H-bomb book).
- Lem's claim: experts mis-forecast in both directions.
- Interactive ⭐ "Forecast checker": a timeline where the child drags a 🔮 marker for "when will it happen?" Then the reveal animates what was predicted (1955 → "soon", Lem's mid-1960s → "1990s") against the outcome.
- MODERN: commercial fusion is still not available in 2026. Our addition, sourced.

**I-02 · Part 3 · l. 34 · LEM-T · explanation**
- Stapledon's novel spans "dwa miliardy lat" (two billion years).
- Use: a scale bar in the deep-time widget (VIII-01). No calculator.

**I-03 · Part 1 · l. 17–18 · LEM-T · explanation**
- Islands of decreasing entropy, and the question of steering the Sun's "miliardoletnim pożarem" (billion-year fire).
- Use: a link to the energy ladder (III-06).

### Chapter II: Dwie ewolucje (lines 39–142)

**II-01 · Podobieństwa · l. 51, 56 · LEM-T · planned**
- *„linią krzywą, pnącą się powoli w górę, aby ze wzgórza kulminacji zejść na powrót w dół, ku zagładzie”*. Bio- and techno-evolution rise slowly, peak (often through gigantism) and decline.
- Interactive ⭐ "Rise and fall": draw or drag a curve, with icons for species and machines (Lem's examples include radio and film versus television, l. 55) riding it. Icons grow giant near the peak.
- The **curve shape is OURS**. Lem gives no equation.

**II-02 · Różnice 1 · l. 68–69 · LEM-Q (qualitative magnitude) · planned**
- *„gdyby miała promień 5 razy większy … jeszcze by tej masy nie wystarczyło”*. Even a protein-solution Earth with five times the radius would not suffice for the enzymes to form by blind chance in 2–4 billion years.
- Interactive: "Blind draws from the bag". A bag of letters, where pressing "Draw" tries to spell a target word. A slider makes the word longer, and the counter shows the expected number of draws exploding.
- The **word game is OURS**, an analogy for Lem's argument. Lem gives no probability figure.
- MODERN: origin-of-life research has moved on (self-organisation, which Lem himself raises at l. 72). The note stays short.

**II-03 · Różnice 2 · l. 81–83 · LEM-Q · planned (with VIII-01)**
- About 2 billion years to construct the cell, "co najmniej połowę" (at least half) of evolution. Lost designs are "tysiące razy" (thousands of times) more numerous than survivors.
- Use: deep-time timeline segments, and a "graveyard vs survivors" dot field showing 1 survivor per 1,000 dots.

**II-04 · Różnice 3 · l. 92–93 · LEM-T · planned (late)**
- Trial and error versus theory. The V-2's shape was found *„przez sita empirycznych prób”* (through sieves of empirical trials) in a wind tunnel.
- Interactive ⭐ "Wind-tunnel game": the child tries random nose shapes and each run shows drag as a bar. A "Use theory" button jumps straight to a good shape.
- The **drag rule is OURS**, a toy. It is not V-2 aerodynamics.

**II-05 · Pierwsza przyczyna · l. 118–119 · LEM-Q (doubtful transcription) · explanation**
- Money can speed up technology only up to a ceiling: no amount of money lands on the Moon in six months.
- Figures appear as "2 miliardów" and "nie 20, lecz 2 miliardów", which is garbled (see §4).
- Use: a "you can't buy time" diagram. **Hold any numbers** until the figures are checked against an edition.

**II-06 · Pierwsza przyczyna · l. 127 · LEM-Q · explanation**
- Single-celled life can persist "sto czy pięćset milionów lat" (100 or 500 million years) if nothing forces change. Feeds VIII-01.

### Chapter III: Cywilizacje kosmiczne (lines 143–256): richest chapter, user priority

**III-01 · Sformułowanie problemu · l. 148 · LEM-Q · planned**
- *„emisja radiowa Ziemi, w zakresie fal metrowych … dorównuje już całkowitej emisji Słońca”*. In metre waves, Earth's TV transmitters already rival the Sun.
- Interactive ⭐ "Radio-bright Earth": a dimmer slider on Earth's TV towers, with two radio "glows" (Sun and Earth) compared at metre wavelength. Illustrative scale. Feeds III-04.

**III-02 · Sformułowanie metody · l. 157–158 · LEM-Q (qualitative) · planned (with III-06)**
- Shklovsky's "cosmic miracles". *„Prosty rachunek dowodzi”* (a simple calculation shows) that anything visible from tens or hundreds of light years needs star-like power.
- Interactive: part of the energy ladder. The child drags a "miracle" farther away, and the required power bar climbs to "a star".
- The **inverse-square power law is OURS** (a standard reconstruction). Lem gives no numbers.

**III-03 · Sformułowanie metody · l. 159 · LEM-Q · planned (0.1.29)**
- *„energetyka ziemska będzie wzrastała rocznie o 1/3 procentu … za 2500 lat … dziesięć miliardów razy”*. With modest growth, energy production in 2,500 years would be 10¹⁰ times today's, one ten-thousandth of the Sun's output by AD 4500.
- Dyson sphere at 1 AU catching "4 * 10³³ ergów na sekundę". Shklovsky on steering solar nuclear burning.
- Scientists: Shklovsky, Dyson (also Sagan, von Hoerner and Bracewell named at l. 159).
- Interactive ⭐ "Energy staircase": a big "years" slider from 0 to 2,500. A growing energy blob fills a city, then Earth, then wraps the Sun as a Dyson sphere. A log bar compares the result with the Sun's output.
- Ada computes (1+r)^t. It shows **Lem's stated result (10¹⁰) and the arithmetic for 1/3 % (about 4,100×) side by side**, plus the rate that would give 10¹⁰ (about 0.93 %/yr). Text is never altered (see §4).
- MODERN: the Sun's luminosity is 3.8×10²⁶ W = 3.8×10³³ erg/s, which matches Lem's 4×10³³.

**III-04 · Sformułowanie metody · l. 163–164 · LEM-Q · planned (0.1.28)**
- *„Aparatura ta mogła odebrać sygnały … z dystansu dziesiątka lat świetlnych.”* From 1960, Drake's Green Bank receiver could hear Earth-strength transmitters out to about 10 ly. It could hear "sto razy większej" (100× farther) if the signal were strong enough. The antenna is described as 27 m.
- Scientists: Drake; the idea came from Cocconi and Morrison.
- Interactive ⭐ "Can we hear them?": drag a star away from the dish and watch the received "loudness" fade with inverse-square rings. Dragging to 100× farther shows the transmitter must be 10,000× stronger. A speaker icon gets quieter (visual only, no audio needed).
- The **inverse-square law is OURS** (standard physics). The 10 ly and 100× figures are Lem's.
- MODERN: Project Ozma used an 85-ft (about 26 m) dish. Lem's figure is not altered.

**III-05 · Sformułowanie metody / Statystyka · l. 163, 169–172 · LEM-Q · planned (0.1.24)**
- *„tylko jedna gwiazda na 150 posiada planety … gwiazd liczy Galaktyka około 150 miliardów”*. Bracewell and von Hoerner: 150 billion stars and 1 in 150 with planets gives about 10⁹ planetary systems. If civilisations lasted as long as their stars, neighbours would be under 10 ly apart. With an average life of 100 million years, about 50 ly. With a few thousand years, about 1,000 ly. The galaxy's age is about 15 billion years.
- Scientists: Bracewell, von Hoerner, Shklovsky.
- Interactive ⭐ "Blinking galaxy" (flagship): a spiral of dots, where each dot lights up when a civilisation is "alive". One huge slider sets "How long does a civilisation last?" from 100 years to 15 billion years on a log scale. Lights flicker in and out; with longer lives the sky fills.
  - Counter: "Alive right now: N".
  - Ruler: "Nearest neighbour ≈ D light-years".
  - Lem's three amber marks on the slider: about 6,500 years → about 1,000 ly; 100 My → about 50 ly; star lifetime → under 10 ly.
- Ada computes N = N★·f·min(L/T,1), the earlier backlog item 10, with test value 434.87 at L = 6,523. Spacing uses a declared disc geometry (OURS).
- The UI shows **Lem's quoted spacings as amber pins next to our model's line** and does not force them to agree.
- MODERN: exoplanet surveys now suggest most stars have planets. A toggle "Today's estimate" switches f to the modern value with its source.

**III-06 · Statystyka cywilizacji kosmicznych · l. 173–175 · LEM-Q · BUILT (lifetime calculator, partly)**
- *„von Hörner uzyskuje jako przeciętną istnienia cywilizacji 6500 lat … tysiąc lat świetlnych … 12 000 lat”*. Von Hoerner gives four fates with arbitrary weights, a mean of 6,500 years, a 1,000 ly spacing, a most-likely age at first contact of 12,000 years, a 0.5 % chance of meeting a civilisation at our stage, and a 2,000-year wait for a reply.
- Already built: the weighted mean (6,523). The delay calculator covers the 2,000-year round trip.
- Additions:
  - (a) "First contact age" (12,000 years) and "same stage" (0.5 %) shown as Lem-reported values, with no recomputation unless von Hoerner's method is sourced.
  - (b) ⭐ "Letter to the stars": send a ✉️ question and watch a 1,000-year trip there and 1,000 back, while a family-tree strip shows about 80 generations passing on Earth.

**III-07 · Statystyka · l. 177 · LEM-T (cites Shklovsky) · planned (0.1.30)**
- *„podobieństwo takiego procesu do lawinowego rozmnożenia organizmów”*. Shklovsky compares the spread of a long-lived civilisation to the avalanche growth of organisms, and Lem asks why such expansion is not seen.
- Interactive ⭐ "Spreading colony": tap one star and it seeds neighbours, which seed theirs. The child slides a "hop time" and watches the galaxy fill in a few million years.
- Spread rules are **OURS**. Lem only states the analogy and the puzzle.

**III-08 · Katastrofizm kosmiczny · l. 182–184 · LEM-Q · planned (0.1.30)**
- *„Niech 990 milionów planet na ich galaktyczny miliard … tylko sto tysięcy, albo zaledwie jeden tysiąc”*. Von Hoerner gives self-destruction 65 chances in 100 and the other causes 35. Lem replies: even if 990 million of a billion are short-lived and only 1,000 escape, those 1,000 would last hundreds of millions of years and should be visible.
- Interactive ⭐ "The stubborn thousand": a field of a billion dots (shown as a zoomable 1,000 × 1,000,000 grid) where nearly all blink out quickly. The child picks how many "escape" (100,000, 1,000 or 1). An odometer shows how many long-lived ones would be **alive now** and how close the nearest would be (reusing the III-05 core).
- The arithmetic is Lem's, and occupancy reuses the III-05 model (OURS).

**III-09 · Metateoria cudów · l. 191 · LEM-Q · BUILT (0.1.23)**
- Technetium lines as a possible "miracle", and "kilku milionów ton" (a few million tonnes) suffices for a visible line.
- Already built: spectrum strip, candidate stars, half-life note.
- Small addition: a "how much is a few million tonnes?" comparison (for example a mountain versus the Sun's mass) as an illustration.

**III-10 · Metateoria cudów · l. 193 · LEM-T (cites Shklovsky) · planned (0.1.31)**
- *„przesuniętego aż ku falom radiowym wskutek efektu Dopplera”*. Photon rockets at near light speed would have their light shifted down to radio waves, and some galactic radio emission could be their trace. Also Sagan's plan to seed Venus with algae (l. 193).
- Scientists: Shklovsky (via Lem), Doppler (eponym), Sagan.
- Interactive ⭐ "Racing rocket rainbow": reuse the 0.1.23 spectrum strip. The child drags the rocket's speed toward c, and the coloured lines slide toward red, then off the strip into "radio", using the relativistic Doppler factor. A siren analogy sits in the caption.
- The **formula is standard physics (OURS)**. Lem gives none.

**III-11 · Unikalność człowieka · l. 199–201 · LEM-Q · BUILT (0.1.27) ⭐⭐**
- *„jest niezwykle mało prawdopodobne, aby jeden gracz, rzucając dziesięć kości, wyrzucił dziesięć szóstek”*. Baumsztejn: one player rolling ten sixes is very unlikely, but with a billion players at once someone almost surely will. With about 3 million cod eggs, the chance that at least one or two become fish is close to one. Lem objects (l. 201): a lost egg is destroyed, whereas a planet that fails to make minds is not.
- Scientist: Baumsztejn (not in the scientist table under that spelling; flagged in §4).
- Interactive ⭐⭐ "Ten sixes":
  - Ten big dice roll; press 🎲 to roll and see how many sixes appear.
  - A "players" slider from 1 to 10⁹ (log) fills the screen with tiny dice tables.
  - A gauge shows "Chance someone gets ten sixes". Ada computes 1−(1−6⁻¹⁰)ⁿ: about 1.65×10⁻⁸ for 1 player and about 0.99999993 for 10⁹.
  - Second tab "3 million eggs": the child sets the survival chance per egg and sees expected fish.
- The arithmetic follows Lem's example exactly (Lem-Q). The probabilities are a standard computation (OURS but trivial). Simulated rolls use a seeded Ada PRNG.

**III-12 · Unikalność człowieka · l. 202 · LEM-Q (cites Shklovsky) · planned (late)**
- Shklovsky's hypothesis: a nearby supernova raises cosmic-ray intensity *„dziesiątki, a nawet setki razy”* (tens or hundreds of times), raising mutation rates. He suggested it caused the Mesozoic reptile extinction.
- Interactive: "Supernova nearby". Drag the supernova closer and a cosmic-ray meter rises (inverse-square, OURS) to Lem's 10× and 100× marks, with Earth's mutation "sparkles" increasing.
- MODERN: the dinosaur extinction is now mainly attributed to the Chicxulub impact. Nearby supernovae are still studied for other events. Needs sources.

**III-13 · Inteligencja: przypadek czy konieczność? · l. 210, 212 · LEM-Q / LEM-T · planned (late)**
- Ashby's rats: the "dull" cautious rat survives poison that the "clever" one learns to trust. *„ponad 700 000 ich gatunków, przy 80 000 gatunków wszystkich kręgowców”*: over 700,000 insect species against 80,000 vertebrate species, so intelligence is not the only route to success.
- Interactive ⭐ (a) a pictogram: 70 bug icons for every 8 vertebrate icons. (b) a "Two rats" toy: the child places food or poison, and the two rats' rules (Ashby's example as Lem tells it) play out.
- MODERN: about 1 million described insect species today. Sourced note.

**III-14 · Hipotezy (III) · l. 223 · LEM-Q (analogy) · planned (with III-08)**
- Averages hide tails, but they have limits too: *„przeciętnej długości życia, wynoszącej około 60 lat, ale żaden człowiek nie może żyć 200 lub 300 lat”*. Similarly, a few-thousand-year average does not exclude million-year civilisations.
- Interactive: a histogram toggle in III-08 ("people" versus "civilisations").

**III-15 · Perspektywy · l. 243 · LEM-Q (quotes Shklovsky, Byurakan 1964) · planned (0.1.29)**
- *„spośród 10²¹ gwiazd … ani jedna nie ma wokół siebie rozwiniętej dostatecznie cywilizacji”*: about 10¹⁰ galaxies × 10¹⁰–10¹¹ stars, and not one shows a civilisation.
- Interactive ⭐ "Power-of-ten zoom": from Sun to galaxy to observable universe, with a star counter.
- MODERN: current estimates of stars in the observable universe are higher (about 10²²–10²⁴). Sourced note.

**III-16 · Perspektywy · l. 244 · LEM-Q · planned (0.1.29)**
- *„Kardaszew … dzielił … cywilizacje na trzy typy”*. Kardashev's three types use about 4×10¹⁹, 4×10³³ and 4×10⁴⁴ erg. Type I needs a few billion years, I→II a few thousand years, II→III a few tens of millions of years.
- Interactive ⭐ "Kardashev staircase": three giant steps (planet, star, galaxy) with a climbing figure. A slider for energy-growth rate shows how many years each step takes. Lem's "few thousand years" for I→II is an amber mark.
- MODERN / units: Kardashev's figures are power (erg **per second**), while the transcription says "roczne" (per year). The note gives watts (about 4×10¹² W, 4×10²⁶ W, 4×10³⁷ W) after checking the source.

**III-17 · Perspektywy · l. 248 · LEM-Q (cites von Hoerner) · planned (late)**
- Intergalactic flight within a human lifetime would need annihilating matter *„niemal rzędu masy naszego Księżyca”* (nearly a Moon's mass).
- Interactive: a "fuel-tank" comparison (ship vs Moon). Optionally a relativistic photon-rocket reconstruction (OURS, B-level), only if the mass and distance assumptions are sourced. Otherwise keep it as a picture of Lem's stated figure.

**III-18 · Perspektywy · l. 251–252 · LEM-T · explanation**
- Dyson sphere "probably nowhere realised". Kardashev's natural-or-artificial radio sources controversy.
- Use: link to III-09 and III-16, plus a "natural or artificial?" sorting game (OURS).

### Chapter IV: Intelektronika (lines 257–490)

**IV-01 · Powrót na ziemię · l. 263–265 · LEM-Q · BUILT (growth) + extension planned (0.1.37)**
- *„Co 15 lat ilość pism naukowych podwaja się”*: more than 100,000 periodicals now, a million by 2000. *„za jakichś 50 lat każdy mieszkaniec Ziemi byłby uczonym”*: in 50 years everyone would be a scientist, so human reserves will stop exponential growth.
- Already built: N₀·2^(t/15).
- Extension ⭐ "Everyone a scientist?": a crowd of 100 people where scientists (lab coats) multiply each tick. The child drags a "years" slider and sees the crowd turn all lab coats at Lem's about 50 years.
  - Inputs: our stated starting share, plus a scientist doubling time taken from the text or an editable value.
  - Lem's "100,000 → 1,000,000 by 2000" is shown as an amber check.
- MODERN: growth slowed but continued. The number of journals in 2000 was far below a million (sourced estimate, with ranges).

**IV-02 · Powrót na ziemię · l. 268 · LEM-Q · BUILT (lottery) + small addition**
- *„Globalne usprawnienia technologii wynoszą dziś około 6% w stosunku rocznym.”* Global technology improvement is about 6 % a year.
- Addition: a tiny "6 % per year" compounding toggle in the growth card (doubling about every 12 years).
- The lottery (10⁶ tickets, 1,000 prizes) is already built.

**IV-03 · Bomba megabitowa · l. 274, 282–284 · LEM-Q · BUILT (researchers vs discoveries) + extension**
- Discoveries double in 30 years and scientists in 10 (built). *„ten spadek krzywej wykładniczego wzrostu, oddalony od nas o trzydzieści do siedemdziesięciu lat”*: the S-bend lies 30–70 years ahead, after which growth becomes proportional to population.
- Extension: an "S-bend" overlay (OURS logistic, with an explicit ceiling) and Lem's 30–70-year window as an amber band. The UI states clearly that Lem gives no curve.

**IV-04 · Wielka gra · l. 292–295 · LEM-T · explanation**
- After the information crisis, civilisations specialise ("speciation") into social, biological and cosmic directions.
- Use: a branching-tree diagram. No numbers.

**IV-05 · Mity nauki · l. 307 · LEM-Q (riddle) · planned (0.1.39)**
- *„schemat urządzenia, złożonego z ośmiu bilionów elementów … w objętości ośmiu tysięcznych milimetra sześciennego”*: a riddle about a device of 8×10¹² parts with a 15×10⁹-part control unit (the body and brain), built from a plan of about 0.008 mm³ (the fertilised egg). Evolution needed over 2 billion years (l. 309).
- Interactive ⭐ "Guess the machine": reveal cards one by one (parts, controller, size of the plan), then the answer. A zoom shows how small 0.008 mm³ is (a grain of salt comparison, OURS).
- MODERN: the human body has about 3.7×10¹³ cells. Sourced.

**IV-06 · Wzmacniacz inteligencji · l. 316–317 · LEM-Q · planned (0.1.43, careful)**
- Ashby's intelligence amplifier. With the same multiplier as a machine gives a worker's strength, *„wykazałby iloraz inteligencji rzędu 10 000”* (it would show an IQ of about 10,000). Average IQ is 100–110, gifted 140–150, rare maximum 180–190. Example of the iron-filing protozoa steered by magnets (l. 317).
- Interactive: a "lever" toy. A child lifts a rock by hand and then with a lever (the strength multiplier). The same multiplier is shown applied to "thinking power" as **Lem's arithmetic**.
- Must have a MODERN note: IQ is a norm-referenced scale, so "IQ 10,000" is a figure of speech, not a measurable score. No rating of real people.

**IV-07 · Czarna skrzynka · l. 327–332 · LEM-T · planned (late)**
- The engineer builds twice (on paper, then in reality). A black box is regulated without being understood, and "cybernetic evolution" could take hundreds of thousands of years.
- Interactive ⭐ "Black box": a box with three knobs and one lamp. The child learns which knob settings keep the lamp green, without seeing inside. The rule is **OURS** (seeded in Ada).

**IV-08 · O moralności homeostatów / Niebezpieczeństwa elektrokracji · l. 339–350 · LEM-T · planned (late)**
- Stafford Beer's steel-works homeostat. A regulator reaching equilibrium "after many oscillations" (l. 349). Wiener's warning (l. 342).
- Interactive: a thermostat-like "keep the level steady" toy where the child sets reaction strength and delay, and the line oscillates or settles.
- Gains and delay are **OURS**, labelled. This was deferred before because Lem gives no dynamics.

**IV-09 · Duch w maszynie · l. 431–437 · LEM-Q / LEM-T · planned (0.1.42)**
- Turing's imitation game. The "gramophone" machine holding *„sto trylionów nagranych odpowiedzi”* (10²⁰ recorded answers), while a person never answers even 10¹² questions. A museum of 10,000 successive models: is no. 7852 conscious, or no. 9973?
- Interactive ⭐ (a) "Gramophone vs thinker": ask from a menu of questions, where the gramophone fails on an unseen one and a storage counter shows 10²⁰ answers against a library picture. (b) "Museum walk": slide along 10,000 machines. The caption asks "Where would *you* draw the line?" and records nothing.
- **No consciousness score.** Lem's numbers are only for storage scale.

**IV-10 · Kłopoty z informacją · l. 444–451 · LEM-T · explanation**
- *Hamlet* as a million physical copies of one Hamlet. Entropy measures information only at equilibrium.
- Use: copy-versus-information demo (copy a book 10⁶ times, information stays the same). It could be a tiny add-on to the choices card.

**IV-11 · Wątpliwości i antynomie · l. 462–468 · LEM-Q · planned (late)**
- Heuristics: the chess machine works *„mniej więcej milion razy szybciej”* (about a million times faster) yet a strong player beats it by seeing wholes. Cited: Taube, Uttley, Rosenblatt, Newell, Shaw, Simon, Tikhomirov.
- Interactive: "Brute force vs heuristic" on a tiny puzzle (for example 3×3 tic-tac-toe). Counters show positions examined by each strategy (OURS).
- MODERN: since 1997 chess engines beat world champions. Sourced note.

**IV-12 · 2 (end of chapter) · l. 480–487 · LEM-T · link only**
- Ashby's amplifier is a selector, while a scientist's work is not only selection. Wiener's danger of gradually losing oversight.
- Link to VII-04.

### Chapter V: Prolegomena wszechmocy (lines 491–622)

**V-01 · Przed chaosem · l. 503–504 · LEM-T (after Ashby) · planned (0.1.36)**
- *„Istnieją, dodajmy za Ashbym, dwa rodzaje maszyn.”* Two kinds of machine, after Ashby. A simple, determinate machine's next state follows from its state and input (pendulum, planet), while a living person needs a huge number of variables and only probabilities.
- Interactive ⭐ "Pendulum vs cat": both start, and the pendulum can be predicted (Ada integrates a simple ODE, OURS) while the cat's next move is a weighted dice roll.

**V-02 · Chaos i ład · l. 511 · LEM-Q · planned (0.1.36) (old backlog item 9)**
- *„Y zachodzi 40 razy na 100 … Z — 60 razy”*: after X in A, outcome Y happens 40 times in 100 and Z 60.
- Interactive ⭐ "Gumball machine": press X 100 times and balls fall into the Y and Z jars. The expected 40/60 line is amber and the actual seeded counts are blue.
- Acceptance as in the old item 9: expectations 40/60, and 0 %/100% gives 0/100.

**V-03 · Chaos i ład · l. 512 · LEM-T · planned (0.1.36)**
- *„dopiero milionowe naciśnięcie klawisza nr 1 zapala znowu lampkę T”*: a deterministic lamp sequence repeating only after a million presses looks chaotic to an observer who leaves too early.
- Interactive ⭐ "Secret pattern lamp": the child presses the big key and lamps light T, W, D, Q…
  - A "patience" slider sets how long you watch.
  - A "period" slider sets the hidden cycle length, from 4 to 10⁶.
  - When patience reaches the period, a "Repeat found!" banner appears.
- The **sequence generator is OURS** (seeded), and the principle is Lem's.

**V-04 · Chaos i ład · l. 517 · LEM-Q · planned (0.1.39)**
- *„każde ciało składa się z ok. 10²⁵ molekuł … minie około 15 bilionów lat”*. Predicting Smith, his young lady and the aunt molecule by molecule means 3×10²⁵ trajectories. Merely fixing their initial states takes about 15×10¹² years and they would never get through breakfast.
- Interactive ⭐ "Counting molecules": a big counter ticks while a "speed" slider (molecules per second) changes how long it would take, against the age of the Universe and a human lifetime bar. Lem's 15 trillion years is an amber mark, and Ada shows the rate it implies (about 6×10⁴ molecules per second).
- MODERN: a human body has roughly 10²⁷ atoms. Optional, sourced.

**V-05 · Chaos i ład · l. 521 · LEM-T · explanation**
- Celestial mechanics computes positions thousands and millions of years ahead. Link to V-01.

**V-06 · Modele i rzeczywistość · l. 579, 586–589 · LEM-T · planned (small)**
- Noise for one listener is information for another (Ashby's telephone crackle). *„Weźmy równanie 4+x = 7.”* The answer is already "inside" the equation.
- Interactive ⭐ "Hidden x": a balance scale with 4 + ☐ = 7. The child moves blocks until it balances. It is a gentle on-ramp for small children.
- The game is OURS, and Lem's example is exact.

**V-07 · Plagiaty i kreacje · l. 598 · LEM-Q · link to IV-05**
- The plan of a brain sits in about three thousandths of a millimetre of sperm head. Feeds the IV-05 and VII-06 comparison.

**V-08 · Obszar imitologii · l. 614–619 · LEM-Q · planned (0.1.39)**
- *„Auto składa się najwyżej z kilkunastu tysięcy części. Ameba — z milionów.”* A car has at most a few tens of thousands of parts, an amoeba millions, and for the amoeba every position matters. So spontaneous assembly of an amoeba is far less likely than of a car.
- Interactive ⭐ "Jigsaw by shaking": a box of puzzle pieces is shaken. A "number of pieces" slider (10 → 10,000 → 1,000,000) shows the expected shakes needed exploding. "Positions matter" can be switched on and off.
- The probability model is **OURS** (a toy). Lem gives only the part counts.

### Chapter VI: Fantomologia (lines 623–758)

**VI-01 · Podstawy fantomatyki · l. 629 · LEM-Q · explanation**
- Recording an experience would need *„kilkuset tysięcy takich zapisów naraz”* (several hundred thousand simultaneous recordings) from the sensory nerves.
- Use: a "how many wires" picture in VI-03.

**VI-02 · Fantomatyka obwodowa i centralna · l. 670–671 · LEM-Q · planned (late, sensitive)**
- Olds and Milner: rats with an implanted electrode pressed a lever *„do 8000 razy na godzinę, więc przeszło dwa razy na sekundę”* (up to 8,000 times an hour, more than twice a second) for 24 hours. Magoun: there are "reward" and "punishment" centres. Ashby's simple four-element homeostat needs no such subsystem, while Beer's complex ones do.
- Interactive: a calm counter showing "8,000 per hour = 2.2 per second", a tap-along metronome, and a homeostat diagram.
- **No animal-harm animation.** Content to be reviewed for children.

**VI-03 · Cerebromatyka · l. 702 · LEM-Q · explanation**
- According to Lorente de Nó there are no more than 10,000 major neuronal circuits in the cortex. Rebuilding needs "tens of millions of connections".
- Use: a dot comparison.

**VI-04 · Teletaksja i fantoplikacja · l. 715–716 · LEM-Q · BUILT (delay) + game planned (0.1.32) ⭐⭐**
- *„sygnał potrzebuje około sekundy, aby dotrzeć do naszego satelity”*: about a second to the Moon and the same back, so a remote "alter ego" can only be a few thousand, at most about fifteen thousand, kilometres from its operator. A thousand people at once could share a marathon runner's senses (fantoplication).
- Scientist link (Posłowie, l. 1158): Minsky's "telepresence".
- Already built: the signal-delay calculator.
- New ⭐⭐ "Drive the Moon robot": the child steers a rover with big arrow buttons. Every command arrives after the light-travel delay for the chosen place (Warsaw–London, a satellite, the Moon at 1.28 s, Mars).
  - The rover visibly overshoots a crater when the lag is large.
  - Lem's "few thousand to about 15,000 km" zone is shaded green, and Ada shows the implied round-trip delay (about 0.1 s at 15,000 km).
  - The game physics is OURS and the delay is Ada.

**VI-05 · Osobowość i informacja · l. 726–739 · LEM-T (cites Wiener) · planned (late)**
- *„Norbert Wiener pierwszy wypowiedział myśl o teoretycznej możliwości „przetelegrafowania” człowieka”*: Wiener's idea of "telegraphing" a person. A radio broadcast could create a million Smiths, which would be a million independent subjects.
- Interactive: a "copy machine" that sends one Smith and makes N copies, each walking off differently (seeded). The caption: "Each copy is a new person; the original goes home."
- No identity score.

**VI-06 · Osobowość i informacja (Smith no. 2) · l. 752 · LEM-Q · planned (0.1.39)**
- *„po dokonaniu 10²⁰ pojedynczych odczytań, zachodzących … z prędkością milionów na sekundę”*: a full atomic record of Smith needs 10²⁰ readings at millions per second.
- Interactive ⭐ "Scanning Smith": a "readings per second" slider plus a "number of scanner heads" slider. A progress bar shows the time, about 3 million years at 10⁶/s with one head, shrinking as the child adds heads.
- This is **our arithmetic on Lem's two numbers**. The UI notes Lem does not state the duration; with one scanner the time comes out in millions of years, which suggests massive parallelism is implied (see §4).

### Chapter VII: Stwarzanie światów (lines 759–952)

**VII-01 · Hodowla informacji · l. 772 · LEM-Q · planned (0.1.35) ⭐⭐**
- *„Przy pięciu zmiennych … w ciągu dwu godzin. Przy sześciu zmiennych … 30 000 takich maszyn … przez kilkadziesiąt lat.”* With five variables a computer at a million operations per second checks every combination in two hours. With six, it takes 30,000 such machines for decades.
- Interactive ⭐⭐ "Too many keys": a lock with N dials. The child adds a dial and watches the "tries needed" tower and the time explode (seconds, hours, years, ages of the Universe).
- Our grid model is kᴺ with k values per dial. **Lem's two data points are amber pins**, and Ada reports how many values per variable they imply (see §4: they don't fit a single simple grid).
- The source of the example is not named in the text; it is not attributed to anyone.

**VII-02 · Hodowla informacji · l. 776 · LEM-T · link only**
- Neutron chain reactions and bacteria on agar share the same exponential parameters, so one can model the other. Link to the growth core (IV-01, VIII-04).

**VII-03 · Hodowla informacji · l. 805, 811, 814, 817 · LEM-Q · planned (0.1.39)**
- The brain regulates hundreds or thousands of variables, but read text blocks it beyond *„jakiś dziesiątek bitów na sekundę”* (some tens of bits per second). A mature organism holds about 10²⁵ bits at the molecular level, which would need quadrillions of formulas. A sperm holds far more information per volume than a brain.
- Interactive ⭐ "Write the body down": at the reading rate of tens of bits per second, how long to read 10²⁵ bits? The answer is about 10¹⁶ years, against the Universe's age.
- This reuses throughput (VIII-02) and is Lem's numbers with our division.

**VII-04 · Jak odbywa się ewolucyjne krążenie informacji? · l. 836–837 · LEM-Q · BUILT (choices)**
- A 1/100 sentence versus vocabulary-sized sets. Lem notes "information is a logarithm".
- Already built.

**VII-05 · same subsection · l. 844, 850–853 · LEM-Q / LEM-T (Ashby) · planned (0.1.38) ⭐**
- *„dwumian Newtona może zostać „nadany” alfabetem Morse’a przez motylka … za sprawą czystego przypadku”*: random processes (a butterfly, gas molecules) "transmit" the binomial theorem in a dozen-odd binary symbols hundreds of thousands of times a second. Ashby: ideas are nothing, selection is everything. Lem: mathematicians are a variety generator and empiricists the selector.
- Interactive ⭐ "Noise machine + sieve": a coin-flip stream scrolls past, the child sets a target pattern length (5–20 bits), and a sieve lights up each time the pattern appears. The counter shows expected waiting time as 2ᴸ.
- Ashby's own calculation (l. 850, "Ashby podaje odpowiednie obliczenie") is **not reproduced** unless sourced from *Design for a Brain*. Our version is the simple 2ᴸ illustration.

**VII-06 · same subsection · l. 833–835 · LEM-T (Schmalhausen) · explanation**
- Schmalhausen: the adult organism holds no more information than the genotype, and the apparent increase is regulation. Diagram only.

**VII-07 · same subsection · l. 860–863 · LEM-Q · explanation**
- Information "farming": several trillion seed molecules, 700 million elementary phenomena. Use: a dot-scale picture only.

**VII-08 · Inżynieria językowa · l. 879–898 · LEM-T · explanation**
- Formal versus natural languages. Brian Goodwin's oscillators (l. 891). Our species branched off "less than three-quarters of a million years ago" (l. 892), which feeds VIII-01.

**VII-09 · Inżynieria transcendencji · l. 911–923 · LEM-T · explanation**
- Constructors building a "world with an afterlife". Philosophical only, with no numbers. Diagram.

**VII-10 · Inżynieria kosmogoniczna · l. 934–938 · LEM-Q / LEM-T · planned (0.1.44)**
- Stars last at most "kilkunastu miliardów lat" (well over ten billion years). A pulsating cosmos with phases of about 20 billion years. *„ilość energii wzrasta nieskończenie, a i tak świetlnej chyżości obiekt … nie osiągnie”*: pushing a body toward light speed takes ever more energy and never reaches c.
- Interactive ⭐ "Push to light speed": the child presses "Push!" repeatedly. Each push adds the same energy, the speedometer creeps closer to c but never reaches it, and the energy bar explodes. Ada computes γ (standard physics, OURS).

**VII-11 · Inżynieria kosmogoniczna · l. 947–950 · LEM-T · planned (late)**
- Nested enclosed worlds, where "civilisation no. 100,000" cannot settle on an atom. "One in every million galaxies".
- Interactive: a "Russian-doll worlds" zoom. Each world is 1/k the size of its parent, and the child sees how few levels fit before the atomic scale (k is OURS).

### Chapter VIII: Paszkwil na ewolucję (lines 953–1143)

**VIII-01 · Konstrukcja życia · l. 990–991 · LEM-Q · planned (0.1.34) ⭐⭐**
- *„90 procent całego czasu ewolucji upłynęło, nim powstały pierwsze kręgowce”*. Lem's dating of life's history: under a century ago Earth's age was put at 40 My, now at least 4 billion years. The oldest organic remains are 2.7 billion years. Vertebrates appeared over 350 My ago and land 150 My later. Mammals are 50 My old, humans 1 My. Life stayed in the oceans for over 2.5 billion years, and about 500 Cambrian species are known.
- Interactive ⭐⭐ "Lem's calendar of life": the whole history is squeezed into one year (or one football pitch). The child drags a time-traveller along it, and events pop up as pictures. "Humans" arrives in the last few hours of 31 December.
- Lem's dates are amber and the modern dates sit on a green toggle.
- MODERN: Earth is about 4.54 Gyr old, the earliest life evidence about 3.5–3.7 Gyr, vertebrates about 520 My, mammals about 200 My (placental radiation about 66 My), *Homo sapiens* about 300 ky. All sourced.

**VIII-02 · Konstrukcja życia · l. 995 · LEM-Q · BUILT (throughput) + extension (0.1.40)**
- *„pałeczka (bakteria) okrężnicy, dzieli się co 20 minut”*: E. coli divides every 20 minutes. It makes about 1,000 protein molecules per second of about 1,000 amino acids each, and at least 1,000 bits per second. A human manages about 25 bits per second, and a page holds about 10,000 bits. A large computer took 30 hours to optimise a model cell.
- Already built: bits and rates.
- Extension ⭐ "Bacteria party": one bacterium doubles every 20 minutes. After 1 h there are 8, after 10 h about a billion. A "food runs out" switch is our resource-limit illustration (the old deferred item).

**VIII-03 · Konstrukcja życia · l. 1008–1009 · LEM-Q · planned (0.1.41)**
- *„lampy katodowe, były milion razy większe od neuronu”*: cryotrons almost match a nerve cell in size, while ten years earlier vacuum tubes were a million times bigger, and they are faster. Life works only in a window of about 40–50 °C, not below freezing.
- Interactive ⭐ "Shrink the switch": a slider from tube to cryotron to neuron (with a modern transistor on the MODERN toggle). Also a thermometer showing life's narrow band against the range of machines.

**VIII-04 · Konstrukcja śmierci · l. 1020–1022 · LEM-Q · planned (0.1.34)**
- Haldane's late-acting lethal-gene hypothesis, which Lem doubts. The longest-lived organisms are sequoias, *„(5–6000 lat)”*.
- Use: in the "lifetime ladder" (VIII-08).
- MODERN: the oldest known individual trees are about 4,800-year-old bristlecone pines (sourced). Giant sequoias reach about 3,000+ years.

**VIII-05 · Konstrukcja świadomości · l. 1034–1036 · LEM-T · explanation**
- 8×10¹² cells, each with hundreds of sensing enzymes. Hypothetical parameters A–D for consciousness. Lem explicitly uses invented values (3, 4, 7, 2), so **this is not to be turned into a score**. Explanation only.

**VIII-06 · Oczami konstruktora (objections 1–8) · l. 1071 · LEM-Q (Dancoff) · planned (late)**
- *„Ewolucja utrzymuje nadmiar przesyłanej genotypowo informacji na możliwie najniższym poziomie”*: Dancoff's principle, minimal redundancy. Evolution is like a constructor content if most of its cars reach the finish.
- Interactive ⭐ "Car rally": the child sets "spare parts" (redundancy) and 100 toy cars drive. With more spares more finish, but each costs more. Our toy model shows the trade-off.
- Lem's sensitive statistic of 250,000 children born yearly with serious hereditary defects is explanation only, phrased gently and not part of the game.

**VIII-07 · Oczami konstruktora · l. 1078, 1087, 1091 · LEM-Q · planned (0.1.41)**
- *„różnicę temperatur rzędu 0,001 stopnia … 0,01 mikrowolta na milimetr”*: a pit viper senses 0.001° differences and electric fish 0.01 µV/mm. Moths hear bat sonar. Vertebrates appeared 360 My ago (l. 1091). A coincidence of blind mutations can be awaited "a billion years in vain" (l. 1078).
- Interactive ⭐ "Super senses": the child turns a "difference" dial down and sees which animal still notices (human vs snake vs fish). Uses picture scales.
- MODERN: pit-viper sensitivity is reported at about 0.003 °C (verify).

**VIII-08 · Rekonstrukcja człowieka · l. 1109–1112 · LEM-Q · planned (0.1.34) ⭐**
- *„Najdłuższe jest trwanie indywidualne galaktyk (kilkanaście miliardów lat), kolejno idą gwiazdy (około 10 miliardów)”*. Lem's ladder of lifetimes: galaxies (over ten billion years), stars (about 10 billion), biological evolution (4–6 billion), geological epochs (150–50 My), sequoia (about 6,000 years), human (about 70 years), mayfly, bacterium (about 15 minutes), virus, mesons (millionths of a second). Claims of 140–160-year lifespans are dismissed. The realistic ceiling for longevity is the sequoia, about 6,000 years.
- Interactive ⭐ "Ladder of lifetimes": a vertical log ladder where the child drags a creature icon and the ladder zooms. An "if you lived as long as…" button shows how many human lifetimes fit.
- Ada only does the log scale and ratios. Values are Lem's, with MODERN toggles.
- Internal note: the bacterium is "15 min" here and "20 min" at l. 995. Both are Lem's, shown as given.

**VIII-09 · Maszyna autoewolucyjna · l. 1126–1127 · LEM-Q · explanation only**
- US marriages break up "w 50 procentach do 5 lat" (50 % within 5 years), and "matrimonial machines". **Not for a child interactive.** Explanation only.

**VIII-10 · Zjawiska pozazmysłowe · l. 1133–1141 · LEM-Q / LEM-T · planned (0.1.33) ⭐⭐**
- *„w przypadkach telepatii używa się najczęściej tak zwanych kart Zenera”*: Rhine and Soal's ESP experiments with Zener cards and dice machines, criticised by Spencer-Brown, whose arguments convince Lem. Lem's argument: if evolution over 2–3 billion years did not amplify the effect beyond barely detectable, it has no future. For psychokinesis, a sensitive Einthoven string galvanometer would beat statistics, since the force needed is *„kilkanaście tysięcy razy mniejszej”* (some ten thousand times smaller) than for turning a die.
- Scientists: Rhine, Soal, Spencer-Brown, Zener (eponym), Einthoven (eponym).
- Interactive ⭐⭐ "Guess the card":
  - Five big Zener symbols (circle, cross, waves, square, star).
  - The child guesses 25 cards and the score bar fills. The chance-level line is at 5 of 25.
  - "Let the computer guess 1,000 times" shows a bell curve of pure luck, and the child's score is placed on it.
  - The caption shows how often luck alone gives 8 or more of 25.
- Ada computes binomial probabilities, and Ada's seeded PRNG shuffles the deck.
- MODERN: the modern consensus is that ESP is not demonstrated, which agrees with Lem's scepticism. Sourced.

### Zakończenie (lines 1144–1152)

**Z-01 · l. 1148 · LEM-T · explanation**
- *„Efektywność … „urządzeń dziedziczności”, mierzona ilością bitów w jednostce czasu na atom nośnika”*: heredity's efficiency in bits per time per carrier atom makes it worth imitating.
- Use: a closing summary card linking VIII-02, VII-03 and IV-05.

### Posłowie: Dwadzieścia lat później (lines 1153–1184)

**P-01 · I · l. 1158 · LEM-T · link**
- Minsky's "telepresence" equals Lem's teletaxy (link to VI-04). Dawkins is also mentioned.

**P-02 · I · l. 1161–1163 · LEM-Q (after Marochnik) · planned (0.1.45)**
- *„Obwód korotacyjnego okręgu wynosi 215 000 lat świetlnych”*: the Sun sits near the galactic corotation circle (radius about 10.5 kpc = 34,000 ly). The pre-solar cloud crossed a spiral arm about 4.9 Gyr ago and spent over 300 My inside. Supernovae near a given star happen every few tens of millions of years.
- Galaxy: 150 billion stars, two-thirds (100 billion) in the arms. 1/100,000 of the stars (1 million) are in the corotation torus, giving an average spacing of 5 ly. If 1 in 100 qualifies, that leaves 10,000 at about 500 ly.
- Interactive ⭐ "The quiet ring": a galaxy where the arms rotate at a different speed from stars on the corotation ring. The child speeds time and sees stars on the ring stay out of the arms ("quiet"). A slider "1 in how many stars is suitable?" moves the dots, with Lem's 5 ly and 500 ly as amber pins.
- The rotation animation is OURS. The spacing computation must **show Lem's figures as stated** next to our declared torus geometry (see §4: a plain 1-D division gives different numbers).

**P-03 · I · l. 1163 · LEM-Q · link**
- Nearly certain that no star within about 50 ly is such a system. This is an amber ring in III-05.

**P-04 · II · l. 1171–1172 · LEM-T (Eigen, Prigogine) · planned (0.1.45)**
- *„Jest to trochę jak na loterii liczbowej … gdy natomiast graczy są setki tysięcy, szansę trafienia rosną.”* Self-organisation far from equilibrium. Hypercycles need ocean-scale, multi-million-year statistics, like a lottery where hundreds of thousands of players raise the odds. The code "multiplied into hundreds of millions of players".
- Interactive: reuse "Ten sixes" (III-11) with a "chemistry" skin (molecules instead of dice). The same Ada core is reused.

**P-05 · II · l. 1174 · LEM-Q · planned (with VIII-01)**
- About a billion years from the code's beginnings to prokaryote radiations, then "only" hundreds of millions for armoured fish, amphibians and insects. Adds to the calendar of life.

**P-06 · II · l. 1178 · LEM-T · planned (late)**
- Evolution of codes as chess whose rules change during the game.
- Interactive ⭐ "Chess with changing rules": a tiny board where every few moves a new rule card flips (OURS rules), as a playful explanation. Low priority.

---

## 3. Step-by-step implementation plan (one increment ≈ one release)

Order: **Chapter III first**, since Robert asked for the scientists' calculations "for that section", followed by the most child-friendly, data-rich items across the book. Each increment needs Robert's OK before it starts. Every increment inherits the §1.4 invariants: Ada computes, JS renders, native, Node/Wasm and browser tests under both MIME types, 320 px, five locales, Debug button and F9 kept, chapter-only view, credits, MODERN notes, githack preview, no merge.

| Release | Increment | Items | Specific acceptance tests (in addition to §1.4) |
|---|---|---|---|
| **0.1.24** | **Blinking galaxy**: civilisation density and spacing (Bracewell, von Hoerner) | III-05 (+P-03 ring) | N(6,523 y) ≈ 434.87; L=0 → 0; L ≥ T saturates at 10⁹; Lem's 10 / 50 / 1,000 ly shown as pins, not forced; auto-demo sweeps L; modern-f toggle sourced. |
| **0.1.25** | **Galaxy player**: 20-second sweep, Play/Pause, Restart, speed, slider from 100 years to 15 billion years, lights follow the slider | III-05 | Moving the slider changes the drawn lit-dot count; Play/Pause toggles; Calm and reduced motion start paused; N(6,523) remains 434.87. |
| **0.1.26** | **Equal dots**: one radius for quiet and awake stars, a soft glow, and seeded spacing so the inner ring does not clump | III-05 | At full lifetime no two drawn dots overlap; awake dots stay the quiet-dot radius; N(6,523) remains 434.87. |
| **0.1.27** | **Ten sixes and 3 million eggs** (Baumsztejn) plus a reusable "many tries" Ada core | III-11 | p₁ = 6⁻¹⁰ ≈ 1.6538×10⁻⁸; n = 10⁹ → ≈ 0.9999999343 (compute with log1p/expm1, test underflow); seeded rolls reproducible; Lem's objection (l. 201) shown in "What Lem says". |
| **0.1.28** | **Can we hear them?** (Drake, Cocconi, Morrison) plus a "Letter to the stars" add-on to delay | III-04, III-06b, III-01 | 10 ly at reference power; 100× distance → 10,000× power; 1,000 ly → 2,000-y round trip (reuses delay core); antenna MODERN note. |
| **0.1.29** | **Energy staircase**: Dyson sphere, Kardashev types, Shklovsky's 10²¹ stars | III-03, III-16, III-15, III-02 | (1.00333…)^2500 ≈ 4.1×10³ is shown beside Lem's stated 10¹⁰ with neutral wording; rate for 10¹⁰ ≈ 0.925 %/yr; Kardashev units note (erg/s vs "roczne"); Sun 4×10³³ erg/s. |
| **0.1.30** | **The stubborn thousand and the spreading colony** (von Hoerner 65:35, Shklovsky avalanche) | III-08, III-07, III-14 | 990 M / 1 B short-lived; survivor choices 10⁵ / 10³ / 1 drive coexisting count via the 0.1.24 core; spread rules labelled OURS; histogram people vs civilisations. |
| **0.1.31** | **Racing rocket rainbow**: Doppler shift on the existing spectrum strip (Shklovsky, Doppler) | III-10 | v=0 → no shift; relativistic factor √((1+β)/(1−β)) verified against fixtures; lines leaving the strip are labelled "now radio"; reuses spectrum Ada core. |
| **0.1.32** | **Drive the Moon robot** (teletaxy; Minsky link) | VI-04, P-01 | Moon round trip ≈ 2.56 s from the mean distance (labelled); 15,000 km → ≈ 0.1 s; commands queued in Ada with a deterministic tick; keyboard arrows work; calm mode steps. |
| **0.1.33** | **Guess the card**: ESP and chance (Rhine, Soal, Spencer-Brown, Zener) | VIII-10 | Binomial(25, 0.2): P(X ≥ 8) ≈ 0.1091; mean 5; 1,000-run seeded histogram reproducible; sceptical framing matches Lem. |
| **0.1.34** | **Lem's calendar of life and the ladder of lifetimes** | VIII-01, VIII-08, VIII-04, II-03, II-06, P-05, I-02 | 1 My on a 4 Gyr year ≈ 2 h 11 min (one-year compression); Lem vs modern toggles; log ladder ordered; all dates carry line locators. |
| **0.1.35** | **Too many keys**: combinatorial explosion | VII-01 | kᴺ fixtures; Lem's 2 h at 10⁶ ops/s ⇒ 7.2×10⁹ checks pinned; the inconsistency with the six-variable figure is shown in a neutral "the numbers imply…" note. |
| **0.1.36** | **Ashby's two machines**: pendulum vs cat, 40/60 gumball machine, secret-pattern lamp | V-01, V-02, V-03 | Expected 40/60; 0/100 edge case; lamp repeat found exactly at period p; seeded; ODE step error within tolerance. |
| **0.1.37** | **Everyone a scientist?** plus the 6 % improvement rate and Lem's 30–70-year S-bend band | IV-01, IV-02, IV-03 | 100,000 × 2^(t/15) reaches 10⁶ at t ≈ 49.8 y; logistic overlay labelled OURS with an explicit ceiling; 6 %/yr doubles in ≈ 11.9 y. |
| **0.1.38** | **Noise machine and sieve** (Ashby generator/selector) | VII-05, IV-12 | Expected wait 2ᴸ for a fixed L-bit pattern (non-overlapping simplification stated); seeded stream; Ashby's own figure not reproduced. |
| **0.1.39** | **How long would it take?** big-number machine: Smith's breakfast, scanning Smith, writing the body, the "riddle machine", car vs amoeba | V-04, VI-06, VII-03, IV-05, V-08, V-07 | 3×10²⁵ / (15×10¹² y) ≈ 6.3×10⁴ s⁻¹ implied rate; 10²⁰ / 10⁶ s⁻¹ ≈ 3.17 My; 10²⁵ bits / 25 bit/s; all duration results shown as our arithmetic. |
| **0.1.40** | **Bacteria party** (extends throughput) | VIII-02 | 2^(t/20 min): 1 h → 8; 10 h → 2³⁰ ≈ 1.07×10⁹; resource-limit switch labelled OURS. |
| **0.1.41** | **Super senses, shrinking switch, life's thermometer** | VIII-07, VIII-03, III-13 | Lem's values are amber, modern values green and sourced; pictograms 700k : 80k insects : vertebrates. |
| **0.1.42** | **Gramophone vs thinker, museum walk** (Turing) | IV-09, IV-10 | 10²⁰ vs 10¹² shown as a storage picture; nothing is recorded or scored; wording reviewed for children. |
| **0.1.43** | **Lever and thinking amplifier** (Ashby) with an IQ caveat | IV-06 | 100 × 100 = 10,000 shown as Lem's arithmetic; mandatory MODERN note; no person-scoring UI. |
| **0.1.44** | **Push to light speed and Russian-doll worlds** | VII-10, VII-11 | γ fixtures (β=0.6 → 1.25; 0.8 → 1.6667); v never reaches c; doll levels from a declared k. |
| **0.1.45** | **The quiet ring** (Marochnik corotation) and **hypercycle lottery** (Eigen, Prigogine) | P-02, P-04 | 2π·34,000 ≈ 213,600 ≈ Lem's 215,000 ly; Lem's 5 / 500 ly pinned beside our declared torus geometry; lottery reuses the 0.1.27 core. |
| **0.1.46** | **Two Evolutions playground**: rise and fall, blind draws, wind-tunnel game | II-01, II-02, II-04 | Curves and drag rule labelled OURS; draw expectation = alphabet^length fixture. |
| **0.1.47** | **Remaining small interactives**: forecast checker, black box, steady-level regulator, Dancoff rally, hidden-x balance, Supernova meter, chess with changing rules, Moon-mass fuel tank | I-01, IV-07, IV-08, VIII-06, V-06, III-12, P-06, III-17 | Each may be split into its own release if too large; all toy rules labelled OURS. |

After 0.1.47, the explanation-led completion covers every remaining subsection: diagrams only for LEM-T items without numbers (III-18, IV-04, VI-01, VI-03, VI-05, VII-06…VII-09, VIII-05, VIII-09, Z-01). The old backlog's "conditional outcomes" sits in 0.1.36 and "coexisting population" in 0.1.24.

---

## 4. Doubts about the source (resolve before or while implementing)

1. **Transcription damage in numbers.** Superscripts are flattened (10³³ → "1033", 10²¹ → "l021", 10²⁵ → "1025", 10²⁰ → "l020"), and "l" sometimes stands for "1". Each exponent used in a calculator has to be confirmed against an edition.
2. **Apollo cost (l. 118–119):** "2 miliardów" and "nie 20, lecz 2 miliardów" are inconsistent; likely 20 and 200 billion dollars. No numbers until checked.
3. **Energy growth (l. 159):** 1/3 % a year for 2,500 years gives about 4,100×, not 10¹⁰. About 0.93 %/yr would match, and so would "one ten-thousandth of solar power". Possibly a transcription error or an error in the original. Show both values without asserting either.
4. **Kardashev units (l. 244):** the text says "roczne" (annual), but Kardashev's classes are power (erg/s). It may be Lem's or the transcriber's wording.
5. **Combinatorial example (l. 772):** two hours for five variables versus 30,000 machines for decades for six implies a jump of about 10⁹, which no simple kᴺ grid with the same k gives. Lem names no source, so present it as Lem's figures plus our model, attributed to no one.
6. **Afterword spacing (l. 1163):** 215,000 ly / 1,000,000 stars is about 0.2 ly in 1-D, yet Lem gives 5 ly. Going to 1 in 100 stars he multiplies spacing by 100 (5 → 500 ly), which matches neither 1-D (×100 would come from 0.2 → 21.5) nor 3-D (×4.6). The geometry is unspecified, so pin his figures and don't force a fit.
7. **Von Hoerner–Lem spacing figures** (10 / 50 / 1,000 ly) depend on a geometry Lem doesn't give, so they remain pins and are not test targets.
8. **"Baumsztejn" (l. 199)** isn't resolved in `data/scientists.tsv` (it shows as `None` at l. 199). Identity and Wikipedia link need checking (possibly A. I. Baumshtein, a Soviet author); until then, no link.
9. **Heading detection:** several short lines are sentences, not headings (l. 611, 620, 655, 734, 775, 782, 910, 918, 921, 1069, 1110). L. 823, "Jak odbywa się ewolucyjne krążenie informacji?", and l. 1069 (the eight objections) may be sub-headings or just paragraph openers. The hypothesis blocks I–III (about l. 215–225) are paragraph-length headings. The current catalogue places the choices calculator under "Cultivating Information", which is consistent if l. 823 is not a separate section.
10. **Internal inconsistencies kept as Lem's:** bacterium 15 min (l. 1111) vs 20 min (l. 995); sequoia "5–6000" vs "about 6000"; vertebrates 350 My (l. 990) vs 360 My (l. 1091).
11. **Polish "bilion" etc.:** "osiem bilionów" = 8×10¹², "sto trylionów" = 10²⁰, "15 bilionów lat" = 1.5×10¹³ years. The locale strings need a test so en/de/es/fr never say "billion" for "bilion".
12. **Edition and dating:** the main text dates from 1964/1966 ("w roku 1966*", l. 243; "Kraków, w sierpniu 1966", l. 1150), and the afterword from 1982 with Marochnik 1982. Captions should say "in 1966" so children aren't misled about "now" or "today".
13. **Reported versus computed:** von Hoerner's 12,000-year first-contact age and the 0.5 % figure are reported results whose method Lem omits. Show them as quoted, not recomputed.

---

## 5. Item counts (for the summary)

| Chapter | Items | Lem-Q (own numbers) | Built |
|---|---:|---:|---:|
| I Dylematy | 3 | 1 | 0 |
| II Dwie ewolucje | 6 | 4 | 0 |
| III Cywilizacje kosmiczne | 18 | 15 | 2 (lifetime, spectrum) + delay reuse |
| IV Intelektronika | 12 | 7 | 3 (growth, lottery, researchers) |
| V Prolegomena wszechmocy | 8 | 4 | 0 |
| VI Fantomologia | 6 | 5 | 1 (delay) |
| VII Stwarzanie światów | 11 | 6 | 1 (choices) |
| VIII Paszkwil na ewolucję | 10 | 9 | 1 (throughput) |
| Zakończenie | 1 | 0 | 0 |
| Posłowie | 6 | 3 | 0 |
| **Total** | **81** | **54** | **8 calculators/visuals** |

"Lem-Q" counts items tagged LEM-Q, including mixed LEM-Q/LEM-T items. The 0.1.23 report's "six calculators" is a miscount: there are seven calculators plus the spectrum visual.

## 6. Print-check decisions (Robert, 15 Nov 2026)
- Exponents confirmed in print: 4×10³³ erg/s (Sun), 10²¹ stars, ~10¹⁰ galaxies × 10¹⁰–10¹¹ stars, Kardashev 4×10¹⁹ / 4×10³³ / 4×10⁴⁴ erg, chess 10⁹⁹, 10²⁵ molecules, 10²⁰ readings. 10²⁵ bits (VII) not found in print; use e-text value, marked unchecked.
- Kardashev: print says "per year"; app shows per second (physics), with a collapsed note that Lem wrote per year.
- Apollo (II, Pierwsza przyczyna): 20 billion USD; "not 20 but 200 billion".
- Energy growth (III, Sformułowanie metody): print confirms 1/3 % a year. Use best judgment: show the ten-billion-times endpoint (consistent with 1/10,000 of solar power in 4500), i.e. ≈0.93 %/yr, with a note that 1/3 % gives only ≈4,100×.
- Number words: Polish/German Billion = 10¹² = English trillion. "Begaton" explained as Lem's coined term (10⁹ t TNT). Device in IV "Mity nauki": use e-text 8×10¹² elements (print not found). Smith drawing: 15×10¹² years.
- Five/six variables (VII): confirmed in print.
- Marochnik spacings and Baumsztejn spelling: not checked in print; use e-text, Baumsztejn unlinked.

