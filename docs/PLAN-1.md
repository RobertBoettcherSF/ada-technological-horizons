# Plan 1 — Scaffold and Ada/WebAssembly boundary

**Ada Technological Horizons · `ada-technological-horizons`**

Status: proposed bounded implementation plan; no scaffold built yet.
Target: first scaffold release, v0.1.0, in a public GitHub repository with a raw.githack live link. Exact build identity and public URLs are recorded only after they exist.

## Scope

1. **Repository and delivery structure.** Prepare the approved public repository, README/About, design document, source/build/test layout and generated static release directory. Keep original Ada packages separate from browser adaptation, HTML/CSS/minimal JavaScript and tests. Document pinned tool versions, build commands and how to serve static outputs locally. No backend. Do not copy private source material or the complete book into the repository. Select a code licence before adding a licence file; do not silently choose one.
2. **Reader-facing shell.** Use the eight-chapter structure in DESIGN.md, section placeholders, Previous/Next and visible planned/completed states. Implement a chapter/topic catalogue with search, chapter/topic/type filters, reading-order default, calculator-first/topic/title ordering, collapsible groups and Open all/Close all. Keep canonical book navigation independent of sorting and the implementation queue. Planned scientific cards are labelled non-operational. Use synthetic catalogue fixtures for tests, not invented book content.
3. **Language structure.** Default to UK English (`en-GB`); provide German (`de`), Spanish (`es`) and French (`fr`) shell translations. Translate navigation, controls, placeholders, validation/loading messages and About text introduced in this increment. Stable English-slug IDs do not vary by language. Language switching preserves selections and demo values. Locale-aware presentation must not change Ada’s numeric semantics. Later chapter content is translated as it is implemented, not claimed complete now.
4. **Ada-to-browser proof.** Pin a viable GNAT-LLVM/AdaWebPack compiler/runtime combination and build one tiny, explicitly technical fixture in plain Ada, used both natively and through Wasm. Proposed fixture: add two finite numeric inputs through a fixed-width boundary and return an explicit success/error status. Ada owns computation and numerical validation. JavaScript handles input adaptation, module loading and rendering only. Show loading/failure states, not a fabricated successful result. This is a technical demo, not a scientific calculator.
5. **Accessible responsive presentation.** Create original styling with readable cards, labelled controls, keyboard focus and text alternatives. No dependency on animation, audio, decorative rain or the reference project’s splash. Keep edits when a demo card is collapsed or filtered out; Reset restores demo inputs without changing language/catalogue preferences.
6. **Reproducible verification and release.** Add appropriate native Ada, boundary and shell tests; document commands and outcomes. Produce static assets with relative paths. On authorised publication, check real raw.githack loading, Wasm MIME/CORS/CSP compatibility, visible version and source identity. Use immutable commit/tag-based production URLs, not query-string cache busting as a production update mechanism.

## Concrete acceptance checks

- All eight chapters and their planned sections are reachable by keyboard with stable IDs. Previous/Next retains book order regardless of catalogue sort.
- A catalogue fixture with one explanation before one calculator appears in reading order by default and reverses appropriately under Calculators first. Equal-category ties retain book order. Topic/title ordering is deterministic.
- Search is case-insensitive and trimmed; filters combine categories with AND and choices within a category with OR. No-results guidance and active-filter/result counts are accurate. Clear filters restores reading order. Planned entries are never counted as working calculators.
- Collapse/Open all/Close all do not erase edited fixture inputs. A narrow viewport has no unusable controls or avoidable page-wide horizontal overflow.
- Every shell string exists in all four languages. Changing language preserves values and results; translated number rendering is unambiguous. Reset restores demo inputs while retaining locale and catalogue settings.
- Native Ada fixture: 2 + 3 → 5; 0 + 0 → 0; a negative finite operand behaves according to the documented addition contract. Browser exports match native fixtures within a declared tolerance. Empty/non-finite/overflowing inputs show an error and no misleading stale result.
- Simulated module-loading failure gives an actionable message without substituting JavaScript arithmetic. Reloading the static bundle actually loads Wasm and invokes Ada, rather than displaying hard-coded fixture answers.
- A clean environment can follow the pinned build instructions. Record actual native/browser/test commands, failures and unsupported features. Verify published assets and stamp before announcing v0.1.0 as live.

## Technical spike stop condition

Start with the smallest available runtime/profile; do not expand this into a compiler-porting project. If a reproducible Ada/Wasm build, required numeric boundary or browser loading fails within an agreed investigation budget, report the exact failing stage and evidence. Keep the shell work reversible. Review the already documented Ada-generated-data fallback with Robert; do not automatically replace Ada mathematics with JavaScript or describe sampled datasets as arbitrary live computation. A partial scaffold may be reviewed, but item 1 is not declared fully successful without the agreed boundary proof or an explicitly accepted revised scope.

## Preserve and exclude

Preserve the calculator-first queue: item 2 remains the four-fate historical weighted-mean calculator. **No lifetime formula, scientific calculator, population/spacing/contact model, chapter-wide explanatory writing or speculative simulation is implemented in item 1.** No full book, scans, long extracts, private KDP/Project Wealth data, account secrets, backend, desktop filesystem integration, audio or elaborate animation. Repository creation/publication is performed only under the user’s specific approval; no existing repository is overwritten or adopted silently.

README/About opening:

> An independent interactive exploration inspired by Stanisław Lem’s Summa Technologiae.

Add that it is original educational software, not an official edition or endorsed adaptation. Attribution is not permission; code licensing and third-party rights remain separate.

## Review and handoff

Before building, confirm the repository owner, code licence, acceptable spike budget and any amendments to this bounded scope. Those are review choices, not reasons to expand item 1. All acceptance checks above are **planned**, not run. The present deliverables are design and plan documents only.

**Any changes, or Go?**
