// node tools/compare.cjs <out.png> <src/icons/file.js ...> [--only a,b]
// Row per icon: the real mark (Simple Icons, CC0, reference only) | ours line | ours fill | ours at 24px.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SI = path.join(ROOT, "node_modules/simple-icons/icons"); // devDependency, CC0: visual reference only
const SLUG = { "apple-logo": "apple", chrome: "googlechrome", firefox: "firefoxbrowser", "x-twitter": "x" };

const args = process.argv.slice(2);
const oi = args.indexOf("--only");
const only = oi > -1 ? args.splice(oi, 2)[1].split(",") : null;
const [out, ...files] = args;
vm.runInThisContext(fs.readFileSync(path.join(ROOT, "src/core.js"), "utf8"));
for (const f of files) vm.runInThisContext(`;(function () {\n${fs.readFileSync(path.resolve(ROOT, f), "utf8")}\n})();`);
const Icons = globalThis.Icons;
const names = only || files.flatMap((f) => Icons.names.filter((n) => Icons.ICONS[n].category === path.basename(f, ".js")));

const ref = (n) => {
  const p = path.join(SI, `${SLUG[n] || n}.svg`);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8").replace("<svg ", '<svg width="80" height="80" fill="#1c1917" ') : "<span>no ref</span>";
};
const rows = names.map((n) => `<div class="r"><div class="n">${n}</div><div class="c ref">${ref(n)}</div>` +
  `<div class="c">${Icons.svg(n, { size: 96, trigger: "none", css: false })}</div>` +
  `<div class="c">${Icons.svg(n, { variant: "fill", size: 96, trigger: "none", css: false })}</div>` +
  `<div class="c s">${Icons.svg(n, { size: 24, trigger: "none", css: false })}${Icons.svg(n, { variant: "fill", size: 24, trigger: "none", css: false })}</div></div>`).join("");
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:10px;font:12px system-ui;color:#1c1917;background:#fff}
.r{display:flex;align-items:center;gap:10px;height:112px}.n{width:100px;color:#666}.c{width:104px;height:104px;display:grid;place-items:center;background:#f6f6f3;border-radius:10px}
.ref{background:#eef6ee}.s{display:flex;gap:8px;justify-content:center;align-items:center}</style>
<p>green = real mark (reference) · ours line · ours fill · ours 24px</p>${rows}`;
const page = path.join(require("os").tmpdir(), "relative-compare.html");
fs.writeFileSync(page, html);
execFileSync("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--disable-gpu", "--hide-scrollbars",
  "--force-device-scale-factor=1", `--window-size=600,${60 + names.length * 112}`, `--screenshot=${path.resolve(out)}`, `file://${page}`], { stdio: "ignore" });
console.log(`${names.length} rows → ${out}`);
