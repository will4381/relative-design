// node tools/film.cjs <out.png> <src/icons/file.js ...> [--only name,name]
// Filmstrip of each icon's animation: 12 frames across one play (headless Chrome, macOS).
// Each frame shows a faint ghost of the resting pose plus the dashed 24px box, so you can judge
// how far parts travel, whether pivots are right, and whether anything leaves the box.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const args = process.argv.slice(2);
const oi = args.indexOf("--only");
const only = oi > -1 ? args.splice(oi, 2)[1].split(",") : null;
const [out, ...files] = args;
// run the engine and category files as plain scripts (same scoping as the build)
const vm = require("vm");
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../src/core.js"), "utf8"));
for (const f of files) vm.runInThisContext(`;(function () {\n${fs.readFileSync(path.resolve(f), "utf8")}\n})();`, { filename: f });
const Icons = globalThis.Icons;

const names = only || Icons.names;
const DUR = 0.9, FRAMES = 12, CELL = 76;
const rows = names.map((n) => {
  const frames = Array.from({ length: FRAMES }, (_, i) => {
    const t = ((i / (FRAMES - 1)) * DUR * 0.999).toFixed(3);
    return `<div class="f"><div class="ghost">${Icons.svg(n, { trigger: "none", css: false, size: 48 })}</div>` +
      `<div style="--ic-seek:${t}s">${Icons.svg(n, { trigger: "play", css: false, size: 48 })}</div></div>`;
  }).join("");
  const fill = `<div class="f solid">${Icons.svg(n, { variant: "fill", trigger: "none", css: false, size: 48 })}</div>`;
  return `<div class="row"><div class="name">${n}</div>${frames}${fill}</div>`;
}).join("");

const html = `<!doctype html><meta charset="utf-8"><style>${Icons.css()}
body{margin:0;padding:12px;background:#fff;font:12px system-ui;color:#1c1917}
.ic{--ic-dur:${DUR}s}.ic .ic-a{animation-play-state:paused!important}
.row{display:flex;align-items:center;gap:4px;height:${CELL}px}
.name{width:110px;overflow:hidden;text-overflow:ellipsis;color:#666}
.f{position:relative;width:${CELL - 6}px;height:${CELL - 6}px;display:grid;place-items:center;background:#f6f6f3;border-radius:8px}
.f>div{position:absolute;inset:0;display:grid;place-items:center}
.f::after{content:"";position:absolute;width:48px;height:48px;outline:1px dashed #d6d6d0;pointer-events:none}
.ghost{color:#1c191722}.solid{background:#eceeff}</style><body>${rows}`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "icfilm-"));
const page = path.join(tmp, "film.html");
fs.writeFileSync(page, html);
const W = 24 + 110 + (FRAMES + 1) * (CELL - 2), H = 24 + names.length * CELL;
execFileSync("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
  `--window-size=${W},${H}`, `--screenshot=${path.resolve(out)}`, `file://${page}`,
], { stdio: "ignore" });
fs.rmSync(tmp, { recursive: true });
console.log(`${names.length} filmstrips → ${out}`);
