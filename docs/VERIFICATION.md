# Verification for v0.1.0

These commands were run on the implementation host (Ubuntu 24.04.5, x86_64). The live raw.githack URL is filled in after the commit that contains `dist/` has been fetched. It is not claimed here until that fetch succeeds.

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
