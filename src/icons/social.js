// Social: networks & platforms as simplified, soft re-drawings of each well-known motif.
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
  const pt = (cx, cy, r, deg) => [f(cx + r * Math.cos(rad(deg))), f(cy + r * Math.sin(rad(deg)))];
  // Smooth curve through points (Catmull-Rom → cubic Béziers). Open curves keep their end tangents.
  const smooth = (pts, closed = false) => {
    const n = pts.length, P = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const [a, b, c, e] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
      d += `C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`;
    }
    return closed ? d + "Z" : d;
  };
  // Left half drawn top → bottom, mirrored across x = 12 back up: one symmetric closed silhouette.
  const mirrored = (half) => smooth([...half, ...half.slice(1, -1).reverse().map(([x, y]) => [24 - x, y])], true);
  const twin = (half) => {
    const right = half.map(([x, y]) => [24 - x, y]).reverse();
    return smooth(half) + smooth(right).replace(/^M[^C]+/, "L" + right[0].join(" ")) + "Z";
  };

  const BADGE = rr(3.5, 3.5, 17, 17, 4);
  const hop = (d, ox, base, delay = 0, y = -1.75) => ["c", "path", { d, anim: "bounce", y, origin: `${ox} ${base}`, delay }];

  // whatsapp: round bubble whose tail is a soft nub at the lower left
  const WA = (() => {
    const c = [12.5, 11.5], R = 8.5, a = pt(...c, R, 112), b = pt(...c, R, 158);
    return `M${a.join(" ")}A${R} ${R} 0 1 0 ${b.join(" ")}` + soft([b, [3.75, 20.25, 1.75], a], false).replace(/^M[^L]+/, "") + "Z";
  })();

  Icons.define("social", {
    facebook: {
      els: [
        ["s", "path", { d: BADGE }],
        hop("M12.5 17.25V10.25A3.25 3.25 0 0 1 15.75 7H16.25M9.75 11.25h5.5", 12.5, 17.25),
      ],
    },
    instagram: {
      els: [
        ["s", "path", { d: rr(3.5, 3.5, 17, 17, 5) }],
        ["c", "circle", { cx: 12, cy: 12, r: 3.75, anim: "pop", s: 1.18 }],
        ["d", "circle", { cx: 16.5, cy: 7.5, r: 1.15, anim: "pulse", delay: 0.12 }],
      ],
    },
    "x-twitter": {
      els: [
        ["l", "path", { d: "M19.25 4.25 4.75 19.75", anim: "draw" }],
        ["k", "path", { d: soft([[4.25, 4, 2], [8.75, 4, 1], [19.75, 20, 2], [15.25, 20, 1]]) }],
      ],
    },
    threads: {
      els: [
        ["l", "circle", { cx: 12, cy: 12.25, r: 3 }],
        ["l", "path", { d: "M15 9.25V13.25A2.25 2.25 0 0 0 19.5 13.25V12A7.5 7.5 0 1 0 16.25 18.25", anim: "draw" }],
      ],
    },
    tiktok: {
      // a little dance from its foot
      anim: "wiggle",
      deg: 10,
      origin: "11 20.25",
      els: [
        ["s", "circle", { cx: 9.5, cy: 16.75, r: 3.25 }],
        ["l", "path", { d: "M12.75 16.75V3.75c0 2.75 2.25 5 5 5" }],
      ],
    },
    youtube: {
      els: [
        ["s", "path", { d: rr(3, 5.25, 18, 13.5, 4.5) }],
        ["d", "path", { d: soft([[9.75, 8.5, 1.25], [16, 12, 1.5], [9.75, 15.5, 1.25]]), anim: "nudge", x: 2 }],
      ],
    },
    linkedin: {
      els: [
        ["s", "path", { d: BADGE }],
        ["d", "circle", { cx: 7.75, cy: 7.5, r: 1.25, anim: "bounce", y: -2.5, origin: "7.75 8.75" }],
        ["c", "path", { d: "M7.75 11V16.75", anim: "squash", origin: "7.75 16.75", delay: 0.22 }],
        ["c", "path", { d: "M11.75 16.75V11M11.75 13.5a2.5 2.5 0 0 1 5 0V16.75" }],
      ],
    },
    snapchat: {
      anim: "float",
      y: -1.75,
      els: [
        ["s", "path", { d: mirrored([[12, 3.75], [8.5, 5.25], [7.25, 8.75], [7.25, 11.25], [5.25, 12.5], [6.5, 14.25], [5.75, 16.25], [4, 17.25], [6, 18.25], [8.5, 18.5], [12, 19.5]]) }],
      ],
    },
    reddit: {
      els: [
        ["l", "path", { d: "M12 9.25 13 4.5H15.5", anim: "swing", deg: -14, origin: "12 9.25" }],
        ["s", "circle", { cx: 17, cy: 4.5, r: 1.5, anim: "swing", deg: -14, origin: "12 9.25" }],
        ["s", "circle", { cx: 4.75, cy: 10.75, r: 1.5 }],
        ["s", "circle", { cx: 19.25, cy: 10.75, r: 1.5 }],
        ["k", "ellipse", { cx: 12, cy: 14.75, rx: 7.75, ry: 5.5 }],
        ["d", "circle", { cx: 9.25, cy: 14, r: 1.25 }],
        ["d", "circle", { cx: 14.75, cy: 14, r: 1.25 }],
        ["c", "path", { d: "M9.5 17.25q2.5 1.5 5 0" }],
      ],
    },
    pinterest: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: `M${pt(12.75, 10.75, 3.75, 165).join(" ")}A3.75 3.75 0 1 1 ${pt(12.75, 10.75, 3.75, 115).join(" ")}M11.75 9 9.75 18.75`, anim: "pop", s: 0.86, origin: "12 12" }],
      ],
    },
    whatsapp: {
      els: [
        ["s", "path", { d: WA }],
        ["c", "path", { d: "M10.5 7.75 9 8.5C8.75 11.75 12.25 15.25 15.5 15l.75-1.5", anim: "wiggle", deg: 12, origin: "12.5 11.5" }],
      ],
    },
    telegram: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: soft([[6.25, 12.25, 1.75], [15.75, 8.25, 1.75], [13.25, 16.75, 1.5], [10.25, 14, 0.5]]) + "M10.25 14 13.25 11", anim: "nudge", x: 1.25, y: -1.25 }],
      ],
    },
    discord: {
      els: [
        ["s", "path", { d: mirrored([[12, 6.5], [7.25, 5.25], [4.5, 7.5], [3, 12.5], [3.25, 16.25], [6, 18.5], [8, 17.25], [12, 17.75]]) }],
        ["d", "ellipse", { cx: 9, cy: 12.5, rx: 1.5, ry: 1.75, anim: "blink", delay: 0.1 }],
        ["d", "ellipse", { cx: 15, cy: 12.5, rx: 1.5, ry: 1.75, anim: "blink", delay: 0.1 }],
      ],
    },
    twitch: {
      els: [
        ["s", "path", { d: soft([[4, 7, 1.5], [7.5, 3.5, 1.5], [20, 3.5, 2], [20, 13.5, 1.25], [16, 17.5, 1.25], [12.5, 17.5, 0.75], [9, 20.75, 1.75], [9, 17.5, 0.75], [4, 17.5, 1.5]]) }],
        ["c", "path", { d: "M11.25 8v4.5", anim: "pulse" }],
        ["c", "path", { d: "M15.75 8v4.5", anim: "pulse", delay: 0.14 }],
      ],
    },
    spotify: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M8 16.5Q12 14.75 15.75 17", anim: "pulse" }],
        ["c", "path", { d: "M7.25 13Q12 10.75 16.75 13.5", anim: "pulse", delay: 0.1 }],
        ["c", "path", { d: "M6.5 9.25Q12 6.75 17.5 9.75", anim: "pulse", delay: 0.2 }],
      ],
    },
    netflix: {
      els: [
        ["l", "path", { d: "M6.75 3.75V20.25", anim: "enter", y: 3 }],
        ["l", "path", { d: "M17.25 3.75V20.25", anim: "enter", y: -3, delay: 0.1 }],
        ["k", "path", { d: soft([[4.5, 3.75, 2], [9, 3.75, 1], [19.5, 20.25, 2], [15, 20.25, 1]]) }],
      ],
    },
    bluesky: {
      anim: "float",
      y: -1.5,
      els: [
        ["s", "path", { d: twin([[12, 10.5], [8.5, 6], [4.5, 3.75], [3, 5.5], [3.5, 9.5], [6, 12.25], [5, 15.25], [6.75, 18], [9.5, 17.25], [12, 13.5]]), anim: "squash", origin: "12 12" }],
      ],
    },
    mastodon: {
      els: [
        ["s", "path", { d: "M10 16.5H15.5A4.5 4.5 0 0 0 20 12V8A4.5 4.5 0 0 0 15.5 3.5H8.5A4.5 4.5 0 0 0 4 8V15C4 19 7.25 20.75 12.75 20" }],
        ["c", "path", { d: "M7.75 13V10.5a2.125 2.125 0 0 1 4.25 0V12.5M12 10.5a2.125 2.125 0 0 1 4.25 0V13", anim: "squash", origin: "12 13" }],
      ],
    },
    medium: {
      els: [
        ["s", "circle", { cx: 6.75, cy: 12, r: 3.75, anim: "bounce", y: -2, origin: "6.75 15.75" }],
        ["s", "ellipse", { cx: 15.5, cy: 12, rx: 1.75, ry: 3.5, anim: "bounce", y: -2, origin: "15.5 15.5", delay: 0.08 }],
        ["l", "path", { d: "M20.5 8.75V15.25", anim: "bounce", y: -2, origin: "20.5 15.25", delay: 0.16 }],
      ],
    },
    dribbble: {
      anim: "bounce",
      y: -3,
      origin: "12 21",
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M3.75 10.25C8.5 11 14 9 17.25 5M8.25 3.75C12 8 15.5 14 15.5 20.25M5.25 17.25C9 13.5 15 12.25 20.75 13.25" }],
      ],
    },
  });
})();
