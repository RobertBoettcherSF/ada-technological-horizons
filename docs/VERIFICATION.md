# Verification

## v0.1.5 calendar, baseline, and target year

`bash tools/build.sh` printed `NATIVE OK`, `LIFETIME OK`, and `GROWTH OK`. The lifetime fixtures are unchanged, including exact 6523 and 8523. Growth defaults remain quantity 4 and factor 4. With starting year 2026 the chart ends at 2056. Target 4 is reached in 2056 when the doubling time is 15, and in 2054 when it is 14. A target already at or below the starting quantity stays at 2026. A starting quantity of 0 does not invent a year for a positive target. Target 10 is reported after the 30-year chart. A fractional year and a year outside -10000..10000 clear the curve. An invalid target clears only the target year.

Node suites: 25 passed. Integer results and calendar years matched Wasm by bits. The slow-doubling case 2^0.2 differed by one ulp between native GNAT and the wasm32 maths library; the check allows that one ulp and still requires a non-finite 15-year baseline to be omitted rather than capped. Headless Chromium printed `BROWSER OK` for `application/wasm` and for `application/octet-stream`. The page showed quantity 4, factor 4, and chart end 2056, with both curves, year labels, and the outside-horizon target. Doubling time 14 with target 4 showed 2054 and a higher chosen curve on the same years. At 320px, `scrollWidth - clientWidth` was at most 1. The civilisation headline stayed 6500 with exact mean 6523.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/86a341b1541993fcafc28617572242d8fb421924/dist/index.html

The page showed release `0.1.5`, that commit, `application/wasm`, quantity **4**, factor **4**, chart end **2056**, two curves, calendar-year and quantity labels, headline **6500** with exact mean **6523**, and closed Technical details. The default illustrative target 10 was reported after the chart, in **2075.8289**. Setting the target to 4 showed **2056**. Doubling time 14 with that target showed **2054**, with the chart still ending in 2056. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (37887 bytes, SHA-256 `b0e52442bc48360c9754bf46181ace5268a76dc256076b21c58e8cc13f7c8bf7`, `access-control-allow-origin: *`).

## v0.1.4 scientific-information growth

`bash tools/build.sh` printed `NATIVE OK`, `LIFETIME OK` and `GROWTH OK`. The lifetime and rebalance fixtures are unchanged. Growth checks: defaults quantity 4 and factor 4; one doubling gives 2 and 2; elapsed 0 keeps the starting quantity and factor 1; starting quantity 0 gives quantity 0 and factor 4; doubling 0 or a negative doubling is status 4; a negative elapsed time is status 3; a negative starting quantity is status 2; NaN is status 1; t = 20000 with d = 1 is status 5 and clears the previous result. The last of the 11 samples matches the reported quantity.

Node suites: 24 passed, including bit-exact Wasm replay of the addition, lifetime, rebalance and growth fixtures. Headless Chromium printed `BROWSER OK` for `application/wasm` and for `application/octet-stream`. The default growth card showed quantity 4 and factor 4, with the table endpoint equal to that quantity. Elapsed time 15 showed 2 and 2. Reset restored 1, 15 and 30. Invalid doubling, a negative elapsed time, a negative start, NaN, an empty field and the overflow case cleared the quantity, factor and curve. The civilisation card still showed 6500 with exact mean 6523, and editing 60 to 30 still showed 15, 30, 25, 30. Technical details stayed closed until opened. The catalogue counted 2 working calculators. At 320px, `scrollWidth - clientWidth` was at most 1.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/5d55a2adbf1b4f04d4076f24d975a57ad4fdd3cd/dist/index.html

The page showed release `0.1.4`, that commit, `application/wasm`, quantity **4**, factor **4**, headline **6500** with exact mean **6523**, two working calculators, and closed Technical details. The curve table had 11 rows and its last quantity was 4. Editing the elapsed time to 15 showed quantity **2** and factor **2**. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (31832 bytes, SHA-256 `7f9036f33539b86fb8f36ad2e5461b2ddf1cebc6730b534fe5846ed64c4093bf`, `access-control-allow-origin: *`).

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
