// node test.js (after a build). Checks every icon renders cleanly through the public API and every export resolves.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { toSvg, css } from "./dist/index.js";
import { icons, names } from "./dist/all.js";
import * as named from "./dist/icons/index.js";

assert.ok(names.length > 400, `expected 400+ icons, got ${names.length}`);
assert.ok(css.includes("@keyframes ic-nudge"), "animation css missing");

const ids = new Set();
for (const name of names) {
  for (const variant of ["line", "fill"]) {
    const s = toSvg(icons[name], { variant, size: 20, stroke: 1.5, title: `${name} <icon>` });
    assert.ok(!/__ID__|NaN|undefined/.test(s), `${name}/${variant} has a bad token`);
    assert.ok(s.includes("--ic-stroke:1.5px") && s.includes("&lt;icon&gt;"), `${name}/${variant} options not applied`);
    const id = s.match(/mask id="([^"]+)"/)[1];
    assert.ok(!ids.has(id), `duplicate mask id ${id}`);
    ids.add(id);
  }
}
assert.equal(Object.keys(named).length, names.length, "named icon exports out of sync");

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
for (const [key, target] of Object.entries(pkg.exports)) {
  const files = typeof target === "string" ? [target] : Object.values(target);
  for (const f of files) if (!f.includes("*")) assert.ok(existsSync(f), `export ${key} → missing ${f}`);
}
for (const css of ["fonts.css", "grotesque.css", "serif.css"]) {
  const src = readFileSync(`./fonts/${css}`, "utf8");
  for (const [, f] of src.matchAll(/(?:url\(|@import )"\.\/([^"]+)"/g)) assert.ok(existsSync(`./fonts/${f}`), `${css} → missing ${f}`);
}

console.log(`ok: ${names.length} icons × 2 variants, ${Object.keys(pkg.exports).length} exports, fonts resolved`);
