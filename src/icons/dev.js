// Dev: code, data & math. All paths drawn from grid geometry.
(function () {
  const f = (v) => +v.toFixed(2);
  // Polyline/polygon whose corners are true arcs: pts = [[x, y, r], ...] (r ignored on open ends).
  const soft = (pts, closed = true) => {
    const n = pts.length;
    let d = closed ? "" : `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) {
      const [vx, vy, r] = pts[i], [px, py] = pts[(i + n - 1) % n], [nx, ny] = pts[(i + 1) % n];
      const l1 = Math.hypot(px - vx, py - vy), l2 = Math.hypot(nx - vx, ny - vy);
      const u1 = [(px - vx) / l1, (py - vy) / l1], u2 = [(nx - vx) / l2, (ny - vy) / l2];
      const half = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))) / 2;
      const t = Math.min(r / Math.tan(half), l1 / 2, l2 / 2), rho = t * Math.tan(half);
      const sweep = -u1[0] * u2[1] + u1[1] * u2[0] > 0 ? 1 : 0;
      d += `${d ? "L" : "M"}${f(vx + u1[0] * t)} ${f(vy + u1[1] * t)}A${f(rho)} ${f(rho)} 0 0 ${sweep} ${f(vx + u2[0] * t)} ${f(vy + u2[1] * t)}`;
    }
    return closed ? d + "Z" : d + `L${pts[n - 1][0]} ${pts[n - 1][1]}`;
  };
  // Rounded rect as a path (x/y attrs are reserved for motion params).
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  const flip = (pts) => pts.map(([x, y, r]) => [24 - x, y, r]);
  const polar = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  // Arc of radius r around (cx, cy), symmetric about the vertical, spanning ±deg from the top (as wifi in media.js).
  const topArc = (cx, cy, r, deg) => {
    const s = Math.sin((deg * Math.PI) / 180) * r, c = Math.cos((deg * Math.PI) / 180) * r;
    return `M${f(cx - s)} ${f(cy - c)}a${r} ${r} 0 0 1 ${f(2 * s)} 0`;
  };

  // Shared silhouettes from files.js / media.js.
  const FILE = "M8 3h5.5L19 8.5V18a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z";
  const FOLD = "M13.5 3.5v3a2 2 0 0 0 2 2h3";
  const FOLDER = "M3 7a3 3 0 0 1 3-3h3.6a2 2 0 0 1 1.4.6L12.5 6H18a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z";
  const CLOUD = "M7 19A4 4 0 0 1 7 11A5.5 5.5 0 0 1 18 11.1A4 4 0 0 1 17 19Z";
  const SQUARE = "M7 3.5h10a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z";
  const slash = ["k", "path", { d: "M3.5 3.5l17 17", anim: "draw", delay: 0.1 }];

  // git: same node (r 2.5, `s`) and stroke as git-branch / git-commit.
  const node = (cx, cy, delay) => ["s", "circle", { cx, cy, r: 2.5, anim: "pop", s: 1.22, ...(delay ? { delay } : {}) }];

  // Magnifier drawn inside a file/folder; wiggles from the handle tip like `search`.
  const lens = (cx, cy, r, len) => {
    const o = r / Math.SQRT2;
    const tip = [f(cx + o + len), f(cy + o + len)];
    return ["c", "path", { d: `M${f(cx + o)} ${f(cy + o)}L${tip[0]} ${tip[1]}M${f(cx - r)} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0Z`, anim: "wiggle", deg: 12, origin: tip.join(" ") }];
  };

  // binary digits: 0 = pill, 1 = stem with a soft flag
  const zero = (x, y, delay) => ["l", "path", { d: rr(x, y, 5, 7, 2.5), anim: "blink", delay }];
  const one = (x, y, delay) => ["l", "path", { d: soft([[x, y + 2, 0], [x + 2.5, y, 1.5], [x + 2.5, y + 7, 0]], false), anim: "blink", delay }];

  // asterisk arms: three strokes through (cx, cy)
  const star = (cx, cy, r) => [90, 30, 150].map((a) => {
    const [x1, y1] = polar(cx, cy, r, a), [x2, y2] = polar(cx, cy, r, a + 180);
    return `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`;
  }).join("");

  // webhook: three rings; from each, a line runs out and wraps round the next ring (pinwheel, 120° symmetric)
  const webhook = () => {
    const cx = 12, cy = 13.25, R = 7.25, rho = 2.75, gap = 2.5;
    const V = [-90, 30, 150].map((a) => polar(cx, cy, R, a));
    // tangent from vertex i onto ring i+1, taken on the inner side
    const dirs = V.map((P, i) => {
      const C = V[(i + 1) % 3], d = Math.hypot(C[0] - P[0], C[1] - P[1]);
      return [Math.atan2(C[1] - P[1], C[0] - P[0]) + Math.asin(rho / d), Math.sqrt(d * d - rho * rho)];
    });
    return V.map((P, i) => {
      const C = V[(i + 1) % 3], [a, L] = dirs[i];
      const S = [P[0] + rho * Math.cos(a), P[1] + rho * Math.sin(a)]; // leave from the ring's opening
      const T = [P[0] + L * Math.cos(a), P[1] + L * Math.sin(a)];
      const sw = (T[0] - C[0]) * Math.sin(a) - (T[1] - C[1]) * Math.cos(a) > 0 ? 1 : -1;
      const tA = Math.atan2(T[1] - C[1], T[0] - C[0]);
      const eA = dirs[(i + 1) % 3][0] - (sw * gap) / rho; // stop short of the next line leaving this ring
      const span = ((((eA - tA) * sw) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const E = [C[0] + rho * Math.cos(tA + sw * span), C[1] + rho * Math.sin(tA + sw * span)];
      return `M${f(S[0])} ${f(S[1])}L${f(T[0])} ${f(T[1])}A${rho} ${rho} 0 ${span > Math.PI ? 1 : 0} ${sw > 0 ? 1 : 0} ${f(E[0])} ${f(E[1])}`;
    });
  };

  Icons.define("dev", {
    braces: {
      els: [
        ["l", "path", { d: "M9.5 3.5H9A2.5 2.5 0 0 0 6.5 6v3.5A2.5 2.5 0 0 1 4 12a2.5 2.5 0 0 1 2.5 2.5V18A2.5 2.5 0 0 0 9 20.5h.5", anim: "nudge", x: -2 }],
        ["l", "path", { d: "M14.5 3.5h.5A2.5 2.5 0 0 1 17.5 6v3.5A2.5 2.5 0 0 0 20 12a2.5 2.5 0 0 0-2.5 2.5V18a2.5 2.5 0 0 1-2.5 2.5h-.5", anim: "nudge", x: 2 }],
      ],
    },
    brackets: {
      els: [
        ["l", "path", { d: "M9.5 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h2", anim: "nudge", x: -2 }],
        ["l", "path", { d: "M14.5 3.5h2A2.5 2.5 0 0 1 19 6v12a2.5 2.5 0 0 1-2.5 2.5h-2", anim: "nudge", x: 2 }],
      ],
    },
    binary: {
      // digits flip over one after another like a split-flap counter
      els: [zero(4.5, 3.5, 0), one(15, 3.5, 0.08), one(5, 13.5, 0.16), zero(14.5, 13.5, 0.24)],
    },
    regex: {
      els: [
        ["l", "path", { d: star(15.5, 8.5, 5), anim: "turn", deg: 60, origin: "15.5 8.5" }],
        ["s", "circle", { cx: 6.5, cy: 17.5, r: 1.75, anim: "bounce", y: -2.5, origin: "6.5 20.25", delay: 0.12 }],
      ],
    },
    webhook: {
      // an event runs round the loop: each hook draws on in turn
      els: webhook().map((d, i) => ["l", "path", { d, anim: "draw", delay: i * 0.12 }]),
    },
    network: {
      // signal pulses out from the hub to the leaves
      els: [
        ["s", "path", { d: rr(9, 3, 6, 6, 2), anim: "pulse" }],
        ["l", "path", { d: "M12 9v3M6 15v-.5A2.5 2.5 0 0 1 8.5 12h7a2.5 2.5 0 0 1 2.5 2.5v.5", anim: "pulse", delay: 0.1 }],
        ["s", "path", { d: rr(3, 15, 6, 6, 2), anim: "pulse", delay: 0.2 }],
        ["s", "path", { d: rr(15, 15, 6, 6, 2), anim: "pulse", delay: 0.2 }],
      ],
    },
    workflow: {
      els: [
        ["s", "path", { d: rr(3, 3, 7, 7, 2.5), anim: "pop", s: 1.15 }],
        ["l", "path", { d: "M10 6.5h5a2.5 2.5 0 0 1 2.5 2.5v5", anim: "draw", delay: 0.1 }],
        ["s", "path", { d: rr(14, 14, 7, 7, 2.5), anim: "pop", s: 1.15, delay: 0.35 }],
      ],
    },
    "git-merge": {
      els: [
        ["l", "path", { d: "M6.5 8.5v7" }],
        ["l", "path", { d: "M15 14.5h-2a6.5 6.5 0 0 1-6.5-6", anim: "draw", delay: 0.08 }],
        node(17.5, 14.5),
        node(6.5, 6, 0.1),
        node(6.5, 18, 0.2),
      ],
    },
    "git-pull-request": {
      els: [
        ["l", "path", { d: "M6 8.5v7" }],
        ["l", "path", { d: "M18 15.5V9.5A3.5 3.5 0 0 0 14.5 6H12.5", anim: "draw", delay: 0.05 }],
        ["l", "path", { d: "M15.5 3 12.5 6l3 3", anim: "grow", origin: "12.5 6", delay: 0.3 }],
        node(18, 18),
        node(6, 6, 0.1),
        node(6, 18, 0.2),
      ],
    },
    "git-fork": {
      els: [
        ["l", "path", { d: "M12 15.5v-3", anim: "draw" }],
        ["l", "path", { d: "M12 12.5H9.5a3 3 0 0 1-3-3v-1", anim: "draw", delay: 0.12 }],
        ["l", "path", { d: "M12 12.5h2.5a3 3 0 0 0 3-3v-1", anim: "draw", delay: 0.12 }],
        node(12, 18),
        node(6.5, 6, 0.12),
        node(17.5, 6, 0.2),
      ],
    },
    "git-compare": {
      els: [
        ["l", "path", { d: "M6 8.5V15a3 3 0 0 0 3 3h3", anim: "draw" }],
        ["l", "path", { d: "M9.5 15.5 12 18l-2.5 2.5", anim: "grow", origin: "12 18", delay: 0.3 }],
        ["l", "path", { d: "M18 15.5V9a3 3 0 0 0-3-3h-3", anim: "draw", delay: 0.1 }],
        ["l", "path", { d: "M14.5 3.5 12 6l2.5 2.5", anim: "grow", origin: "12 6", delay: 0.4 }],
        node(6, 6),
        node(18, 18, 0.1),
      ],
    },
    container: {
      // hoisted by a crane, lands with a squash
      anim: "bounce",
      y: -2.5,
      origin: "12 18.5",
      els: [
        ["s", "path", { d: rr(3, 5.5, 18, 13, 2.5) }],
        ["c", "path", { d: "M7.5 9v6M12 9v6M16.5 9v6" }],
      ],
    },
    boxes: {
      // stacked crates hop in turn, the top one last
      els: [
        ["s", "path", { d: rr(3, 14.25, 6.75, 6.75, 2) }],
        ["s", "path", { d: rr(14.25, 14.25, 6.75, 6.75, 2) }],
        ["s", "path", { d: rr(8.63, 3, 6.75, 6.75, 2) }],
      ].map((e, i) => (e[2] = { ...e[2], anim: "bounce", y: [-1.5, -1.5, -2.5][i], origin: `${[6.38, 17.63, 12][i]} ${[21, 21, 9.75][i]}`, delay: [0, 0.08, 0.2][i] }, e)),
    },
    infinity: {
      els: [["l", "path", { d: "M12 12C10 9 8.5 8.25 6.75 8.25A3.75 3.75 0 0 0 6.75 15.75C8.5 15.75 10 15 12 12S15.5 8.25 17.25 8.25A3.75 3.75 0 0 1 17.25 15.75C15.5 15.75 14 15 12 12Z", anim: "draw" }]],
    },
    asterisk: { els: [["l", "path", { d: star(12, 12, 8.5), anim: "turn", deg: 60, origin: "12 12" }]] },
    equal: {
      els: [
        ["l", "path", { d: "M4.5 9h15", anim: "draw" }],
        ["l", "path", { d: "M4.5 15h15", anim: "draw", delay: 0.1 }],
      ],
    },
    divide: {
      els: [
        ["l", "path", { d: "M4.5 12h15" }],
        ["s", "circle", { cx: 12, cy: 6, r: 1, anim: "nudge", y: -2 }],
        ["s", "circle", { cx: 12, cy: 18, r: 1, anim: "nudge", y: 2 }],
      ],
    },
    sigma: {
      anim: "wiggle",
      deg: 10,
      els: [["l", "path", { d: soft([[17.5, 6.5, 0], [17.5, 4, 1.25], [6.5, 4, 2], [12.5, 12, 1.5], [6.5, 20, 2], [17.5, 20, 1.25], [17.5, 17.5, 0]], false) }]],
    },
    pi: {
      anim: "wiggle",
      deg: 10,
      els: [["l", "path", { d: "M4 9.5A3 3 0 0 1 7 6.5H20M9.5 6.5V14q0 4-3 6M15.5 6.5V17a3 3 0 0 0 3 3h1" }]],
    },
    function: {
      anim: "wiggle",
      deg: 10,
      els: [
        ["l", "path", { d: "M18.5 5C17.8 3.6 15 3 14.4 5.2L9.6 18.8C9 21 6.2 20.4 5.5 19" }],
        ["l", "path", { d: "M8 10h8.5" }],
      ],
    },
    variable: {
      els: [
        ["l", "path", { d: "M7.5 3.5a13.5 13.5 0 0 0 0 17", anim: "nudge", x: -1.5 }],
        ["l", "path", { d: "M16.5 3.5a13.5 13.5 0 0 1 0 17", anim: "nudge", x: 1.5 }],
        ["l", "path", { d: "M9.75 9.75l4.5 4.5M14.25 9.75l-4.5 4.5", anim: "turn", deg: 90, origin: "12 12", delay: 0.06 }],
      ],
    },
    sheet: {
      els: [
        ["s", "path", { d: SQUARE }],
        ["c", "path", { d: "M3 9.5h18" }],
        ["c", "path", { d: "M9.5 9.5v11", anim: "draw", delay: 0.05 }],
        ["c", "path", { d: "M3 15h18", anim: "draw", delay: 0.15 }],
      ],
    },
    "cloud-off": { els: [["s", "path", { d: CLOUD }], slash] },
    "wifi-off": {
      els: [
        ["s", "circle", { cx: 12, cy: 18.5, r: 0.5 }],
        ["l", "path", { d: topArc(12, 18.5, 4.5, 38) }],
        ["l", "path", { d: topArc(12, 18.5, 9, 38) }],
        ["l", "path", { d: topArc(12, 18.5, 13.5, 38) }],
        slash,
      ],
    },
    unlink: {
      els: [
        ["l", "path", { d: "M8.5 7.5H6a4.5 4.5 0 0 0 0 9h2.5", transform: "rotate(-45 12 12)", anim: "nudge", x: -1.25, y: 1.25 }],
        ["l", "path", { d: "M15.5 7.5H18a4.5 4.5 0 0 1 0 9h-2.5", transform: "rotate(-45 12 12)", anim: "nudge", x: 1.25, y: -1.25 }],
        ["l", "path", { d: "M12 3.5v2.5M12 18v2.5", transform: "rotate(-45 12 12)", anim: "grow", origin: "12 12", delay: 0.1 }],
      ],
    },
    "file-search": { els: [["s", "path", { d: FILE }], ["c", "path", { d: FOLD }], lens(11.25, 13.25, 3, 2.75)] },
    "file-code": {
      els: [
        ["s", "path", { d: FILE }],
        ["c", "path", { d: FOLD }],
        ["c", "path", { d: "M10 12l-2 2.25 2 2.25", anim: "nudge", x: -1.25 }],
        ["c", "path", { d: "M14 12l2 2.25-2 2.25", anim: "nudge", x: 1.25 }],
      ],
    },
    "folder-search": { els: [["s", "path", { d: FOLDER }], lens(11, 12.25, 3, 2.75)] },
  });
})();
