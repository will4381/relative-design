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

  // Keycap: soft square with a lip line near the bottom for depth. The whole key presses down;
  // the glyph sits on the key top, so it rides along.
  const CAP = rr(3.5, 3.5, 17, 17, 4.5);
  const LIP = "M8.5 17.5h7";
  const key = (...glyph) => ({ ...N(0, 1.25), els: [["s", "path", { d: CAP }], ["c", "path", { d: LIP }], ...glyph] });
  const g = (d, more) => ["c", "path", { d, ...more }];

  const SHIFT = [[12, 3.5, 2], [21, 12.5, 2], [15.5, 12.5, 1], [15.5, 20.5, 1.5], [8.5, 20.5, 1.5], [8.5, 12.5, 1], [3, 12.5, 2]];
  const CAPS = [[12, 3.5, 2], [20.5, 11.5, 2], [15.5, 11.5, 1], [15.5, 16, 1.25], [8.5, 16, 1.25], [8.5, 11.5, 1], [3.5, 11.5, 2]];
  const MINI_SHIFT = [[12, 6, 1.5], [16.25, 10.25, 1.25], [14, 10.25, 0.75], [14, 13.5, 1], [10, 13.5, 1], [10, 10.25, 0.75], [7.75, 10.25, 1.25]];

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
    "key-command": key(g(cmd(12, 10, 1.25, 1.4))),
    "key-option": key(g("M8 7.5h2l4 5h2M13.5 7.5h2.5")),
    "key-shift": key(g(soft(MINI_SHIFT))),
    "key-control": key(g("M8 12l4-4 4 4")),
    "key-escape": key(g("M14.34 8.11A3.25 3.25 0 1 1 10.36 12.09"), g("M13.5 11.25L8.75 6.5M8.75 9V6.5h2.5")),
    "key-tab": key(g("M7.5 10h5.5M10.75 7.5l2.5 2.5-2.5 2.5M16.5 7v6")),
    "key-return": key(g("M16 6.75V9a2 2 0 0 1-2 2H8M10.75 8.25L8 11l2.75 2.75")),
    "key-delete": key(g(soft([[6, 10, 1], [9.5, 6.25, 1], [18, 6.25, 1.5], [18, 13.75, 1.5], [9.5, 13.75, 1]])), g("M12.75 9l2 2M14.75 9l-2 2")),
    "key-space": key(g("M8 8.25V11a1.25 1.25 0 0 0 1.25 1.25h5.5A1.25 1.25 0 0 0 16 11V8.25")),
    "key-up": key(g("M12 13.25v-6.5M9 9.75l3-3 3 3")),
    "key-down": key(g("M12 6.75v6.5M9 10.25l3 3 3-3")),
    "key-left": key(g("M15.5 10h-7M11.5 7l-3 3 3 3")),
    "key-right": key(g("M8.5 10h7M12.5 7l3 3-3 3")),
    "key-windows": key(...panes(8, 16, 10, 3, 3.75, 1.25, 0.75).map((d) => ["d", "path", { d }])),
    "key-fn": key(g("M9.5 13.25V8.5a1.75 1.75 0 0 1 1.75-1.75M8 9.5h3"), g("M13.5 9.5v3.75M13.5 11.25a1.5 1.5 0 0 1 3 0v2")),

    // two keys pressed one after the other
    shortcut: {
      els: [
        ["s", "path", { d: rr(3, 8.75, 5.5, 6.5, 1.75), ...N(0, 1.25) }],
        ["l", "path", { d: "M10.75 12h2.5M12 10.75v2.5" }],
        ["s", "path", { d: rr(15.5, 8.75, 5.5, 6.5, 1.75), ...N(0, 1.25, 0.15) }],
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
