// Editor: text formatting. Letterforms are soft geometric strokes; every acute tip is filleted.
(function () {
  const f = (v) => +v.toFixed(2);
  // Polyline through [x, y, r?] points; any point with r gets a true arc fillet. closed → polygon.
  function poly(pts, closed = false) {
    const n = pts.length;
    return pts.map(([x, y, r], i) => {
      const cmd = i ? "L" : "M";
      if (!r || (!closed && (i === 0 || i === n - 1))) return `${cmd}${f(x)} ${f(y)}`;
      const [ax, ay] = pts[(i + n - 1) % n], [bx, by] = pts[(i + 1) % n];
      const l1 = Math.hypot(ax - x, ay - y), l2 = Math.hypot(bx - x, by - y);
      const u = [(ax - x) / l1, (ay - y) / l1], v = [(bx - x) / l2, (by - y) / l2];
      const t = r / Math.tan(Math.acos(u[0] * v[0] + u[1] * v[1]) / 2);
      const sweep = u[0] * v[1] - u[1] * v[0] < 0 ? 1 : 0;
      return `${cmd}${f(x + u[0] * t)} ${f(y + u[1] * t)}A${r} ${r} 0 0 ${sweep} ${f(x + v[0] * t)} ${f(y + v[1] * t)}`;
    }).join("") + (closed ? "Z" : "");
  }
  // Points along a 45° axis (lower-left → upper-right) from o: a = along, b = across.
  const K = Math.SQRT1_2;
  const ax45 = (o, list) => list.map(([a, b, r]) => [o[0] + (a + b) * K, o[1] + (b - a) * K, r]);
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;

  // Digits. "1": short flag filleted into the stem (no needle at the top).
  const one = (x, y, h) => poly([[x - 2.5, y + 1.4], [x, y, 1.5], [x, y + h]]);
  // "2": round shoulder, S-curve down into a square-ish foot (90° corner, no acute tip).
  const two = (x, y, w, h) => {
    const R = w / 2, k = h - R;
    return `M${x} ${y + R}a${R} ${R} 0 0 1 ${w} 0C${x + w} ${f(y + R + k * 0.45)} ${x} ${f(y + h - k * 0.4)} ${x} ${y + h}h${w}`;
  };

  // B: stem + two bowls with softened outer corners. Drawn twice, ±.5 apart, so the stems get bold-face weight.
  const B =
    "M6.75 12V5.5A1.5 1.5 0 0 1 8.25 4h4a4 4 0 0 1 0 8H6.75" +
    "M6.75 12h6.5a4 4 0 0 1 0 8h-5a1.5 1.5 0 0 1-1.5-1.5V12";
  const H = (l, r, t, b) => `M${l} ${t}V${b}M${r} ${t}V${b}M${l} ${(t + b) / 2}H${r}`;
  const X = (x, y) => `M${x} ${y}l8 9M${x + 8} ${y}l-8 9`;
  // a soft-ended T bar: the ends curl down like a slab serif
  const tBar = (l, r, y) => `M${l} ${y + 2.5}V${y + 1.5}A1.5 1.5 0 0 1 ${l + 1.5} ${y}H${r - 1.5}A1.5 1.5 0 0 1 ${r} ${y + 1.5}V${y + 2.5}`;

  const ROWS = [4.5, 9.5, 14.5, 19.5];
  const lines = (spans, motion) => spans.map(([a, b], i) => ["l", "path", { d: `M${a} ${ROWS[i]}H${b}`, ...motion(i) }]);

  // Highlighter: body + chisel tip along the diagonal; eraser: one block with a sleeve band.
  const HL = [6, 15.75];
  const ER = [6.5, 15];

  Icons.define("editor", {
    bold: {
      anim: "pop",
      s: 1.16,
      origin: "12 12",
      els: [
        ["l", "path", { d: B, transform: "translate(-.5 0)" }],
        ["l", "path", { d: B, transform: "translate(.5 0)" }],
      ],
    },
    italic: {
      // leans further over, pivoting on the baseline
      anim: "tilt",
      deg: 12,
      origin: "10.3 20",
      els: [["l", "path", { d: "M10.2 4h7M13.7 4l-3.4 16M6.8 20h7" }]],
    },
    underline: {
      els: [
        ["l", "path", { d: "M7 3.75v6.5a5 5 0 0 0 10 0v-6.5", anim: "bounce", y: -2, origin: "12 15.25", delay: 0.12 }],
        ["l", "path", { d: "M5 20.25h14", anim: "draw" }],
      ],
    },
    strikethrough: {
      els: [
        ["l", "path", { d: "M16.5 7.25C16 5.25 14.25 4 12 4 9.5 4 7.5 5.5 7.5 7.75 7.5 12.75 16.5 11.25 16.5 16.25 16.5 18.5 14.5 20 12 20 9.75 20 8 18.75 7.5 16.75" }],
        ["l", "path", { d: "M3.5 12h17", anim: "draw" }],
      ],
    },
    heading: {
      anim: "bounce",
      y: -2.5,
      origin: "12 20",
      els: [["l", "path", { d: H(6, 18, 4, 20) }]],
    },
    "heading-1": {
      els: [
        ["l", "path", { d: H(4, 12, 4.5, 19.5) }],
        ["l", "path", { d: one(19.5, 9.5, 10), anim: "bounce", y: -3, origin: "19.5 19.5" }],
      ],
    },
    "heading-2": {
      els: [
        ["l", "path", { d: H(3.5, 11.5, 4.5, 19.5) }],
        ["l", "path", { d: two(15.75, 9.5, 4.75, 10), anim: "bounce", y: -3, origin: "18.1 19.5" }],
      ],
    },
    type: {
      // stamped like a type block: squash on its foot
      anim: "squash",
      origin: "12 20",
      els: [
        ["l", "path", { d: tBar(5, 19, 4) }],
        ["l", "path", { d: "M12 4v16M9.5 20h5" }],
      ],
    },
    quote: {
      els: [
        ["s", "circle", { cx: 7, cy: 15, r: 2.75, anim: "bounce", y: -2.5, origin: "7 17.75" }],
        ["l", "path", { d: "M4.25 15c0-4 1.75-7 5.25-8.5", anim: "bounce", y: -2.5, origin: "7 17.75" }],
        ["s", "circle", { cx: 17, cy: 15, r: 2.75, anim: "bounce", y: -2.5, origin: "17 17.75", delay: 0.12 }],
        ["l", "path", { d: "M14.25 15c0-4 1.75-7 5.25-8.5", anim: "bounce", y: -2.5, origin: "17 17.75", delay: 0.12 }],
      ],
    },

    "align-left": { els: lines([[3.5, 20.5], [3.5, 14], [3.5, 18], [3.5, 11.5]], (i) => ({ anim: "nudge", x: -2.5, delay: i * 0.07 })) },
    "align-center": { els: lines([[3.5, 20.5], [7, 17], [5, 19], [8, 16]], (i) => ({ anim: "nudge", x: i % 2 ? -2 : 2, delay: i * 0.06 })) },
    "align-right": { els: lines([[3.5, 20.5], [10, 20.5], [6, 20.5], [12.5, 20.5]], (i) => ({ anim: "nudge", x: 2.5, delay: i * 0.07 })) },
    "align-justify": { els: lines([[3.5, 20.5], [3.5, 20.5], [3.5, 20.5], [3.5, 20.5]], (i) => ({ anim: "squash", delay: i * 0.09 })) },

    "list-ordered": {
      els: [
        ["l", "path", { d: one(6.5, 3.25, 5.5), anim: "pop", s: 1.25, origin: "5.5 6" }],
        ["l", "path", { d: two(3.5, 15.25, 4, 5.5), anim: "pop", s: 1.25, origin: "5.5 18", delay: 0.16 }],
        ["l", "path", { d: "M11.5 6h9", anim: "draw", delay: 0.04 }],
        ["l", "path", { d: "M11.5 12h9", anim: "draw", delay: 0.12 }],
        ["l", "path", { d: "M11.5 18h9", anim: "draw", delay: 0.2 }],
      ],
    },
    "list-checks": {
      els: [
        ["l", "path", { d: "M3.5 6.25l2 2 4-4.5", anim: "draw" }],
        ["l", "path", { d: "M3.5 18.25l2 2 4-4.5", anim: "draw", delay: 0.2 }],
        ["l", "path", { d: "M13 6h7.5" }],
        ["l", "path", { d: "M13 12h7.5" }],
        ["l", "path", { d: "M13 18h7.5" }],
      ],
    },
    "indent-increase": {
      els: [
        ["l", "path", { d: "M3.5 4.5h17M3.5 19.5h17" }],
        ["l", "path", { d: "M4 8.5l3.5 3.5L4 15.5", anim: "nudge", x: 2 }],
        ["l", "path", { d: "M12.5 9.5h8", anim: "nudge", x: 1.5, delay: 0.08 }],
        ["l", "path", { d: "M12.5 14.5h8", anim: "nudge", x: 1.5, delay: 0.13 }],
      ],
    },
    "indent-decrease": {
      els: [
        ["l", "path", { d: "M3.5 4.5h17M3.5 19.5h17" }],
        ["l", "path", { d: "M7.5 8.5 4 12l3.5 3.5", anim: "nudge", x: -2 }],
        ["l", "path", { d: "M12.5 9.5h8", anim: "nudge", x: -1.5, delay: 0.08 }],
        ["l", "path", { d: "M12.5 14.5h8", anim: "nudge", x: -1.5, delay: 0.13 }],
      ],
    },
    subscript: {
      els: [
        ["l", "path", { d: X(4, 4.5) }],
        ["l", "path", { d: two(15.5, 15, 4, 5.5), anim: "nudge", y: 2 }],
      ],
    },
    superscript: {
      els: [
        ["l", "path", { d: X(4, 10.5) }],
        ["l", "path", { d: two(15.5, 3.5, 4, 5.5), anim: "nudge", y: -2 }],
      ],
    },
    highlighter: {
      els: [
        ["s", "path", { d: poly(ax45(HL, [[16.5, -3.25, 2.5], [16.5, 3.25, 2.5], [8, 3.25, 1], [5.5, 2, 1], [1, 2, 1.5], [2.75, -2, 1.5], [5.5, -2, 1], [8, -3.25, 1]]), true), anim: "nudge", x: 3 }],
        ["c", "path", { d: poly(ax45(HL, [[8.75, -3.25], [8.75, 3.25]])), anim: "nudge", x: 3 }],
        ["l", "path", { d: "M4 20.5h10", anim: "draw" }],
      ],
    },
    eraser: {
      els: [
        ["s", "path", { d: poly(ax45(ER, [[0, -3.5, 3], [14, -3.5, 3], [14, 3.5, 3], [0, 3.5, 3]]), true), anim: "shake", x: 2 }],
        ["c", "path", { d: poly(ax45(ER, [[5.5, -3.5], [5.5, 3.5]])), anim: "shake", x: 2 }],
        ["l", "path", { d: "M11 20.5h9.5" }],
      ],
    },
    pilcrow: {
      els: [
        ["s", "path", { d: "M13 4h-3a4 4 0 0 0 0 8h3Z", anim: "pop", s: 1.15, origin: "13 8" }],
        ["l", "path", { d: "M13 12v8", anim: "draw", delay: 0.12 }],
        ["l", "path", { d: "M13 4h5v16", anim: "draw", delay: 0.2 }],
      ],
    },
    "case-sensitive": {
      els: [
        ["l", "path", { d: poly([[3, 19], [7.5, 5.5, 2], [12, 19]]) + "M4.6 15h5.8", anim: "bounce", y: -2.5, origin: "7.5 19" }],
        ["l", "circle", { cx: 17.5, cy: 16.5, r: 2.5, anim: "bounce", y: -2.5, origin: "17.75 19", delay: 0.12 }],
        ["l", "path", { d: "M20 14v5", anim: "bounce", y: -2.5, origin: "17.75 19", delay: 0.12 }],
      ],
    },
    "wrap-text": {
      els: [
        ["l", "path", { d: "M3.5 6h17M3.5 18h5" }],
        ["l", "path", { d: "M3.5 12h14a3 3 0 0 1 0 6H13", anim: "draw" }],
        ["l", "path", { d: "M15.5 15.5 13 18l2.5 2.5", anim: "grow", origin: "13 18", delay: 0.36 }],
      ],
    },
    "remove-formatting": {
      els: [
        ["l", "path", { d: tBar(4, 16, 4) + "M10 4v15.5", anim: "shake", x: 1.25, delay: 0.1 }],
        ["l", "path", { d: "M15 15l5 5M20 15l-5 5", anim: "turn", deg: 90, origin: "17.5 17.5" }],
      ],
    },
    "text-cursor": {
      // blinks like a caret
      anim: "pulse",
      els: [
        ["l", "path", { d: "M8.5 4c2.25 0 3.5 1 3.5 3.25v9.5c0 2.25-1.25 3.25-3.5 3.25M15.5 4c-2.25 0-3.5 1-3.5 3.25M15.5 20c-2.25 0-3.5-1-3.5-3.25" }],
      ],
    },
    "spell-check": {
      els: [
        ["l", "path", { d: "M9.5 5.5V11", anim: "bounce", y: -1.5, origin: "7 11" }],
        ["l", "circle", { cx: 6.75, cy: 8.25, r: 2.75, anim: "bounce", y: -1.5, origin: "7 11" }],
        ["l", "path", { d: "M14 3v8", anim: "bounce", y: -1.5, origin: "16.5 11", delay: 0.08 }],
        ["l", "circle", { cx: 16.75, cy: 8.25, r: 2.75, anim: "bounce", y: -1.5, origin: "16.5 11", delay: 0.08 }],
        ["l", "path", { d: "M10.5 17l3 3 6.5-6.5", anim: "draw", delay: 0.2 }],
      ],
    },
    table: {
      els: [
        ["s", "path", { d: rr(3.5, 3.5, 17, 17, 4) }],
        ["c", "path", { d: "M5.5 9h13", anim: "draw" }],
        ["c", "path", { d: "M12 9v9.5", anim: "draw", delay: 0.1 }],
        ["c", "path", { d: "M5.5 14.75h13", anim: "draw", delay: 0.2 }],
      ],
    },
  });
})();
