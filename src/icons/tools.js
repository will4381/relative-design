// Tools: tools and everyday objects.
(function () {
  const f = (v) => +v.toFixed(2);
  // Rounded rect as a path (x/y attrs are reserved for motion params).
  const rr = (x, y, w, h, r) =>
    `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  // Closed polygon with every corner filleted by an arc: pts = [[x, y, radius], ...] (concave corners too).
  // Fillets that don't fit an edge are scaled down to share it, so tips are always soft nubs.
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
      const a = [p.x + p.u1[0] * t, p.y + p.u1[1] * t], b = [p.x + p.u2[0] * t, p.y + p.u2[1] * t];
      return `${i ? "L" : "M"}${f(a[0])} ${f(a[1])}A${r} ${r} 0 0 ${p.sweep} ${f(b[0])} ${f(b[1])}`;
    }).join("") + "Z";
  };
  // Outline wrapping circles [cx, cy, r] in clockwise order, joined by tangent lines (tapered capsules).
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
      return `${i ? "L" : "M"}${f(a[0])} ${f(a[1])}A${Math.abs(r)} ${Math.abs(r)} 0 ${span > Math.PI ? 1 : 0} ${r > 0 ? 1 : 0} ${f(b[0])} ${f(b[1])}`;
    }).join("") + "Z";
  };
  // Where an upright-drawn point lands after `rotate(deg 12 12)` then a shift: used for motion origins.
  const at = (x, y, deg, dx = 0, dy = 0) => {
    const a = (deg * Math.PI) / 180, u = x - 12, v = y - 12;
    return `${f(12 + u * Math.cos(a) - v * Math.sin(a) + dx)} ${f(12 + u * Math.sin(a) + v * Math.cos(a) + dy)}`;
  };

  // Wrench, drawn upright (jaw up) then laid on the diagonal.
  const WRENCH = soft([
    [6.5, 4.5, 2.25], [10.25, 4.5, 1], [10.25, 8.75, 1.75], [13.75, 8.75, 1.75], [13.75, 4.5, 1], [17.5, 4.5, 2.25],
    [17.5, 9.5, 3], [14, 13.5, 1], [14, 22, 2], [10, 22, 2], [10, 13.5, 1], [6.5, 9.5, 3],
  ]);
  const W_T = "rotate(45 12 12)";
  // Hammer, drawn upright (head up) then laid on the diagonal: blunt face left, tapered claw right.
  const H_T = "translate(-1 1) rotate(45 12 12)";
  // Pipette, drawn upright (bulb up) then laid on the diagonal.
  const P_T = "translate(.75 -1.25) rotate(45 12 12)";
  // Flashlight, drawn upright (lamp up) then laid on the diagonal.
  const F_T = "translate(-1.25 1.25) rotate(45 12 12)";
  // Gavel: head across the up-left end of a diagonal handle; block below for it to strike.
  const G_T = "rotate(-45 12 12)";

  Icons.define("tools", {
    wrench: {
      // cranks round the nut held in its jaw
      els: [["s", "path", { d: WRENCH, transform: W_T, anim: "tilt", deg: -24, origin: at(12, 8, 45) }]],
    },
    hammer: {
      // claw hammer: swings from the grip end and strikes down
      els: [
        ["l", "path", { d: "M12 8v13", transform: H_T, anim: "tilt", deg: 22, origin: at(12, 21, 45, -1, 1) }],
        ["s", "path", { d: soft([[6.5, 3.5, 1.25], [13.5, 3.5, 1], [17.5, 5, 1], [17.5, 7, 1], [13.5, 8, 1], [6.5, 8, 1.25]]), transform: H_T, anim: "tilt", deg: 22, origin: at(12, 21, 45, -1, 1) }],
      ],
    },
    scissors: {
      // each blade turns with the ring across from it: snip-snip around the pivot
      els: [
        ["l", "path", { d: "M7.95 15.6 17.25 3.85", anim: "wiggle", deg: 12, origin: "12 10.5" }],
        ["s", "circle", { cx: 6.25, cy: 17.75, r: 2.75, anim: "wiggle", deg: 12, origin: "12 10.5" }],
        ["l", "path", { d: "M16.05 15.6 6.75 3.85", anim: "wiggle", deg: -12, origin: "12 10.5" }],
        ["s", "circle", { cx: 17.75, cy: 17.75, r: 2.75, anim: "wiggle", deg: -12, origin: "12 10.5" }],
      ],
    },
    ruler: {
      els: [
        ["s", "path", { d: rr(8.25, 2.25, 7.5, 19.5, 2), transform: "rotate(45 12 12)" }],
        ...[[5.75, 3], [10.25, 4], [14.75, 3]].map(([y, l], i) =>
          ["c", "path", { d: `M8.25 ${y}h${l}`, transform: "rotate(45 12 12)", anim: "draw", delay: i * 0.1 }]),
      ],
    },
    pipette: {
      // dropper: the bulb squeezes and a drop falls from the tip
      els: [
        ["s", "path", { d: soft([[10.5, 9, 0.5], [13.5, 9, 0.5], [13.5, 15, 2.5], [12, 19.75, 1], [10.5, 15, 2.5]]), transform: P_T }],
        ["k", "path", { d: "M8.5 8.75h7", transform: P_T }],
        ["k", "circle", { cx: 12, cy: 4.5, r: 2.75, transform: P_T, anim: "squash", origin: at(12, 7.25, 45, 0.75, -1.25) }],
        ["s", "path", { d: hull([[8.15, 19.25, 0.6], [8.15, 20.25, 1.1]]), anim: "enter", y: -2.5, delay: 0.2 }],
      ],
    },
    "paint-bucket": {
      // tipped can pouring: it tips further round its lip, then the drop falls off the stream
      els: [
        ["s", "path", { d: rr(8, 9, 10, 10, 2.5), transform: "rotate(-30 13 14)", anim: "tilt", deg: -12, origin: "6.6 12" }],
        ["l", "path", { d: "M9 9a4 4 0 0 1 8 0", transform: "rotate(-30 13 14)", anim: "tilt", deg: -12, origin: "6.6 12" }],
        ["l", "path", { d: "M6.6 12C5.25 13 4.5 14.25 4.5 16" }],
        ["s", "path", { d: hull([[4.5, 17.5, 0.9], [4.5, 19.5, 1.5]]), anim: "enter", y: -3, delay: 0.3 }],
      ],
    },
    magnet: {
      anim: "shake",
      x: 1,
      els: [
        ["s", "path", { d: "M4 11a8 8 0 0 1 16 0v8.5a1 1 0 0 1-1 1h-2.5a1 1 0 0 1-1-1V11a3.5 3.5 0 0 0-7 0v8.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" }],
        ["c", "path", { d: "M4 16h4.5M15.5 16H20" }],
      ],
    },
    briefcase: {
      anim: "bounce",
      y: -2,
      origin: "12 20.5",
      els: [
        ["s", "path", { d: rr(3, 7, 18, 13.5, 3.5) }],
        ["l", "path", { d: "M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" }],
        ["d", "path", { d: rr(10.5, 11.75, 3, 3, 1), anim: "pop", s: 1.35, delay: 0.3 }],
      ],
    },
    calculator: {
      els: [
        ["s", "path", { d: rr(4.5, 2.5, 15, 19, 3.5) }],
        ["c", "path", { d: "M8.5 7h7", anim: "draw", delay: 0.45 }],
        ...[[8.5, 12.25, 0], [12, 12.25, 0.2], [15.5, 12.25, 0.1], [8.5, 16.75, 0.3], [12, 16.75, 0.05], [15.5, 16.75, 0.15]].map(([cx, cy, delay]) =>
          ["d", "circle", { cx, cy, r: 1.15, anim: "pop", s: 0.55, delay }]),
      ],
    },
    book: {
      // slides off the shelf: tips back on its bottom corner
      anim: "tilt",
      deg: -10,
      origin: "5 21.5",
      els: [
        ["s", "path", { d: "M5 19V5.5A3 3 0 0 1 8 2.5h10a1.5 1.5 0 0 1 1.5 1.5v17.5h-12A2.5 2.5 0 0 1 5 19Z" }],
        ["c", "path", { d: "M19.5 16.5H7.5a2.5 2.5 0 0 0-2.5 2.5" }],
        ["c", "path", { d: "M9.5 7h5.5", anim: "draw", delay: 0.2 }],
      ],
    },
    "book-open": {
      els: [
        ["s", "path", { d: soft([[12, 6.5, 1], [3, 4.5, 1.5], [3, 18, 1.5], [12, 20.5, 1.25]]), anim: "tilt", deg: 10, origin: "12 6.5", delay: 0.12 }],
        ["s", "path", { d: soft([[12, 6.5, 1], [12, 20.5, 1.25], [21, 18, 1.5], [21, 4.5, 1.5]]), anim: "tilt", deg: -10, origin: "12 6.5" }],
        ["c", "path", { d: "M12 7v13" }],
      ],
    },
    notebook: {
      els: [
        ["s", "path", { d: rr(6, 2.5, 13.5, 19, 3) }],
        ["l", "path", { d: "M3.5 7.5h4.5M3.5 12h4.5M3.5 16.5h4.5", anim: "wiggle", deg: 8, origin: "6 12" }],
        ["c", "path", { d: "M10.5 8h5", anim: "draw" }],
        ["c", "path", { d: "M10.5 12.5h5", anim: "draw", delay: 0.12 }],
      ],
    },
    newspaper: {
      els: [
        ["s", "path", { d: rr(3, 4, 18, 16, 3.5) }],
        ["c", "path", { d: "M7 8.25h10", anim: "draw" }],
        ["d", "path", { d: rr(6.25, 11.25, 5, 5, 1), anim: "grow", delay: 0.12 }],
        ["c", "path", { d: "M14.5 12.25h3", anim: "draw", delay: 0.2 }],
        ["c", "path", { d: "M14.5 15.75h3", anim: "draw", delay: 0.28 }],
      ],
    },
    library: {
      els: [
        ["s", "path", { d: rr(3.5, 3.5, 4.5, 17, 1.5), anim: "bounce", y: -2, origin: "5.75 20.5" }],
        ["s", "path", { d: rr(10.5, 7.5, 4.5, 13, 1.5), anim: "bounce", y: -2, origin: "12.75 20.5", delay: 0.1 }],
        ["k", "path", { d: rr(16.25, 6, 4.5, 14.5, 1.5), transform: "rotate(-14 20.75 20.5)", anim: "bounce", y: -2, origin: "18.5 20.5", delay: 0.1 }],
      ],
    },
    "graduation-cap": {
      // tossed in the air; the tassel swings after
      anim: "bounce",
      y: -2.5,
      origin: "12 19",
      els: [
        ["s", "path", { d: "M7.5 12v4c0 1.66 2 3 4.5 3s4.5-1.34 4.5-3v-4Z" }],
        ["k", "path", { d: soft([[3, 9, 2], [12, 4.5, 1.5], [21, 9, 2], [12, 13.5, 1.5]]) }],
        ["l", "path", { d: "M19.75 9.75v5.5", anim: "swing", deg: -16, origin: "19.75 9.75", delay: 0.18 }],
        ["s", "circle", { cx: 19.75, cy: 16.75, r: 1.25, anim: "swing", deg: -16, origin: "19.75 9.75", delay: 0.18 }],
      ],
    },
    glasses: {
      anim: "bounce",
      y: -2.5,
      origin: "12 18.5",
      els: [
        ["s", "circle", { cx: 7, cy: 14.5, r: 3.75 }],
        ["s", "circle", { cx: 17, cy: 14.5, r: 3.75 }],
        ["l", "path", { d: "M10.5 13.25a2 2 0 0 1 3 0" }],
        ["l", "path", { d: "M3.25 14.5V10.5a3 3 0 0 1 2.25-2.9", anim: "wiggle", deg: -12, origin: "3.25 14.5", delay: 0.2 }],
        ["l", "path", { d: "M20.75 14.5V10.5a3 3 0 0 0-2.25-2.9", anim: "wiggle", deg: 12, origin: "20.75 14.5", delay: 0.2 }],
      ],
    },
    anchor: {
      anim: "swing",
      deg: 14,
      origin: "12 3",
      els: [
        ["l", "circle", { cx: 12, cy: 5, r: 2 }],
        ["l", "path", { d: "M12 7v14M8.5 10.5h7" }],
        ["l", "path", { d: "M4.5 13.5a7.5 7.5 0 0 0 15 0M3 15.25l1.5-1.75 1.75 1.5M21 15.25l-1.5-1.75-1.75 1.5" }],
      ],
    },
    "life-buoy": {
      anim: "turn",
      deg: 90,
      origin: "12 12",
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "circle", { cx: 12, cy: 12, r: 4 }],
        ["c", "path", { d: "M14.83 9.17l3.53-3.53M9.17 9.17 5.64 5.64M9.17 14.83l-3.53 3.53M14.83 14.83l3.53 3.53" }],
      ],
    },
    flashlight: {
      els: [
        ["s", "path", { d: rr(9.5, 9.5, 5, 10.5, 2), transform: F_T }],
        ["k", "path", { d: soft([[7.25, 4, 1.25], [16.75, 4, 1.25], [14.75, 9.75, 1], [9.25, 9.75, 1]]), transform: F_T }],
        ["d", "circle", { cx: 12, cy: 14, r: 1, transform: F_T, anim: "pop", s: 0.5 }],
        ["l", "path", { d: "M12 1.5V-.25", transform: F_T, anim: "pulse", delay: 0.12 }],
        ["l", "path", { d: "M7.75 1.75 6.75.25M16.25 1.75l1-1.5", transform: F_T, anim: "pulse", delay: 0.22 }],
      ],
    },
    toolbox: {
      els: [
        ["s", "path", { d: rr(3, 10.5, 18, 10, 3) }],
        ["k", "path", { d: "M3 13V10a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3Z", anim: "bounce", y: -2.5, origin: "12 13" }],
        ["l", "path", { d: "M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2", anim: "bounce", y: -2.5, origin: "12 13" }],
        ["d", "path", { d: rr(10.5, 14.5, 3, 2.5, 1) }],
      ],
    },
    bed: {
      // side view: headboard post on the left, mattress, right leg; the pillow drops in and the mattress gives
      els: [
        ["l", "path", { d: "M3.5 5.5v15" }],
        ["s", "path", { d: "M3.5 12.5h15.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5H3.5Z", anim: "squash", origin: "12 16.5", delay: 0.28 }],
        ["l", "path", { d: "M20.5 16.5v4" }],
        ["s", "path", { d: "M7.5 7h3.5a1.5 1.5 0 0 1 1.5 1.5v.25a1.5 1.5 0 0 1-1.5 1.5H7.5A1.5 1.5 0 0 1 6 8.75V8.5A1.5 1.5 0 0 1 7.5 7Z", anim: "enter", y: -3 }],
      ],
    },
    sofa: {
      els: [
        ["s", "path", { d: rr(5, 4.5, 14, 9, 3), anim: "bounce", y: -1.5, origin: "12 13.5", delay: 0.12 }],
        ["k", "path", { d: "M3 12a2 2 0 0 1 4 0v2.5h10V12a2 2 0 0 1 4 0v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z", anim: "squash", origin: "12 20" }],
        ["l", "path", { d: "M6 20v1.25M18 20v1.25" }],
      ],
    },
    "door-open": {
      els: [
        ["l", "path", { d: "M5 21V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v15M3 21h18" }],
        ["s", "path", { d: soft([[5, 6, 0.5], [13.5, 7.5, 1.25], [13.5, 19.5, 1.25], [5, 21, 0.5]]), anim: "squash", origin: "5 13.5" }],
        ["d", "circle", { cx: 10.75, cy: 13.5, r: 1, anim: "squash", origin: "5 13.5" }],
      ],
    },
    shirt: {
      anim: "swing",
      deg: 10,
      origin: "12 3.5",
      els: [
        ["s", "path", { d: soft([[8.75, 3.5, 1], [12, 5.75, 3], [15.25, 3.5, 1], [21, 7.5, 1.5], [19, 11.5, 1.25], [17, 10.5, 0.75], [17, 20.5, 2], [7, 20.5, 2], [7, 10.5, 0.75], [5, 11.5, 1.25], [3, 7.5, 1.5]]) }],
      ],
    },
    backpack: {
      anim: "swing",
      deg: 10,
      origin: "12 3",
      els: [
        ["s", "path", { d: rr(4.5, 6, 15, 15, 4.5) }],
        ["l", "path", { d: "M9.5 6V5.5a2.5 2.5 0 0 1 5 0V6" }],
        ["c", "path", { d: "M8 13.5h8v2.5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2Z", anim: "squash", origin: "12 13.5", delay: 0.15 }],
      ],
    },
    lamp: {
      els: [
        ["s", "path", { d: soft([[9, 3, 1.25], [15, 3, 1.25], [19, 11, 1.5], [5, 11, 1.5]]), anim: "squash", origin: "12 3" }],
        ["l", "path", { d: "M12 11v9.5M7.5 20.5h9" }],
        ["l", "path", { d: "M7.75 14.25 6.5 16.75", anim: "pulse", delay: 0.12 }],
        ["l", "path", { d: "M16.25 14.25l1.25 2.5", anim: "pulse", delay: 0.2 }],
      ],
    },
    scale: {
      els: [
        ["s", "circle", { cx: 12, cy: 4.25, r: 1.25 }],
        ["l", "path", { d: "M12 5.5v15M7.5 20.5h9" }],
        ...[[0, "l", "M5.75 7.5h12.5M5.75 7.5 3.25 13.5M5.75 7.5l2.5 6M18.25 7.5l-2.5 6M18.25 7.5l2.5 6"], [0, "s", "M3 13.5h5.5a2.75 2.75 0 0 1-5.5 0ZM15.5 13.5H21a2.75 2.75 0 0 1-5.5 0Z"]].map(([, k, d]) =>
          [k, "path", { d, anim: "wiggle", deg: 8, origin: "12 7.5" }]),
      ],
    },
    gavel: {
      els: [
        ["s", "path", { d: rr(4.5, 17.25, 9.5, 3.75, 1.75) }],
        ["l", "path", { d: "M12 9v12", transform: `translate(1.5 -1.5) ${G_T}`, anim: "tilt", deg: -14, origin: at(12, 21, -45, 1.5, -1.5) }],
        ["s", "path", { d: rr(6.75, 3.5, 10.5, 5.5, 2), transform: `translate(1.5 -1.5) ${G_T}`, anim: "tilt", deg: -14, origin: at(12, 21, -45, 1.5, -1.5) }],
      ],
    },
  });
})();
