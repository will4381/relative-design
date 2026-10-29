// Keys: bare Mac modifier glyphs, keycaps that press down, and combos.
(function () {
  const f = (v) => +v.toFixed(2);
  // Closed polygon with every corner filleted by an arc: pts = [[x, y, radius], ...] (same as actions.js).
  const soft = (pts) => {
    const n = pts.length;
    const c = pts.map(([x, y, r], i) => {
      const [px, py] = pts[(i + n - 1) % n], [nx, ny] = pts[(i + 1) % n];
      const l1 = Math.hypot(px - x, py - y), l2 = Math.hypot(nx - x, ny - y);
      const u1 = [(px - x) / l1, (py - y) / l1], u2 = [(nx - x) / l2, (ny - y) / l2];
      const half = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))) / 2;
      return { x, y, u1, u2, l2, tan: Math.tan(half), t: r / Math.tan(half), sweep: u1[0] * u2[1] - u1[1] * u2[0] < 0 ? 1 : 0 };
    });
    const k = c.map(() => 1);
    c.forEach((p, i) => {
      const q = c[(i + 1) % n], sc = Math.min(1, p.l2 / (p.t + q.t));
      k[i] = Math.min(k[i], sc); k[(i + 1) % n] = Math.min(k[(i + 1) % n], sc);
    });
    return c.map((p, i) => {
      const t = p.t * k[i], r = f(t * p.tan);
      const a = [p.x + p.u1[0] * t, p.y + p.u1[1] * t], b = [p.x + p.u2[0] * t, p.y + p.u2[1] * t];
      return `${i ? "L" : "M"}${f(a[0])} ${f(a[1])}A${r} ${r} 0 0 ${p.sweep} ${f(b[0])} ${f(b[1])}`;
    }).join("") + "Z";
  };
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  // ⌘ centred on (cx, cy): inner square half-size h, corner loops radius r.
  const cmd = (cx, cy, h, r) => {
    const a = f(cx - h), b = f(cy - h), s = f(2 * h + 2 * r);
    return `M${a} ${b}v-${r}a${r} ${r} 0 1 0-${r} ${r}h${s}a${r} ${r} 0 1 0-${r}-${r}v${s}a${r} ${r} 0 1 0 ${r}-${r}h-${s}a${r} ${r} 0 1 0 ${r} ${r}Z`;
  };
  // Four window panes in a 2×2 grid, drawn in slight perspective (right side nearer, so taller).
  // Spans x xa→xb around row line cy; hl/hr = half-height at the left/right edge; g = gap between panes.
  const panes = (xa, xb, cy, hl, hr, g, r) => {
    const top = (x) => cy - hl - ((hr - hl) * (x - xa)) / (xb - xa);
    const xm = xa + (xb - xa) * 0.47;
    const cols = [[xa, xm - g / 2], [xm + g / 2, xb]];
    const out = [];
    for (const row of [-1, 1])
      for (const [x0, x1] of cols) {
        const edge = (x) => (row < 0 ? top(x) : 2 * cy - top(x)), mid = cy + (row * g) / 2;
        const pts = row < 0
          ? [[x0, edge(x0), r], [x1, edge(x1), r], [x1, mid, r], [x0, mid, r]]
          : [[x0, mid, r], [x1, mid, r], [x1, edge(x1), r], [x0, edge(x0), r]];
        out.push(soft(pts));
      }
    return out; // order: top-left, top-right, bottom-left, bottom-right
  };
  const N = (x, y, delay) => ({ anim: "nudge", x, y, ...(delay ? { delay } : {}) });

  // Keycap: a clean soft square; the whole key presses down and the glyph rides along.
  // Glyphs are the bare glyphs at about half size, centred on (12, 12), ~8.5 units tall.
  const CAP = rr(3.5, 3.5, 17, 17, 4.5);
  const key = (...glyph) => ({ ...N(0, 1.25), els: [["s", "path", { d: CAP }], ...glyph] });
  const g = (d, more) => ["c", "path", { d, ...more }];

  const SHIFT = [[12, 3.5, 2], [21, 12.5, 2], [15.5, 12.5, 1], [15.5, 20.5, 1.5], [8.5, 20.5, 1.5], [8.5, 12.5, 1], [3, 12.5, 2]];
  const CAPS = [[12, 3.5, 2], [20.5, 11.5, 2], [15.5, 11.5, 1], [15.5, 16, 1.25], [8.5, 16, 1.25], [8.5, 11.5, 1], [3.5, 11.5, 2]];
  const MINI_SHIFT = [[12, 7.5, 1.5], [16.75, 12.25, 1.25], [14, 12.25, 0.75], [14, 16.25, 1], [10, 16.25, 1], [10, 12.25, 0.75], [7.25, 12.25, 1.25]];
  // ⎋ ring, open at the top-left where the arrow leaves (centre 13.25, r 3.75, gap -195°…-75°)
  const ESC_RING = "M14.22 9.63A3.75 3.75 0 1 1 9.63 14.22";

  Icons.define("keys", {
    // ⌥: the lower track is the default path, the short upper bar flips up like the alternate switch
    option: {
      els: [
        ["l", "path", { d: "M3.5 6.5h5l7 11h5" }],
        ["l", "path", { d: "M14.5 6.5h6", anim: "tilt", origin: "20.5 6.5", deg: 22 }],
      ],
    },
    shift: { ...N(0, -2.5), els: [["s", "path", { d: soft(SHIFT) }]] },
    control: { els: [["l", "path", { d: "M4.5 15.5L12 8l7.5 7.5", ...N(0, -2.5) }]] },
    // ⎋: the arrow escapes out through the gap in the ring
    escape: {
      els: [
        ["l", "path", { d: "M11.69 6.74A7 7 0 1 1 6.74 11.69" }],
        ["l", "path", { d: "M12.5 12.5l-8-8M4.5 9V4.5H9", ...N(-2, -2) }],
      ],
    },
    tab: {
      els: [
        ["l", "path", { d: "M3.5 12H16M11 7l5 5-5 5", ...N(2, 0) }],
        ["l", "path", { d: "M20.5 5.5v13" }],
      ],
    },
    "delete-forward": {
      els: [
        ["s", "path", { d: soft([[21, 12, 2], [15.5, 5, 2.5], [3, 5, 3.5], [3, 19, 3.5], [15.5, 19, 2.5]]) }],
        ["c", "path", { d: "M7 9.5l5 5M12 9.5l-5 5", anim: "shake", x: 1.25 }],
      ],
    },
    "caps-lock": {
      els: [
        ["s", "path", { d: soft(CAPS), ...N(0, -2.5) }],
        ["l", "path", { d: "M8.5 20.5h7", ...N(0, 0.75, 0.12) }],
      ],
    },
    eject: {
      els: [
        ["s", "path", { d: soft([[12, 4, 2], [20.5, 13.5, 2], [3.5, 13.5, 2]]), anim: "bounce", y: -3, origin: "12 13.5" }],
        ["l", "path", { d: "M3.5 19.5h17" }],
      ],
    },
    fn: {
      els: [
        ["l", "path", { d: "M7 18.5V8.5A3.5 3.5 0 0 1 10.5 5h.5M4 11h6", anim: "bounce", y: -2.5, origin: "7 18.5" }],
        ["l", "path", { d: "M13.5 11v7.5M13.5 14.5a3.25 3.25 0 0 1 6.5 0v4", anim: "bounce", y: -2.5, origin: "16.75 18.5", delay: 0.1 }],
      ],
    },
    windows: {
      els: panes(3.5, 20.5, 12, 6.5, 8.5, 4.5, 1.5).map((d, i) => ["s", "path", { d, anim: "pop", s: 1.15, delay: i * 0.07 }]),
    },

    keycap: key(),
    "key-command": key(g(cmd(12, 12, 1.5, 1.75))),
    "key-option": key(g("M7.25 9h2.75l4 6h2.75M13.75 9h3")),
    "key-shift": key(g(soft(MINI_SHIFT))),
    "key-control": key(g("M7.75 14.25L12 10l4.25 4.25")),
    "key-escape": key(g(ESC_RING), g("M12.75 12.75l-4.5-4.5M8.25 11V8.25H11")),
    "key-tab": key(g("M7.25 12h6.25M10.5 9l3 3-3 3M16.75 7.75v8.5")),
    "key-return": key(g("M16.5 8v2.75a2 2 0 0 1-2 2H7.75M10.75 9.75l-3 3 3 3")),
    "key-delete": key(g(soft([[6.5, 12, 1.5], [10.25, 7.5, 1.25], [17.5, 7.5, 1.75], [17.5, 16.5, 1.75], [10.25, 16.5, 1.25]])), g("M12.5 10.75l2.5 2.5M15 10.75l-2.5 2.5")),
    "key-space": key(g("M7.75 10.5v2.25a1.5 1.5 0 0 0 1.5 1.5h5.5a1.5 1.5 0 0 0 1.5-1.5V10.5")),
    "key-up": key(g("M12 16.25v-8.5M8.5 11.25L12 7.75l3.5 3.5")),
    "key-down": key(g("M12 7.75v8.5M8.5 12.75L12 16.25l3.5-3.5")),
    "key-left": key(g("M16.25 12h-8.5M11.25 8.5L7.75 12l3.5 3.5")),
    "key-right": key(g("M7.75 12h8.5M12.75 8.5L16.25 12l-3.5 3.5")),
    "key-windows": key(...panes(7.75, 16.25, 12, 3.75, 4.5, 1.5, 0.75).map((d) => ["d", "path", { d }])),
    "key-fn": key(g("M9 16.25V9.75a2 2 0 0 1 2-2M7.5 11h2.75"), g("M13 11v5.25M13 13a1.75 1.75 0 0 1 3.5 0v3.25")),

    // a ⌘ key in front of a second key: the front key presses, then the one behind it
    shortcut: {
      els: [
        ["s", "path", { d: rr(7.5, 3, 13.5, 13.5, 3.75), ...N(0, 1.25, 0.12) }],
        ["k", "path", { d: rr(3, 7.5, 13.5, 13.5, 3.75), ...N(0, 1.25) }],
        ["c", "path", { d: cmd(9.75, 14.25, 0.8, 1.5), ...N(0, 1.25) }],
      ],
    },
    touchpad: {
      anim: "squash",
      origin: "12 20",
      els: [
        ["s", "path", { d: rr(3, 4, 18, 16, 4) }],
        ["c", "path", { d: "M3 15h18M12 15v5" }],
      ],
    },
  });
})();
