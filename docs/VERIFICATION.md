# Verification

## v0.1.3 rebalance and headline

`bash tools/build.sh` printed `NATIVE OK` and `LIFETIME OK`. Rebalance checks: 60 edited to 30 becomes 15, 30, 25, 30; 5 edited to 95 becomes 95, 5, 0, 0; a single 100 leaves the others at 0; 100 edited to 0 shares the remainder equally and the total stays within `1.0e-9` of 100. The exact default mean remains 6523 and the 20000-year case remains 8523. Wasm replay matched the addition, lifetime, and rebalance bits.

Node suites: 23 passed, plus the headline check that 6523 displays as 6500 and 8523 as 8500. Headless Chromium printed `BROWSER OK` twice. The default card showed 6500 with exact mean 6523. Editing 60 to 30 showed 15, 30, 25, 30. A duration of 20000 showed 8500 without moving the probabilities. Invalid text cleared the headline. Technical details stayed closed until opened.

Verified in a browser on 8 November 2026, after raw.githack’s “Open the page” confirmation:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/72fc54fc4378c7d3fda7f21e5540b8a7c30edf43/dist/index.html

The page showed release `0.1.3`, that commit, `application/wasm`, headline **6500** with exact mean **6523**, and closed Technical details. Editing 60 to 30 showed probabilities 15, 30, 25, 30 and headline **10500** (exact 10524). `curl` received `text/html` and `application/wasm` (14874 bytes, `access-control-allow-origin: *`).

## v0.1.2 calculator and theme

`bash tools/build.sh` on Ubuntu 24.04.5 printed `NATIVE OK` and `LIFETIME OK`.

Native lifetime checks include defaults **6523** years with contributions 5, 18, 4500 and 2000; last duration 20000 giving **8523**; a single 100% fate; zero durations giving 0; totals 90 and 110; a negative probability; a negative duration; NaN and infinity. The export clears a previous mean when the total is rejected. Wasm replay of those fixture bits matched. The addition fixtures still match as well.

Node suites: 21 passed. Headless Chromium printed `BROWSER OK` for `application/wasm` and for `application/octet-stream`. That run checked the closed Technical details disclosure, the lifetime card showing 6523, an edit to 8523, reset, chapter tiles, filters, languages, the addition proof after the disclosure is opened, and a 320px viewport.

Verified in a browser on 8 November 2026, after raw.githack’s “Open the page” confirmation:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/c7a2ea1e7df52e4a649402c698a5bd23fababf68/dist/index.html

The page showed release `0.1.2`, that commit, `application/wasm`, two Ada calls, mean **6523**, and closed Technical details. Editing the last duration to 20000 changed the mean to **8523**. `curl` received `text/html` and `application/wasm` (10361 bytes, `access-control-allow-origin: *`).

## v0.1.1 opening

Checked on the same Ubuntu 24.04.5 host after `bash tools/build.sh`.

- Native fixture: `NATIVE OK`. The Wasm module SHA-256 is unchanged, `92a552be9ee7c1421a17948e35caa50dbd746b043d19297db05af07f67f7b5d1`, because the Ada units did not change.
- `node --test` on the catalogue, translation, state, number and Wasm-parity suites: 20 passed.
- Headless Chromium against `dist/` printed `BROWSER OK` for `Content-Type: application/wasm` and again for `application/octet-stream`.
- On first load, `#technical-details` is closed. Enter on its summary opens it and Enter closes it. The visible release label is `0.1.1`.
- The addition card is before the section list, shows prefilled `2` and `3`, and shows result `5` from Ada. Chapter tiles expose a description in the active language.
- Search, order and filters start closed. Enter on that summary opens them. The existing language, filter, sort, reset, collapse, error and load-failure checks still pass. At 320px, `scrollWidth - clientWidth` is at most 1.

Verified in a browser on 8 November 2026, after raw.githack’s “Open the page” confirmation, at:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/7ed60133a77e6b1a3ac22c9dc0b390e2823a064f/dist/index.html

The page showed release `0.1.1`, that commit, execution `Ada WebAssembly`, `application/wasm`, one Ada call, and result `5`. Technical details and the search disclosure were closed. Ten chapter tiles were present. `curl` received `text/html` for the page and `application/wasm` for the 6818-byte module, with `access-control-allow-origin: *`.

## v0.1.0

These commands were run on the implementation host (Ubuntu 24.04.5, x86_64).

## Build

```text
bash tools/build.sh
```

Result: `NATIVE OK`, then `dist ready`.

Native fixture lines:

```text
FIXTURE two-plus-three 4000000000000000 4008000000000000  0 4014000000000000
FIXTURE zero-plus-zero 0000000000000000 0000000000000000  0 0000000000000000
FIXTURE negative-left c000000000000000 4014000000000000  0 4008000000000000
FIXTURE negative-both c000000000000000 c008000000000000  0 c014000000000000
FIXTURE negative-sum 3ff0000000000000 c010000000000000  0 c008000000000000
FIXTURE tenth-plus-fifth 3fb999999999999a 3fc999999999999a  0 3fd3333333333334
FIXTURE negative-zero 8000000000000000 8000000000000000  0 8000000000000000
FIXTURE nan-left 7ff8000000000001 3ff0000000000000  1 0000000000000000
FIXTURE infinity-right 3ff0000000000000 7ff0000000000000  1 0000000000000000
FIXTURE overflow-positive 7fefffffffffffff 7fefffffffffffff  2 0000000000000000
FIXTURE overflow-negative ffefffffffffffff ffefffffffffffff  2 0000000000000000
```

`4014000000000000` is binary64 `5`. Status `1` is a non-finite operand. Status `2` is a non-finite sum. The module SHA-256 is `92a552be9ee7c1421a17948e35caa50dbd746b043d19297db05af07f67f7b5d1`.

Compiler lines printed by the script:

```text
Native GNAT: GNATMAKE 13.3.0
Wasm compiler: llvm-gcc version 14
Linker: /usr/lib/llvm-16/bin/wasm-ld (Ubuntu LLD 16.0.6)
```

## Node checks

```text
node --test tests/catalogue.test.mjs tests/i18n.test.mjs tests/state.test.mjs tests/numbers.test.mjs tests/wasm-parity.test.mjs
```

Result: 20 passed, 0 failed. The parity test instantiated `dist/ath_addition.wasm` through the page’s loader, called Ada, and matched every native status and success bit pattern. A forced HTTP 404 left the session unloaded and did not produce a sum.

## Browser

```text
SHOT_LABEL=primary node tests/shell.browser.mjs
WASM_CONTENT_TYPE=application/octet-stream PORT=8766 SHOT_LABEL=skip node tests/shell.browser.mjs
```

Both printed `BROWSER OK`.

The page was served from `dist/` with relative paths. The first server sent `Content-Type: application/wasm`. The second sent `application/octet-stream`. In both cases the diagnostics showed Ada WebAssembly, the call count was greater than zero, and `2 + 3` rendered `5` only after the module loaded.

Also checked in that run:

- Eight chapter links and every planned section link, with English-slug hashes unchanged in German.
- Keyboard activation of Dilemmas and of Part 1. Previous is unavailable on the first section. Next from Formulating the Method stays Statistics of Cosmic Civilisations after switching the catalogue to title order and to calculators first.
- Chapter plus type filters, a search, an empty calculator filter with the no-results note, and Clear filters returning 74 entries in reading order. Working calculators stay 0.
- Language switch to German keeps edited operands and the canonical result `5`. Reset restores `2` and `3` and keeps German. Close all / Open all keeps an edited operand.
- `0 + 0` shows `0`. `-2 + -3` shows `-5`. An empty field, `2+3`, `NaN`, and `1.7976931348623157e+308` added to itself show an error and a blank result.
- Simulated load failure clears the result and shows the translated retry guidance. Retry loads the module again and shows `5`.
- At 1280×900 and at 320×800, `scrollWidth - clientWidth` was at most 1.

Screenshots from that run are in `docs/review/`.

## Published snapshot

Verified on 8 November 2026 against commit `fecd1d9154dfbef5a69a306ef3409d9219d7958e`:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/fecd1d9154dfbef5a69a306ef3409d9219d7958e/dist/index.html

`curl` received `200` with `text/html` for the page, `application/javascript` for `dist/js/app.js`, and `application/wasm` for `dist/ath_addition.wasm` (6818 bytes). The Wasm response also sent `access-control-allow-origin: *` and `cache-control: max-age=31536000, public, immutable`.

A browser is shown raw.githack’s confirmation screen first (“One more step” / “Open the page”). After that button, headless Chromium loaded this URL and reported:

- release `0.1.0`
- published commit `fecd1d9154dfbef5a69a306ef3409d9219d7958e`
- execution `Ada WebAssembly`
- Wasm response type `application/wasm`
- one Ada call
- result `5` for the default operands `2` and `3`
- eight chapter links

Screenshots of that session are `docs/review/githack-live.png` and `docs/review/githack-demo.png`.
