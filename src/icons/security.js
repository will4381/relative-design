// Security: API keys, secrets, tokens. All paths drawn from grid geometry.
(function () {
  const f = (v) => +v.toFixed(2);
  const R2 = Math.SQRT1_2;
  // Polyline/polygon whose corners are true arcs: pts = [[x, y, r], ...] (r ignored on open ends). Same as dev.js.
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
  const polar = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

  // Shared silhouettes (status.js / files.js).
  const SHIELD =
    "M11.25 3.3a2 2 0 0 1 1.5 0l6.2 2.45A1.6 1.6 0 0 1 20 7.25V11.5c0 4-3 7.1-6.7 9.1Q12 21.3 10.7 20.6C7 18.6 4 15.5 4 11.5V7.25a1.6 1.6 0 0 1 1.05-1.5Z";
  const SQUARE = "M7 3.5h10a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z";

  // Diagonal key like status `key`: bow centred on (c, c), shaft runs down-right to `end`, teeth stick out up-right.
  // teeth: [[t, len], ...] where (t, t) is the root on the shaft.
  const shaft = (from, end) => ["l", "path", { d: `M${f(from)} ${f(from)}L${end} ${end}` }];
  const teeth = (list) => list.map(([t, len]) => ["l", "path", { d: `M${t} ${t}l${f(len * R2)}-${f(len * R2)}` }]);
  const TURN = { anim: "tilt", deg: 30 }; // turned in the lock around the bow

  // Keyhole: round head + slot, both cut from what they sit on.
  const keyhole = (cx, cy, r, slot, motion = {}) => [
    ["d", "circle", { cx, cy, r, ...motion }],
    ["c", "path", { d: `M${cx} ${cy}v${slot}`, ...motion }],
  ];

  // Asterisk as a soft six-point flower (solid), so it stays crisp when small.
  const flower = (cx, cy, R, r) => {
    const pts = Array.from({ length: 12 }, (_, i) => {
      const [x, y] = polar(cx, cy, i % 2 ? r : R, -90 + i * 30);
      return [f(x), f(y), i % 2 ? 0.3 : 0.55];
    });
    return soft(pts);
  };

  // Ring arrow round (12, 12): arc from `a0` clockwise to `a1` (degrees, y down), open chevron head at a1.
  const ringArrow = (r, a0, a1, arm = 4) => {
    const s = polar(12, 12, r, a0), e = polar(12, 12, r, a1);
    const t = ((a1 + 90) * Math.PI) / 180; // clockwise tangent at the head
    const back = [-Math.cos(t), -Math.sin(t)];
    const rot = (v, deg) => { const a = (deg * Math.PI) / 180; return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; };
    const p = rot(back, 45), q = rot(back, -45);
    return `M${f(s[0])} ${f(s[1])}A${r} ${r} 0 1 1 ${f(e[0])} ${f(e[1])}` +
      `M${f(e[0] + p[0] * arm)} ${f(e[1] + p[1] * arm)}L${f(e[0])} ${f(e[1])}L${f(e[0] + q[0] * arm)} ${f(e[1] + q[1] * arm)}`;
  };

  // Small eye lens: cubic halves meeting at ~102° tips, for secret.
  const EYE_S = "M3.5 7C5.5 4.5 8.5 3.25 12 3.25S18.5 4.5 20.5 7C18.5 9.5 15.5 10.75 12 10.75S5.5 9.5 3.5 7Z";
  // Safe wheel: hub ring + four diagonal spokes (90° symmetric, so it can turn a quarter).
  const wheel = (cx, cy, r, R) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0Z` +
    [45, 135, 225, 315].map((a) => { const [x1, y1] = polar(cx, cy, r, a), [x2, y2] = polar(cx, cy, R, a); return `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`; }).join("");
  const turning = (els, origin, delay) => els.map((e) => (e[2] = { ...e[2], ...TURN, origin, ...(delay ? { delay } : {}) }, e));

  Icons.define("security", {
    api: {
      // letters jiggle in turn on their baseline (a hop would hit the badge)
      els: [
        ["s", "path", { d: rr(3, 6, 18, 12, 4) }],
        ["c", "path", { d: soft([[5.25, 15], [7.75, 9, 0.75], [10.25, 15]], false) + "M6.05 13.1h3.4", anim: "squash", origin: "7.75 15" }],
        ["c", "path", { d: "M12.75 15V9H14a1.75 1.75 0 0 1 0 3.5h-1.25", anim: "squash", origin: "14.25 15", delay: 0.08 }],
        ["c", "path", { d: "M18.5 9v6", anim: "squash", origin: "18.5 15", delay: 0.16 }],
      ],
    },
    "api-key": {
      els: [
        // status key laid flat across the top, code brackets underneath
        ...[
          ["s", "circle", { cx: 7.25, cy: 7.25, r: 4.25 }],
          ["d", "circle", { cx: 7.25, cy: 7.25, r: 1.4 }],
          ["l", "path", { d: "M11.5 7.25H21M21 7.25v-3M17.75 7.25v-3" }],
        ].map((e) => (e[2] = { ...e[2], anim: "tilt", deg: -15, origin: "7.25 7.25" }, e)),
        ["l", "path", { d: "M7.5 13.75 4.25 17l3.25 3.25", anim: "nudge", x: -1.5, delay: 0.1 }],
        ["l", "path", { d: "M13.25 13.5 11 20.5", anim: "wiggle", deg: 12, delay: 0.14 }],
        ["l", "path", { d: "M16.5 13.75 19.75 17l-3.25 3.25", anim: "nudge", x: 1.5, delay: 0.1 }],
      ],
    },
    "key-round": {
      ...TURN,
      origin: "9 9",
      els: [
        ["s", "circle", { cx: 9, cy: 9, r: 6 }],
        ["d", "circle", { cx: 9, cy: 9, r: 2 }],
        shaft(9 + 6 * R2, 18.75),
        ...teeth([[18.75, 3], [15.25, 3]]),
      ],
    },
    "key-square": {
      ...TURN,
      origin: "8 8",
      els: [
        ["s", "path", { d: rr(3, 3, 10, 10, 3.5) }],
        ["d", "circle", { cx: 8, cy: 8, r: 1.6 }],
        shaft(9.5 + 3.5 * R2, 18.75),
        ...teeth([[18.75, 3], [15.25, 3]]),
      ],
    },
    "key-plus": {
      els: [
        ...turning([
          ["s", "circle", { cx: 8.25, cy: 8.25, r: 5.25 }],
          ["d", "circle", { cx: 8.25, cy: 8.25, r: 1.6 }],
          shaft(8.25 + 5.25 * R2, 18.75),
          ...teeth([[18.75, 3], [15.25, 3]]),
        ], "8.25 8.25"),
        ["k", "path", { d: "M18.5 3v5M16 5.5h5", anim: "grow", origin: "18.5 5.5", delay: 0.15 }],
      ],
    },
    "key-off": {
      // key turned a quarter so the standard slash crosses its shaft, clear of the bow
      els: [
        ["s", "circle", { cx: 6.75, cy: 17.25, r: 3.75 }],
        ["d", "circle", { cx: 6.75, cy: 17.25, r: 1.25 }],
        ["l", "path", { d: `M${f(6.75 + 3.75 * R2)} ${f(17.25 - 3.75 * R2)}L18.75 5.25` }],
        ["l", "path", { d: "M18.75 5.25l-2.12-2.12M15.25 8.75l-2.12-2.12" }],
        ["k", "path", { d: "M3.5 3.5l17 17", anim: "draw" }],
      ],
    },
    "key-rotate": {
      els: [
        ["l", "path", { d: ringArrow(9, 20, -40 + 360), anim: "turn", deg: 360, origin: "12 12" }],
        ...turning([
          ["s", "circle", { cx: 9.5, cy: 9.5, r: 2.5 }],
          shaft(9.5 + 2.5 * R2, 15.25),
          ...teeth([[15.25, 2], [13.25, 2]]),
        ], "9.5 9.5", 0.12),
      ],
    },
    token: {
      // coin flips: squashes while its hash spins a quarter
      anim: "squash",
      origin: "12 12",
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M10 7.5v9M14 7.5v9M7.5 10h9M7.5 14h9", anim: "turn", deg: 90, origin: "12 12" }],
      ],
    },
    secret: {
      // masked characters blink in turn
      els: [
        ["s", "path", { d: rr(3, 6.5, 18, 11, 3.5) }],
        ...[7.5, 12, 16.5].map((cx, i) => ["d", "circle", { cx, cy: 12, r: 1.6, anim: "pulse", delay: i * 0.1 }]),
      ],
    },
    password: {
      els: [
        ["s", "path", { d: rr(3, 6.5, 18, 11, 3.5) }],
        ...[7, 10.75, 14.5].map((cx, i) => ["d", "path", { d: flower(cx, 12, 1.9, 0.95), anim: "pop", s: 1.3, origin: `${cx} 12`, delay: i * 0.08 }]),
        ["c", "path", { d: "M18 9.5v5", anim: "pulse", delay: 0.3 }],
      ],
    },
    "shield-key": {
      els: [
        ["s", "path", { d: SHIELD }],
        ...keyhole(12, 10.5, 2, 4.5, { anim: "tilt", deg: 35, origin: "12 10.5" }),
      ],
    },
    vault: {
      els: [
        ["s", "path", { d: rr(3, 3, 18, 16, 3.5) }],
        ["l", "path", { d: "M7 19v2M17 19v2" }],
        ["c", "path", { d: wheel(10.25, 11, 2, 4.25), anim: "turn", deg: 90, origin: "10.25 11" }],
        ["c", "path", { d: "M17 8.5v5" }],
      ],
    },
    "lock-keyhole": {
      els: [
        ["l", "path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3", anim: "bounce", y: -2.5, origin: "12 10.5", delay: 0.15 }],
        ["s", "path", { d: rr(4.5, 10.5, 15, 10.5, 3) }],
        ...keyhole(12, 14.75, 1.75, 2.75, { anim: "tilt", deg: 30, origin: "12 14.75" }),
      ],
    },
    "terminal-key": {
      els: [
        ["s", "path", { d: rr(3, 3, 18, 11, 3.5) }],
        ["c", "path", { d: "M7 6l2.25 2.25L7 10.5", anim: "nudge", x: 1.5 }],
        ["c", "path", { d: "M12 10.5h3.5", anim: "pulse", delay: 0.1 }],
        ...[
          ["k", "circle", { cx: 9.75, cy: 18, r: 2.75 }],
          ["k", "path", { d: "M12.5 18h8M20.5 18v2.5M17.5 18v2.25" }],
        ].map((e) => (e[2] = { ...e[2], anim: "tilt", deg: 25, origin: "9.75 18", delay: 0.12 }, e)),
      ],
    },
    curl: {
      els: [
        ["s", "circle", { cx: 5, cy: 9, r: 1 }],
        ["s", "circle", { cx: 5, cy: 15.5, r: 1 }],
        ["l", "path", { d: "M9.5 20l4.25-16", anim: "nudge", x: 2 }],
        ["l", "path", { d: "M15.5 20l4.25-16", anim: "nudge", x: 2, delay: 0.09 }],
      ],
    },
  });
})();
