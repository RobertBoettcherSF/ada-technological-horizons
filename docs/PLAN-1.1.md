# Plan 1.1 — Opening and chapter tiles

**Ada Technological Horizons · approved UI refinement of the v0.1.0 scaffold**

Status: approved with “OK” and implemented as release 0.1.1 on the Plan 1 branch. This note does not authorise later queue items.

## What changed

The page now starts with a short invitation and one thing to try: the existing Ada binary64 addition, in a card with prefilled inputs, a prominent result, Reset, an explanation, and an explicit technical-demonstration label. Chapter navigation is a set of tiles with brief descriptions. Planned tiles stay visibly distinct from that working card. Search, order and filters remain fully usable behind a secondary disclosure. Compiler, commit, fingerprint and runtime details stay in the page, inside a disclosure that is closed until opened. Only a small release label is visible beforehand.

## What did not change

Ada still owns the addition and the numerical checks. JavaScript still only loads the module and renders the status. The four languages, stable English ids, catalogue rules, reset, and collapse behaviour are unchanged. No civilisation-lifetime calculator or other scientific model was added. The visual reference was the approachable card hierarchy of the syllabus pages, not their dark theme, decorative background, or audio.

## Acceptance for this increment

- A new visitor sees how to start and can edit the addition without opening a menu.
- Chapter tiles are keyboard links and describe each chapter in one or two sentences.
- Technical details and the search tools are disclosures that open and close from the keyboard.
- Technical details are closed on first load.
- Language, filter, sort, and edited operands survive as they did in 0.1.0.
- Native and Wasm fixture results still match.
- A narrow viewport does not force horizontal scrolling.
