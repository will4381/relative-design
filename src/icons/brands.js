// Brands: languages & frameworks as simplified, soft re-drawings of each well-known motif.
// Every path is built here from grid geometry (no logo files or icon sets).
(function () {
  const f = (v) => +v.toFixed(2);
  const rad = (d) => (d * Math.PI) / 180;
  // Polyline/polygon whose corners are true arcs: pts = [[x, y, r], ...] (r ignored on open ends).
  const soft = (pts, closed = true) => {
    const n = pts.length;
    let d = closed ? "" : `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) {
      const [vx, vy, r = 0] = pts[i], [px, py] = pts[(i + n - 1) % n], [nx, ny] = pts[(i + 1) % n];
      const l1 = Math.hypot(px - vx, py - vy), l2 = Math.hypot(nx - vx, ny - vy);
      const u1 = [(px - vx) / l1, (py - vy) / l1], u2 = [(nx - vx) / l2, (ny - vy) / l2];
      const half = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))) / 2;
      if (!r) { d += `${d ? "L" : "M"}${f(vx)} ${f(vy)}`; continue; }
      const t = Math.min(r / Math.tan(half), l1 / 2, l2 / 2), rho = t * Math.tan(half);
      const sweep = -u1[0] * u2[1] + u1[1] * u2[0] > 0 ? 1 : 0;
      d += `${d ? "L" : "M"}${f(vx + u1[0] * t)} ${f(vy + u1[1] * t)}A${f(rho)} ${f(rho)} 0 0 ${sweep} ${f(vx + u2[0] * t)} ${f(vy + u2[1] * t)}`;
    }
    return closed ? d + "Z" : d + `L${f(pts[n - 1][0])} ${f(pts[n - 1][1])}`;
  };
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  const pt = (cx, cy, rx, ry, deg) => [f(cx + rx * Math.cos(rad(deg))), f(cy + ry * Math.sin(rad(deg)))];
  const rot = (pts, deg, cx = 12, cy = 12) => pts.map(([x, y, r]) => {
    const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
    return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c, r];
  });
  const turn180 = (pts) => pts.map(([x, y, r]) => [24 - x, 24 - y, r]);

  // ---- letterforms (soft geometric strokes, sized for a 24px badge) ----
  // S: two stacked elliptic bowls, top one opening right, bottom one opening left.
  const S = (cx, top, rx, h) => {
    const ry = h / 4, c1 = top + ry, c2 = top + 3 * ry;
    const [ax, ay] = pt(cx, c1, rx, ry, -38), [bx, by] = pt(cx, c2, rx, ry, 142);
    return `M${ax} ${ay}A${rx} ${ry} 0 1 0 ${cx} ${top + 2 * ry}A${rx} ${ry} 0 1 1 ${bx} ${by}`;
  };
  // J: stem with a round hook to the left.
  const J = (x, top, bottom, r) => `M${x} ${top}V${bottom - r}a${r} ${r} 0 0 1-${2 * r} 0`;
  // C: circle arc opening right (±open degrees).
  const C = (cx, cy, r, open = 48) => {
    const [ax, ay] = pt(cx, cy, r, r, -open), [bx, by] = pt(cx, cy, r, r, open);
    return `M${ax} ${ay}A${r} ${r} 0 1 0 ${bx} ${by}`;
  };
  const plus = (cx, cy, a) => `M${cx - a} ${cy}h${2 * a}M${cx} ${cy - a}v${2 * a}`;

  // ---- shared containers ----
  const BADGE = rr(3.5, 3.5, 17, 17, 4);
  // pointy-top hexagon (C family, node)
  const HEX = soft(Array.from({ length: 6 }, (_, i) => [...pt(12, 12, 9.5, 9.5, -90 + i * 60), 2.5]));
  // html/css: flat-topped shield narrowing to a soft keel
  const SHIELD = soft([[3.75, 3, 2], [20.25, 3, 2], [18.75, 18.75, 2], [12, 21, 3], [5.25, 18.75, 2]]);

  // letters in a badge hop in turn, landing on their own baseline
  const hop = (d, ox, base, delay = 0, y = -1.5) => ["c", "path", { d, anim: "bounce", y, origin: `${ox} ${base}`, delay }];

  // ---- python: two interlocking snakes, one the 180° turn of the other ----
  const SNAKE = [[7.5, 3, 2.5], [13.5, 3, 2.5], [13.5, 10.5, 2], [7.5, 10.5, 1.25], [7.5, 16, 2], [3, 16, 2], [3, 7, 2], [7.5, 7, 1.25]];

  // ---- rust: 8-tooth gear ----
  const GEAR = soft(Array.from({ length: 8 }, (_, i) => {
    const a = i * 45 - 90;
    return [[...pt(12, 12, 7.25, 7.25, a - 15), 0.75], [...pt(12, 12, 9, 9, a - 8), 0.9], [...pt(12, 12, 9, 9, a + 8), 0.9], [...pt(12, 12, 7.25, 7.25, a + 15), 0.75]];
  }).flat());

  // ---- svelte: S-shaped ribbon (constant width) built from two concentric arc pairs ----
  const svelte = () => {
    const R = 3.5, w = 1.75, Ro = R + w, Ri = R - w, ct = 8.5, cb = 15.5, a = -30;
    const P = (cy, r, deg) => pt(12, cy, r, r, deg).join(" ");
    return `M${P(ct, Ro, a)}A${Ro} ${Ro} 0 1 0 12 ${ct + Ro}A${Ri} ${Ri} 0 1 1 ${P(cb, Ri, 180 + a)}` +
      `A${w} ${w} 0 0 0 ${P(cb, Ro, 180 + a)}A${Ro} ${Ro} 0 1 0 12 ${cb - Ro}A${Ri} ${Ri} 0 1 1 ${P(ct, Ri, a)}A${w} ${w} 0 0 0 ${P(ct, Ro, a)}Z`;
  };

  // ---- tailwind: a fat tilde, hump then dip, thickest mid-way, round ends ----
  const wave = (x0, y0, w, A) => {
    const N = 24, top = [], bot = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, bx = x0 + w * t, by = y0 - A * Math.sin(2 * Math.PI * t);
      const tx = w, ty = -2 * Math.PI * A * Math.cos(2 * Math.PI * t), l = Math.hypot(tx, ty);
      const h = 1.5 + 0.5 * Math.sin(Math.PI * t), nx = ty / l, ny = -tx / l;
      top.push(`${f(bx + nx * h)} ${f(by + ny * h)}`);
      bot.unshift(`${f(bx - nx * h)} ${f(by - ny * h)}`);
    }
    return `M${top.join("L")}A1.5 1.5 0 0 1 ${bot.join("L")}A1.5 1.5 0 0 1 ${top[0]}Z`;
  };

  // ---- docker: little containers riding the whale ----
  const crate = (cx, cy, delay) => ["s", "path", { d: rr(cx - 1, cy - 1, 2, 2, 0.5), anim: "bounce", y: -1.75, origin: `${cx} ${cy + 1}`, delay }];

  // ---- android ----
  const AY = -1.75; // lift the whole head so head + antennae sit centred
  const dome = () => {
    const cy = 19 + AY, R = 8.5, r = 1.5, xc = Math.sqrt((R - r) ** 2 - r * r);
    const tx = (R / (R - r)) * xc, ty = cy - (R / (R - r)) * r;
    return `M${f(12 - xc)} ${f(cy)}A${r} ${r} 0 0 1 ${f(12 - tx)} ${f(ty)}A${R} ${R} 0 0 1 ${f(12 + tx)} ${f(ty)}A${r} ${r} 0 0 1 ${f(12 + xc)} ${f(cy)}Z`;
  };
  const antenna = (side, delay) => {
    const [bx, by] = pt(12, 19 + AY, 8.5, 8.5, -90 + side * 32), [tx, ty] = pt(12, 19 + AY, 12, 12, -90 + side * 32);
    return ["l", "path", { d: `M${bx} ${by}L${tx} ${ty}`, anim: "wiggle", deg: 14 * side, origin: `${bx} ${by}`, delay }];
  };

  Icons.define("brands", {
    javascript: {
      els: [
        ["s", "path", { d: BADGE }],
        hop(J(10.25, 8, 16, 1.75), 8.5, 16),
        hop(S(15.25, 8, 2.25, 8), 15.25, 16, 0.1),
      ],
    },
    typescript: {
      els: [
        ["s", "path", { d: BADGE }],
        hop("M6.25 8h5M8.75 8v8", 8.75, 16),
        hop(S(15.25, 8, 2.25, 8), 15.25, 16, 0.1),
      ],
    },
    python: {
      // the two snakes chase each other half a turn
      anim: "turn",
      deg: 180,
      origin: "12 12",
      els: [
        ["s", "path", { d: soft(SNAKE) }],
        ["s", "path", { d: soft(turn180(SNAKE)) }],
        ["d", "circle", { cx: 10.25, cy: 6, r: 1 }],
        ["d", "circle", { cx: 13.75, cy: 18, r: 1 }],
      ],
    },
    rust: {
      els: [
        ["s", "path", { d: GEAR, anim: "turn", deg: 45, origin: "12 12" }],
        ["c", "path", { d: "M9.75 15.75V8.5h3a1.75 1.75 0 0 1 0 3.5h-3M12.25 12l2.5 3.75" }],
      ],
    },
    go: {
      els: [
        ["l", "path", { d: "M6.25 9.5H3M6.25 14.5H4.5", anim: "draw", delay: 0.05 }],
        ["l", "path", { d: (() => { const [ax, ay] = pt(11, 12, 2.6, 3.75, -50); return `M${ax} ${ay}A2.6 3.75 0 1 0 13.6 12H11.5`; })(), anim: "nudge", x: 2 }],
        ["l", "ellipse", { cx: 18.25, cy: 12, rx: 2.6, ry: 3.75, anim: "nudge", x: 2, delay: 0.06 }],
      ],
    },
    java: {
      els: [
        ["l", "path", { d: "M8 6.25c-.9-1 .9-2 0-3.25", anim: "enter", y: 1.75 }],
        ["l", "path", { d: "M12.5 6.25c-.9-1 .9-2 0-3.25", anim: "enter", y: 1.75, delay: 0.12 }],
        ["s", "path", { d: "M6.25 9h8a1.25 1.25 0 0 1 1.25 1.25v3a4.5 4.5 0 0 1-4.5 4.5h-1.5A4.5 4.5 0 0 1 5 13.25v-3A1.25 1.25 0 0 1 6.25 9Z" }],
        ["l", "path", { d: "M15.5 10.5H17a2.25 2.25 0 0 1 0 4.5h-1.75" }],
        ["l", "path", { d: "M4 20.25c3 1 9.5 1 12.5 0" }],
      ],
    },
    swift: {
      anim: "nudge",
      x: 2,
      y: -2,
      els: [
        ["s", "path", { d: "M5.4 4.1C9 8.25 13 11.25 16.25 11.5 17.4 11.6 18.3 10.4 19.1 9.3A1.25 1.25 0 0 1 20.8 9.6C21 13 19.5 17.5 15 19.25 11.5 20.6 7 19.75 4.3 17.5A1.2 1.2 0 0 1 4.9 15.6C6.5 15.4 8 15 9 14.25 7 11.5 5 8 4 5.25A1 1 0 0 1 5.4 4.1Z" }],
      ],
    },
    kotlin: {
      anim: "bounce",
      y: -2.5,
      origin: "12 20.5",
      els: [["s", "path", { d: soft([[3.5, 3.5, 3], [20.5, 3.5, 2], [12, 12, 1], [20.5, 20.5, 2], [3.5, 20.5, 3]]) }]],
    },
    php: {
      els: [
        ["s", "ellipse", { cx: 12, cy: 12, rx: 9, ry: 7 }],
        hop("M6.75 15.5V10h.5a1.5 1.5 0 0 1 0 3h-.5", 7.75, 13, 0, -1.25),
        hop("M10.75 8V13M10.75 11.5a1.5 1.5 0 0 1 3 0V13", 12.25, 13, 0.08, -1.25),
        hop("M15.75 15.5V10h.5a1.5 1.5 0 0 1 0 3h-.5", 16.75, 13, 0.16, -1.25),
      ],
    },
    ruby: {
      els: [
        ["s", "path", { d: soft([[6.75, 4.5, 1.5], [17.25, 4.5, 1.5], [21, 10, 1.5], [12, 20.5, 2], [3, 10, 1.5]]), anim: "pop", s: 1.12, origin: "12 12" }],
        ["c", "path", { d: "M3.75 10h16.5", anim: "draw" }],
        ["c", "path", { d: "M8.5 10 12 4.75 15.5 10M8.5 10 12 19.25 15.5 10", anim: "draw", delay: 0.12 }],
      ],
    },
    c: {
      els: [["s", "path", { d: HEX }], hop(C(12, 12, 4), 12, 16)],
    },
    cpp: {
      els: [
        ["s", "path", { d: HEX }],
        hop(C(9.5, 12, 3.25), 9.5, 15.25),
        ["c", "path", { d: plus(15.75, 9, 1.25), anim: "grow", delay: 0.15 }],
        ["c", "path", { d: plus(15.75, 15, 1.25), anim: "grow", delay: 0.25 }],
      ],
    },
    csharp: {
      els: [
        ["s", "path", { d: HEX }],
        hop(C(9, 12, 2.75), 9, 14.75),
        ["c", "path", { d: "M14.75 9v6M17.25 9v6M13.75 10.75h4.75M13.5 13.25h4.75", anim: "wiggle", deg: 12, delay: 0.15 }],
      ],
    },
    html: {
      els: [
        ["s", "path", { d: SHIELD }],
        hop(soft([[14.75, 7], [9.75, 7, 1], [9.5, 11.25, 1], [12.25, 11.25]], false) + "a2.75 2.75 0 0 1 0 5.5H9.25", 12, 16.5),
      ],
    },
    css: {
      els: [
        ["s", "path", { d: SHIELD }],
        hop(soft([[9.25, 7], [14.75, 7, 1.5], [11.75, 11]], false) + "h.5a2.75 2.75 0 0 1 0 5.5H9.25", 12, 16.5),
      ],
    },
    react: {
      els: [
        ["l", "path", { d: [0, 60, 120].map((a) => { const [x1, y1] = pt(12, 12, 9, 9, a), [x2, y2] = pt(12, 12, 9, 9, a + 180); return `M${x1} ${y1}A9 3.75 ${a} 1 1 ${x2} ${y2}A9 3.75 ${a} 1 1 ${x1} ${y1}`; }).join(""), anim: "turn", deg: 60, origin: "12 12" }],
        ["s", "circle", { cx: 12, cy: 12, r: 1.25 }],
      ],
    },
    vue: {
      els: [
        ["l", "path", { d: soft([[3, 4.5], [12, 20, 2.5], [21, 4.5]], false), anim: "nudge", y: 2 }],
        ["l", "path", { d: soft([[8.23, 4.5], [12, 11, 2], [15.77, 4.5]], false), anim: "nudge", y: 2, delay: 0.08 }],
      ],
    },
    angular: {
      els: [
        ["s", "path", { d: soft([[12, 2.75, 2], [20.5, 5.75, 2], [19.25, 16.5, 2], [12, 21, 2.5], [4.75, 16.5, 2], [3.5, 5.75, 2]]) }],
        hop(soft([[8, 16], [12, 7, 2], [16, 16]], false) + "M9.6 13h4.8", 12, 16),
      ],
    },
    svelte: {
      anim: "wiggle",
      deg: 10,
      els: [["s", "path", { d: svelte(), transform: "rotate(20 12 12)" }]],
    },
    nextjs: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: soft([[9, 16], [9, 8, 1.5], [15.5, 16.5]], false), anim: "draw" }],
        ["c", "path", { d: "M15 8v4.5", anim: "draw", delay: 0.2 }],
      ],
    },
    nodejs: {
      anim: "pop",
      s: 1.14,
      origin: "12 12",
      els: [
        ["s", "path", { d: HEX }],
        ["c", "path", { d: J(10.25, 8.75, 15.25, 1.5) }],
        ["c", "path", { d: S(14.75, 8.75, 2, 6.5) }],
      ],
    },
    tailwind: {
      els: [
        ["s", "path", { d: wave(4, 7, 11, 1.75), anim: "nudge", x: 2 }],
        ["s", "path", { d: wave(9, 17, 11, 1.75), anim: "nudge", x: 2, delay: 0.1 }],
      ],
    },
    docker: {
      // the whale bobs along while its containers hop, left to right
      anim: "float",
      y: -1.25,
      els: [
        ["s", "path", { d: "M5 14H16.75C17.4 12.6 18.4 11.75 19.75 11.5A.75.75 0 0 1 20.6 12.4C20.3 13.4 19.75 14.25 19 15 17 18.5 13.5 20 9.5 20 5.75 20 3.5 17.5 3.5 15.5A1.5 1.5 0 0 1 5 14Z" }],
        ["d", "circle", { cx: 7.25, cy: 16.5, r: 0.9 }],
        crate(6.5, 10, 0), crate(11.5, 10, 0.08), crate(16.5, 10, 0.16),
        crate(11.5, 5, 0.08), crate(16.5, 5, 0.16),
      ],
    },
    npm: {
      els: [
        ["s", "path", { d: BADGE }],
        hop(soft([[8.25, 16.5], [8.25, 7.75, 1], [13.25, 7.75, 2.5], [15.75, 10.25], [15.75, 16.5]], false), 12, 16.5, 0, -2),
      ],
    },
    vite: {
      els: [
        ["s", "path", { d: soft([[3, 4.5, 2.5], [21, 4.5, 2.5], [12, 21, 2.5]]) }],
        ["k", "path", { d: soft([[14.5, 2.75, 1.25], [8.5, 11.75, 1.25], [11.75, 11.75, 0.6], [10.5, 18, 1.25], [16, 9, 1.25], [12.75, 9, 0.6]]), anim: "pop", s: 1.22, origin: "12 11" }],
      ],
    },
    github: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["d", "path", { d: soft([[6.75, 12, 0.5], [7.75, 6.25, 1.75], [11, 9.5, 0.5]]), anim: "wiggle", deg: -14, origin: "8.25 11", delay: 0.05 }],
        ["d", "path", { d: soft([[13, 9.5, 0.5], [16.25, 6.25, 1.75], [17.25, 12, 0.5]]), anim: "wiggle", deg: 14, origin: "15.75 11", delay: 0.22 }],
        ["d", "ellipse", { cx: 12, cy: 12.75, rx: 5.25, ry: 4 }],
        ["d", "path", { d: "M10 15.5h4v6.75h-4Z" }],
      ],
    },
    gitlab: {
      // a curious head tilt from the chin
      anim: "tilt",
      deg: -10,
      origin: "12 20.75",
      els: [
        ["s", "path", { d: soft([[5.25, 3.75, 2], [7.75, 10, 1], [16.25, 10, 1], [18.75, 3.75, 2], [21, 13, 2], [12, 20.75, 2.5], [3, 13, 2]]) }],
      ],
    },
    android: {
      els: [
        antenna(-1, 0), antenna(1, 0.1),
        ["s", "path", { d: dome() }],
        ["d", "circle", { cx: 8.75, cy: 15.25 + AY + 0.5, r: 1, anim: "blink", delay: 0.3 }],
        ["d", "circle", { cx: 15.25, cy: 15.25 + AY + 0.5, r: 1, anim: "blink", delay: 0.3 }],
      ],
    },
  });
})();
