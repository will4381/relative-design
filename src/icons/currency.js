// Currency: bare signs drawn big in soft geometric strokes, plus money objects.
// Every 90° letter corner gets a 1.5 arc; acute tips (N, W, M, z, ₹) get true arc fillets.
(function () {
  const f = (v) => +v.toFixed(2);
  // Polyline through [x, y, r?]; points with r get an arc fillet (clamped so it never eats past an edge).
  // A point [x, y, r, "y"] keeps its rounded apex on the original y (the hidden vertex moves to make room),
  // so a filleted acute tip still reaches the baseline / cap height.
  function fil(pts, closed = false) {
    const n = pts.length;
    pts = pts.map((p) => [...p]);
    for (let it = 0; it < 8; it++) pts.forEach((p, i) => {
      if (p[3] !== "y") return;
      const [ax, ay] = pts[(i + n - 1) % n], [bx, by] = pts[(i + 1) % n], y0 = p[4] ?? (p[4] = p[1]);
      const la = Math.hypot(ax - p[0], ay - p[1]), lb = Math.hypot(bx - p[0], by - p[1]);
      const ux = (ax - p[0]) / la, uy = (ay - p[1]) / la, vx = (bx - p[0]) / lb, vy = (by - p[1]) / lb;
      const half = Math.acos(ux * vx + uy * vy) / 2, m = Math.hypot(ux + vx, uy + vy);
      p[1] = y0 - ((uy + vy) / m) * (p[2] / Math.sin(half) - p[2]);
    });
    const soft = (i) => pts[i][2] && (closed || (i > 0 && i < n - 1));
    return pts.map(([x, y, r], i) => {
      const cmd = i ? "L" : "M";
      if (!soft(i)) return `${cmd}${f(x)} ${f(y)}`;
      const ia = (i + n - 1) % n, ib = (i + 1) % n;
      const [ax, ay] = pts[ia], [bx, by] = pts[ib];
      const la = Math.hypot(ax - x, ay - y), lb = Math.hypot(bx - x, by - y);
      const ux = (ax - x) / la, uy = (ay - y) / la, vx = (bx - x) / lb, vy = (by - y) / lb;
      const half = Math.acos(Math.max(-1, Math.min(1, ux * vx + uy * vy))) / 2;
      const t = Math.min(r / Math.tan(half), soft(ia) ? la / 2 : la, soft(ib) ? lb / 2 : lb);
      const rr = t * Math.tan(half);
      const sweep = (x - ax) * (by - y) - (y - ay) * (bx - x) > 0 ? 1 : 0;
      return `${cmd}${f(x + ux * t)} ${f(y + uy * t)}A${f(rr)} ${f(rr)} 0 0 ${sweep} ${f(x + vx * t)} ${f(y + vy * t)}`;
    }).join("") + (closed ? "Z" : "");
  }
  const cont = (d) => "L" + d.slice(1); // continue a path from its current point
  const rr = (x, y, w, h, r) =>
    `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;

  // The pack's soft S (same curve as editor's strikethrough), fitted into any box.
  const S_PTS = [[16.5, 7.25], [16, 5.25], [14.25, 4], [12, 4], [9.5, 4], [7.5, 5.5], [7.5, 7.75], [7.5, 12.75], [16.5, 11.25], [16.5, 16.25], [16.5, 18.5], [14.5, 20], [12, 20], [9.75, 20], [8, 18.75], [7.5, 16.75]];
  const S = (l, t, r, b) => {
    const p = S_PTS.map(([x, y]) => `${f(l + ((x - 7.5) / 9) * (r - l))} ${f(t + ((y - 4) / 16) * (b - t))}`);
    return `M${p[0]}` + [1, 4, 7, 10, 13].map((i) => `C${p[i]} ${p[i + 1]} ${p[i + 2]}`).join("");
  };
  // Dollar: S plus top/bottom stubs at its centre line.
  const dollar = (l, t, r, b, s0, s1) => S(l, t, r, b) + `M${(l + r) / 2} ${s0}V${t}M${(l + r) / 2} ${b}V${s1}`;

  // Stem at x from t down to b, with a bowl (top → bowlB) reaching bowlR. Returns { d, foot } where foot is
  // the point the bowl closes on (R legs start there). extend: how far the bowl's closing bar runs past the stem.
  const P = (x, t, b, bowlB, bowlR, extend = 0) => {
    const r = (bowlB - t) / 2, hx = bowlR - r;
    return { d: `M${x} ${b}V${t + 1.5}a1.5 1.5 0 0 1 1.5-1.5H${hx}a${r} ${r} 0 0 1 0 ${2 * r}H${x - extend}`, foot: [hx, bowlB] };
  };
  const R = (x, t, b, bowlB, bowlR, legX) => {
    const p = P(x, t, b, bowlB, bowlR);
    return { body: p.d, leg: `M${p.foot[0]} ${p.foot[1]}L${legX} ${b}`, foot: p.foot };
  };
  // B: stem + two bowls; corners on the stem side softened.
  const Bp = (x, t, m, b, top, bot) => {
    const r1 = (m - t) / 2, r2 = (b - m) / 2;
    return `M${x} ${m}V${t + 1.5}a1.5 1.5 0 0 1 1.5-1.5H${top - r1}a${r1} ${r1} 0 0 1 0 ${2 * r1}H${x}` +
      `M${x} ${m}H${bot - r2}a${r2} ${r2} 0 0 1 0 ${2 * r2}H${x + 1.5}a1.5 1.5 0 0 1-1.5-1.5V${m}`;
  };

  // Circular arrow on a ring around (12,12): from a0 to a1 degrees (clockwise when a1 > a0), open head at a1.
  const pt = (a, r) => [12 + r * Math.cos((a * Math.PI) / 180), 12 + r * Math.sin((a * Math.PI) / 180)];
  const arcArrow = (a0, a1, r, len = 3.5) => {
    const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r), cw = a1 > a0;
    const [xb, yb] = pt(a1 - (cw ? 22 : -22), r);
    const m = Math.hypot(x1 - xb, y1 - yb), vx = (xb - x1) / m, vy = (yb - y1) / m, c = Math.SQRT1_2;
    const arm = (s) => `${f(x1 + len * c * (vx - s * vy))} ${f(y1 + len * c * (s * vx + vy))}`;
    return `M${f(x0)} ${f(y0)}A${r} ${r} 0 0 ${cw ? 1 : 0} ${f(x1)} ${f(y1)}M${arm(1)}L${f(x1)} ${f(y1)}L${arm(-1)}`;
  };

  const RAND = R(6.5, 3.5, 20.5, 12, 16.75, 17.5);
  const REAL_R = R(3.5, 5, 19, 12, 10.25, 10.25);
  const RP_R = R(3.5, 3.5, 17.5, 10.5, 10, 10);
  const RM_R = R(3, 4.5, 19.5, 11.75, 10, 10);
  const BTC = "rotate(12 12 12)";

  Icons.define("currency", {
    dollar: {
      anim: "bounce",
      y: -3,
      origin: "12 21",
      // tall, open S with short bar stubs above and below (no bar through the middle)
      els: [
        ["l", "path", { d: "M16.25 7.75C15.5 6.25 13.9 5.5 12 5.5 9.5 5.5 7.75 6.9 7.75 8.9 7.75 11 9.6 11.5 12 12s4.25 1 4.25 3.1c0 2-1.75 3.4-4.25 3.4-1.9 0-3.5-.75-4.25-2.25" }],
        ["l", "path", { d: "M12 3v2.5M12 18.5V21" }],
      ],
    },
    euro: {
      els: [
        ["l", "path", { d: `M19.35 6.05A8 8 0 1 0 19.35 17.95`, anim: "draw" }],
        ["l", "path", { d: "M3.5 9.75H13", anim: "nudge", x: -2, delay: 0.22 }],
        ["l", "path", { d: "M3.5 14.25H13", anim: "nudge", x: -2, delay: 0.3 }],
      ],
    },
    "pound-sterling": {
      // stamped down onto its base
      anim: "squash",
      origin: "12 20.25",
      els: [["l", "path", { d: "M16.42 8.5A3.75 3.75 0 1 0 9 7.75V20.25M5.5 20.25H18M5.5 13H13.5" }]],
    },
    "japanese-yen": {
      els: [
        ["l", "path", { d: "M5.5 3.5 12 11.25 18.5 3.5M12 11.25V20.5" }],
        ["l", "path", { d: "M7 12.75H17", anim: "nudge", x: 2 }],
        ["l", "path", { d: "M7 17.25H17", anim: "nudge", x: 2, delay: 0.09 }],
      ],
    },
    "chinese-yuan": {
      // 元, written stroke by stroke
      els: [
        ["l", "path", { d: "M8 4.5H16", anim: "draw" }],
        ["l", "path", { d: "M4 9.75H20", anim: "draw", delay: 0.1 }],
        ["l", "path", { d: "M9.75 9.75V12.5C9.75 16 8 18.75 5 20.25", anim: "draw", delay: 0.2 }],
        ["l", "path", { d: "M14.25 9.75V17.75a2.5 2.5 0 0 0 2.5 2.5H18a1.5 1.5 0 0 0 1.5-1.5V17", anim: "draw", delay: 0.3 }],
      ],
    },
    "indian-rupee": {
      anim: "wiggle",
      deg: 10,
      origin: "12 12",
      els: [["l", "path", { d: "M6 4H18M6 8.5H18M10.75 4a4.25 4.25 0 0 1 0 8.5" + cont(fil([[10.75, 12.5], [5.5, 12.5, 2], [14.25, 20.5]])) }]],
    },
    "russian-ruble": {
      anim: "pop",
      s: 1.15,
      origin: "12 12",
      els: [
        ["l", "path", { d: P(9.25, 3.5, 20.5, 12, 17.5, 3).d }],
        ["l", "path", { d: "M6.25 16.5H14.25" }],
      ],
    },
    "korean-won": {
      els: [
        ["l", "path", { d: fil([[3.75, 4], [7.75, 20, 2, "y"], [12, 8.5, 1.75, "y"], [16.25, 20, 2, "y"], [20.25, 4]]) }],
        ["l", "path", { d: "M3 10.5H21", anim: "draw", delay: 0.05 }],
        ["l", "path", { d: "M3 15H21", anim: "draw", delay: 0.15 }],
      ],
    },
    "turkish-lira": {
      els: [
        ["l", "path", { d: "M8.5 3.5V19a1.5 1.5 0 0 0 1.5 1.5h.5A8 8 0 0 0 18.5 12.5", anim: "draw" }],
        ["l", "path", { d: "M5 11 12.5 8", anim: "nudge", x: 1.5, y: -0.6, delay: 0.25 }],
        ["l", "path", { d: "M5 15.5 12.5 12.5", anim: "nudge", x: 1.5, y: -0.6, delay: 0.33 }],
      ],
    },
    "swiss-franc": {
      els: [
        ["l", "path", { d: "M8.75 20.5V5a1.5 1.5 0 0 1 1.5-1.5H18.25" }],
        ["l", "path", { d: "M8.75 11H16.25", anim: "nudge", x: 2 }],
        ["l", "path", { d: "M5.75 16H12.75", anim: "nudge", x: 2, delay: 0.09 }],
      ],
    },
    "philippine-peso": {
      // flips like a tossed coin
      anim: "squash",
      origin: "12 12",
      els: [
        ["l", "path", { d: P(7.5, 3.5, 20.5, 15.5, 17.5).d }],
        ["l", "path", { d: "M4.5 7.5H20M4.5 11.5H20" }],
      ],
    },
    "nigerian-naira": {
      els: [
        ["l", "path", { d: fil([[6, 20.5], [6, 3.5, 2, "y"], [18, 20.5, 2, "y"], [18, 3.5]]) }],
        ["l", "path", { d: "M3.5 9.75H20.5", anim: "nudge", x: -2 }],
        ["l", "path", { d: "M3.5 14.25H20.5", anim: "nudge", x: 2 }],
      ],
    },
    "israeli-shekel": {
      els: [
        ["l", "path", { d: "M5 20.5V7a3.5 3.5 0 0 1 3.5-3.5H11a3.5 3.5 0 0 1 3.5 3.5v7.5", anim: "nudge", y: -1.5 }],
        ["l", "path", { d: "M19 3.5V17a3.5 3.5 0 0 1-3.5 3.5H13A3.5 3.5 0 0 1 9.5 17V9.5", anim: "nudge", y: 1.5 }],
      ],
    },
    "thai-baht": {
      anim: "bounce",
      y: -2.5,
      origin: "12 21",
      els: [["l", "path", { d: Bp(7.25, 5, 12, 19, 15.5, 16.75) + "M11.25 3V5M11.25 19V21" }]],
    },
    "vietnamese-dong": {
      els: [
        ["l", "circle", { cx: 10.75, cy: 13, r: 3.75, anim: "bounce", y: -2, origin: "12 16.75" }],
        ["l", "path", { d: "M14.5 3.5V16.75M12 6.25H17.25", anim: "bounce", y: -2, origin: "12 16.75" }],
        ["l", "path", { d: "M6.5 20.5H17.5", anim: "draw", delay: 0.15 }],
      ],
    },
    "brazilian-real": {
      els: [
        ["l", "path", { d: REAL_R.body + REAL_R.leg, anim: "bounce", y: -2.5, origin: "7 19" }],
        ["l", "path", { d: dollar(14, 6.5, 20.5, 17.5, 4.25, 19.75), anim: "bounce", y: -2.5, origin: "17.25 19.75", delay: 0.12 }],
      ],
    },
    "south-african-rand": {
      els: [
        ["l", "path", { d: RAND.body }],
        // the leg kicks out from the bowl
        ["l", "path", { d: RAND.leg, anim: "tilt", deg: -24, origin: RAND.foot.join(" ") }],
      ],
    },
    "swedish-krona": {
      els: [
        ["l", "path", { d: "M4.75 3.5V20.5M10.75 10.5 4.75 15.25M7.75 12.88 11 20.5", anim: "squash", origin: "8 20.5" }],
        ["l", "path", { d: "M14.75 20.5V10.5M14.75 15a4.5 4.5 0 0 1 4.5-4.5", anim: "squash", origin: "17 20.5", delay: 0.1 }],
      ],
    },
    "polish-zloty": {
      els: [
        ["l", "path", { d: fil([[4.75, 10], [11.25, 10, 2], [4.75, 20.5, 2], [11.25, 20.5]]), anim: "wiggle", deg: 10, origin: "8 15.25" }],
        ["l", "path", { d: "M16.25 3.5V20.5" }],
        ["l", "path", { d: "M13.75 14.5 18.75 11", anim: "draw", delay: 0.2 }],
      ],
    },
    "indonesian-rupiah": {
      els: [
        // R stamps down, then the p hops beside it
        ["l", "path", { d: RP_R.body + RP_R.leg, anim: "squash", origin: "6.75 17.5" }],
        ["l", "path", { d: "M13.5 10V21", anim: "bounce", y: -2, origin: "17 17.5", delay: 0.12 }],
        ["l", "circle", { cx: 17.25, cy: 13.75, r: 3.75, anim: "bounce", y: -2, origin: "17 17.5", delay: 0.12 }],
      ],
    },
    "malaysian-ringgit": {
      anim: "pop",
      s: 1.14,
      origin: "12 12",
      els: [
        ["l", "path", { d: RM_R.body + RM_R.leg }],
        ["l", "path", { d: fil([[12.75, 19.5], [12.75, 4.5, 1.75], [16.875, 11.5, 1.25], [21, 4.5, 1.75], [21, 19.5]]) }],
      ],
    },
    bitcoin: {
      anim: "wiggle",
      deg: 12,
      origin: "12 12",
      els: [["l", "path", { d: Bp(6.75, 5, 12, 19, 15.25, 16.75) + "M9.25 3V5M13.25 3V5M9.25 19V21M13.25 19V21", transform: BTC }]],
    },
    ethereum: {
      els: [
        ["s", "path", { d: fil([[12, 3, 2, "y"], [17, 12.25, 1.25], [12, 15.25, 1.25], [7, 12.25, 1.25]], true), anim: "bounce", y: -2.5, origin: "12 15.25" }],
        ["l", "path", { d: fil([[7, 17.5], [12, 20.5, 1.5], [17, 17.5]]), anim: "squash", origin: "12 20.5", delay: 0.3 }],
      ],
    },
    currency: {
      // ¤ has four-fold symmetry: a quarter turn lands on rest
      anim: "turn",
      deg: 90,
      origin: "12 12",
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 5.25 }],
        ["l", "path", { d: "M15.71 8.29 18.36 5.64M8.29 8.29 5.64 5.64M15.71 15.71l2.65 2.65M8.29 15.71 5.64 18.36" }],
      ],
    },
    banknote: {
      // waved by its corner
      anim: "wiggle",
      deg: 8,
      origin: "3 18",
      els: [
        ["s", "path", { d: rr(3, 6, 18, 12, 3) }],
        ["c", "circle", { cx: 12, cy: 12, r: 2.75 }],
        ["d", "circle", { cx: 6.75, cy: 9.75, r: 1 }],
        ["d", "circle", { cx: 17.25, cy: 14.25, r: 1 }],
      ],
    },
    coins: {
      // the stack springs: each coin rises in proportion to its height, so they never collide
      els: [
        ["s", "path", { d: rr(4, 15.5, 14, 5, 2.5) }],
        ["k", "path", { d: rr(6, 10.5, 14, 5, 2.5), anim: "bounce", y: -1.75, origin: "13 15.5" }],
        ["k", "path", { d: rr(4.5, 5.5, 14, 5, 2.5), anim: "bounce", y: -3.5, origin: "11.5 10.5" }],
      ],
    },
    "currency-exchange": {
      // point-symmetric, so the two coins trade places on a half turn
      anim: "turn",
      deg: 180,
      origin: "12 12",
      els: [
        ["s", "circle", { cx: 7.75, cy: 7.75, r: 4 }],
        ["s", "circle", { cx: 16.25, cy: 16.25, r: 4 }],
        ["l", "path", { d: arcArrow(-80, -10, 8.75, 4) }],
        ["l", "path", { d: arcArrow(100, 170, 8.75, 4) }],
      ],
    },
    "wallet-cards": {
      els: [
        ["s", "path", { d: rr(9, 3, 10.5, 8, 2), anim: "nudge", y: -2 }],
        ["k", "path", { d: rr(5, 5.5, 10.5, 8, 2), anim: "nudge", y: -2, delay: 0.09 }],
        ["k", "path", { d: rr(3, 9.5, 17.5, 11, 3.5) }],
        ["k", "path", { d: rr(14, 12.5, 7, 5.5, 2) }],
        ["d", "circle", { cx: 17.25, cy: 15.25, r: 1.1 }],
      ],
    },
  });
})();
