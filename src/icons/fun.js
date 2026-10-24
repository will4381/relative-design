// Fun: nature, weather, play, creative.
(function () {
  // Closed polygon with every corner filleted by an arc: pts = [[x, y, radius], ...].
  // Fillets that don't fit an edge are scaled down to share it, so tips are always soft nubs.
  const soft = (pts) => {
    const n = pts.length, f = (v) => +v.toFixed(2);
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
      const a = [p.x + p.u1[0] * t, p.y + p.u1[1] * t], b = [p.x + p.u2[0] * t, p.y + p.u2[1] * t];
      return `${i ? "L" : "M"}${f(a[0])} ${f(a[1])}A${r} ${r} 0 0 ${p.sweep} ${f(b[0])} ${f(b[1])}`;
    }).join("") + "Z";
  };
  // Outline wrapping circles [cx, cy, r] in clockwise order, joined by tangent lines.
  // r > 0 rounds a tip (tip radius = r), r < 0 is a concave scoop between tips.
  const hull = (C) => {
    const n = C.length, f = (v) => +v.toFixed(2), T = [];
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
      return `${i ? "L" : "M"}${f(a[0])} ${f(a[1])}A${Math.abs(r)} ${Math.abs(r)} 0 ${span > Math.PI ? 1 : 0} ${r > 0 ? 1 : 0} ${f(b[0])} ${f(b[1])}`;
    }).join("") + "Z";
  };
  // Soft 4-point sparkle: each tip is a half-circle nub (radius p) flowing into concave curved sides.
  const star = (x, y, R) => {
    const p = R * 0.2, f = (v) => +v.toFixed(2);
    const rot = ([u, v], i) => [[u, v], [-v, u], [-u, -v], [v, -u]][i]; // quarter turns, clockwise
    const pt = (q, i) => { const [u, v] = rot(q, i); return `${f(x + u)} ${f(y + v)}`; };
    let d = `M${pt([p, p - R], 0)}`;
    for (let i = 0; i < 4; i++)
      d += `Q${pt([p, -p], i)} ${pt([R - p, -p], i)}A${f(p)} ${f(p)} 0 0 1 ${pt([p, p - R], (i + 1) % 4)}`;
    return d + "Z";
  };
  const R45 = "rotate(45 12 12)";

  Icons.define("fun", {
    sun: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 4 }],
        ["l", "path", {
          d: "M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1",
          anim: "turn", deg: 45, origin: "12 12",
        }],
      ],
    },
    moon: {
      els: [
        ["s", "path", { d: "M6.68 4.74A9 9 0 1 0 19.26 17.32A1.25 1.25 0 0 0 18.01 15.36A8 8 0 0 1 8.64 5.99A1.25 1.25 0 0 0 6.68 4.74Z", anim: "tilt", deg: -15, origin: "12 12" }],
        ["s", "path", { d: star(16.5, 7.5, 2.5), anim: "twinkle", delay: 0.12 }],
      ],
    },
    "cloud-rain": {
      els: [
        ["s", "path", { d: "M7 13.5a4 4 0 0 1 1-7.9 5 5 0 0 1 9 .9 3.5 3.5 0 0 1 0 7Z" }],
        ["l", "path", { d: "M8 17l-1 3", anim: "enter", x: 0.5, y: -1.5 }],
        ["l", "path", { d: "M12.5 17l-1 3", anim: "enter", x: 0.5, y: -1.5, delay: 0.1 }],
        ["l", "path", { d: "M17 17l-1 3", anim: "enter", x: 0.5, y: -1.5, delay: 0.2 }],
      ],
    },
    snowflake: {
      anim: "turn",
      deg: 60,
      origin: "12 12",
      els: [0, 60, 120].map((a) => ["l", "path", {
        d: "M12 3v18M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5",
        transform: `rotate(${a} 12 12)`,
      }]),
    },
    zap: {
      // jolt. Tip vertices sit past the grid so the rounded tips land at y 3 and 21.
      anim: "shake",
      x: 1.25,
      els: [["s", "path", { d: soft([[16.5, 0, 1.25], [4, 14, 1.25], [9.5, 14, 0.75], [7.5, 24, 1.25], [20, 10, 1.25], [14.5, 10, 0.75]]) }]],
    },
    flame: {
      anim: "squash",
      origin: "12 21",
      els: [
        ["s", "path", { d: "M12 21a7 7 0 0 1-7-7c0-2.4 1.1-4.3 2.4-5.9a1.2 1.2 0 0 1 1.95.2l.85 1.6c.3-1.7.9-3.2 1.85-4.65a1.6 1.6 0 0 1 2.5-.3C17.2 7.6 19 10.6 19 14a7 7 0 0 1-7 7Z" }],
        ["c", "path", {
          d: "M12 18a2.5 2.5 0 0 1-2.5-2.5c0-1.3 1-2.4 1.9-3.4a.8.8 0 0 1 1.2 0c.9 1 1.9 2.1 1.9 3.4A2.5 2.5 0 0 1 12 18Z",
          anim: "squash", origin: "12 18", delay: 0.1,
        }],
      ],
    },
    droplet: {
      anim: "bounce",
      origin: "12 21",
      els: [
        ["s", "path", { d: hull([[12, 4.5, 1.5], [12, 14.25, 6.75]]) }],
        ["c", "path", { d: "M9 14.5a3 3 0 0 0 3 3" }],
      ],
    },
    leaf: {
      anim: "swing",
      deg: 14,
      origin: "4 20",
      els: [
        ["s", "path", { d: "M6.25 15.75C6.5 9.5 11 5 18 4.1a1.75 1.75 0 0 1 1.9 1.9C19.4 13 15 17.5 8 17.75a1.75 1.75 0 0 1-1.75-2Z" }],
        ["l", "path", { d: "M4 20l3-3" }],
        ["c", "path", { d: "M10 14l4-4" }],
      ],
    },
    tree: {
      els: [
        ["s", "path", { d: soft([[12, 2.25, 2], [5.75, 10.75, 1.5], [9.25, 10.75, 0.75], [4.5, 17.25, 1.5], [19.5, 17.25, 1.5], [14.75, 10.75, 0.75], [18.25, 10.75, 1.5]]), anim: "swing", deg: 10, origin: "12 17" }],
        ["l", "path", { d: "M12 17v4" }],
      ],
    },
    flower: {
      els: [
        ["s", "path", { d: soft([[5.75, 3.25, 1.25], [9.25, 7.5, 0.5], [12, 2.75, 1.5], [14.75, 7.5, 0.5], [18.25, 3.25, 1.25], [17.75, 15.5, 5.75], [6.25, 15.5, 5.75]]), anim: "wiggle", deg: 12, origin: "12 15.5" }],
        ["l", "path", { d: "M12 15.5V21" }],
        ["s", "path", { d: soft([[12, 20.25, 1.5], [12.75, 15.75, 2], [17.25, 15, 1.5], [16.5, 19.5, 2]]), anim: "tilt", deg: 15, origin: "12 20", delay: 0.1 }],
      ],
    },
    umbrella: {
      els: [
        ["s", "path", {
          d: "M3 12a9 9 0 0 1 18 0 1.5 1.5 0 0 1-1.5 1.5 4 4 0 0 0-5 0 4 4 0 0 0-5 0 4 4 0 0 0-5 0A1.5 1.5 0 0 1 3 12Z",
          anim: "squash", origin: "12 12",
        }],
        ["l", "path", { d: "M12 12.75v5.75a2.5 2.5 0 0 1-5 0" }],
      ],
    },
    wind: {
      els: [
        ["l", "path", { d: "M3 8.5h10.5a2.5 2.5 0 1 0-2.5-2.5", anim: "nudge", x: 2.5 }],
        ["l", "path", { d: "M3 13h15a2.5 2.5 0 1 1-2.5 2.5", anim: "nudge", x: 2.5, delay: 0.08 }],
        ["l", "path", { d: "M3 17.5h6", anim: "nudge", x: 2.5, delay: 0.16 }],
      ],
    },
    thermometer: {
      els: [
        ["s", "path", { d: "M9.5 13.75V5.5a2.5 2.5 0 0 1 5 0v8.25a4 4 0 1 1-5 0Z" }],
        ["c", "path", { d: "M12 16.75V9", anim: "draw" }],
        ["d", "circle", { cx: 12, cy: 16.75, r: 1.75, anim: "pop", s: 1.3 }],
      ],
    },
    sparkle: {
      els: [
        ["s", "path", { d: star(10.5, 13.5, 7.5), anim: "twinkle" }],
        ["s", "path", { d: star(18, 6, 3), anim: "twinkle", delay: 0.12 }],
      ],
    },
    rocket: {
      anim: "nudge",
      x: 2.5,
      y: -2.5,
      els: [
        ["s", "path", { d: soft([[12, 2, 2.25], [16.5, 7.5, 5], [16.5, 12.5, 0.75], [19, 15, 1.25], [19, 17.75, 1.25], [5, 17.75, 1.25], [5, 15, 1.25], [7.5, 12.5, 0.75], [7.5, 7.5, 5]]), transform: R45 }],
        ["c", "circle", { cx: 12, cy: 10, r: 1.5, transform: R45 }],
        ["l", "path", { d: "M12 20.5v1.25", transform: R45, anim: "pulse" }],
      ],
    },
    trophy: {
      anim: "pop",
      s: 1.15,
      origin: "12 21",
      els: [
        ["s", "path", { d: "M8 4h8a1.5 1.5 0 0 1 1.5 1.5v3a5.5 5.5 0 0 1-11 0v-3A1.5 1.5 0 0 1 8 4Z" }],
        ["l", "path", { d: "M6.5 6H5.25a2 2 0 0 0-2 2c0 2 1.5 3.25 3.75 3.25M17.5 6h1.25a2 2 0 0 1 2 2c0 2-1.5 3.25-3.75 3.25M12 14v3.5" }],
        ["s", "path", { d: "M10 17.5h4a2.5 2.5 0 0 1 2.5 2.5 1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1 2.5 2.5 0 0 1 2.5-2.5Z" }],
      ],
    },
    medal: {
      anim: "swing",
      deg: 16,
      origin: "12 3.5",
      els: [
        ["s", "path", { d: soft([[6.5, 3.5, 1.25], [10, 3.5, 1.25], [12.5, 10, 1], [9, 10, 1]]) + soft([[14, 3.5, 1.25], [17.5, 3.5, 1.25], [15, 10, 1], [11.5, 10, 1]]) }],
        ["k", "circle", { cx: 12, cy: 15.5, r: 5 }],
        ["d", "path", { d: star(12, 15.5, 3), anim: "twinkle", delay: 0.15 }],
      ],
    },
    crown: {
      // one soft silhouette: three rounded peaks, gem cut in the middle, base bar below
      anim: "bounce",
      y: -1.5,
      origin: "12 20.5",
      els: [
        ["s", "path", { d: "M7.25 17.5Q5.25 17.5 4.88 15.53L3.92 10.46Q3.5 8.25 5.21 9.71L7.17 11.37Q8.5 12.5 9.28 10.93L10.99 7.51Q12 5.5 13.01 7.51L14.72 10.93Q15.5 12.5 16.83 11.37L18.79 9.71Q20.5 8.25 20.08 10.46L19.12 15.53Q18.75 17.5 16.75 17.5Z" }],
        ["d", "circle", { cx: 12, cy: 13.75, r: 1.25, anim: "twinkle", delay: 0.18 }],
        ["l", "path", { d: "M5.5 20.75h13" }],
      ],
    },
    target: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "circle", { cx: 12, cy: 12, r: 5, anim: "pop", s: 1.15, delay: 0.08 }],
        ["d", "circle", { cx: 12, cy: 12, r: 1.5, anim: "pop", s: 1.5 }],
      ],
    },
    lightbulb: {
      els: [
        ["s", "path", { d: "M10 17.5a1 1 0 0 1-1-1c0-1.3-.6-2.3-1.6-3.5A6 6 0 1 1 16.6 13c-1 1.2-1.6 2.2-1.6 3.5a1 1 0 0 1-1 1Z", anim: "pop", s: 1.1, origin: "12 17.5" }],
        ["l", "path", { d: "M9.5 20.5h5" }],
        ["c", "path", { d: "M9 9a3 3 0 0 1 3-3", anim: "draw", delay: 0.1 }],
      ],
    },
    puzzle: {
      // piece lifts a corner and settles into place
      anim: "tilt",
      deg: -12,
      origin: "3 21",
      els: [
        // body 3–16.25 × 7.75–21 (r 2.5); identical tabs r 2 with 2.5-wide necks and 0.75 fillets
        ["s", "path", { d: "M5.5 7.75H7.61A.75 .75 0 0 0 8.16 6.49A2 2 0 1 1 11.09 6.49A.75 .75 0 0 0 11.64 7.75H13.75A2.5 2.5 0 0 1 16.25 10.25V12.36A.75 .75 0 0 0 17.51 12.91A2 2 0 1 1 17.51 15.84A.75 .75 0 0 0 16.25 16.39V18.5A2.5 2.5 0 0 1 13.75 21H5.5A2.5 2.5 0 0 1 3 18.5V10.25A2.5 2.5 0 0 1 5.5 7.75Z" }],
      ],
    },
    gamepad: {
      els: [
        ["s", "path", { d: "M8.5 6.5h7a5.5 5.5 0 0 1 0 11h-7a5.5 5.5 0 0 1 0-11Z" }],
        ["c", "path", { d: "M7.5 10.5v3M6 12h3", anim: "nudge", x: -0.75 }],
        ["d", "circle", { cx: 14.75, cy: 13, r: 1.1, anim: "pop", s: 0.6, delay: 0.1 }],
        ["d", "circle", { cx: 17, cy: 10.75, r: 1.1, anim: "pop", s: 0.6, delay: 0.2 }],
      ],
    },
    dice: {
      anim: "bounce",
      y: -2.5,
      origin: "12 20.5",
      els: [
        ["s", "path", { d: "M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z", anim: "wiggle", deg: 12, origin: "12 12" }],
        ["d", "circle", { cx: 8, cy: 8, r: 1.5, anim: "wiggle", deg: 12, origin: "12 12" }],
        ["d", "circle", { cx: 12, cy: 12, r: 1.5, anim: "wiggle", deg: 12, origin: "12 12" }],
        ["d", "circle", { cx: 16, cy: 16, r: 1.5, anim: "wiggle", deg: 12, origin: "12 12" }],
      ],
    },
    palette: {
      els: [
        ["s", "path", { d: "M12 3a9 9 0 0 0 0 18c1.4 0 2-.9 2-2 0-.6-.3-1-.6-1.4-.3-.4-.4-.8-.4-1.3 0-1.2 1-2.3 2.3-2.3h2.2a3.5 3.5 0 0 0 3.5-3.5C21 6.6 17 3 12 3Z" }],
        ["d", "circle", { cx: 7.5, cy: 12, r: 1.25, anim: "bounce", y: -1 }],
        ["d", "circle", { cx: 9, cy: 8, r: 1.25, anim: "bounce", y: -1, delay: 0.07 }],
        ["d", "circle", { cx: 13, cy: 7, r: 1.25, anim: "bounce", y: -1, delay: 0.14 }],
        ["d", "circle", { cx: 16.5, cy: 9, r: 1.25, anim: "bounce", y: -1, delay: 0.21 }],
      ],
    },
    brush: {
      // held at the handle end, the bristles sweep a stroke
      anim: "wiggle",
      deg: 12,
      origin: "19.4 4.6",
      els: [
        ["l", "path", { d: "M12 1.5V9.5", transform: R45 }],
        ["s", "path", { d: hull([[12, 15, 3], [12, 21.25, 1.25]]), transform: R45 }],
      ],
    },
    "magic-wand": {
      els: [
        ["l", "path", { d: "M3.5 20.5 13.5 10.5", anim: "tilt", deg: -12, origin: "3.5 20.5" }],
        ["s", "path", { d: star(17.5, 6.5, 3), anim: "twinkle", delay: 0.12 }],
        ["l", "path", { d: "M8 4v3M6.5 5.5h3", anim: "twinkle", delay: 0.22 }],
      ],
    },
    coffee: {
      els: [
        ["s", "path", { d: "M6 8.5h8a1.5 1.5 0 0 1 1.5 1.5v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-5A1.5 1.5 0 0 1 6 8.5Z" }],
        ["l", "path", { d: "M15.5 10.5H17a2.5 2.5 0 0 1 0 5h-1.5" }],
        ["l", "path", { d: "M7.75 3c-.8 1 .8 2 0 3", anim: "enter", y: 1.25 }],
        ["l", "path", { d: "M12.25 3c-.8 1 .8 2 0 3", anim: "enter", y: 1.25, delay: 0.12 }],
      ],
    },
    smile: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["d", "circle", { cx: 9, cy: 10, r: 1.25, anim: "blink" }],
        ["d", "circle", { cx: 15, cy: 10, r: 1.25, anim: "blink" }],
        ["c", "path", { d: "M8.5 14.5a4.5 4.5 0 0 0 7 0", anim: "squash", delay: 0.1 }],
      ],
    },
    ghost: {
      anim: "float",
      y: -2.5,
      els: [
        ["s", "path", { d: "M5 11a7 7 0 0 1 14 0v7.5a2.33 2.33 0 0 1-4.67 0 2.33 2.33 0 0 1-4.66 0A2.33 2.33 0 0 1 5 18.5Z" }],
        ["d", "circle", { cx: 9.5, cy: 11, r: 1.25, anim: "blink", delay: 0.2 }],
        ["d", "circle", { cx: 14.5, cy: 11, r: 1.25, anim: "blink", delay: 0.2 }],
      ],
    },
    paw: {
      els: [
        ["s", "path", {
          d: "M12 12.5c-2.5 0-5.5 3-5.5 5.5 0 1.5 1 2.5 2.5 2.5 1 0 2-.5 3-.5s2 .5 3 .5c1.5 0 2.5-1 2.5-2.5 0-2.5-3-5.5-5.5-5.5Z",
          anim: "squash", origin: "12 20.5", delay: 0.2,
        }],
        ["s", "circle", { cx: 4.75, cy: 11, r: 1.75, anim: "bounce", y: -1.5 }],
        ["s", "circle", { cx: 9, cy: 6, r: 1.75, anim: "bounce", y: -1.5, delay: 0.06 }],
        ["s", "circle", { cx: 15, cy: 6, r: 1.75, anim: "bounce", y: -1.5, delay: 0.12 }],
        ["s", "circle", { cx: 19.25, cy: 11, r: 1.75, anim: "bounce", y: -1.5, delay: 0.18 }],
      ],
    },
  });
})();
