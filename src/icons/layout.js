// Layout: windows, panels, shapes. All paths drawn from grid geometry. Block-scoped helpers.
{
const f = (v) => +v.toFixed(2);
// Rounded rect as a path (rect x/y attrs are reserved for motion params).
const rr = (x, y, w, h, r) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
// Closed polygon, every corner filleted by a true arc: [[x, y, r], ...].
const poly = (pts) =>
  pts.map(([x, y, r], i) => {
    const [ax, ay] = pts[(i + pts.length - 1) % pts.length], [bx, by] = pts[(i + 1) % pts.length];
    const la = Math.hypot(ax - x, ay - y), lb = Math.hypot(bx - x, by - y);
    const ux = (ax - x) / la, uy = (ay - y) / la, vx = (bx - x) / lb, vy = (by - y) / lb;
    const t = r / Math.tan(Math.acos(ux * vx + uy * vy) / 2);
    const sweep = (x - ax) * (by - y) - (y - ay) * (bx - x) > 0 ? 1 : 0;
    return `${i ? "L" : "M"}${f(x + ux * t)} ${f(y + uy * t)}A${r} ${r} 0 0 ${sweep} ${f(x + vx * t)} ${f(y + vy * t)}`;
  }).join("") + "Z";
// Regular polygon around (cx, cy): n corners at radius R, first corner at angle a0, all filleted by rc.
const ngon = (cx, cy, n, R, rc, a0 = -90) =>
  poly(Array.from({ length: n }, (_, i) => {
    const a = ((a0 + (i * 360) / n) * Math.PI) / 180;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a), rc];
  }));
// Flat isometric sheet centred on (cx, cy): side tips (radius rs) land at cx ± hw, slope s.
const sheet = (cx, cy, hw, s, rs, rt) => {
  const half = Math.atan(s), w = hw + rs * (1 / Math.sin(half) - 1), h = w * s;
  return poly([[cx, cy - h, rt], [cx + w, cy, rs], [cx, cy + h, rt], [cx - w, cy, rs]]);
};

// Dividers touching the frame: square caps end exactly on its outer edge at any stroke width.
const SQ = { "stroke-linecap": "square" };
const BOX = rr(3.5, 3.5, 17, 17, 4);
const box = ["s", "path", { d: BOX }];
const dot = (cx, cy, m = {}) => ["s", "circle", { cx, cy, r: 0.75, ...m }];
// Four soft corner brackets inside 3.5–20.5; arm = straight run after the corner arc.
const corners = (arm, r, inset, m) => {
  const a = 3.5, b = 20.5, L = arm + r;
  return [
    [`M${a} ${a + L}V${a + r}A${r} ${r} 0 0 1 ${a + r} ${a}H${a + L}`, -1, -1],
    [`M${b - L} ${a}H${b - r}A${r} ${r} 0 0 1 ${b} ${a + r}V${a + L}`, 1, -1],
    [`M${b} ${b - L}V${b - r}A${r} ${r} 0 0 1 ${b - r} ${b}H${b - L}`, 1, 1],
    [`M${a + L} ${b}H${a + r}A${r} ${r} 0 0 1 ${a} ${b - r}V${b - L}`, -1, 1],
  ].map(([d, sx, sy]) => ["l", "path", { d, ...(m && { anim: "nudge", x: sx * inset, y: sy * inset, ...m }) }]);
};

Icons.define("layout", {
  // Panels: the divider slides as if the panel is being pulled open, then springs back.
  sidebar: { els: [box, ["c", "path", { d: "M9.5 3.5v17", ...SQ, anim: "nudge", x: 2.5 }]] },
  "sidebar-right": { els: [box, ["c", "path", { d: "M14.5 3.5v17", ...SQ, anim: "nudge", x: -2.5 }]] },
  "panel-top": { els: [box, ["c", "path", { d: "M3.5 9.5h17", ...SQ, anim: "nudge", y: 2.5 }]] },
  "panel-bottom": { els: [box, ["c", "path", { d: "M3.5 14.5h17", ...SQ, anim: "nudge", y: -2.5 }]] },
  columns: {
    els: [
      box,
      ["c", "path", { d: "M9.25 3.5v17", ...SQ, anim: "draw" }],
      ["c", "path", { d: "M14.75 3.5v17", ...SQ, anim: "draw", delay: 0.12 }],
    ],
  },
  rows: {
    els: [
      box,
      ["c", "path", { d: "M3.5 9.25h17", ...SQ, anim: "draw" }],
      ["c", "path", { d: "M3.5 14.75h17", ...SQ, anim: "draw", delay: 0.12 }],
    ],
  },
  "app-window": {
    els: [
      box,
      ["c", "path", { d: "M3.5 9h17", ...SQ }],
      ["d", "circle", { cx: 7.25, cy: 6.25, r: 1, anim: "pop", s: 1.45 }],
      ["d", "circle", { cx: 10.5, cy: 6.25, r: 1, anim: "pop", s: 1.45, delay: 0.08 }],
      ["d", "circle", { cx: 13.75, cy: 6.25, r: 1, anim: "pop", s: 1.45, delay: 0.16 }],
    ],
  },
  layers: {
    // the stack fans upward, top sheet first
    els: [
      ["s", "path", { d: sheet(12, 15.9, 8.25, 0.4, 2, 2.5), anim: "bounce", y: -2, origin: "12 20.6", delay: 0.16 }],
      ["k", "path", { d: sheet(12, 11.3, 8.25, 0.4, 2, 2.5), anim: "bounce", y: -2.25, origin: "12 16", delay: 0.08 }],
      ["k", "path", { d: sheet(12, 6.7, 8.25, 0.4, 2, 2.5), anim: "bounce", y: -2.5, origin: "12 11.4" }],
    ],
  },
  frame: {
    els: [
      ["l", "path", { d: "M3.5 8h17", anim: "nudge", y: -1.5 }],
      ["l", "path", { d: "M3.5 16h17", anim: "nudge", y: 1.5 }],
      ["l", "path", { d: "M8 3.5v17", anim: "nudge", x: -1.5 }],
      ["l", "path", { d: "M16 3.5v17", anim: "nudge", x: 1.5 }],
    ],
  },
  crop: {
    // both corners close in on the crop area
    els: [
      ["l", "path", { d: "M7 3.5V14a3 3 0 0 0 3 3h10.5", anim: "nudge", x: 1.25, y: -1.25 }],
      ["l", "path", { d: "M17 20.5V10a3 3 0 0 0-3-3H3.5", anim: "nudge", x: -1.25, y: 1.25 }],
    ],
  },
  focus: {
    els: [
      ...corners(2, 3.5, 1.25, {}),
      ["s", "circle", { cx: 12, cy: 12, r: 3, anim: "pop", s: 1.22, delay: 0.14 }],
    ],
  },
  scan: {
    els: [...corners(2, 3.5), ["l", "path", { d: "M7.5 12h9", anim: "nudge", y: 4.25 }]],
  },
  split: {
    // one path forks; each branch shoots out along its own diagonal
    els: [
      ["l", "path", { d: "M12 20.5v-6.5a4 4 0 0 0-1.17-2.83" }],
      ["l", "path", { d: "M12 14a4 4 0 0 1 1.17-2.83" }],
      ["l", "path", { d: "M10.83 11.17 5 5.34M5 9.5V5.34h4.16", anim: "nudge", x: -1.75, y: -1.75 }],
      ["l", "path", { d: "M13.17 11.17 19 5.34M19 9.5V5.34h-4.16", anim: "nudge", x: 1.75, y: -1.75 }],
    ],
  },
  kanban: {
    els: [
      box,
      ["c", "path", { d: "M7.5 8v8", anim: "bounce", y: -1.5, origin: "7.5 16" }],
      ["c", "path", { d: "M12 8v4", anim: "bounce", y: -1.5, origin: "12 12", delay: 0.09 }],
      ["c", "path", { d: "M16.5 8v6", anim: "bounce", y: -1.5, origin: "16.5 14", delay: 0.18 }],
    ],
  },
  dock: {
    // apps hop in the dock, one after another
    els: [
      box,
      ["d", "circle", { cx: 8, cy: 16.25, r: 1.25, anim: "bounce", y: -2, origin: "8 17.5" }],
      ["d", "circle", { cx: 12, cy: 16.25, r: 1.25, anim: "bounce", y: -2, origin: "12 17.5", delay: 0.1 }],
      ["d", "circle", { cx: 16, cy: 16.25, r: 1.25, anim: "bounce", y: -2, origin: "16 17.5", delay: 0.2 }],
    ],
  },
  gallery: {
    // thumbnails ripple, then the big picture takes the pick
    els: [
      ["s", "path", { d: rr(3.5, 3.5, 17, 11.5, 3.5), anim: "pop", s: 1.08, origin: "12 15", delay: 0.24 }],
      ["c", "path", { d: "M7.25 11.5l2.5-2.5 2.5 2.5", anim: "pop", s: 1.08, origin: "12 15", delay: 0.24 }],
      ["d", "circle", { cx: 15.75, cy: 8, r: 1.25, anim: "pop", s: 1.08, origin: "12 15", delay: 0.24 }],
      ["l", "path", { d: "M5 19.5h2.5", anim: "bounce", y: -1.5 }],
      ["l", "path", { d: "M10.75 19.5h2.5", anim: "bounce", y: -1.5, delay: 0.08 }],
      ["l", "path", { d: "M16.5 19.5h2.5", anim: "bounce", y: -1.5, delay: 0.16 }],
    ],
  },

  // Plain shapes: each does its own trick.
  square: { els: [["s", "path", { d: rr(4, 4, 16, 16, 4), anim: "turn", deg: 90, origin: "12 12" }]] },
  circle: { els: [["s", "circle", { cx: 12, cy: 12, r: 9, anim: "bounce", y: -3, origin: "12 21" }]] },
  triangle: { els: [["s", "path", { d: ngon(12, 13.875, 3, 12.5, 2.5), anim: "turn", deg: 120, origin: "12 13.875" }]] },
  hexagon: { els: [["s", "path", { d: ngon(12, 12, 6, 9.25, 2.5), anim: "turn", deg: 60, origin: "12 12" }]] },
  shapes: {
    els: [
      ["s", "path", { d: rr(3.5, 3.5, 6.75, 6.75, 2), anim: "pop", s: 1.15 }],
      ["s", "path", { d: ngon(12, 17.5, 3, 6, 1.75), anim: "pop", s: 1.15, origin: "12 17.5", delay: 0.1 }],
      ["s", "circle", { cx: 17, cy: 6.875, r: 3.5, anim: "pop", s: 1.15, delay: 0.2 }],
    ],
  },
  component: {
    // the four pieces breathe outward in a clockwise ripple
    els: [
      [12, 6, 0, -1], [18, 12, 1, 0], [12, 18, 0, 1], [6, 12, -1, 0],
    ].map(([cx, cy, sx, sy], i) => ["s", "path", {
      d: poly([[cx, cy - 3.25, 1.25], [cx + 3.25, cy, 1.25], [cx, cy + 3.25, 1.25], [cx - 3.25, cy, 1.25]]),
      anim: "nudge", ...(sx && { x: sx * 1.25 }), ...(sy && { y: sy * 1.25 }), delay: i * 0.06,
    }]),
  },
  blocks: {
    // the loose block hops and lands in its slot
    els: [
      ["s", "path", { d: poly([[3.5, 3.5, 2], [9.75, 3.5, 2], [9.75, 14.25, 2], [20.5, 14.25, 2], [20.5, 20.5, 2], [3.5, 20.5, 2]]) }],
      ["s", "path", { d: rr(14.25, 3.5, 6.25, 6.25, 2), anim: "bounce", y: -2.5, origin: "17.375 9.75" }],
    ],
  },
  "layout-dashboard": {
    els: [
      ["s", "path", { d: rr(3.5, 3.5, 6.25, 9, 2), anim: "bounce", y: -1.5, origin: "6.625 12.5" }],
      ["s", "path", { d: rr(14.25, 3.5, 6.25, 3.75, 1.5), anim: "bounce", y: -1.5, origin: "17.375 7.25", delay: 0.07 }],
      ["s", "path", { d: rr(3.5, 17, 6.25, 3.5, 1.5), anim: "bounce", y: -1.5, origin: "6.625 20.5", delay: 0.14 }],
      ["s", "path", { d: rr(14.25, 11.75, 6.25, 8.75, 2), anim: "bounce", y: -1.5, origin: "17.375 20.5", delay: 0.21 }],
    ],
  },
  "picture-in-picture": {
    els: [box, ["d", "path", { d: rr(11, 11.5, 6, 5, 1.5), anim: "nudge", x: 1.5, y: 1.5 }]],
  },
  "rectangle-horizontal": {
    els: [["s", "path", { d: rr(3, 6.5, 18, 11, 3.5), anim: "squash", origin: "12 17.5" }]],
  },
  "grip-vertical": {
    // a ripple runs down the handle
    els: [6, 12, 18].flatMap((y, i) => [9.25, 14.75].map((x) => dot(x, y, { anim: "nudge", x: 1.5, delay: i * 0.1 }))),
  },
  "grip-horizontal": {
    els: [6, 12, 18].flatMap((x, i) => [9.25, 14.75].map((y) => dot(x, y, { anim: "bounce", y: -1.75, delay: i * 0.1 }))),
  },
});
}
