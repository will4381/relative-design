// Nature: weather, animals, awards.
(function () {
  const f = (v) => +v.toFixed(2);
  const P = (x, y) => `${f(x)} ${f(y)}`;
  const rad = (d) => (d * Math.PI) / 180;
  const rot = ([x, y], d, [cx, cy] = [12, 12]) => {
    const c = Math.cos(rad(d)), s = Math.sin(rad(d));
    return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
  };

  // Closed polygon with every corner filleted by an arc: pts = [[x, y, radius], ...] (same helper as fun.js).
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
      return `${i ? "L" : "M"}${P(p.x + p.u1[0] * t, p.y + p.u1[1] * t)}A${r} ${r} 0 0 ${p.sweep} ${P(p.x + p.u2[0] * t, p.y + p.u2[1] * t)}`;
    }).join("") + "Z";
  };
  // Outline wrapping circles [cx, cy, r] in clockwise order; r < 0 is a concave scoop (same helper as fun.js).
  const hull = (C) => {
    const n = C.length, T = [];
    C.forEach(([ax, ay, sa], i) => {
      const [bx, by, sb] = C[(i + 1) % n], L = Math.hypot(bx - ax, by - ay);
      const th = -Math.acos((sa - sb) / L), ux = (bx - ax) / L, uy = (by - ay) / L;
      const nx = ux * Math.cos(th) - uy * Math.sin(th), ny = ux * Math.sin(th) + uy * Math.cos(th);
      T.push([[ax + sa * nx, ay + sa * ny], [bx + sb * nx, by + sb * ny]]);
    });
    return C.map(([cx, cy, r], i) => {
      const a = T[(i + n - 1) % n][1], b = T[i][0];
      let span = (Math.atan2(b[1] - cy, b[0] - cx) - Math.atan2(a[1] - cy, a[0] - cx)) * Math.sign(r);
      while (span < 0) span += 2 * Math.PI;
      return `${i ? "L" : "M"}${P(a[0], a[1])}A${Math.abs(r)} ${Math.abs(r)} 0 ${span > Math.PI ? 1 : 0} ${r > 0 ? 1 : 0} ${P(b[0], b[1])}`;
    }).join("") + "Z";
  };
  // Soft 4-point sparkle (same construction as fun.js).
  const sparkle = (x, y, R) => {
    const p = R * 0.2;
    const q = ([u, v], i) => [[u, v], [-v, u], [-u, -v], [v, -u]][i];
    const pt = (o, i) => { const [u, v] = q(o, i); return P(x + u, y + v); };
    let d = `M${pt([p, p - R], 0)}`;
    for (let i = 0; i < 4; i++) d += `Q${pt([p, -p], i)} ${pt([R - p, -p], i)}A${f(p)} ${f(p)} 0 0 1 ${pt([p, p - R], (i + 1) % 4)}`;
    return d + "Z";
  };
  // Five-point star with soft tips, as a filleted polygon.
  const star5 = (cx, cy, R, r, tip = 1, valley = 0.5) =>
    soft(Array.from({ length: 10 }, (_, i) => {
      const a = rad(-90 + i * 36), d = i % 2 ? r : R;
      return [cx + d * Math.cos(a), cy + d * Math.sin(a), i % 2 ? valley : tip];
    }));

  // The pack's two cloud silhouettes: files.js `cloud` (scalable copy) and fun.js `cloud-rain`.
  const cloud = (k = 1, ox = 0, oy = 0) => {
    const p = (x, y) => P(ox + k * x, oy + k * y), r = (v) => f(v * k);
    return `M${p(7, 19)}A${r(4)} ${r(4)} 0 0 1 ${p(7, 11)}A${r(5.5)} ${r(5.5)} 0 0 1 ${p(18, 11.1)}A${r(4)} ${r(4)} 0 0 1 ${p(17, 19)}Z`;
  };
  const RAIN_CLOUD = "M7 13.5a4 4 0 0 1 1-7.9 5 5 0 0 1 9 .9 3.5 3.5 0 0 1 0 7Z";
  // fun.js moon crescent; its bite circle is centred on (16.5, 7.5).
  const MOON = "M6.68 4.74A9 9 0 1 0 19.26 17.32A1.25 1.25 0 0 0 18.01 15.36A8 8 0 0 1 8.64 5.99A1.25 1.25 0 0 0 6.68 4.74Z";
  // fun.js sun rays, as a function of centre and radii.
  const rays = (cx, cy, r1, r2, angles) =>
    angles.map((a) => `M${P(cx + r1 * Math.cos(rad(a)), cy + r1 * Math.sin(rad(a)))}L${P(cx + r2 * Math.cos(rad(a)), cy + r2 * Math.sin(rad(a)))}`).join("");

  // Recycle: three bent arrows chasing round a soft triangle (centroid 12 13.5).
  const RC = [12, 13.5], RR = 12, RCORNER = 2.75, GAP = 3.5, HEAD = 3;
  const recycleArrow = (() => {
    const V = [-90, 30, 150].map((a) => [RC[0] + RR * Math.cos(rad(a)), RC[1] + RR * Math.sin(rad(a))]);
    const [V0, V1, V2] = V, side = Math.hypot(V1[0] - V0[0], V1[1] - V0[1]);
    const u = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
    const uA = u(V0, V2), uB = u(V0, V1), t = RCORNER / Math.tan(rad(30)), m = side / 2 - GAP / 2;
    const at = (uu, d) => [V0[0] + uu[0] * d, V0[1] + uu[1] * d];
    const tail = at(uA, m), a1 = at(uA, t), a2 = at(uB, t), head = at(uB, m);
    const arm = (s) => { const [x, y] = rot([head[0] - uB[0] * HEAD, head[1] - uB[1] * HEAD], s * 45, head); return P(x, y); };
    return `M${P(...tail)}L${P(...a1)}A${RCORNER} ${RCORNER} 0 0 1 ${P(...a2)}L${P(...head)}M${arm(1)}L${P(...head)}L${arm(-1)}`;
  })();

  // Clover: one outline of four heart leaves (two lobes + tip notch each), deep valleys between them.
  const CLOVER_C = [12, 10.25];
  const clover = (() => {
    const C = [];
    const pol = (d, a, r) => [CLOVER_C[0] + d * Math.cos(rad(a)), CLOVER_C[1] + d * Math.sin(rad(a)), r];
    for (const th of [-135, -45, 45, 135]) {
      C.push(pol(5.6, th - 17, 2), pol(7.85, th, -0.6), pol(5.6, th + 17, 2), pol(4.1, th + 45, -0.6));
    }
    return hull(C);
  })();

  // Leaf/lens between two points: soft tips (rt) and a wide middle (rm).
  const lens = ([ax, ay], [bx, by], rt, rm, e = 0.6) => {
    const L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L, mx = (ax + bx) / 2, my = (ay + by) / 2;
    return hull([[ax, ay, rt], [mx - uy * e, my + ux * e, rm], [bx, by, rt], [mx + uy * e, my - ux * e, rm]]);
  };

  // Fish: oval body (10, 12, 6.5×4.5) flowing into a forked tail as one outline, so line mode has no crossings.
  const FISH = "M15.5 9.6A6.5 4.5 0 1 0 15.5 14.4" +
    soft([[15.5, 14.4, 0], [21, 17.5, 1.25], [19.25, 12, 1], [21, 6.5, 1.25], [15.5, 9.6, 0]]).replace(/^M/, "L").replace(/Z$/, "") + "Z";

  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;

  // Snowflakes / confetti specks: a zero-length round-capped stroke, solid in both variants.
  const dot = (x, y, m = {}) => ["l", "path", { d: `M${x} ${y}h.01`, ...m }];

  Icons.define("nature", {
    "moon-star": {
      els: [
        ["s", "path", { d: MOON, anim: "tilt", deg: -12, origin: "12 12" }],
        ["s", "path", { d: star5(16.75, 7.5, 4.6, 2.05, 0.5, 0.25), anim: "twinkle", delay: 0.1 }],
      ],
    },
    cloudy: {
      els: [
        ["s", "path", { d: cloud(0.62, 9.6, -0.4), anim: "float", x: -1.5, y: 0, delay: 0.08 }],
        ["k", "path", { d: cloud(0.86, 0.3, 4.05), anim: "float", x: 1.25, y: 0 }],
      ],
    },
    "cloud-sun": {
      els: [
        ["s", "circle", { cx: 9, cy: 9, r: 3.25 }],
        ["l", "path", { d: rays(9, 9, 5.25, 6.5, [0, 45, 90, 135, 180, 225, 270, 315]), anim: "turn", deg: 45, origin: "9 9" }],
        ["k", "path", { d: cloud(0.72, 6.6, 6.9), anim: "float", x: 1.25, y: 0 }],
      ],
    },
    "cloud-snow": {
      els: [
        ["s", "path", { d: RAIN_CLOUD }],
        ...[[8, 17, 0], [12.5, 17, 0.12], [17, 17, 0.24], [10.25, 21, 0.06], [14.75, 21, 0.18]].map(([x, y, delay]) =>
          dot(x, y, { anim: "enter", x: -0.75, y: -2.5, delay })),
      ],
    },
    "cloud-lightning": {
      els: [
        ["s", "path", { d: RAIN_CLOUD, anim: "shake", x: 0.75, delay: 0.12 }],
        ["k", "path", { d: soft([[16.5, 0, 1.25], [4, 14, 1.25], [9.5, 14, 0.75], [7.5, 24, 1.25], [20, 10, 1.25], [14.5, 10, 0.75]].map(([x, y, r]) => [4.2 + 0.65 * x, 7.55 + 0.65 * y, 0.65 * r])), anim: "enter", y: -3 }],
      ],
    },
    sunrise: {
      els: [
        ["s", "path", { d: "M7 19a5 5 0 0 1 10 0", anim: "grow", origin: "12 19" }],
        ["l", "path", { d: rays(12, 19, 7.5, 9, [-150, -30]), anim: "grow", origin: "12 19", delay: 0.22 }],
        ["l", "path", { d: "M12 10V3.5M9.25 6.25 12 3.5l2.75 2.75", anim: "nudge", y: -2, delay: 0.1 }],
        ["l", "path", { d: "M3 19h18" }],
      ],
    },
    sunset: {
      els: [
        ["s", "path", { d: "M7 19a5 5 0 0 1 10 0", anim: "enter", y: -2.5, delay: 0.14 }],
        ["l", "path", { d: rays(12, 19, 7.5, 9, [-150, -30]), anim: "grow", origin: "12 19", delay: 0.3 }],
        ["l", "path", { d: "M12 3.5V10M9.25 7.25 12 10l2.75-2.75", anim: "nudge", y: 1.5 }],
        ["l", "path", { d: "M3 19h18" }],
      ],
    },
    rainbow: {
      els: [
        ["l", "path", { d: "M3 16.5a9 9 0 0 1 18 0", anim: "draw" }],
        ["l", "path", { d: "M7.5 16.5a4.5 4.5 0 0 1 9 0", anim: "draw", delay: 0.12 }],
      ],
    },
    tornado: {
      anim: "wiggle",
      deg: 8,
      origin: "12.5 21",
      els: [
        ["l", "path", { d: "M3 3.5h18", anim: "nudge", x: 1.5, delay: 0.16 }],
        ["l", "path", { d: "M5 8h12.5", anim: "nudge", x: -1.5, delay: 0.12 }],
        ["l", "path", { d: "M8.5 12.5h9", anim: "nudge", x: 1.5, delay: 0.08 }],
        ["l", "path", { d: "M8 17h5", anim: "nudge", x: -1.5, delay: 0.04 }],
        ["l", "path", { d: "M12 21h1.5", anim: "nudge", x: 1 }],
      ],
    },
    waves: {
      els: [6, 12, 18].map((y, i) => ["l", "path", {
        d: `M3 ${y}q2.25-2.5 4.5 0t4.5 0 4.5 0 4.5 0`, anim: "nudge", x: 2.5, delay: i * 0.1,
      }]),
    },
    "mountain-snow": {
      els: [
        ["s", "path", { d: soft([[9.5, 4.5, 2.25], [14.25, 12.25, 0.75], [16.25, 9.5, 1.75], [21, 19.5, 1.5], [3, 19.5, 1.5]]) }],
        ["c", "path", { d: "M5.9 11.25l1.85 1.5 1.75-1.5 1.75 1.5 2-1.6", anim: "draw" }],
        dot(19.5, 4.5, { anim: "enter", y: -2.5, delay: 0.1 }),
        dot(16, 3.25, { anim: "enter", y: -2.5, delay: 0.25 }),
      ],
    },
    earth: {
      // planet: disc with two soft continents and an island floating inside (not touching the rim)
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["d", "path", { d: "M7 7.5c1.5-1 3.5-.75 4.25.5.6 1-.4 2-1.5 2.5-.9.4-1 1.6-2 1.75-1.25.2-2.25-.9-2.25-2.25 0-1 .5-1.9 1.5-2.5Z", anim: "wiggle", deg: 8, origin: "12 12" }],
        ["d", "path", { d: "M13 12.75c1.25-.5 3 .25 3.75 1.5.8 1.3.5 3-.75 3.75-1.1.7-2.6.4-3.25-.6-.5-.8-.2-1.4-.6-2.2-.4-.9.1-2.1.85-2.45Z", anim: "wiggle", deg: 8, origin: "12 12", delay: 0.05 }],
        ["d", "circle", { cx: 16.25, cy: 8, r: 1, anim: "wiggle", deg: 8, origin: "12 12", delay: 0.1 }],
      ],
    },
    recycle: {
      els: [0, 120, 240].map((a) => ["l", "path", { d: recycleArrow, transform: `rotate(${a} ${RC[0]} ${RC[1]})`, anim: "turn", deg: 120, origin: `${RC[0]} ${RC[1]}` }]),
    },
    sprout: {
      els: [
        ["l", "path", { d: "M12 21v-8.5", anim: "grow", origin: "12 21" }],
        ["s", "path", { d: lens([11.25, 12.25], [4.75, 7], 1.1, 2.4, 0.5), anim: "grow", origin: "12 12.5", delay: 0.14 }],
        ["s", "path", { d: lens([12.75, 11.25], [19.5, 4.25], 1.1, 2.75, 0.5), anim: "grow", origin: "12 12.5", delay: 0.2 }],
        ["l", "path", { d: "M7.5 21h9" }],
      ],
    },
    clover: {
      anim: "wiggle",
      deg: 10,
      origin: "13 21",
      els: [
        ["s", "path", { d: clover, anim: "pop", s: 1.1, origin: `12 ${CLOVER_C[1] + 3.25}`, delay: 0.1 }],
        ["l", "path", { d: `M12 ${CLOVER_C[1] + 3.5}c0 3 .4 5.2 1.5 7.25` }],
      ],
    },
    feather: {
      anim: "float",
      y: -1.5,
      els: [
        ["s", "path", { d: soft([[12, 1.5, 2.5], [16.25, 5.5, 3], [16.5, 10.5, 2], [14, 11.75, 0.5], [16, 13.5, 1.5], [13, 18, 1], [11, 18, 1], [8, 14.5, 2], [7.5, 9.5, 3], [9, 4.5, 2.5]]), transform: "rotate(45 12 12)", anim: "wiggle", deg: 12, origin: "12 12" }],
        ["c", "path", { d: "M12 8.5V16.75", transform: "rotate(45 12 12)", anim: "wiggle", deg: 12, origin: "12 12" }],
        ["l", "path", { d: "M12 18v4", transform: "rotate(45 12 12)", anim: "wiggle", deg: 12, origin: "12 12" }],
      ],
    },
    bird: {
      anim: "bounce",
      y: -1.5,
      origin: "11.5 20",
      els: [
        ["s", "path", { d: hull([[14.5, 8.5, 3], [20.25, 9.25, 1.25], [18, 12.5, -0.9], [11, 14, 6], [3.5, 8.75, 1], [8.5, 7, -1]]) }],
        ["c", "path", { d: "M14 13.25c-.5 2.5-3 4-6 3.5", anim: "squash", origin: "14 13.25", delay: 0.08 }],
        ["d", "circle", { cx: 15.25, cy: 7.75, r: 1 }],
      ],
    },
    fish: {
      anim: "wiggle",
      deg: 8,
      origin: "4 12",
      els: [
        ["s", "path", { d: FISH, anim: "nudge", x: -2 }],
        ["d", "circle", { cx: 7, cy: 11.25, r: 1.1, anim: "nudge", x: -2 }],
        ["c", "path", { d: "M10.5 9.75c.75 1.4.75 3.1 0 4.5", anim: "nudge", x: -2 }],
      ],
    },
    rabbit: {
      anim: "bounce",
      y: -3,
      origin: "12 21",
      els: [
        ["s", "path", { d: hull([[8, 4.75, 1.75], [9.75, 11.5, 2.1]]), anim: "tilt", deg: -14, origin: "9.75 13", delay: 0.12 }],
        ["s", "path", { d: hull([[16, 4.75, 1.75], [14.25, 11.5, 2.1]]), anim: "tilt", deg: 14, origin: "14.25 13", delay: 0.12 }],
        ["k", "ellipse", { cx: 12, cy: 15.75, rx: 6.5, ry: 5.25 }],
        ["d", "circle", { cx: 9.5, cy: 15, r: 1 }],
        ["d", "circle", { cx: 14.5, cy: 15, r: 1 }],
        ["d", "circle", { cx: 12, cy: 17.5, r: 0.85 }],
      ],
    },
    turtle: {
      // side view facing right: domed shell with a plate line, stubby legs, round head that peeks out
      els: [
        ["s", "path", { d: "M3 15.5a7 6.5 0 0 1 14 0Z" }],
        ["c", "path", { d: "M6.5 12.5c2-1.25 5-1.25 7 0" }],
        ["l", "path", { d: "M6 15.75v2.75M14 15.75v2.75" }],
        ["s", "circle", { cx: 19.25, cy: 13, r: 2.25, anim: "nudge", x: 1.25 }],
      ],
    },
    snail: {
      els: [
        ["s", "path", { d: hull([[3.5, 19.75, 1], [18.75, 12.25, 2], [18.75, 18.75, 2]]), anim: "squash", origin: "3 20.5" }],
        ["l", "path", { d: "M18 10.5 17.25 7M19.75 10.5l.75-3.5", anim: "squash", origin: "3 20.5" }],
        ["k", "circle", { cx: 10, cy: 11.25, r: 6.25, anim: "nudge", x: 1, delay: 0.12 }],
        ["c", "path", { d: "M10 11.5a1.25 1.25 0 0 1 2.5 0 2.5 2.5 0 0 1-5 0", anim: "nudge", x: 1, delay: 0.12 }],
      ],
    },
    dog: {
      els: [
        ["l", "path", { d: "M18.75 12.5c1.5-.5 2.25-2 2.25-4.25", anim: "swing", deg: 22, origin: "18.75 12.5" }],
        ["s", "path", { d: soft([[8.5, 11.5, 3], [19.25, 11.5, 3], [19.25, 20.5, 1.25], [16.25, 20.5, 1.25], [16.25, 17, 1], [11.5, 17, 1], [11.5, 20.5, 1.25], [8.5, 20.5, 1.25]]) }],
        ["k", "path", { d: hull([[8.75, 7.25, 3.5], [4.75, 9.25, 1.75]]) }],
        ["k", "path", { d: hull([[10.75, 5.25, 1.1], [11.5, 9.5, 1.3]]), anim: "tilt", deg: 18, origin: "10.75 4.5", delay: 0.2 }],
        ["d", "circle", { cx: 7.75, cy: 7, r: 1 }],
      ],
    },
    cat: {
      els: [
        ["s", "path", { d: soft([[4.5, 3, 1.5], [11.5, 8.5, 1], [3.75, 13, 1]]), anim: "tilt", deg: -12, origin: "6.5 11", delay: 0.05 }],
        ["s", "path", { d: soft([[19.5, 3, 1.5], [20.25, 13, 1], [12.5, 8.5, 1]]), anim: "tilt", deg: 12, origin: "17.5 11", delay: 0.2 }],
        ["k", "ellipse", { cx: 12, cy: 14.75, rx: 8, ry: 6 }],
        ["d", "circle", { cx: 8.75, cy: 14.5, r: 1.1, anim: "blink", delay: 0.35 }],
        ["d", "circle", { cx: 15.25, cy: 14.5, r: 1.1, anim: "blink", delay: 0.35 }],
        ["d", "circle", { cx: 12, cy: 17, r: 0.85 }],
      ],
    },
    award: {
      anim: "swing",
      deg: 12,
      origin: "12 3",
      els: [
        ["s", "path", { d: soft([[8.5, 12.5, 1], [11.75, 13.5, 1], [9.75, 21, 1], [8, 19.25, 0.5], [6, 20.25, 1]]) + soft([[15.5, 12.5, 1], [18, 20.25, 1], [16, 19.25, 0.5], [14.25, 21, 1], [12.25, 13.5, 1]]) }],
        ["k", "path", { d: hull(Array.from({ length: 16 }, (_, i) => {
          const a = rad(-90 + i * 22.5);
          return i % 2 ? [12 + 6.4 * Math.cos(a), 9 + 6.4 * Math.sin(a), -1] : [12 + 4.5 * Math.cos(a), 9 + 4.5 * Math.sin(a), 1.5];
        })) }],
        ["d", "path", { d: star5(12, 9.25, 2.9, 1.35, 0.5, 0.3), anim: "twinkle", delay: 0.15 }],
      ],
    },
    badge: {
      anim: "pop",
      s: 1.1,
      els: [
        ["s", "path", { d: hull(Array.from({ length: 16 }, (_, i) => i % 2
          ? [12 + 9.6 * Math.cos(rad(-90 + i * 22.5)), 12 + 9.6 * Math.sin(rad(-90 + i * 22.5)), -1.5]
          : [12 + 6.75 * Math.cos(rad(-90 + i * 22.5)), 12 + 6.75 * Math.sin(rad(-90 + i * 22.5)), 2.25])), anim: "turn", deg: 45, origin: "12 12" }],
      ],
    },
    gem: {
      els: [
        ["s", "path", { d: soft([[7.25, 4, 1.5], [16.75, 4, 1.5], [21, 9.25, 1.5], [12, 21, 2], [3, 9.25, 1.5]]), anim: "twinkle", origin: "12 12" }],
        ["c", "path", { d: "M3.75 9.25h16.5M8.5 9.25 12 19M15.5 9.25 12 19", anim: "twinkle", origin: "12 12" }],
      ],
    },
    "party-popper": {
      els: [
        ["s", "path", { d: soft([[3, 21, 2], [7.25, 8.75, 1.5], [15.25, 16.75, 1.5]]), anim: "squash", origin: "3 21" }],
        dot(11, 4, { anim: "enter", x: -3, y: 3 }),
        ["l", "path", { d: "M15.5 3.5l.5 2.5", anim: "enter", x: -3, y: 3, delay: 0.06 }],
        ["l", "path", { d: "M13 10.5c1-1.5 2.5-1.5 3.5-3s2-1.5 3.5-1.5", anim: "enter", x: -3, y: 3, delay: 0.12 }],
        dot(20, 11, { anim: "enter", x: -3, y: 3, delay: 0.18 }),
        ["l", "path", { d: "M18 15l2.5.5", anim: "enter", x: -3, y: 3, delay: 0.24 }],
      ],
    },
    egg: {
      anim: "wiggle",
      deg: 10,
      origin: "12 21",
      els: [
        ["s", "path", { d: "M5.5 14.5C5.5 8.5 8.5 3 12 3s6.5 5.5 6.5 11.5a6.5 6.5 0 0 1-13 0Z" }],
        ["c", "path", { d: "M8.75 14.5a3.25 3.25 0 0 0 2.25 3.1" }],
      ],
    },
  });
})();
