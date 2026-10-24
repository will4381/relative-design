// Media & devices. All paths drawn from grid geometry.
(function () {
  const f = (v) => +v.toFixed(2);
  // Radii are centerline radii; the stroke adds half its width to the visible tip.
  // Polyline/polygon whose corners are true arcs of radius r (shrunk only if an edge is too short).
  const soft = (pts, r, closed = true) => {
    const n = pts.length;
    let d = closed ? "" : `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) {
      const [vx, vy] = pts[i], [px, py] = pts[(i + n - 1) % n], [nx, ny] = pts[(i + 1) % n];
      const l1 = Math.hypot(px - vx, py - vy), l2 = Math.hypot(nx - vx, ny - vy);
      const u1 = [(px - vx) / l1, (py - vy) / l1], u2 = [(nx - vx) / l2, (ny - vy) / l2];
      const half = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))) / 2;
      const t = Math.min(r / Math.tan(half), l1 / 2, l2 / 2), rho = t * Math.tan(half);
      const sweep = -u1[0] * u2[1] + u1[1] * u2[0] > 0 ? 1 : 0;
      d += `${d ? "L" : "M"}${f(vx + u1[0] * t)} ${f(vy + u1[1] * t)}A${f(rho)} ${f(rho)} 0 0 ${sweep} ${f(vx + u2[0] * t)} ${f(vy + u2[1] * t)}`;
    }
    return closed ? d + "Z" : d + `L${pts[n - 1][0]} ${pts[n - 1][1]}`;
  };
  const rpoly = (pts, r) => soft(pts, r);
  // Rounded rect as a path (x/y attrs are reserved for motion params).
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  const flipX = (pts) => pts.map(([x, y]) => [24 - x, y]);
  // Arc of radius r around (cx, cy), symmetric about the vertical, spanning ±deg from the top.
  const topArc = (cx, cy, r, deg) => {
    const s = Math.sin((deg * Math.PI) / 180) * r, c = Math.cos((deg * Math.PI) / 180) * r;
    return `M${f(cx - s)} ${f(cy - c)}a${r} ${r} 0 0 1 ${f(2 * s)} 0`;
  };

  const PLAY = [[7.5, 4.5], [7.5, 19.5], [20, 12]];
  const SKIP = [[4.5, 5], [4.5, 19], [15, 12]];
  const FF1 = [[3, 5.5], [3, 18.5], [12, 12]];
  const FF2 = [[11.5, 5.5], [11.5, 18.5], [21, 12]];
  const SPK = rpoly([[3.5, 8.5], [7, 8.5], [11.5, 4.5], [11.5, 19.5], [7, 15.5], [3.5, 15.5]], 1.25);
  const WAVE1 = "M15.25 9a4.25 4.25 0 0 1 0 6";
  const WAVE2 = "M18.25 5.5a9 9 0 0 1 0 13";
  const BATT = { d: rr(3, 6.5, 15.5, 11, 3) };

  const head = (cx, cy, m) => ["s", "ellipse", { cx, cy, rx: 2.75, ry: 2.25, transform: `rotate(-20 ${cx} ${cy})`, ...m }];
  const CLAP = { transform: "rotate(-5 3.5 7.25)", anim: "tilt", origin: "3.5 7.25", deg: 5 };
  const KEYS = [[8, 9, 0], [12, 9, 0.18], [16, 9, 0.06], [8, 12, 0.24], [12, 12, 0.12], [16, 12, 0.3]];

  Icons.define("media", {
    play: { anim: "nudge", x: 2.5, els: [["s", "path", { d: rpoly(PLAY, 1.75) }]] },
    pause: {
      els: [
        ["s", "path", { d: rr(6, 4.5, 4, 15, 1.5), anim: "squash", origin: "8 19.5" }],
        ["s", "path", { d: rr(14, 4.5, 4, 15, 1.5), anim: "squash", origin: "16 19.5", delay: 0.1 }],
      ],
    },
    stop: { anim: "pop", s: 1.14, els: [["s", "path", { d: rr(4.5, 4.5, 15, 15, 4) }]] },
    "skip-forward": {
      els: [
        ["s", "path", { d: rpoly(SKIP, 1.5), anim: "nudge", x: 2.5 }],
        ["l", "path", { d: "M19.5 5v14", anim: "nudge", x: 1.5, delay: 0.12 }],
      ],
    },
    "skip-back": {
      els: [
        ["s", "path", { d: rpoly(flipX(SKIP), 1.5), anim: "nudge", x: -2.5 }],
        ["l", "path", { d: "M4.5 5v14", anim: "nudge", x: -1.5, delay: 0.12 }],
      ],
    },
    "fast-forward": {
      anim: "nudge",
      x: 2.5,
      els: [
        ["s", "path", { d: rpoly(FF1, 1.25) }],
        ["k", "path", { d: rpoly(FF2, 1.25) }],
      ],
    },
    rewind: {
      anim: "nudge",
      x: -2.5,
      els: [
        ["s", "path", { d: rpoly(flipX(FF1), 1.25) }],
        ["k", "path", { d: rpoly(flipX(FF2), 1.25) }],
      ],
    },
    "volume-high": {
      els: [
        ["s", "path", { d: SPK, anim: "squash", origin: "11.5 12" }],
        ["l", "path", { d: WAVE1, anim: "pulse", delay: 0.1 }],
        ["l", "path", { d: WAVE2, anim: "pulse", delay: 0.22 }],
      ],
    },
    "volume-low": {
      els: [["s", "path", { d: SPK, anim: "squash", origin: "11.5 12" }], ["l", "path", { d: WAVE1, anim: "pulse", delay: 0.1 }]],
    },
    "volume-off": {
      els: [["s", "path", { d: SPK }], ["l", "path", { d: "M15.5 9.5l5 5m0-5l-5 5", anim: "grow" }]],
    },
    "music-note": {
      // beamed eighth notes; each note (head + stem) hops in turn
      els: [
        ["s", "path", { d: rpoly([[8.9, 6.5], [18.9, 3.5], [18.9, 5.5], [8.9, 8.5]], 1), anim: "bounce", y: -2, origin: "12 19.75", delay: 0.07 }],
        ["l", "path", { d: "M8.9 17V7.5", anim: "bounce", y: -2, origin: "6.5 19.75" }],
        head(6.5, 17.5, { anim: "bounce", y: -2, origin: "6.5 19.75" }),
        ["l", "path", { d: "M18.9 15V4.5", anim: "bounce", y: -2, origin: "16.5 17.75", delay: 0.14 }],
        head(16.5, 15.5, { anim: "bounce", y: -2, origin: "16.5 17.75", delay: 0.14 }),
      ],
    },
    headphones: {
      els: [
        ["l", "path", { d: "M4.5 13.5V11a7.5 7.5 0 0 1 15 0v2.5" }],
        ["s", "path", { d: rr(3, 12.5, 5, 8, 2.5), anim: "bounce", y: -1.5, origin: "5.5 20.5" }],
        ["s", "path", { d: rr(16, 12.5, 5, 8, 2.5), anim: "bounce", y: -1.5, origin: "18.5 20.5", delay: 0.12 }],
      ],
    },
    camera: {
      els: [
        ["s", "path", { d: "M7 7h1.5l1.1-1.65A2 2 0 0 1 11.27 4.5h1.46a2 2 0 0 1 1.66.85L15.5 7H17a4 4 0 0 1 4 4v5.5a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4Z", anim: "squash", origin: "12 20.5" }],
        ["c", "circle", { cx: 12, cy: 13.5, r: 3.25, anim: "pop", s: 1.15, delay: 0.08 }],
      ],
    },
    image: {
      els: [
        ["s", "path", { d: rr(3.5, 3.5, 17, 17, 4) }],
        ["c", "path", { d: soft([[7, 16.5], [10.5, 12.5], [13.25, 15.5], [14.75, 14], [17, 16.5]], 0.75, false) }],
        ["d", "circle", { cx: 15.25, cy: 8.75, r: 1.75, anim: "enter", y: 2 }],
      ],
    },
    film: {
      // clapperboard: the bar claps shut on its left hinge, the slate jolts
      els: [
        ["s", "path", { d: rr(3.5, 10.75, 17, 9.75, 3), anim: "squash", origin: "12 10.75", delay: 0.22 }],
        ["k", "path", { d: rr(3.5, 4.25, 17, 3, 1.25), ...CLAP }],
        ["c", "path", { d: "M8.5 7.25l1.75-3M13.5 7.25l1.75-3", ...CLAP }],
      ],
    },
    monitor: {
      els: [
        ["s", "path", { d: rr(3, 3.5, 18, 13, 3) }],
        ["c", "path", { d: "M6.75 9.5l2.75-2.75", anim: "draw" }],
        ["l", "path", { d: "M12 16.5v4M8 20.5h8" }],
      ],
    },
    laptop: {
      els: [
        ["s", "path", { d: rr(4.5, 4, 15, 11.5, 3), anim: "blink", origin: "12 15.5" }],
        ["l", "path", { d: "M3 19.5h18" }],
      ],
    },
    smartphone: {
      anim: "shake",
      x: 1.5,
      els: [
        ["s", "path", { d: rr(6, 3, 12, 18, 3.5) }],
        ["c", "path", { d: "M10.75 17.5h2.5" }],
      ],
    },
    tablet: {
      anim: "tilt",
      deg: -16,
      els: [
        ["s", "path", { d: rr(4, 3, 16, 18, 3.5) }],
        ["c", "path", { d: "M10.5 17.5h3" }],
      ],
    },
    watch: {
      els: [
        ["s", "path", { d: "M8.5 6.5l.6-2.35A1.5 1.5 0 0 1 10.55 3h2.9a1.5 1.5 0 0 1 1.45 1.15l.6 2.35" }],
        ["s", "path", { d: "M8.5 17.5l.6 2.35A1.5 1.5 0 0 0 10.55 21h2.9a1.5 1.5 0 0 0 1.45-1.15l.6-2.35" }],
        ["s", "path", { d: rr(6, 6, 12, 12, 3.5) }],
        ["c", "path", { d: "M12 9.25V12l1.75 1.25", anim: "turn", deg: 360, origin: "12 12" }],
      ],
    },
    keyboard: {
      els: [
        ["s", "path", { d: rr(3, 5, 18, 14, 3.5) }],
        ...KEYS.map(([cx, cy, delay]) => ["d", "circle", { cx, cy, r: 1, anim: "nudge", y: 1, delay }]),
        ["c", "path", { d: "M8.5 15.5h7", anim: "nudge", y: 1, delay: 0.38 }],
      ],
    },
    mouse: {
      els: [
        ["s", "path", { d: rr(5.5, 3, 13, 18, 6.5) }],
        ["c", "path", { d: "M12 7v3", anim: "nudge", y: 2 }],
      ],
    },
    printer: {
      els: [
        ["s", "path", { d: "M7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" }],
        ["s", "path", { d: rr(3, 8, 18, 9.5, 3) }],
        ["k", "path", { d: rr(7, 13.5, 10, 7.5, 1.5), anim: "enter", y: -4 }],
      ],
    },
    speaker: {
      els: [
        ["s", "path", { d: rr(5, 3, 14, 18, 3.5) }],
        ["d", "circle", { cx: 12, cy: 7, r: 1.25 }],
        ["c", "circle", { cx: 12, cy: 14.5, r: 3.25, anim: "heartbeat", s: 1.2 }],
      ],
    },
    cast: {
      els: [
        ["l", "path", { d: "M3.5 8a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4v8.5a4 4 0 0 1-4 4h-1" }],
        ["s", "circle", { cx: 3.5, cy: 20.5, r: 0.5, anim: "pulse" }],
        ["l", "path", { d: "M3.5 16a4.5 4.5 0 0 1 4.5 4.5", anim: "pulse", delay: 0.1 }],
        ["l", "path", { d: "M3.5 11.5a9 9 0 0 1 9 9", anim: "pulse", delay: 0.2 }],
      ],
    },
    battery: {
      els: [
        ["s", "path", BATT],
        ["l", "path", { d: "M21 10.5v3" }],
        ["d", "path", { d: rr(6, 10, 6, 4, 1), anim: "grow", origin: "6 12" }],
      ],
    },
    "battery-charging": {
      els: [
        ["s", "path", BATT],
        ["l", "path", { d: "M21 10.5v3" }],
        ["c", "path", { d: soft([[12.5, 9], [9.5, 12.25], [13, 11.75], [10, 15]], 0.75, false), anim: "pop", s: 1.1 }],
      ],
    },
    wifi: {
      els: [
        ["s", "circle", { cx: 12, cy: 18.5, r: 0.5, anim: "pulse" }],
        ["l", "path", { d: topArc(12, 18.5, 4.5, 38), anim: "pulse", delay: 0.08 }],
        ["l", "path", { d: topArc(12, 18.5, 9, 38), anim: "pulse", delay: 0.16 }],
        ["l", "path", { d: topArc(12, 18.5, 13.5, 38), anim: "pulse", delay: 0.24 }],
      ],
    },
    bluetooth: { anim: "wiggle", deg: 10, els: [["l", "path", { d: soft([[7, 7.5], [17, 16.5], [12, 21], [12, 3], [17, 7.5], [7, 16.5]], 0.75, false) }]] },
    plug: {
      anim: "nudge",
      y: -2.5,
      els: [
        ["l", "path", { d: "M9 3v4M15 3v4M12 17.5V21" }],
        ["s", "path", { d: "M5.5 8.5A1.5 1.5 0 0 1 7 7h10a1.5 1.5 0 0 1 1.5 1.5V11a6.5 6.5 0 0 1-13 0Z" }],
      ],
    },
    power: {
      els: [
        ["l", "path", { d: "M12 3v8", anim: "nudge", y: -2, delay: 0.25 }],
        ["l", "path", { d: "M6.86 6.62a8 8 0 1 0 10.28 0", anim: "draw" }],
      ],
    },
  });
})();
