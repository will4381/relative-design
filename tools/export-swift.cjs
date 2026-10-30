// node tools/export-swift.cjs <path/to/relative-design-swift>
// Exports every icon as native-ready geometry for the Swift package:
//   Sources/RelativeDesign/Resources/icons.json         geometry + paint ops + motion per icon
//   Sources/RelativeDesign/Icons/RelativeIconName.swift  the typed list of names
//
// Geometry is normalised to absolute M/L/C/Z with transforms baked in, so Swift only needs a tiny parser.
// Paint ops mirror src/core.js exactly (white = draw, black = cut), for both variants.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const svgpath = require("svgpath");

const ROOT = path.join(__dirname, "..");
const out = process.argv[2];
if (!out) throw new Error("usage: node tools/export-swift.cjs <swift package dir>");

vm.runInThisContext(fs.readFileSync(path.join(ROOT, "src/core.js"), "utf8"));
for (const f of fs.readdirSync(path.join(ROOT, "src/icons")).filter((f) => f.endsWith(".js") && !f.startsWith("_")).sort())
  vm.runInThisContext(`;(function () {\n${fs.readFileSync(path.join(ROOT, "src/icons", f), "utf8")}\n})();`, { filename: f });
const Icons = globalThis.Icons;
const GAP = 1.5; // knockout gap, as in core.js

const r3 = (n) => +n.toFixed(3);

function shapeD(tag, a) {
  if (tag === "path") return a.d;
  const rx = tag === "circle" ? +a.r : +a.rx, ry = tag === "circle" ? +a.r : +a.ry;
  const cx = +a.cx, cy = +a.cy;
  if (tag === "circle" || tag === "ellipse")
    return `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
  throw new Error(`unsupported tag ${tag}`);
}

// → { d: "M x y L x y C … Z", bbox: [minX, minY, maxX, maxY], length }
function normalize(d, transform) {
  let p = svgpath(d);
  if (transform) p = p.transform(transform);
  p = p.abs().unarc().unshort();
  const parts = [];
  let x = 0, y = 0, sx = 0, sy = 0, length = 0;
  const pts = [];
  const lineTo = (nx, ny) => { length += Math.hypot(nx - x, ny - y); parts.push(`L${r3(nx)} ${r3(ny)}`); x = nx; y = ny; pts.push([x, y]); };
  const cubicTo = (x1, y1, x2, y2, nx, ny) => {
    let px = x, py = y;
    for (let i = 1; i <= 16; i++) { // sample for length + bbox
      const t = i / 16, u = 1 - t;
      const qx = u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * nx;
      const qy = u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * ny;
      length += Math.hypot(qx - px, qy - py); px = qx; py = qy; pts.push([qx, qy]);
    }
    parts.push(`C${r3(x1)} ${r3(y1)} ${r3(x2)} ${r3(y2)} ${r3(nx)} ${r3(ny)}`);
    x = nx; y = ny;
  };
  p.iterate((s) => {
    switch (s[0]) {
      case "M": x = sx = s[1]; y = sy = s[2]; parts.push(`M${r3(x)} ${r3(y)}`); pts.push([x, y]); break;
      case "L": lineTo(s[1], s[2]); break;
      case "H": lineTo(s[1], y); break;
      case "V": lineTo(x, s[1]); break;
      case "C": cubicTo(s[1], s[2], s[3], s[4], s[5], s[6]); break;
      case "Q": cubicTo(x + (2 / 3) * (s[1] - x), y + (2 / 3) * (s[2] - y), s[3] + (2 / 3) * (s[1] - s[3]), s[4] + (2 / 3) * (s[2] - s[4]), s[3], s[4]); break;
      case "Z": length += Math.hypot(sx - x, sy - y); x = sx; y = sy; parts.push("Z"); break;
      default: throw new Error(`unexpected segment ${s[0]} in ${d}`);
    }
  });
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  return { d: parts.join(""), bbox: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], length };
}

const center = (b) => [r3((b[0] + b[2]) / 2), r3((b[1] + b[3]) / 2)];
const union = (bs) => [Math.min(...bs.map((b) => b[0])), Math.min(...bs.map((b) => b[1])), Math.max(...bs.map((b) => b[2])), Math.max(...bs.map((b) => b[3]))];
const PAINT = { none: 0, white: 1, black: 2 };

function motion(m, bbox) {
  if (!m.anim) return null;
  const o = m.origin ? m.origin.split(" ").map(Number) : center(bbox);
  const a = { n: m.anim, o };
  for (const k of ["delay", "x", "y", "deg", "s"]) if (m[k] !== undefined) a[k] = m[k];
  return a;
}

const icons = {};
for (const name of Icons.names) {
  const icon = Icons.ICONS[name];
  const g = [];
  const els = [];
  const boxes = [];
  for (const [kind, tag, attrs] of icon.els) {
    const { anim, origin, delay, deg, s, dx, dy, x, y, transform, ...a } = attrs; // no <rect>s, so x/y are motion
    const geo = normalize(shapeD(tag, a), transform);
    boxes.push(geo.bbox);
    const gi = g.push(geo.d) - 1;
    const attrFill = a.fill === "#000" ? PAINT.black : a.fill === "#fff" ? PAINT.white : PAINT.none;
    const noStroke = a["stroke-width"] === 0;
    const mul = +(/\*\s*([\d.]+)\)/.exec(a.style || "")?.[1] ?? 1);
    const cap = a["stroke-linecap"] === "square" ? 1 : 0;
    const eo = a["fill-rule"] === "evenodd" ? 1 : 0;
    let dash = null;
    if (a["stroke-dasharray"] && a.pathLength) {
      const k = geo.length / +a.pathLength;
      dash = [...String(a["stroke-dasharray"]).split(/[\s,]+/).map((v) => r3(+v * k)), r3(+(a["stroke-dashoffset"] || 0) * k)];
    }
    // op: [geometry, fill, stroke, strokeMul, strokeAdd, cap, evenodd, dash?]
    const op = (fill, stroke, m = mul, add = 0, gIndex = gi, c = cap) => {
      const o = [gIndex, fill, noStroke ? 0 : stroke, m, add, c, eo];
      if (dash && stroke) o.push(dash);
      return o;
    };
    const variants = {};
    for (const variant of ["line", "fill"]) {
      const filled = variant === "fill";
      let ops;
      if (kind === "k") ops = [op(PAINT.black, PAINT.black, 1, 2 * GAP), op(filled ? PAINT.white : attrFill, PAINT.white)];
      else if (kind === "s" && tag === "circle" && +a.r <= 1.25) {
        // tiny circles are drawn as round-capped dots (see core.js)
        const di = g.indexOf(`M${r3(+a.cx)} ${r3(+a.cy)}L${r3(+a.cx)} ${r3(+a.cy)}`);
        const dot = di > -1 ? di : g.push(`M${r3(+a.cx)} ${r3(+a.cy)}L${r3(+a.cx)} ${r3(+a.cy)}`) - 1;
        ops = [op(PAINT.none, PAINT.white, 1, 2 * +a.r, dot, 0)];
      } else if (kind === "s") ops = [op(filled ? PAINT.white : attrFill, PAINT.white)];
      else if (kind === "c") ops = [op(attrFill, filled ? PAINT.black : PAINT.white)];
      else if (kind === "d") ops = [[gi, filled ? PAINT.black : PAINT.white, 0, 1, 0, 0, eo]];
      else ops = [op(attrFill, PAINT.white)];
      variants[variant] = ops;
    }
    const el = { line: variants.line, fill: variants.fill };
    const m = motion({ anim, origin, delay, deg, s, x: dx ?? x, y: dy ?? y }, geo.bbox);
    if (m) el.a = m;
    els.push(el);
  }
  const entry = { c: icon.category, g, e: els };
  const m = motion({ anim: icon.anim, origin: icon.origin, delay: icon.delay, deg: icon.deg, s: icon.s, x: icon.x, y: icon.y }, union(boxes));
  if (m) entry.a = m;
  icons[name] = entry;
}

const res = path.join(out, "Sources/RelativeDesign/Resources");
fs.mkdirSync(res, { recursive: true });
fs.writeFileSync(path.join(res, "icons.json"), JSON.stringify({ version: 1, gap: GAP, icons }));

const KEYWORDS = new Set(("associatedtype class deinit enum extension fileprivate func import init inout internal let open operator private " +
  "precedencegroup protocol public rethrows static struct subscript typealias var break case catch continue default defer do else " +
  "fallthrough for guard if in repeat return throw switch where while Any as await false is nil self Self super throws true try " +
  "some any consume copy discard borrowing consuming").split(" "));
const camel = (n) => n.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const ident = (n) => (KEYWORDS.has(camel(n)) ? `\`${camel(n)}\`` : camel(n));
const swift = `// Generated by relative-design/tools/export-swift.cjs. Do not edit.

/// Every icon in the Relative set (${Icons.names.length}).
public enum RelativeIconName: String, CaseIterable, Sendable, Hashable {
${Icons.names.map((n) => `    case ${ident(n)}${camel(n) !== n ? ` = "${n}"` : ""}`).join("\n")}

    /// The category the icon belongs to (e.g. "arrows", "status", "social").
    public var category: String {
        switch self {
${Object.entries(Icons.names.reduce((acc, n) => ((acc[Icons.ICONS[n].category] ||= []).push(n), acc), {}))
  .map(([cat, ns]) => `        case ${ns.map((n) => `.${ident(n)}`).join(", ")}: return "${cat}"`).join("\n")}
        }
    }
}
`;
const iconsDir = path.join(out, "Sources/RelativeDesign/Icons");
fs.mkdirSync(iconsDir, { recursive: true });
fs.writeFileSync(path.join(iconsDir, "RelativeIconName.swift"), swift);

const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0);
console.log(`${Icons.names.length} icons → icons.json (${kb(path.join(res, "icons.json"))} KB) + RelativeIconName.swift`);
