# Ada Technological Horizons — design proposal

**Plan status (8 November 2026).** Release 0.1.2 added the four-fate weighted mean and the dark opening. Release 0.1.3 shows that mean to the nearest 100 years and, when one probability is edited, rebalances the other three in Ada. Release 0.1.4 adds queue item 3, scientific-information growth, under Intellectronics / Return to Earth. Release 0.1.5 keeps that exponential and adds a presentation calendar (default year 2026, whole years from -10000 to 10000), a 15-year baseline on the same axes, a linear/logarithmic display switch, and an illustrative target year computed in Ada. Release 0.1.6 extends both curves through a reachable target, while the reported quantity stays at the visitor's elapsed time. Release 0.1.7 adds queue item 4, light-time for a fixed distance, under Phantomology / Teletaxy and Phantomultiplication. Release 0.1.8 numbers the timeline legs and adds Sun, Venus, Europa, Titan and Proxima Centauri examples. Release 0.1.9 shows cumulative time in the event list and keeps the one-way duration on each leg. Release 0.1.10 adds queue item 5, constant-rate information under A Lampoon of Evolution / Constructing Life, using only the historical page, human, and bacterial figures. Release 0.1.11 shows only the selected chapter, section, or catalogue match, and keeps Technical details closed until the button or F9 opens it. Release 0.1.12 shows historical information rates on a linear chart and a separate nominal 1000BASE-T line rate. Release 0.1.13 follows the chosen rate in that chart and saves a local debug report. Release 0.1.14 gives the human, bacterial, line-rate and historical choices different charts. Release 0.1.15 plots those choices as information transmitted against time. Release 0.1.16 names the plotted curves, the target line and the crossing dot in a legend. The approved starting quantity is nonnegative, including zero; the factor remains 2^(t/d). Items 6–19, including the researcher/discoveries comparison, logistic or resource limits, spacing, contact and recurrence, are not implemented. The sections that follow remain the original design proposal.


**Design for review · 8 November 2026 (Europe/Berlin)**

## 1. Purpose

Create a public, chapter-led companion to Stanisław Lem’s *Summa technologiae*, exploring the whole book through explanations, diagrams and, where justified, interactive calculations or explicitly exploratory simulations. The book’s structure determines navigation; the implementation queue prioritises defensible calculators before explanation-led completion. Cosmic civilisation lifetimes are important, but form one bounded section rather than the organising principle of the repository.

Keep calculation and model logic in **plain Ada** as far as practical. Deliver a browser experience from a public GitHub repository, with a live raw.githack.com link. HTML/CSS provide the interface; minimal JavaScript loads WebAssembly, handles browser events and renders Ada results. No backend is planned. SPARK is not required.

The first two increments are the scaffold and an editable historical civilisation-duration calculator. The ambition is whole-book coverage, not to force every philosophical argument into an equation. A good explanatory diagram is preferable to a numerical model whose assumptions the book does not justify.

### Identity and rights boundary

**Display name: Ada Technological Horizons. Repository slug: `ada-technological-horizons`.** The name and public GitHub direction are agreed; repository creation, availability and trademark clearance have not been verified. Proposed README/About opening:

> An independent interactive exploration inspired by Stanisław Lem’s Summa Technologiae.

Follow with: “This is an original educational project, not an official edition or an endorsed adaptation.” Attribution and a distinct name do not confer copyright permission or eliminate legal risk. Use original explanations, diagrams and code; exclude complete book text, scans and long extracts. Review any short quotations and third-party assets separately. Select a code licence without implying it licenses Lem’s writing or other third-party material.

## 2. Navigation follows the book

Use eight chapter pages with section navigation, Previous/Next links and a persistent chapter index. UK English is the default. Titles and navigation may be translated, while stable language-neutral identifiers use English slugs (for example, `cosmic-civilisations/civilisation-statistics`) and do not change with language. The following hierarchy follows the actual headings in the available text, translated here for clarity; these are working translations, not claimed canonical titles from a published English edition. No separate contents page was recovered: the structure was verified against the body. Edition review may refine wording without silently breaking published URLs.

1. **Dilemmas.** Three numbered parts (1–3).
2. **Two Evolutions.** Introduction; Similarities; Differences (1–4); The First Cause; A Few Naïve Questions.
3. **Cosmic Civilisations.** Formulating the Problem; Formulating the Method; Statistics of Cosmic Civilisations; Cosmic Catastrophism; A Metatheory of Miracles; Human Uniqueness; Intelligence: Chance or Necessity?; Hypotheses; A Dissenting Opinion; Prospects.
4. **Intellectronics.** Return to Earth; The Megabit Bomb; The Great Game; Myths of Science; The Intelligence Amplifier; The Black Box; On the Morality of Homeostats; The Dangers of Electrocracy; Cybernetics and Sociology; Faith and Information; Experimental Metaphysics; The Beliefs of Electronic Brains; The Ghost in the Machine; Troubles with Information; Doubts and Antinomies (1–2).
5. **Prolegomena to Omnipotence.** Before Chaos; Chaos and Order; Scylla and Charybdis, or On Moderation; The Constructor’s Silence; Madness with a Method; A New Linnaeus, or On Classification; Models and Reality; Plagiarisms and Creations; The Domain of Imitology.
6. **Phantomology.** The Foundations of Phantomatics; The Phantomatic Machine; Peripheral and Central Phantomatics; The Limits of Phantomatics; Cerebromatics; Teletaxy and Phantomultiplication; Personality and Information.
7. **Creating Worlds.** Introduction; Cultivating Information; Linguistic Engineering; Transcendence Engineering; Cosmogonic Engineering.
8. **A Lampoon of Evolution.** Introduction; Reconstructing the Species; Constructing Life; Constructing Death; Constructing Consciousness; Constructions Based on Errors; Bionics and Biocybernetics; Through the Constructor’s Eyes; Reconstructing the Human Being; Cyborgisation; The Autoevolutionary Machine; Extrasensory Phenomena.

Follow with **Conclusion** and **Afterword: Twenty Years Later** (parts I–II). Their placement should preserve the distinction between the main argument and retrospective commentary.

Every section eventually receives an intelligible entry, but not necessarily a calculator. Show coverage honestly: explanation available, model available, exploratory experiment, or planned. An unimplemented section must not masquerade as a completed interactive module.

## 3. Product mechanics adapted from KDP Desk

Adapt KDP Desk’s mature mechanics: numbered bounded plans, review before building, independent specification checks, real-user feedback and identifiable reproducible releases. Protect curated examples from generated/stress-test data; report unknowns instead of guessing. A compact diagnostic panel can show release/module/runtime identity without collecting private data.

This is public browser software, not a Project Wealth organiser: local filesystem, publishing-account and mailbox operations do not transfer. No secrets in assets or server-side Ada execution on static hosting.

## 4. What a section contains

Each section begins with the question Lem is examining, a concise explanation and its relationship to surrounding sections. Then choose the appropriate treatment:

- **Explanation/diagram:** arguments, alternatives, feedback loops or comparisons without fabricated numerical precision.
- **Historical calculation:** the reported values and assumptions, distinguished from a reproduced derivation.
- **Reconstruction:** an independently justified model with visible equations, units, parameter meanings and limitations.
- **Exploratory simulation:** our deliberately simplified experiment, clearly not Lem’s own calculation or an empirical prediction.

Calculators open with an example and immediate result. Valid edits recalculate; Reset restores the complete example and assumptions. Reject empty, non-finite, out-of-domain or mutually inconsistent inputs with useful messages. Name units on both controls and axes. Explain percentage/probability conversions. Separate numerical precision from uncertainty in assumptions.

Provide text/table alternatives to graphics, keyboard operation, visible focus, responsive layouts and reduced-motion behaviour. Proposed language set, matching the reference: English (`en-GB`, default), German (`de`), Spanish (`es`) and French (`fr`), pending confirmation of this exact set. The source text’s language does not require Polish support. Use a clearly labelled, keyboard-accessible language selector; flags may supplement language names, not replace them. Translate explanations, chapter/section labels, controls, notes, chart alternatives, validation and About text. Store language separately from numerical state; switching language preserves values, units, selections and results. Reset restores model defaults without changing language or catalogue filters. Locale-aware parsing/formatting must be unambiguous; Ada receives canonical numeric values and returns locale-independent results/status codes. Missing translations must be detected, not silently presented as complete.

### Catalogue mechanics

Adapt the reference’s subject tiles into chapter tiles and its topic chips into section/topic filters. Retain collapsible headings and Open all/Close all, example-filled cards, live results and reset. Its documentation establishes these mechanics, but does **not** establish arbitrary sorting or search: the following are proposed additions for our catalogue.

Default order is book reading order. Offer **Calculators first** (within equal types, book order), **Topic** (a curated translated topic grouping, then book order) and **Title** (locale-aware, stable ID tie-break). Filter by chapter, topic and availability/type (calculator, explanation, exploratory or planned); combine selected categories with AND, multiple choices within a category with OR. Search translated titles, summaries and topic labels; trim input and ignore case. Show result count, active filters, no-results guidance and Clear filters returning to reading order. Planned entries are visibly non-operational, not counted as working calculators. Preserve model state when filtering/collapsing, rather than resetting or dropping edits. UI ordering never renumbers implementation items or alters canonical chapter navigation.

Use original visual styling. Do not automatically import the reference’s Lorenz splash, Sanskrit rain, sound design or subject taxonomy. Saved mute and reduced-motion mechanics transfer if such features are later approved; audio is not required now.

### One bounded example: civilisation statistics

The first calculator uses four historical alternative fates, with editable probabilities and adopted mean durations:

| Fate | Probability | Mean technological duration |
|---|---:|---:|
| Complete destruction of life | 5% | 100 years |
| Destruction of higher life | 60% | 30 years |
| Physical or mental degeneration | 15% | 30,000 years |
| Loss of scientific/technical interest | 20% | 10,000 years |

The calculation is the weighted mean **L = Σ pᵢlᵢ**, with probabilities expressed as fractions internally. These defaults give **6,523 years**, historically reported as approximately **6,500 years**. Both probabilities and conditional mean durations are visitor-editable. Show each fate’s contribution so the result is understandable, not merely a number.

These subjective historical defaults are not present-day measurements. The fifth “no limitation” case has zero weight and is deferred; no infinite lifetime is required. Additional distributions, recurrence, population and contact calculations are separate models. Preserve Lem’s criticism of universal short lifetimes. Resolve edition/transcription uncertainties that affect calculations, without turning the interface into citation bureaucracy. Do not distribute the complete book.

## 5. Ada in the browser

**Preferred route: Ada → WebAssembly → a thin browser interface.** GNAT-LLVM provides an Ada-to-LLVM compiler; AdaWebPack documents a WebAssembly runtime and Web API bindings. A maintained community fork documents wasm32 runtimes, standalone and Emscripten-linked variants, plus browser examples. This is a documented route worth pursuing, not proof that our chosen build and dependencies already work.

The documented community runtime has no tasks/protected objects, runtime-dependent I/O/timing and a standalone `Ada.Strings.Fixed` limitation. Exception support depends on runtime/browser features. Keep deterministic Ada packages independent of filesystem, calendars and DOM; represent astronomical years numerically rather than with real-time `Duration`.

Pin and verify a compiler/runtime pair with arithmetic, required transcendental functions, initialisation, exports and explicit error codes. Prefer fixed-width numeric interfaces; extend to buffers only when necessary. JavaScript marshals controls and renders outputs; Ada owns numerical validation and computation. Do not duplicate model mathematics in JavaScript.

raw.githack cannot execute native Ada or provide a backend: Wasm runs on the visitor’s device. Verify deployed MIME (`application/wasm` for streaming), CORS/CSP and relative asset loading. A byte-buffer loader can address streaming MIME mismatch, not bypass access policies. No deployed header test has run.

Use immutable commit/tag-based production URLs and matching visible release identity; production query strings do not invalidate permanently cached assets. Review raw.githack’s HTML confirmation screen and lack of uptime guarantees.

If the bounded Wasm spike fails, review Ada-generated versioned datasets as a fallback. Sample selection is not arbitrary live calculation: label resolution, do not silently interpolate or reimplement mathematics in JavaScript. Ada/Wasm remains preferred.

## 6. Recommended repository structure

- `ada/core/`: plain Ada model packages, units, validation and deterministic simulation state.
- `ada/browser/`: narrow WebAssembly export boundary and runtime adaptation.
- `ada/tools/`: optional native dataset generators.
- `tests/native/`: Ada unit tests and independently checked examples.
- `tests/browser/`: loading, controls, rendering and native/Wasm cross-checks.
- `web/`: chapter content, HTML/CSS and minimal JavaScript adapters.
- `data/`: reviewed examples or explicitly precomputed outputs.
- `docs/`: design and model notes; `dist/`: generated static release assets.

Use a shared Ada core for native tests and browser builds. Record pinned compiler/runtime versions and repeatable commands. Keep generated assets distinguishable from edited source; decide whether deployment assets are committed or attached to releases once the raw.githack delivery path is agreed.

## 7. Calculator-first build queue

Navigation remains in book order; implementation now prioritises useful calculators across chapters. Items 1–2 stay fixed. Labels distinguish **A: direct arithmetic from the book’s stated quantities**, **B: a transparent standard reconstruction with explicit assumptions**, and **C: our exploratory rules**, not a historical equation. A numerical statement in prose is not automatically a verified scientific law. All listed tests are planned acceptance cases, not results already obtained. Every calculator inherits live valid results, complete Reset, units, accessible charts and Ada-owned validation/computation.

1. **Scaffold and Ada/WebAssembly boundary.** Build the eight-chapter navigation, proposed i18n structure/language selector, catalogue filtering/search/sort shell, reproducible static release structure and tiny native/Wasm computation. Prepare public GitHub/raw.githack assets; repository identity/publication remain to be agreed. Exclude scientific models. Accept matching native/browser fixtures, keyboard navigation, stable English IDs across languages, predictable filter/sort/reset behaviour, visible planned/completed states and documented loading failures. Catalogue fixture tests must distinguish reading order from calculator-first order; language switching must not change numerical state. Check deployed headers when publication is authorised. Review the dataset fallback if the bounded toolchain spike fails.

2. **Civilisation weighted mean — Cosmic Civilisations / Statistics of Cosmic Civilisations (historical reconstruction).** Question: how do assumed fates and their conditional durations affect the average? Editable defaults and provenance are the historical four-fate table above, recovered from von Hoerner’s account, not a new fit. Ada computes L = Σ pᵢlᵢ and contribution bars. Accept defaults 6,523 years; changing only loss-of-interest duration to 20,000 gives 8,523; reset restores every default. Reject 90%/110% totals, negative, empty or non-finite values. Fate probabilities are not annual hazards; technological-phase endings are not all extinctions. Defer the historical zero-weight fifth case and downstream distributions/contact models.

3. **Scientific information growth — Intellectronics / Return to Earth (B; implemented in 0.1.4, calendar and target year in 0.1.5).** Question: what does persistent doubling imply? Book default: 15-year doubling of scientific periodicals. Use an initial index of 1 as an explicitly normalised teaching choice, not a historical count; allow an editable positive starting count, positive doubling time and non-negative elapsed years. Compute N(t)=N₀·2^(t/d); show indexed curve and factor, optionally time to a chosen target. State unrestricted exponential growth is the scenario, not a forecast. Accept 1→2 at 15 years and →4 at 30; t=0 preserves N₀; reject zero doubling time and overflow. Do not assign an unsupported calendar date to the book’s “over 100,000” baseline.

4. **Communication and teleoperation delay — Phantomology / Teletaxy and Phantomultiplication (B; implemented in 0.1.7).** Question: when does distance prevent prompt dialogue/control? The book gives 1,000 light-years and a 2,000-year reply wait, and approximately a second each way to the Moon. Editable default: 1,000 light-years, light-speed propagation and zero processing delay; optional visitor-entered distances in kilometres use a standard physical constant with explicit units. Compute one-way d/c and round-trip 2d/c plus processing; show a message timeline, not a conversation-success probability. Accept 1,000 light-years→1,000/2,000 years; zero distance/processing→zero; a stated illustrative one-light-second distance→two seconds round trip. Reject negative/non-finite values. Ignore motion/relativity/cosmology in this bounded model; do not present the rounded lunar prose as an exact distance measurement.

5. **Biological information throughput — A Lampoon of Evolution / Constructing Life (A; implemented in 0.1.10).** Question: how long would a stated information quantity take at different rates? Book examples: approximately 10,000 bits per low-redundancy printed page, 25 bits/s human processing and at least 1,000 bits/s bacterial information production. Editable defaults retain those historical estimates; compute time B/r and rate ratio, with parallel bars. Accept one page→400 seconds at 25 bits/s and 10 seconds at 1,000; ratio 40. These are unlike processes compared arithmetically, not evidence that a bacterium reads pages or that cognition has a universal measured bandwidth. Require positive rates, non-negative quantities; distinguish a lower-bound rate from an exact value.

6. **Information and reference sets — Creating Worlds / Cultivating Information (B; ready).** Question: how does changing the set of possible messages change selective information? The book contrasts roughly 100 true element statements with a vocabulary-sized set and explicitly notes the logarithmic measure. Default equiprobable set size 100 is book-based; a second size of 10,000 is clearly an illustrative choice, not a quoted exact vocabulary. Editable positive integer set sizes or probability 0<p≤1; compute I=−log₂p, hence log₂M for equiprobable messages. Show bits and set-size comparison. Accept M=100→approximately 6.643856 bits; 10,000→13.287712; p=1→0. Do not infer truth, meaning or biological fitness from surprisal, or reproduce the transcription’s damaged wordplay as evidence.

7. **Research-coverage lottery — Intellectronics / Return to Earth (B; ready with declared sampling rule).** Question: what is lost when only some possible research tickets are covered? Book default: M=1,000,000 tickets, W=1,000 prizes; purchasing half is discussed. Editable sample k=500,000 follows that example. Our explicit assumption is uniform sampling without replacement: expected prizes kW/M; probability of none C(M−W,k)/C(M,k), zero if k>M−W. Plot coverage versus expected prizes and no-prize probability. Accept defaults expected prizes 500; small check M=10,W=2,k=3 gives expectation 0.6 and no-prize probability 7/15. Use stable logarithmic/product computation and communicate underflow rather than displaying tiny risks as mathematical zero. Validate integer bounds. This quantifies Lem’s analogy, not actual discovery probabilities; choosing research directions is not demonstrated to be uniform random sampling.

8. **Researchers versus discoveries — Intellectronics / The Megabit Bomb (B; ready; reuses growth core).** Question: how do different doubling times change relative output per researcher? Book times: discoveries 30 years, researchers 10. Normalise both initial indices to 1 (our presentation choice), editable times, horizon and initial indices. Compute D=D₀·2^(t/30), R=R₀·2^(t/10), and D/R using edited denominators as appropriate; show indexed curves and ratio. Accept t=30 gives D=2,R=8, relative ratio 0.25. Explain these are historical aggregate indices, not causal measurement of individual productivity. Exclude an invented saturation date, population ceiling or logistic-growth constant.

9. **Conditional outcomes — Prolegomena to Omnipotence / Chaos and Order (A arithmetic; optional C sampling; ready).** Question: how does probabilistic order differ from a deterministic mapping? Book example gives outcomes Y/Z occurring 40/60 times per hundred after X. Editable probabilities default 40%/60%, count 100; calculate expected counts n·p and a two-bar display. Accept expectations 40/60; 0%/100% produces 0/100. Require a valid total and non-negative integer count. If sampling is added, identify it as our seeded Bernoulli experiment: observed counts fluctuate, unlike expected counts. Do not imply that one conditional distribution alone proves or measures dependence between A and B; that needs baseline information not supplied here.

10. **Coexisting civilisation population — Cosmic Civilisations / Statistics (B; useful, moderate readiness; depends on item 2).** Question: how does lifetime change simultaneous rather than all-time population? Book-based defaults: 150 billion stars, favourable fraction 1/150, time window 15 billion years; use the calculated mean 6,523 years. Our first simplified scenario is one technological episode per favourable system, uniformly timed over the window; N=N★·f·min(L/T,1). Show expected count versus lifetime, not a literal catalogue. Accept these defaults→approximately 434.8667 coexisting civilisations, explicitly not a recovered historical output; L=0→0; L≥T saturates at one billion. Validate fractions/window. A fixed-duration occupancy approximation uses a mean for variable lifetimes; expose its boundary assumptions. Do not silently combine these defaults with another paper’s population constants. Recurrence and distances are separate future increments.

### Deferred numerical candidates

- **Energy growth / Formulating the Method (B):** valuable but hold pending text check. The available prose states 1/3% annual growth and a factor of ten billion after 2,500 years. Annual compounding of that rate gives only about 4,100. Do not silently replace it with 1%, invent a baseline or claim both agree. A future comparison can display P/P₀=(1+r)^t and the mismatch once the intended wording is resolved.
- **Civilisation spacing / Statistics (B):** needs a declared stellar density and geometry. A homogeneous three-dimensional model gives characteristic spacing proportional to density^(−1/3), not automatically the exact mean nearest-neighbour distance. The afterword’s torus assumptions change the geometry; do not force the reported 1,000 light-years or its later 5/500-light-year figures to fit one equation.
- **Recurrence, contact selection and lifetime tails (B/C):** recurrence requires a recovery/stopping rule for finite histories; contact age needs selection/detection assumptions; survival curves need distributions. These are separate questions, not consequences of the mean alone.
- **Binary division / Constructing Life (B):** the book’s 20-minute bacterial division suggests N=N₀·2^(t/20 minutes), but unlimited nutrient growth duplicates item 3. Add later only if resource limitation becomes a separately specified educational model.
- **Hidden periodicity / Chaos and Order (C):** the book describes a deterministic lamp sequence too long for an observer to see repeat. A bounded seeded demonstration is promising, but our sequence/rules must be labelled, not advertised as Lem’s chaos equation.
- **Feedback / The Phantomatic Machine; continuous versus threshold regulation / Cultivating Information (C):** prose supports interaction diagrams, but supplies no gains, delays, plant dynamics or stability thresholds. Start with diagrams; an eventual toy controller must declare all those choices.
- **Evolutionary search / Cultivating Information and Afterword II (C):** the corridor/filter and meaningful-anagram analogies suggest experiments, but fitness rules, mutation, population and stopping criteria are ours. Defer until simple calculators are complete. No consciousness/IQ multiplier, moral ranking, personal-identity score or medical longevity predictor.

### Explanation-led completion after calculators

Items 11–19 are coverage tracks, not permission to implement whole chapters in one batch. Expand each next unfinished section into one bounded approved item. Acceptance for each is an accurate question/explanation, navigable section, labelled assumptions and accessible diagrams; reuse existing calculators rather than duplicating them.

11. **Dilemmas:** numbered parts 1–3; forecasting limits without fabricated predictions.
12. **Two Evolutions:** Introduction through A Few Naïve Questions; biological/technological comparisons without a universal numerical progress law.
13. **Cosmic Civilisations:** all ten sections in reading order; integrate items 2, 4 and 10, keeping reported contact statistics separate from computed results and retaining Lem’s critique.
14. **Intellectronics:** all fifteen sections; integrate items 3, 7 and 8; ethical/metaphysical questions get explanations, not scores.
15. **Prolegomena to Omnipotence:** nine sections; integrate item 9; distinguish models from their targets and keep humorous physical analogies from masquerading as laws.
16. **Phantomology:** seven sections; integrate communication delay; diagrams distinguish one-way representation, feedback and speculative identity arguments.
17. **Creating Worlds:** introduction and four engineering themes; integrate information measures without equating bits with semantic truth or a model world with real consciousness.
18. **A Lampoon of Evolution:** thirteen sections; integrate throughput and distinguish biological description, engineering analogy and speculative redesign, with no medical advice.
19. **Conclusion and Afterword:** preserve the retrospective viewpoint and its changed spatial assumptions. Reconcile coverage with navigation, perform agreed release checks, and never label placeholder sections complete. Checked earlier increments can be released independently.

## 8. Tests, review and remaining decisions

Plan native Ada tests for worked examples, boundary values, unit conversions, numerical stability and deterministic simulation seeds. Cross-check the same fixtures against Wasm exports, using justified absolute/relative tolerances. Test ABI conversions, initialisation, invalid-input status and memory ownership separately from mathematics. UI tests cover complete translations for every adopted language, locale parsing/formatting, translated errors/chart labels, language switching without numerical changes, reset preserving locale, search/filter combinations, deterministic sorting, collapse without lost edits, accessible alternatives and loading failure. Large runs must not freeze the interface; add a worker only if measurements justify it.

These are planned tests. No Ada toolchain installation, compilation, native/browser execution or application testing has been performed for this design. Public documentation was inspected; runtime claims still require our own feasibility checks.

Review next: repository owner for Ada Technological Horizons / `ada-technological-horizons`, proposed four-language set, code licence and quotation policy, visual direction, browser support, toolchain-spike budget and release layout. Public visibility, static delivery, whole-book chapter structure and an Ada-first core are the brief; the exact compiler/runtime combination remains the principal technical decision.
