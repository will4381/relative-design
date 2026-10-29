// Companies: well-known marks as simplified, soft re-drawings of each motif.
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
  // S: two stacked elliptic bowls, top one opening right, bottom one opening left.
  const S = (cx, top, rx, h) => {
    const ry = h / 4, c1 = top + ry, c2 = top + 3 * ry;
    const [ax, ay] = pt(cx, c1, rx, ry, -38), [bx, by] = pt(cx, c2, rx, ry, 142);
    return `M${ax} ${ay}A${rx} ${ry} 0 1 0 ${cx} ${top + 2 * ry}A${rx} ${ry} 0 1 1 ${bx} ${by}`;
  };

  const BADGE = rr(3.5, 3.5, 17, 17, 4);
  const hop = (d, ox, base, delay = 0, y = -1.75) => ["c", "path", { d, anim: "bounce", y, origin: `${ox} ${base}`, delay }];

  // ---- google: G arc opening upper-right, bar into the centre ----
  const G = (() => { const [ax, ay] = pt(12, 12, 8.5, 8.5, -42); return `M${ax} ${ay}A8.5 8.5 0 1 0 20.5 12H12.75`; })();

  // ---- meta: a rounded infinity, loops fuller than a lemniscate ----
  const meta = (() => {
    const N = 64, p = [];
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * 2 * Math.PI;
      p.push(`${f(12 + 8.5 * Math.sin(t))} ${f(12 - 5.25 * Math.sin(2 * t) * (1 - 0.18 * Math.cos(2 * t)))}`);
    }
    return `M${p.join("L")}Z`;
  })();

  // ---- amazon: smile ending in an arrowhead tangent to the curve ----
  const SMILE_END = [19.25, 15.25];
  const smileHead = (() => {
    const [ex, ey] = SMILE_END, d = [ex - 12, ey - 20.5], l = Math.hypot(...d), u = [-d[0] / l, -d[1] / l], k = Math.SQRT1_2, a = 2.75;
    const r1 = [k * (u[0] - u[1]), k * (u[0] + u[1])], r2 = [k * (u[0] + u[1]), k * (u[1] - u[0])];
    return `M${f(ex + r1[0] * a)} ${f(ey + r1[1] * a)}L${ex} ${ey}L${f(ex + r2[0] * a)} ${f(ey + r2[1] * a)}`;
  })();

  // ---- paypal: a soft italic P ----
  const P = (x, y) => `M${x} ${y + 12}V${y + 1.5}a1.5 1.5 0 0 1 1.5-1.5h3a3.5 3.5 0 0 1 0 7H${x}`;
  const ITALIC = "translate(2.13 0) skewX(-10)";

  // ---- slack: four capsules in a pinwheel hash ----
  const PILLS = [[5.5, 3.5, 4, 7.5, 0, -2], [13, 5.5, 7.5, 4, 2, 0], [14.5, 13, 4, 7.5, 0, 2], [3.5, 14.5, 7.5, 4, -2, 0]];

  // ---- dropbox: four soft rhombi, two lid flaps over two box sides ----
  const rhomb = (cx, cy, a = 4.25, b = 2.25) => soft([[cx - a, cy, 1.25], [cx, cy - b, 1.75], [cx + a, cy, 1.25], [cx, cy + b, 1.75]]);

  // ---- openai: six round lobes around a hexagonal hole, seams swirling out from its corners ----
  const LOBE_D = 5.75, LOBE_R = 3.5;
  const ROSETTE = (() => {
    const h = Math.sqrt(LOBE_R ** 2 - (LOBE_D / 2) ** 2), m = LOBE_D * Math.cos(rad(30)) + h;
    const dip = (i) => pt(12, 12, m, m, -60 + 60 * i);
    return [0, 1, 2, 3, 4, 5].map((i) => `${i ? "" : `M${dip(0).join(" ")}`}A${LOBE_R} ${LOBE_R} 0 1 1 ${dip(i + 1).join(" ")}`).join("") + "Z";
  })();
  const DIP_M = LOBE_D * Math.cos(rad(30)) + Math.sqrt(LOBE_R ** 2 - (LOBE_D / 2) ** 2);
  const HOLE = soft([0, 1, 2, 3, 4, 5].map((i) => [...pt(12, 12, 3, 3, -90 + 60 * i), 0.75]));
  const SEAMS = [0, 1, 2, 3, 4, 5].map((i) => `M${pt(12, 12, 3, 3, -90 + 60 * i).join(" ")}L${pt(12, 12, DIP_M - 0.5, DIP_M - 0.5, -60 + 60 * i).join(" ")}`).join("");

  // ---- chrome: three tangents off the inner ring, 120° apart ----
  const CHROME = [0, 120, 240].map((a) => {
    const [sx, sy] = rot([[12, 8.5]], a)[0], [ex, ey] = rot([[12 + Math.sqrt(81 - 12.25), 8.5]], a)[0];
    return `M${f(sx)} ${f(sy)}L${f(ex)} ${f(ey)}`;
  }).join("");

  // ---- safari: thin needle, NE half solid ----
  const NEEDLE = [[16.75, 7.25, 1.5], [13.4, 13.4, 0.75], [7.25, 16.75, 1.5], [10.6, 10.6, 0.75]];
  const NEEDLE_NE = [[16.75, 7.25, 1.5], [13.4, 13.4, 0.5], [10.6, 10.6, 0.5]];

  // ---- anthropic: two slanted slabs and a crossbar ----
  const slabL = soft([[3.5, 20, 1.5], [7.5, 20, 1], [10.25, 4, 1.5], [6.25, 4, 1]]);
  const slabR = soft([[13.75, 4, 1.5], [17.75, 4, 1], [20.5, 20, 1.5], [16.5, 20, 1]]);

  // ---- firefox: fox crescent whose inner edge is the globe's rim; ear up at the head, round tail tip ----
  const GLOBE = [12.75, 11.25, 5.25];
  const FOX = (() => {
    const [gx, gy, gr] = GLOBE, a0 = -48, a1 = 232;
    const onGlobe = ([x, y]) => { const l = Math.hypot(x - gx, y - gy); return [f(gx + (gr * (x - gx)) / l), f(gy + (gr * (y - gy)) / l)]; };
    const P0 = pt(12, 12, 9, 9, a0), P1 = pt(12, 12, 9, 9, a1), Q0 = onGlobe(P0), Q1 = onGlobe(P1);
    const cap = Math.hypot(P1[0] - Q1[0], P1[1] - Q1[1]) / 2;
    return soft([Q0, [16, 3, 1.5], P0], false) + `A9 9 0 1 1 ${P1.join(" ")}A${f(cap)} ${f(cap)} 0 0 1 ${Q1.join(" ")}A${gr} ${gr} 0 1 0 ${Q0.join(" ")}Z`;
  })();

  Icons.define("companies", {
    google: {
      els: [["l", "path", { d: G, anim: "draw" }]],
    },
    "apple-logo": {
      els: [
        ["s", "path", { d: "M12 9C13.25 7.75 15 7.25 16.5 7.5 17.4 7.65 18.1 8.15 18.7 9A3.5 3.5 0 0 0 18.75 14.5C19.1 16.25 18.25 19 16.75 20.25 15.75 21 14.75 21 13.75 20.5Q12 19.75 10.25 20.5C9.25 21 8.25 21 7.25 20.25 5.5 19 4.25 16.25 4.25 13.5 4.25 9.75 6.5 7.25 9.25 7.25 10.25 7.25 11.25 8.25 12 9Z"}],
        ["s", "path", { d: soft([[12.5, 6.25, 1.5], [13.4, 3.5, 3], [16.5, 2.75, 1.5], [15.4, 5.6, 3]]), anim: "swing", deg: -16, origin: "12.75 6" }],
      ],
    },
    microsoft: {
      els: [[3.5, 3.5], [14, 3.5], [14, 14], [3.5, 14]].map(([x, y], i) => ["s", "path", { d: rr(x, y, 6.5, 6.5, 1.75), anim: "pop", s: 1.1, delay: i * 0.08 }]),
    },
    meta: {
      anim: "squash",
      origin: "12 12",
      els: [["l", "path", { d: meta }]],
    },
    amazon: {
      els: [
        ["l", "circle", { cx: 11.25, cy: 8.75, r: 4 }],
        ["l", "path", { d: "M15.25 4.75v8.5" }],
        ["l", "path", { d: `M4.5 15.25Q12 20.5 ${SMILE_END.join(" ")}`, anim: "draw" }],
        ["l", "path", { d: smileHead, anim: "grow", origin: SMILE_END.join(" "), delay: 0.45 }],
      ],
    },
    stripe: {
      els: [["s", "path", { d: BADGE }], ["c", "path", { d: S(12, 7.25, 3, 9.5), anim: "wiggle", deg: 12, origin: "12 12" }]],
    },
    paypal: {
      els: [
        ["l", "path", { d: P(10.25, 4), transform: ITALIC, anim: "bounce", y: -1.75, origin: "12.5 16", delay: 0.12 }],
        ["k", "path", { d: P(6.75, 7.75), transform: ITALIC, anim: "bounce", y: -1.75, origin: "9 19.75" }],
      ],
    },
    shopify: {
      anim: "bounce",
      y: -2.5,
      origin: "12 21",
      els: [
        ["s", "path", { d: "M7 7.5h10a1.5 1.5 0 0 1 1.5 1.4l.9 9.4a2.5 2.5 0 0 1-2.5 2.7H7.1a2.5 2.5 0 0 1-2.5-2.7l.9-9.4A1.5 1.5 0 0 1 7 7.5Z" }],
        ["l", "path", { d: "M9 7.5V7a3 3 0 0 1 6 0v.5" }],
        ["c", "path", { d: S(12, 10.75, 2.25, 7) }],
      ],
    },
    figma: {
      els: [
        ["s", "path", { d: "M12 9.25H9.25a2.75 2.75 0 0 1 0-5.5H12Z", anim: "pop", s: 1.14, origin: "12 9.25" }],
        ["s", "path", { d: "M12 3.75h2.75a2.75 2.75 0 0 1 0 5.5H12Z", anim: "pop", s: 1.14, origin: "12 9.25", delay: 0.08 }],
        ["s", "path", { d: "M12 9.25H9.25a2.75 2.75 0 0 0 0 5.5H12Z" }],
        ["s", "circle", { cx: 14.75, cy: 12, r: 2.75, anim: "pop", s: 1.14, origin: "12 9.25", delay: 0.16 }],
        ["s", "path", { d: "M12 14.75V17.5a2.75 2.75 0 1 1-2.75-2.75Z", anim: "pop", s: 1.14, origin: "12 14.75", delay: 0.24 }],
        ["c", "path", { d: "M12 3.75V14.75M7.75 9.25H16.25M7.75 14.75H12" }],
      ],
    },
    notion: {
      els: [
        ["s", "path", { d: BADGE }],
        ["c", "path", { d: "M7.25 16.5h3M7.25 7.5h2.5M14 7.5h3.25" }], ["c", "path", { d: soft([[8.75, 16.5], [8.75, 7.5], [15.5, 16.5, 1.5], [15.5, 7.5]], false), anim: "draw" }],
      ],
    },
    slack: {
      els: PILLS.map(([x, y, w, h, nx, ny], i) => ["s", "path", { d: rr(x, y, w, h, 2), anim: "nudge", x: nx, y: ny, delay: i * 0.07 }]),
    },
    airbnb: {
      anim: "heartbeat",
      s: 1.12,
      origin: "12 12",
      els: [["l", "path", { d: "M12 15.75C13.25 14.25 14.75 13 14.75 11.5A2.75 2.75 0 0 0 9.25 11.5C9.25 13 10.75 14.25 12 15.75C13.75 18 15.5 20.5 17.5 20.5C19.75 20.5 21.5 18.25 20.25 16L13.6 4.4C13 3.25 11 3.25 10.4 4.4L3.75 16C2.5 18.25 4.25 20.5 6.5 20.5C8.5 20.5 10.25 18 12 15.75Z" }]],
    },
    uber: {
      els: [["s", "path", { d: BADGE }], ["c", "path", { d: "M8.75 7.5v5a3.25 3.25 0 0 0 6.5 0v-5", anim: "nudge", x: 1.75 }]],
    },
    dropbox: {
      els: [
        ["s", "path", { d: rhomb(7.5, 5.5), anim: "tilt", deg: -20, origin: "3.25 5.5" }],
        ["s", "path", { d: rhomb(16.5, 5.5), anim: "tilt", deg: 20, origin: "20.75 5.5", delay: 0.06 }],
        ["s", "path", { d: rhomb(7.5, 12.5) }],
        ["s", "path", { d: rhomb(16.5, 12.5) }],
        ["s", "path", { d: rhomb(12, 18.75, 3.5, 1.75) }],
      ],
    },
    zoom: {
      els: [
        ["s", "path", { d: BADGE }],
        ["c", "path", { d: rr(6.5, 9, 7.75, 6, 1.75), anim: "pop", s: 1.15, origin: "12 12" }],
        ["c", "path", { d: soft([[14.25, 11.25, 0.75], [17.5, 9.75, 1], [17.5, 14.25, 1], [14.25, 12.75, 0.75]]), anim: "pop", s: 1.15, origin: "12 12" }],
      ],
    },
    openai: {
      els: [["s", "path", { d: ROSETTE, anim: "turn", deg: 60, origin: "12 12" }], ["c", "path", { d: HOLE + SEAMS, anim: "turn", deg: 60, origin: "12 12" }]],
    },
    anthropic: {
      els: [
        ["s", "path", { d: slabL, anim: "bounce", y: -1.75, origin: "5.5 20" }],
        ["l", "path", { d: "M8.5 14.5H12", anim: "bounce", y: -1.75, origin: "5.5 20" }],
        ["s", "path", { d: slabR, anim: "bounce", y: -1.75, origin: "18.5 20", delay: 0.1 }],
      ],
    },
    chrome: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "circle", { cx: 12, cy: 12, r: 3.5 }],
        ["c", "path", { d: CHROME, anim: "turn", deg: 120, origin: "12 12" }],
      ],
    },
    safari: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M12 4.75v1.25M19.25 12H18M12 19.25V18M4.75 12H6" }],
        ["c", "path", { d: soft(NEEDLE), anim: "wiggle", deg: 18, origin: "12 12" }],
        ["d", "path", { d: soft(NEEDLE_NE), anim: "wiggle", deg: 18, origin: "12 12" }],
      ],
    },
    firefox: {
      els: [
        ["s", "circle", { cx: GLOBE[0], cy: GLOBE[1], r: GLOBE[2] }],
        // the fox curls round the globe, pivoting on the globe's centre so its inner edge stays on the rim
        ["s", "path", { d: FOX, anim: "wiggle", deg: -10, origin: `${GLOBE[0]} ${GLOBE[1]}` }],
        ["c", "circle", { cx: GLOBE[0], cy: GLOBE[1], r: GLOBE[2] }],
      ],
    },
  });
})();
