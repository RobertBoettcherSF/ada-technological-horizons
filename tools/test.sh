#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
bash "$ROOT/tools/build.sh"
node --test "$ROOT/tests/catalogue.test.mjs" "$ROOT/tests/i18n.test.mjs" "$ROOT/tests/state.test.mjs" "$ROOT/tests/numbers.test.mjs" "$ROOT/tests/wasm-parity.test.mjs"
if [[ ! -d "$ROOT/node_modules/playwright" ]]; then
  npm install --no-save playwright
fi
npx playwright install chromium
SHOT_LABEL=primary node "$ROOT/tests/shell.browser.mjs"
WASM_CONTENT_TYPE=application/octet-stream PORT=8766 SHOT_LABEL=skip node "$ROOT/tests/shell.browser.mjs"
