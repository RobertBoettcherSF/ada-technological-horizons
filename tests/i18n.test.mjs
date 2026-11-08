import assert from "node:assert/strict";
import test from "node:test";
import { messageKeys, messages, t } from "../web/js/messages.js";

const LOCALES = ["en-GB", "de", "es", "fr"];
const CREDIT = "An independent interactive exploration inspired by Stanisław Lem’s Summa Technologiae.";

test("every shell string exists in all four languages", () => {
  for (const locale of LOCALES) {
    assert.deepEqual(Object.keys(messages[locale]).sort(), messageKeys.slice().sort());
    for (const key of messageKeys) {
      assert.equal(typeof messages[locale][key], "string");
      assert.ok(messages[locale][key].trim() !== "", `${locale} ${key}`);
    }
  }
});

test("the English credit sentence is exact", () => {
  assert.equal(t("en-GB", "app.credit"), CREDIT);
});

test("representative controls are actually translated", () => {
  const keys = ["nav.previous", "nav.next", "catalogue.clear", "demo.empty", "demo.loadFailed", "type.planned", "app.invite", "demo.friendlyTitle", "diag.toggle"];
  for (const key of keys) {
    const values = new Set(LOCALES.map((locale) => t(locale, key)));
    assert.equal(values.size, 4, key);
  }
});

test("missing keys are reported instead of being shown as English", () => {
  assert.throws(() => t("de", "not.a.key"), /Missing translation/);
});
