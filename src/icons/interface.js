// Interface: actions, toggles, navigation chrome.
(function () {
  const r2 = (v) => Math.round(v * 100) / 100;
  // Closed polygon with every corner rounded by an explicit arc (no sharp tips): [[x, y, r], ...].
  function roundPoly(pts) {
    const n = pts.length;
    return pts.map(([x, y, r], i) => {
      const [ax, ay] = pts[(i + n - 1) % n], [bx, by] = pts[(i + 1) % n];
      const l1 = Math.hypot(ax - x, ay - y), l2 = Math.hypot(bx - x, by - y);
      const u = [(ax - x) / l1, (ay - y) / l1], v = [(bx - x) / l2, (by - y) / l2];
      const t = r / Math.tan(Math.acos(u[0] * v[0] + u[1] * v[1]) / 2);
      const sweep = u[0] * v[1] - u[1] * v[0] < 0 ? 1 : 0;
      return `${i ? "L" : "M"}${r2(x + u[0] * t)} ${r2(y + u[1] * t)}A${r} ${r} 0 0 ${sweep} ${r2(x + v[0] * t)} ${r2(y + v[1] * t)}`;
    }).join("") + "Z";
  }
  const polar = (r, deg) => [12 + r * Math.cos((deg * Math.PI) / 180), 12 + r * Math.sin((deg * Math.PI) / 180)];
  // Gear: n teeth, base radius rb, tip radius rt, every tooth corner softened.
  function gear(n, rb, rt, baseHalf, tipHalf) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i * 360) / n - 90;
      pts.push([...polar(rb, a - baseHalf), 0.75], [...polar(rt, a - tipHalf), 1], [...polar(rt, a + tipHalf), 1], [...polar(rb, a + baseHalf), 0.75]);
    }
    return roundPoly(pts);
  }

  // Rounded rect as a path: rect x/y attrs would collide with the motion params x/y.
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;

  const tray = "M4 15v2.5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V15";
  Icons.define("interface", {
    plus: { anim: "turn", deg: 90, els: [["l", "path", { d: "M12 4.5v15M4.5 12h15" }]] },
    minus: { els: [["l", "path", { d: "M4.5 12h15", anim: "draw" }]] },
    cross: { anim: "turn", deg: 90, els: [["l", "path", { d: "M6 6l12 12M18 6 6 18" }]] },
    check: { els: [["l", "path", { d: "M4.5 12.5l5 5 10-10", anim: "draw" }]] },

    "plus-circle": {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M12 8v8M8 12h8", anim: "turn", deg: 90, origin: "12 12" }],
      ],
    },
    "minus-circle": {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M8 12h8", anim: "draw" }],
      ],
    },
    "cross-circle": {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M9.25 9.25l5.5 5.5M14.75 9.25l-5.5 5.5", anim: "turn", deg: 90, origin: "12 12" }],
      ],
    },
    "check-circle": {
      anim: "pop",
      s: 1.08,
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M8 12.25l2.75 2.75L16 9.75", anim: "draw", delay: 0.12 }],
      ],
    },

    menu: {
      els: [
        ["l", "path", { d: "M4 6h16", anim: "nudge", x: 2.5 }],
        ["l", "path", { d: "M4 12h16", anim: "nudge", x: 2.5, delay: 0.07 }],
        ["l", "path", { d: "M4 18h16", anim: "nudge", x: 2.5, delay: 0.14 }],
      ],
    },
    "more-horizontal": {
      els: [
        ["s", "circle", { cx: 5, cy: 12, r: 1, anim: "bounce", y: -2.5 }],
        ["s", "circle", { cx: 12, cy: 12, r: 1, anim: "bounce", y: -2.5, delay: 0.1 }],
        ["s", "circle", { cx: 19, cy: 12, r: 1, anim: "bounce", y: -2.5, delay: 0.2 }],
      ],
    },
    "more-vertical": {
      els: [
        ["s", "circle", { cx: 12, cy: 5, r: 1, anim: "pop", s: 1.35 }],
        ["s", "circle", { cx: 12, cy: 12, r: 1, anim: "pop", s: 1.35, delay: 0.08 }],
        ["s", "circle", { cx: 12, cy: 19, r: 1, anim: "pop", s: 1.35, delay: 0.16 }],
      ],
    },

    search: {
      anim: "wiggle",
      origin: "20.25 20.25",
      deg: 10,
      els: [
        ["s", "circle", { cx: 10.75, cy: 10.75, r: 7 }],
        ["l", "path", { d: "M15.75 15.75l4.5 4.5" }],
      ],
    },
    filter: {
      anim: "squash",
      origin: "12 4",
      els: [
        ["s", "path", { d: roundPoly([[1, 3.5, 2], [23, 3.5, 2], [14, 12.5, 2], [14, 20.5, 1.5], [10, 20.5, 1.5], [10, 12.5, 2]]) }],
      ],
    },
    settings: {
      els: [
        ["s", "path", { d: gear(8, 6.75, 9, 15, 9), anim: "turn", deg: 45, origin: "12 12" }],
        ["c", "circle", { cx: 12, cy: 12, r: 2.75 }],
      ],
    },
    sliders: {
      els: [
        ["l", "path", { d: "M3.5 7.5H18" }],
        ["l", "path", { d: "M6 16.5h14.5" }],
        ["k", "circle", { cx: 17, cy: 7.5, r: 2.5, anim: "nudge", x: -3 }],
        ["k", "circle", { cx: 7, cy: 16.5, r: 2.5, anim: "nudge", x: 3, delay: 0.06 }],
      ],
    },
    home: {
      anim: "bounce",
      origin: "12 20.5",
      y: -2.5,
      els: [
        ["s", "path", { d: roundPoly([[12, 3.25, 2.5], [20, 9.5, 2], [20, 20.5, 3], [4, 20.5, 3], [4, 9.5, 2]]) }],
        ["c", "path", { d: "M9.75 20.5v-3.75a2.25 2.25 0 0 1 4.5 0v3.75" }],
      ],
    },

    // trash + pencil from _example.js; pencil body redrawn with a rounded nib.
    trash: {
      els: [
        ["s", "path", { d: "M5.5 6.5h13l-.85 11.9a3 3 0 0 1-3 2.6h-5.3a3 3 0 0 1-3-2.6Z" }],
        // lid + handle hinge up from the right end
        ["s", "path", { d: "M9 6.5V5a2.5 2.5 0 0 1 2.5-2.5h1A2.5 2.5 0 0 1 15 5v1.5Z", anim: "tilt", origin: "20.5 6.5", deg: 20 }],
        ["l", "path", { d: "M3.5 6.5h17", anim: "tilt", origin: "20.5 6.5", deg: 20 }],
        ["c", "path", { d: "M10 11v5" }],
        ["c", "path", { d: "M14 11v5" }],
      ],
    },
    pencil: {
      anim: "wiggle",
      origin: "5 19",
      deg: 10,
      els: [
        ["s", "path", { d: "M8.5 5a3.5 3.5 0 0 1 7 0v.5h-7Z", transform: "rotate(45 12 12) translate(0 1)" }],
        ["s", "path", { d: roundPoly([[8.5, 9, 1], [15.5, 9, 1], [15.5, 17, 1], [12, 21.58, 1.75], [8.5, 17, 1]]), transform: "rotate(45 12 12) translate(0 1)" }],
      ],
    },

    copy: {
      els: [
        ["s", "path", { d: rr(3.5, 3.5, 12, 12, 3) }],
        ["k", "path", { d: rr(8.5, 8.5, 12, 12, 3), anim: "nudge", x: 2, y: 2 }],
      ],
    },
    clipboard: {
      els: [
        ["s", "path", { d: rr(4.75, 4.75, 14.5, 16.25, 3.5) }],
        ["k", "path", { d: rr(8.5, 3, 7, 3.75, 1.5), anim: "bounce", y: -2.5, origin: "12 6.75" }],
      ],
    },
    link: {
      els: [
        ["l", "path", { d: "M10 7.5H7.5a4.5 4.5 0 0 0 0 9H10", transform: "rotate(-45 12 12)", anim: "nudge", x: 1.25, y: -1.25 }],
        ["l", "path", { d: "M14 7.5h2.5a4.5 4.5 0 0 1 0 9H14", transform: "rotate(-45 12 12)", anim: "nudge", x: -1.25, y: 1.25 }],
        ["l", "path", { d: "M8.5 12h7", transform: "rotate(-45 12 12)" }],
      ],
    },
    share: {
      els: [
        ["l", "path", { d: "M8.5 9.5H8a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5a3 3 0 0 0-3-3h-.5", anim: "squash", origin: "12 20.5", delay: 0.12 }],
        ["l", "path", { d: "M12 14V3.5M8.5 7l3.5-3.5L15.5 7", anim: "nudge", y: -2.5 }],
      ],
    },
    "share-nodes": {
      els: [
        ["l", "path", { d: "M17.5 6 6.5 12l11 6" }],
        ["k", "circle", { cx: 17.5, cy: 6, r: 2.75, anim: "pop", s: 1.2, delay: 0.1 }],
        ["k", "circle", { cx: 6.5, cy: 12, r: 2.75, anim: "pop", s: 1.2 }],
        ["k", "circle", { cx: 17.5, cy: 18, r: 2.75, anim: "pop", s: 1.2, delay: 0.2 }],
      ],
    },

    grid: {
      els: [
        ["s", "path", { d: rr(3.5, 3.5, 6.25, 6.25, 2), anim: "pop", s: 1.14 }],
        ["s", "path", { d: rr(14.25, 3.5, 6.25, 6.25, 2), anim: "pop", s: 1.14, delay: 0.07 }],
        ["s", "path", { d: rr(14.25, 14.25, 6.25, 6.25, 2), anim: "pop", s: 1.14, delay: 0.14 }],
        ["s", "path", { d: rr(3.5, 14.25, 6.25, 6.25, 2), anim: "pop", s: 1.14, delay: 0.21 }],
      ],
    },
    list: {
      els: [
        ["s", "circle", { cx: 4.5, cy: 6, r: 0.75 }],
        ["s", "circle", { cx: 4.5, cy: 12, r: 0.75 }],
        ["s", "circle", { cx: 4.5, cy: 18, r: 0.75 }],
        ["l", "path", { d: "M9 6h11", anim: "draw" }],
        ["l", "path", { d: "M9 12h11", anim: "draw", delay: 0.1 }],
        ["l", "path", { d: "M9 18h11", anim: "draw", delay: 0.2 }],
      ],
    },

    download: {
      els: [
        ["l", "path", { d: "M12 3.5v11M8.5 11l3.5 3.5 3.5-3.5", anim: "nudge", y: 2.5 }],
        ["l", "path", { d: tray, anim: "squash", origin: "12 20.5", delay: 0.18 }],
      ],
    },
    upload: {
      els: [
        ["l", "path", { d: "M12 15V4.5M8.5 8 12 4.5 15.5 8", anim: "nudge", y: -3 }],
        ["l", "path", { d: tray, anim: "squash", origin: "12 20.5" }],
      ],
    },
    "log-in": {
      els: [
        ["l", "path", { d: "M14 3.5h3A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5h-3" }],
        ["l", "path", { d: "M3.5 12h11M11 8.5l3.5 3.5-3.5 3.5", anim: "nudge", x: 3 }],
      ],
    },
    "log-out": {
      els: [
        ["l", "path", { d: "M10 3.5H7A3.5 3.5 0 0 0 3.5 7v10A3.5 3.5 0 0 0 7 20.5h3" }],
        ["l", "path", { d: "M9 12h11M16.5 8.5 20 12l-3.5 3.5", anim: "nudge", x: 3 }],
      ],
    },

    maximize: {
      els: [
        ["l", "path", { d: "M3.5 9V6.5a3 3 0 0 1 3-3H9", anim: "nudge", x: -1.5, y: -1.5 }],
        ["l", "path", { d: "M15 3.5h2.5a3 3 0 0 1 3 3V9", anim: "nudge", x: 1.5, y: -1.5 }],
        ["l", "path", { d: "M20.5 15v2.5a3 3 0 0 1-3 3H15", anim: "nudge", x: 1.5, y: 1.5 }],
        ["l", "path", { d: "M9 20.5H6.5a3 3 0 0 1-3-3V15", anim: "nudge", x: -1.5, y: 1.5 }],
      ],
    },
    minimize: {
      els: [
        ["l", "path", { d: "M9 3.5V6a3 3 0 0 1-3 3H3.5", anim: "nudge", x: 1, y: 1 }],
        ["l", "path", { d: "M20.5 9H18a3 3 0 0 1-3-3V3.5", anim: "nudge", x: -1, y: 1 }],
        ["l", "path", { d: "M15 20.5V18a3 3 0 0 1 3-3h2.5", anim: "nudge", x: -1, y: -1 }],
        ["l", "path", { d: "M3.5 15H6a3 3 0 0 1 3 3v2.5", anim: "nudge", x: 1, y: -1 }],
      ],
    },
  });
})();
