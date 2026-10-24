// Travel: transport, places, food.
(function () {
  const f = (v) => +v.toFixed(2);
  // Rounded rect as a path (x/y attrs are reserved for motion params).
  const rr = (x, y, w, h, r) =>
    `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  // Closed polygon with every corner filleted by an arc: pts = [[x, y, radius], ...].
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
  // Outline wrapping circles [cx, cy, r] in clockwise order, joined by tangent lines.
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
  // Circle (cx, cy, R) with a round bite (bx, by, br) taken out; the two lips get fillets of radius fr.
  const bitten = (cx, cy, R, bx, by, br, fr) => {
    const d = Math.hypot(bx - cx, by - cy), ux = (bx - cx) / d, uy = (by - cy) / d;
    const r1 = R - fr, r2 = br + fr, a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(r1 * r1 - a * a);
    const lip = (s) => {
      const F = [cx + a * ux - s * h * uy, cy + a * uy + s * h * ux];
      const o = [cx + (R * (F[0] - cx)) / r1, cy + (R * (F[1] - cy)) / r1];
      const b = [bx + (br * (F[0] - bx)) / r2, by + (br * (F[1] - by)) / r2];
      return { o: o.map(f), b: b.map(f) };
    };
    const P = lip(1), M = lip(-1);
    return `M${P.o}A${R} ${R} 0 1 1 ${M.o}A${fr} ${fr} 0 0 1 ${M.b}A${br} ${br} 0 0 0 ${P.b}A${fr} ${fr} 0 0 1 ${P.o}Z`.replace(/,/g, " ");
  };
  // Union of a row of overlapping circles (left to right) above a flat base at y = yb: foam, clouds.
  const puffs = (C, yb) => {
    const meet = ([x1, y1, r1], [x2, y2, r2]) => {
      const d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
      const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(r1 * r1 - a * a);
      return [x1 + a * ux + h * uy, y1 + a * uy - h * ux]; // the upper intersection
    };
    const [x0, y0, r0] = C[0], [xn, yn, rn] = C[C.length - 1];
    let d = `M${f(x0 - Math.sqrt(r0 * r0 - (yb - y0) ** 2))} ${yb}`;
    C.forEach(([, , r], i) => {
      const p = i < C.length - 1 ? meet(C[i], C[i + 1]) : [xn + Math.sqrt(rn * rn - (yb - yn) ** 2), yb];
      d += `A${r} ${r} 0 0 1 ${f(p[0])} ${f(p[1])}`;
    });
    return d + "Z";
  };
  // Croissant: a crescent of puffy segments around (12, 17). Each segment's outer edge bulges between notches,
  // the horn tips are half-round caps, the inner edge is one smooth arc.
  const pol = (a, r) => `${f(12 + r * Math.cos((a * Math.PI) / 180))} ${f(17 + r * Math.sin((a * Math.PI) / 180))}`;
  const CRO_A = [-195, -125, -55, 15], CRO_RO = [6, 9.5, 9.5, 6], CRO_RI = 4.5;
  const CROISSANT = (() => {
    const cap = (CRO_RO[0] - CRO_RI) / 2, n = CRO_A.length - 1;
    let d = `M${pol(CRO_A[0], CRO_RI)}A${cap} ${cap} 0 0 1 ${pol(CRO_A[0], CRO_RO[0])}`;
    for (let i = 0; i < n; i++) {
      const chord = 2 * Math.sin(((CRO_A[i + 1] - CRO_A[i]) * Math.PI) / 360) * (CRO_RO[i] + CRO_RO[i + 1]) / 2;
      d += `A${f(chord * 0.62)} ${f(chord * 0.62)} 0 0 1 ${pol(CRO_A[i + 1], CRO_RO[i + 1])}`;
    }
    return d + `A${cap} ${cap} 0 0 1 ${pol(CRO_A[n], CRO_RI)}A${CRO_RI} ${CRO_RI} 0 1 0 ${pol(CRO_A[0], CRO_RI)}Z`;
  })();
  const wheel = (cx) => ["k", "circle", { cx, cy: 18.75, r: 2 }];
  const ride = (delay) => ({ anim: "bounce", y: -1, origin: "12 16", delay });

  Icons.define("travel", {
    bus: {
      // side view, nose to the right: body rides on its springs while the wheels roll forward
      anim: "nudge",
      x: 2.5,
      els: [
        ["s", "path", { d: rr(3, 4.5, 18, 11.5, 3), ...ride(0.1) }],
        ["d", "path", { d: rr(5.75, 7.5, 3.25, 3.5, 1), ...ride(0.1) }],
        ["d", "path", { d: rr(10.75, 7.5, 3.25, 3.5, 1), ...ride(0.1) }],
        ["d", "path", { d: rr(15.75, 7.5, 2.5, 3.5, 1), ...ride(0.1) }],
        wheel(6.75),
        wheel(17.25),
      ],
    },
    bike: {
      anim: "nudge",
      x: 2,
      els: [
        ["l", "path", { d: "M6.5 16.5h5l4-6.5 2 6.5M11.5 16.5 9.25 9M7.5 9h3.5M15.5 10 14.75 7h2.25" }],
        ["l", "circle", { cx: 6.5, cy: 16.5, r: 3.5 }],
        ["l", "circle", { cx: 17.5, cy: 16.5, r: 3.5 }],
        ["l", "path", { d: "M6.5 13.5v6", anim: "turn", deg: 180, origin: "6.5 16.5" }],
        ["l", "path", { d: "M17.5 13.5v6", anim: "turn", deg: 180, origin: "17.5 16.5" }],
      ],
    },
    train: {
      // front view like `car`: the body rocks on its bogies, the rails stay put
      els: [
        ["s", "path", { d: rr(5, 3, 14, 14.5, 4.5), anim: "bounce", y: -1.5, origin: "12 17.5" }],
        ["d", "path", { d: rr(8, 6, 8, 4.5, 1.5), anim: "bounce", y: -1.5, origin: "12 17.5" }],
        ["d", "circle", { cx: 8.75, cy: 14, r: 1.25, anim: "bounce", y: -1.5, origin: "12 17.5" }],
        ["d", "circle", { cx: 15.25, cy: 14, r: 1.25, anim: "bounce", y: -1.5, origin: "12 17.5" }],
        ["l", "path", { d: "M8.75 17.5 7 20.75M15.25 17.5 17 20.75" }],
      ],
    },
    ship: {
      els: [
        ["s", "path", { d: rr(8, 4.5, 8, 7, 2), anim: "wiggle", deg: 8, origin: "12 16" }],
        ["k", "path", { d: soft([[3, 10.5, 1.25], [21, 10.5, 1.25], [18, 16, 2], [6, 16, 2]]), anim: "wiggle", deg: 8, origin: "12 16" }],
        ["d", "circle", { cx: 8.5, cy: 13, r: 1, anim: "wiggle", deg: 8, origin: "12 16" }],
        ["d", "circle", { cx: 12, cy: 13, r: 1, anim: "wiggle", deg: 8, origin: "12 16" }],
        ["d", "circle", { cx: 15.5, cy: 13, r: 1, anim: "wiggle", deg: 8, origin: "12 16" }],
        ["l", "path", { d: "M3 20q1.5-1.5 3 0t3 0 3 0 3 0 3 0 3 0", anim: "nudge", x: -1.5, delay: 0.1 }],
      ],
    },
    sailboat: {
      anim: "wiggle",
      deg: 8,
      origin: "12 20.5",
      els: [
        ["s", "path", { d: "M12.75 13V4.6a1.25 1.25 0 0 1 2.2-.8A16 16 0 0 1 20.4 11.6 1.25 1.25 0 0 1 19.2 13Z", anim: "squash", origin: "12.75 13", delay: 0.12 }],
        ["s", "path", { d: "M8.75 13V7.35a1.1 1.1 0 0 0-1.95-.7A13 13 0 0 0 3.85 11.7 1.1 1.1 0 0 0 4.9 13Z", anim: "squash", origin: "8.75 13", delay: 0.18 }],
        ["k", "path", { d: soft([[3, 16, 1.25], [21, 16, 1.25], [18, 20.5, 2], [6, 20.5, 2]]) }],
      ],
    },
    fuel: {
      els: [
        ["s", "path", { d: rr(4, 3.5, 10, 17, 2.5) }],
        ["c", "path", { d: rr(7, 6.5, 4, 3.5, 1), anim: "pulse", delay: 0.1 }],
        ["l", "path", { d: "M14 12.5a2 2 0 0 1 2 2V17a1.875 1.875 0 0 0 3.75 0V8.5" }],
        // the nozzle hangs on its hook and sways
        ["k", "path", { d: rr(18.5, 5, 2.5, 5, 1.25), anim: "swing", deg: 10, origin: "19.75 5" }],
      ],
    },
    parking: {
      els: [
        ["s", "path", { d: rr(3.5, 3.5, 17, 17, 4) }],
        // the P pulls into its bay and settles
        ["c", "path", { d: "M9.5 16.5v-9h3.25a2.75 2.75 0 0 1 0 5.5H9.5", anim: "enter", x: -3 }],
      ],
    },
    hotel: {
      els: [
        ["s", "path", { d: "M4.5 21V9.5a2 2 0 0 1 2-2h1.75a.75.75 0 0 0 .75-.75V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.75a.75.75 0 0 0 .75.75h1.75a2 2 0 0 1 2 2V21Z" }],
        ["l", "path", { d: "M3 21h18" }],
        // lights come on, room by room
        ["d", "path", { d: rr(7.5, 10.5, 2.5, 2.5, 0.75), anim: "grow" }],
        ["d", "path", { d: rr(14, 10.5, 2.5, 2.5, 0.75), anim: "grow", delay: 0.08 }],
        ["d", "path", { d: rr(7.5, 14.75, 2.5, 2.5, 0.75), anim: "grow", delay: 0.16 }],
        ["d", "path", { d: rr(14, 14.75, 2.5, 2.5, 0.75), anim: "grow", delay: 0.24 }],
        ["c", "path", { d: "M10.75 21v-2.5a1.25 1.25 0 0 1 2.5 0V21" }],
      ],
    },
    tent: {
      els: [
        ["s", "path", { d: soft([[12, 5, 2], [19.5, 19.5, 1], [4.5, 19.5, 1]]) }],
        ["l", "path", { d: "M3 19.5h18" }],
        // the door flap lifts open from the ridge
        ["d", "path", { d: soft([[12, 10, 1.5], [14.75, 19.5, 0.5], [9.25, 19.5, 0.5]]), anim: "tilt", deg: -18, origin: "12 10" }],
      ],
    },
    mountain: {
      els: [
        // the sun rises from behind the ridge
        ["s", "circle", { cx: 18.5, cy: 5, r: 2, anim: "enter", y: 3, delay: 0.05 }],
        ["k", "path", { d: soft([[3, 19.5, 1.25], [9, 6, 2.25], [12.75, 12.5, 0.75], [15.5, 9, 2], [21, 19.5, 1.25]]) }],
      ],
    },
    school: {
      els: [
        ["s", "path", { d: soft([[3.5, 20.5, 1.25], [3.5, 12, 1.25], [7.5, 12, 0.75], [12, 7.5, 1.75], [16.5, 12, 0.75], [20.5, 12, 1.25], [20.5, 20.5, 1.25]]) }],
        ["l", "path", { d: "M12 8V3" }],
        ["s", "path", { d: soft([[12, 3, 0.5], [16, 3, 1], [16, 6, 1], [12, 6, 0.5]]), anim: "squash", origin: "12 4.5" }],
        ["d", "circle", { cx: 12, cy: 12.75, r: 1.25 }],
        ["d", "circle", { cx: 6.5, cy: 16, r: 1 }],
        ["d", "circle", { cx: 17.5, cy: 16, r: 1 }],
        ["c", "path", { d: "M10.25 20.5v-2.25a1.75 1.75 0 0 1 3.5 0v2.25" }],
      ],
    },
    factory: {
      els: [
        ["s", "path", { d: soft([[3, 20.5, 1.25], [3, 6, 1], [6.5, 6, 1], [6.5, 12.5, 0.25], [11.25, 9, 1.25], [11.25, 12.5, 0.25], [16, 9, 1.25], [16, 12.5, 0.25], [21, 9, 1.25], [21, 20.5, 1.25]]) }],
        ["d", "path", { d: rr(8.75, 15.25, 2.75, 2.75, 0.75) }],
        ["d", "path", { d: rr(14.5, 15.25, 2.75, 2.75, 0.75) }],
        // smoke puffs rise out of the chimney
        ["s", "circle", { cx: 8.75, cy: 4.5, r: 0.5, anim: "enter", x: -1.5, y: 1.5 }],
        ["s", "circle", { cx: 11.5, cy: 3, r: 0.75, anim: "enter", x: -1.5, y: 1.5, delay: 0.12 }],
      ],
    },
    route: {
      els: [
        ["s", "circle", { cx: 5.5, cy: 18.5, r: 2 }],
        ["l", "path", { d: "M10.5 18.5h4a3.25 3.25 0 0 0 0-6.5h-5a3.25 3.25 0 0 1 0-6.5h4", anim: "draw" }],
        ["s", "circle", { cx: 18.5, cy: 5.5, r: 2, anim: "grow", delay: 0.35 }],
      ],
    },
    signpost: {
      els: [
        ["l", "path", { d: "M12 8v4.5M12 17v4" }],
        ["s", "path", { d: soft([[4.5, 3.5, 1.25], [16, 3.5, 1], [20.5, 5.75, 1.5], [16, 8, 1], [4.5, 8, 1.25]]), anim: "swing", deg: 10, origin: "12 5.75" }],
        ["s", "path", { d: soft([[19.5, 12.5, 1.25], [19.5, 17, 1.25], [8, 17, 1], [3.5, 14.75, 1.5], [8, 12.5, 1]]), anim: "swing", deg: 10, origin: "12 14.75", delay: 0.07 }],
      ],
    },
    luggage: {
      // tips back onto its wheel, ready to roll
      anim: "tilt",
      deg: -12,
      origin: "8.5 20.5",
      els: [
        ["s", "path", { d: rr(5, 6.5, 14, 12.5, 3) }],
        ["l", "path", { d: "M9.5 6.5V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1.5" }],
        ["c", "path", { d: "M9 10v5.5M15 10v5.5" }],
        ["l", "path", { d: "M8.5 19v1.5M15.5 19v1.5" }],
      ],
    },
    "traffic-cone": {
      els: [
        ["s", "path", { d: soft([[10.5, 3, 1.5], [13.5, 3, 1.5], [17.25, 18, 1], [6.75, 18, 1]]), anim: "wiggle", deg: 10, origin: "12 18" }],
        ["c", "path", { d: "M8.95 9h6.1M7.78 13.5h8.44", anim: "wiggle", deg: 10, origin: "12 18" }],
        ["k", "path", { d: rr(3.5, 17.5, 17, 3, 1.5) }],
      ],
    },
    pizza: {
      anim: "bounce",
      y: -2.5,
      origin: "12 21",
      els: [
        ["s", "path", { d: hull([[5, 6, 1.5], [19, 6, 1.5], [12, 19.5, 1.5]]) }],
        ["c", "path", { d: "M4.25 9.25h15.5" }],
        ["d", "circle", { cx: 10, cy: 12.25, r: 1.25 }],
        ["d", "circle", { cx: 14, cy: 13, r: 1 }],
        ["d", "circle", { cx: 12, cy: 16, r: 0.9 }],
      ],
    },
    cake: {
      els: [
        ["s", "path", { d: hull([[12, 4, 0.75], [12, 6, 1.5]]), anim: "wiggle", deg: 14, origin: "12 7.5" }],
        ["l", "path", { d: "M12 10.5v2" }],
        ["s", "path", { d: rr(4, 12.5, 16, 8, 2.5) }],
        ["c", "path", { d: "M4 15.5q2 2 4 0q2 2 4 0q2 2 4 0q2 2 4 0" }],
        ["l", "path", { d: "M3 20.5h18" }],
      ],
    },
    apple: {
      // hangs from its stem like it's still on the branch
      anim: "swing",
      deg: 10,
      origin: "13.25 4",
      els: [
        ["s", "path", { d: "M12 8.75C13.5 7.25 16 6.75 17.75 7.75 20 9 20.5 12 19.75 14.75 19 17.75 16.75 20.75 14.5 20.75 13.5 20.75 13 20.25 12 20.25 11 20.25 10.5 20.75 9.5 20.75 7.25 20.75 5 17.75 4.25 14.75 3.5 12 4 9 6.25 7.75 8 6.75 10.5 7.25 12 8.75Z" }],
        ["l", "path", { d: "M12 8.75C12 7 12.25 5.5 13.25 4" }],
        ["k", "path", { d: soft([[14, 5.5, 1.25], [16.75, 5.25, 3], [19.5, 3, 1.25], [16.5, 3.25, 3]]) }],
      ],
    },
    utensils: {
      els: [
        ["l", "path", { d: "M4 3v4a3 3 0 0 0 6 0V3M7 3v18", anim: "wiggle", deg: 8, origin: "7 21" }],
        ["s", "path", { d: "M16 13.5V4.5a1.5 1.5 0 0 1 2.3-1.27C19.6 4.1 20 6.5 20 9.5v3a1 1 0 0 1-1 1Z", anim: "wiggle", deg: 8, origin: "16 21", delay: 0.08 }],
        ["l", "path", { d: "M16 13.5V21", anim: "wiggle", deg: 8, origin: "16 21", delay: 0.08 }],
      ],
    },
    wine: {
      // cheers: the glass tips, the wine stays level
      anim: "tilt",
      deg: 15,
      origin: "12 20.5",
      els: [
        ["s", "path", { d: "M7.5 3h9a1 1 0 0 1 1 1v3.5a5.5 5.5 0 0 1-11 0V4a1 1 0 0 1 1-1Z" }],
        ["c", "path", { d: "M9.5 8.5h5", anim: "tilt", deg: -15, origin: "12 8.5" }],
        ["l", "path", { d: "M12 13v7.5M8 20.5h8" }],
      ],
    },
    beer: {
      els: [
        ["s", "path", { d: rr(4.5, 9.5, 11, 11.5, 2.5) }],
        ["l", "path", { d: "M15.5 13h1.5a2.5 2.5 0 0 1 2.5 2.5v1a2.5 2.5 0 0 1-2.5 2.5h-1.5" }],
        ["c", "path", { d: "M8.25 14.5v3.5M11.75 14.5v3.5" }],
        ["k", "path", { d: puffs([[6.75, 8.5, 2.5], [10.5, 6.75, 3], [14.25, 8.5, 2.5]], 10.5), anim: "squash", origin: "10.5 10.5" }],
      ],
    },
    "ice-cream": {
      els: [
        ["s", "path", { d: soft([[7, 13.5, 1], [17, 13.5, 1], [12, 22.75, 1.5]]) }],
        ["c", "path", { d: "M9.5 16.25h5" }],
        ["k", "path", { d: "M7.1 9A5 5 0 1 1 16.9 9a1.63 1.63 0 0 1-3.27 0 1.63 1.63 0 0 1-3.26 0A1.63 1.63 0 0 1 7.1 9Z", anim: "wiggle", deg: 10, origin: "12 10.5" }],
      ],
    },
    cookie: {
      els: [
        ["s", "path", { d: bitten(12, 12, 9, 19.5, 4.5, 4.25, 1.25), anim: "wiggle", deg: 8, origin: "12 12" }],
        ...[[8, 9.5, 1.25], [12.5, 12.5, 1.1], [8.5, 15.5, 1.1], [15, 16.5, 1.25]].map(([cx, cy, r]) =>
          ["d", "circle", { cx, cy, r, anim: "wiggle", deg: 8, origin: "12 12" }]),
        ["s", "circle", { cx: 19.5, cy: 4.5, r: 0.5, anim: "enter", y: -2, delay: 0.15 }],
      ],
    },
    croissant: {
      // a fresh crescent puffs up
      anim: "squash",
      origin: "12 19",
      els: [
        ["s", "path", { d: CROISSANT }],
        ["c", "path", { d: `M${pol(CRO_A[1], CRO_RI)}A9 9 0 0 0 ${pol(CRO_A[1], CRO_RO[1])}M${pol(CRO_A[2], CRO_RI)}A9 9 0 0 1 ${pol(CRO_A[2], CRO_RO[2])}` }],
      ],
    },
    carrot: {
      els: [
        ["l", "path", { d: "M17.9 6.1 17.5 2.75", anim: "wiggle", deg: 15, origin: "17.9 6.1" }],
        ["l", "path", { d: "M17.9 6.1 20.75 3.25", anim: "wiggle", deg: 15, origin: "17.9 6.1", delay: 0.06 }],
        ["l", "path", { d: "M17.9 6.1 21.25 6.5", anim: "wiggle", deg: 15, origin: "17.9 6.1", delay: 0.12 }],
        ["k", "path", { d: hull([[15.75, 8.25, 3.75], [5.25, 18.75, 1.5]]) }],
        ["c", "path", { d: "M14.33 13.91 12.9 12.48M7.7 12.92 8.76 13.98" }],
      ],
    },
    soup: {
      els: [
        ["s", "path", { d: "M4.06 11.5H19.94A1 1 0 0 1 20.93 12.63A9 9 0 0 1 3.07 12.63A1 1 0 0 1 4.06 11.5Z" }],
        ["l", "path", { d: "M8 7.75q-1.25-1 0-2.125t0-2.125", anim: "enter", y: 1.25 }],
        ["l", "path", { d: "M12 7.75q-1.25-1 0-2.125t0-2.125", anim: "enter", y: 1.25, delay: 0.1 }],
        ["l", "path", { d: "M16 7.75q-1.25-1 0-2.125t0-2.125", anim: "enter", y: 1.25, delay: 0.2 }],
      ],
    },
    "cup-soda": {
      els: [
        ["l", "path", { d: "M13 8 14.5 3h3", anim: "wiggle", deg: 12, origin: "13 7", delay: 0.1 }],
        ["s", "path", { d: soft([[6, 8, 1], [18, 8, 1], [16.5, 20.5, 1.75], [7.5, 20.5, 1.75]]) }],
        ["k", "path", { d: rr(4.5, 6, 15, 3.5, 1.75) }],
        // fizz rises
        ["d", "circle", { cx: 10.25, cy: 16.75, r: 1, anim: "enter", y: 1.5 }],
        ["d", "circle", { cx: 13.75, cy: 14, r: 1, anim: "enter", y: 1.5, delay: 0.12 }],
      ],
    },
  });
})();
