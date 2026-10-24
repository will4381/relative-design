// Health: medicine, science, body, feelings.
// Faces share smile's geometry (circle r9, eye dots r1.25, mouth arcs at stroke weight).
// Stick figures share one head (r2) and limb weight.
(function () {
  const f = (v) => +v.toFixed(2);
  // Closed polygon with every corner filleted by an arc: pts = [[x, y, radius], ...].
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
  // Outline wrapping circles [cx, cy, r] in clockwise order, joined by tangent lines (r < 0 = concave scoop).
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
  // Rounded rect as a path (rect x/y attrs are reserved for motion params).
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  // Open circular arc, angles in degrees (0 = right, clockwise on screen).
  const arc = (cx, cy, r, a0, a1) => {
    const p = (a) => `${f(cx + r * Math.cos((a * Math.PI) / 180))} ${f(cy + r * Math.sin((a * Math.PI) / 180))}`;
    return `M${p(a0)}A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${p(a1)}`;
  };
  const R45 = "rotate(45 12 12)";

  // status.js heart, shared so the pack has one heart.
  const HEART =
    "M10.7 19.1C4.9 15.2 3 12.2 3 8.9 3 6.1 5.1 4 7.8 4c1.8 0 3.3 1 4.2 2.5C12.9 5 14.4 4 16.2 4 18.9 4 21 6.1 21 8.9c0 3.3-1.9 6.3-7.7 10.2Q12 20 10.7 19.1Z";
  const FACE = ["s", "circle", { cx: 12, cy: 12, r: 9 }];
  const eye = (cx, a = {}) => ["d", "circle", { cx, cy: 10, r: 1.25, ...a }];

  // Bone: two knobs per end (r 2.4) on a 3-wide shaft, built horizontally then laid on the diagonal.
  const BONE = (() => {
    const a = 6.75, dy = 1.9, r = 2.4, h = 1.5;
    const sx = Math.sqrt(r * r - (dy - h) ** 2), nx = Math.sqrt(r * r - dy * dy);
    const P = (x, y) => `${f(12 + x)} ${f(12 + y)}`;
    return `M${P(-a + sx, -h)}H${f(12 + a - sx)}A${r} ${r} 0 1 1 ${P(a + nx, 0)}A${r} ${r} 0 1 1 ${P(a - sx, h)}` +
      `H${f(12 - a + sx)}A${r} ${r} 0 1 1 ${P(-a - nx, 0)}A${r} ${r} 0 1 1 ${P(-a + sx, -h)}Z`;
  })();

  // Brain from the side: lobes bulge between soft notches over a flatter base, brain-stem nub lower right.
  // Each point carries the radius of the outward arc to the next point (0 = straight).
  const BRAIN = (() => {
    const P = [[4.5, 13.25, 3.25], [5, 8, 3.25], [9.25, 4.75, 3.25], [14.75, 4.75, 3.25], [18.75, 7.5, 3.25], [19.25, 12.75, 3],
      [16.5, 16.25, 0], [16, 19, 1.25], [13.5, 19, 0], [13, 16.75, 10]];
    return P.map(([x, y], i) => { const [, , r] = P[(i + P.length - 1) % P.length];
      return i ? (r ? `A${r} ${r} 0 0 1 ${x} ${y}` : `L${x} ${y}`) : `M${x} ${y}`; }).join("") + `A10 10 0 0 1 4.5 13.25Z`;
  })();

  Icons.define("health", {
    "heart-pulse": {
      anim: "heartbeat",
      s: 1.12,
      origin: "12 12",
      els: [
        ["s", "path", { d: HEART }],
        ["c", "path", { d: "M6.75 12H8.5c.9 0 1.1-2.75 2.1-2.75S12 15 13.1 15s1.2-3 2.15-3h2", anim: "draw", delay: 0.1 }],
      ],
    },
    pill: {
      // hops and tumbles end over end
      anim: "bounce",
      y: -2,
      origin: "12 20",
      els: [
        ["s", "path", { d: rr(8, 2, 8, 20, 4), transform: R45, anim: "wiggle", deg: 16, origin: "12 12" }],
        ["c", "path", { d: "M8 12h8", transform: R45, anim: "wiggle", deg: 16, origin: "12 12" }],
      ],
    },
    stethoscope: {
      els: [
        ["l", "path", { d: "M5 3.5h1.5M11 3.5h1.5M5.75 3.5V8a3.25 3.25 0 0 0 6.5 0V3.5" }],
        // the tube and chest piece dangle from the Y
        ["l", "path", { d: "M9 11.25v3.25a4.75 4.75 0 0 0 9.5 0V13", anim: "swing", deg: 10, origin: "9 11.25" }],
        ["s", "circle", { cx: 18.5, cy: 10.5, r: 2.5, anim: "swing", deg: 10, origin: "9 11.25" }],
      ],
    },
    syringe: {
      els: [
        ["l", "path", { d: "M12 18v4.25", transform: R45 }],
        ["s", "path", { d: rr(8.75, 6.5, 6.5, 11.5, 2), transform: R45 }],
        ["l", "path", { d: "M7.5 6.5h9", transform: R45 }],
        // plunger pushes in along the barrel
        ["l", "path", { d: "M9.5 2h5M12 2v8", transform: R45, anim: "nudge", x: -1.4, y: 1.4 }],
        ["c", "path", { d: "M10.5 10h3", transform: R45, anim: "nudge", x: -1.4, y: 1.4 }],
      ],
    },
    microscope: {
      els: [
        ["l", "path", { d: "M4.5 21h15" }],
        ["l", "path", { d: "M14.5 8.5a6.5 6.5 0 0 1 1.5 12.5" }],
        ["l", "path", { d: "M6 16.5h6.5" }],
        // tube focuses down onto the slide
        ["s", "path", { d: rr(7.75, 2.5, 4.5, 10, 1.75), transform: "rotate(-25 10 12.5)", anim: "nudge", y: 1.25 }],
      ],
    },
    flask: {
      els: [
        ["s", "path", { d: soft([[9.75, 3, 0.75], [14.25, 3, 0.75], [14.25, 8.5, 1.5], [20.5, 20.75, 2.25], [3.5, 20.75, 2.25], [9.75, 8.5, 1.5]]) }],
        ["l", "path", { d: "M8.5 3h7" }],
        ["c", "path", { d: "M7.75 14.5c1.4-.75 2.85-.75 4.25 0s2.85.75 4.25 0" }],
        // bubbles rise through the liquid
        ["d", "circle", { cx: 10.25, cy: 17.75, r: 1.25, anim: "enter", y: 2, delay: 0 }],
        ["d", "circle", { cx: 14, cy: 17.25, r: 1, anim: "enter", y: 2, delay: 0.14 }],
      ],
    },
    "test-tube": {
      // swirled from the lip, the liquid sloshes a beat later
      anim: "wiggle",
      deg: 14,
      origin: "18.54 5.46",
      els: [
        ["s", "path", { d: "M9 3.5v13a3 3 0 0 0 6 0v-13Z", transform: R45 }],
        ["l", "path", { d: "M7.5 3.5h9", transform: R45 }],
        ["d", "path", { d: "M11 11h2v5.5a1 1 0 0 1-2 0Z", transform: R45, anim: "squash", delay: 0.12 }],
      ],
    },
    atom: {
      els: [
        ...[0, 60, 120].map((a) => ["l", "ellipse", { cx: 12, cy: 12, rx: 9, ry: 3.75, transform: `rotate(${a} 12 12)`, anim: "turn", deg: 60, origin: "12 12" }]),
        ["s", "circle", { cx: 12, cy: 12, r: 0.75, anim: "pop", s: 1.25, delay: 0.2 }],
      ],
    },
    dna: {
      els: [
        ["l", "path", { d: "M7.5 3C7.5 7.5 16.5 7.5 16.5 12S7.5 16.5 7.5 21", anim: "squash", origin: "12 12" }],
        ["l", "path", { d: "M16.5 3C16.5 7.5 7.5 7.5 7.5 12S16.5 16.5 16.5 21", anim: "squash", origin: "12 12", delay: 0.1 }],
        ["l", "path", { d: "M10.5 3.75h3M10.5 12h3M10.5 20.25h3", anim: "squash", origin: "12 12", delay: 0.05 }],
      ],
    },
    brain: {
      els: [
        ["s", "path", { d: BRAIN, anim: "squash", origin: "12 20.5" }],
        ["c", "path", { d: "M7.75 11.5c1.5-.25 2.75.5 3.25 1.75", anim: "draw", delay: 0.1 }],
        ["c", "path", { d: "M13.25 7.75c.25 1.5 1.25 2.5 2.75 2.75", anim: "draw", delay: 0.2 }],
      ],
    },
    accessibility: {
      // rolls forward, head bobs
      anim: "nudge",
      x: 2,
      els: [
        ["s", "circle", { cx: 12.75, cy: 4.25, r: 2, anim: "bounce", y: -1.25, origin: "12.75 6.25", delay: 0.12 }],
        ["l", "path", { d: "M12.25 8.75 11.75 14H16.5l2 5h1.25M12 11h3.5" }],
        ["l", "path", { d: arc(10, 15.75, 5, 15, 255) }],
      ],
    },
    "person-standing": {
      anim: "bounce",
      y: -2.5,
      origin: "12 21",
      els: [
        ["s", "circle", { cx: 12, cy: 4.5, r: 2 }],
        ["l", "path", { d: "M8 14.5l1.15-4a1.5 1.5 0 0 1 1.45-1.1h2.8a1.5 1.5 0 0 1 1.45 1.1l1.15 4M12 9.5v5.5M8.75 21 12 15l3.25 6" }],
      ],
    },
    hand: {
      // waves from the wrist
      anim: "swing",
      deg: 16,
      origin: "12 21",
      els: [
        ["s", "path", { d: "M7 13V6.5a1.75 1.75 0 0 1 3.5 0V4.75a1.75 1.75 0 0 1 3.5 0v1a1.75 1.75 0 0 1 3.5 0V8.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1c-2.4 0-3.7-1-5-2.75l-2.6-3.6a1.75 1.75 0 0 1 2.7-2.2Z" }],
        ["c", "path", { d: "M10.5 6.5v5.5M14 4.75V12M17.5 8.5V12" }],
      ],
    },
    baby: {
      anim: "wiggle",
      deg: 8,
      origin: "12 21",
      els: [
        FACE,
        ["c", "path", { d: "M12 3c-1.5 0-2.25 2.75-.25 2.75.9 0 1.1-.9.6-1.35", anim: "swing", deg: 25, origin: "12 3", delay: 0.1 }],
        ["d", "circle", { cx: 9, cy: 12, r: 1.25, anim: "blink", delay: 0.2 }],
        ["d", "circle", { cx: 15, cy: 12, r: 1.25, anim: "blink", delay: 0.2 }],
        ["c", "path", { d: "M10.25 15.75a2.5 2.5 0 0 0 3.5 0" }],
      ],
    },
    bandage: {
      // pressed on
      anim: "squash",
      origin: "12 12",
      els: [
        ["s", "path", { d: rr(2.5, 8, 19, 8, 4), transform: R45 }],
        ["c", "path", { d: "M9 8v8M15 8v8", transform: R45 }],
        ...[[11, 11], [13, 11], [11, 13], [13, 13]].map(([cx, cy]) => ["d", "circle", { cx, cy, r: 0.75, transform: R45 }]),
      ],
    },
    hospital: {
      els: [
        ["s", "path", { d: soft([[3.5, 21, 1.5], [3.5, 11, 2], [7.5, 11, 1], [7.5, 3.5, 3], [16.5, 3.5, 3], [16.5, 11, 1], [20.5, 11, 2], [20.5, 21, 1.5]]) }],
        ["c", "path", { d: "M12 6.75v5M9.5 9.25h5", anim: "pop", s: 1.25, origin: "12 9.25" }],
        ["c", "path", { d: "M10 21v-2.25a2 2 0 0 1 4 0V21" }],
      ],
    },
    ambulance: {
      // drives off, roof light flashes
      anim: "nudge",
      x: 2.5,
      // same body, cab and wheels as commerce's truck
      els: [
        ["s", "path", { d: "M6.75 6V4.75a1 1 0 0 1 1-1h.75a1 1 0 0 1 1 1V6", anim: "pulse" }],
        ["s", "path", { d: rr(3, 6, 10.25, 9.5, 2.5) }],
        ["c", "path", { d: "M8.13 8.75v4M6.13 10.75h4" }],
        ["s", "path", { d: soft([[16, 8.5, 1], [18.25, 8.5, 1.5], [21, 12.5, 1.5], [21, 15.5, 1], [16, 15.5, 1]]) }],
        ["k", "circle", { cx: 7.75, cy: 18.75, r: 2 }],
        ["k", "circle", { cx: 18.25, cy: 18.75, r: 2 }],
      ],
    },
    dumbbell: {
      anim: "bounce",
      y: -2.5,
      origin: "12 17",
      // plates are narrow on the grid; the stroke gives them their visible width and ~1.5 corner radius
      els: [
        ["l", "path", { d: "M9.25 12h5.5" }],
        ["s", "path", { d: rr(3, 8.5, 1.5, 7, 0.75) }],
        ["s", "path", { d: rr(7.25, 7, 2, 10, 1) }],
        ["s", "path", { d: rr(14.75, 7, 2, 10, 1) }],
        ["s", "path", { d: rr(19.5, 8.5, 1.5, 7, 0.75) }],
      ],
    },
    footprints: {
      els: [
        ["s", "path", { d: hull([[7.5, 9.5, 2.75], [8, 13.25, 2]]), anim: "enter", y: 2 }],
        ["l", "path", { d: "M7 18.5h2.25", anim: "enter", y: 2 }],
        ["s", "path", { d: hull([[16.5, 5.5, 2.75], [16, 9.25, 2]]), anim: "enter", y: 2, delay: 0.16 }],
        ["l", "path", { d: "M14.75 14.5H17", anim: "enter", y: 2, delay: 0.16 }],
      ],
    },
    ear: {
      anim: "wiggle",
      deg: 9,
      origin: "9 19",
      els: [
        ["l", "path", { d: "M6 9.5a6 6 0 0 1 12 0c0 3-2.25 4.25-3.25 6S13.5 21 10 21a3 3 0 0 1-2.75-1.75" }],
        ["l", "path", { d: "M9.25 9.75a2.75 2.75 0 0 1 5.5 0c0 1.5-1.25 2.25-2.25 2.25" }],
      ],
    },
    frown: {
      els: [
        FACE,
        eye(9, { anim: "nudge", y: 1.25, delay: 0.06 }),
        eye(15, { anim: "nudge", y: 1.25, delay: 0.06 }),
        ["c", "path", { d: "M8.5 16.5a4.5 4.5 0 0 1 7 0", anim: "nudge", y: 1.5 }],
      ],
    },
    meh: {
      els: [
        FACE,
        eye(9, { anim: "blink" }),
        eye(15, { anim: "blink" }),
        ["c", "path", { d: "M9 15.25h6", anim: "nudge", x: 1.25, delay: 0.2 }],
      ],
    },
    laugh: {
      anim: "bounce",
      y: -2.5,
      origin: "12 21",
      els: [
        FACE,
        ["c", "path", { d: "M7.5 10.5c.5-1.5 2.5-1.5 3 0M13.5 10.5c.5-1.5 2.5-1.5 3 0" }],
        ["d", "path", { d: hull([[8.75, 13.75, 1], [15.25, 13.75, 1], [12, 14.75, 3.25]]), anim: "squash", origin: "12 13", delay: 0.12 }],
      ],
    },
    angry: {
      anim: "shake",
      x: 1.25,
      els: [
        FACE,
        ["c", "path", { d: "M7.75 7.25l3 1.25M16.25 7.25l-3 1.25" }],
        ["d", "circle", { cx: 9, cy: 11, r: 1.25 }],
        ["d", "circle", { cx: 15, cy: 11, r: 1.25 }],
        ["c", "path", { d: "M9 16.5c1.75-1.5 4.25-1.5 6 0" }],
      ],
    },
    skull: {
      anim: "wiggle",
      deg: 10,
      origin: "12 21",
      els: [
        ["s", "path", { d: "M7.5 16.15A8 8 0 1 1 16.5 16.15V19a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2Z" }],
        ["d", "circle", { cx: 9, cy: 11.25, r: 2 }],
        ["d", "circle", { cx: 15, cy: 11.25, r: 2 }],
        ["c", "path", { d: "M10.5 18v3M13.5 18v3" }],
      ],
    },
    bone: {
      // a dog shakes it
      anim: "wiggle",
      deg: 15,
      origin: "12 12",
      els: [["s", "path", { d: BONE, transform: "rotate(-45 12 12)" }]],
    },
    weight: {
      // dropped in, lands with a thud
      anim: "enter",
      y: -4,
      els: [
        ["l", "circle", { cx: 12, cy: 6.25, r: 2.75 }],
        ["s", "path", { d: soft([[6.25, 9.5, 2], [17.75, 9.5, 2], [20.5, 20.5, 2.25], [3.5, 20.5, 2.25]]), anim: "squash", origin: "12 20.5", delay: 0.45 }],
      ],
    },
    siren: {
      anim: "shake",
      x: 1,
      els: [
        ["s", "path", { d: "M6.5 17v-4.5a5.5 5.5 0 0 1 11 0V17Z" }],
        ["c", "path", { d: "M9.5 13a2.5 2.5 0 0 1 2.5-2.5" }],
        ["s", "path", { d: rr(4, 17, 16, 4, 1.5) }],
        ["l", "path", { d: "M12 2.5V4", anim: "pulse" }],
        ["l", "path", { d: "M5.25 5.25l1.1 1.1M18.75 5.25l-1.1 1.1", anim: "pulse", delay: 0.1 }],
        ["l", "path", { d: "M3 11.75h1.5M19.5 11.75H21", anim: "pulse", delay: 0.2 }],
      ],
    },
  });
})();
