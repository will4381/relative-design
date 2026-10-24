// Status icons: locks, visibility, marks, alerts, toggles, feedback.
(function () {
  const f = (v) => +v.toFixed(2);
  // Closed polygon with every corner filleted by a true arc of radius r (no sharp tips). rs: one radius or one per vertex.
  const roundPoly = (pts, rs) => {
    const n = pts.length;
    const unit = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
    return pts.map((p, i) => {
      const r = Array.isArray(rs) ? rs[i] : rs, a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      const u1 = unit(p, a), u2 = unit(p, b);
      const t = r / Math.tan(Math.acos(u1[0] * u2[0] + u1[1] * u2[1]) / 2);
      const cross = (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]);
      return `${i ? "L" : "M"}${f(p[0] + u1[0] * t)} ${f(p[1] + u1[1] * t)}A${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${f(p[0] + u2[0] * t)} ${f(p[1] + u2[1] * t)}`;
    }).join("") + "Z";
  };
  // Star-like ring of points alternating between radius R and r.
  const ring = (cx, cy, count, R, r, rot = -90) =>
    Array.from({ length: count * 2 }, (_, i) => {
      const a = ((rot + (i * 180) / count) * Math.PI) / 180, d = i % 2 ? r : R;
      return [cx + d * Math.cos(a), cy + d * Math.sin(a)];
    });

  // Lens with r=2 arcs at both corners, so the eye has no points.
  const EYE = "M4 10.27C6.6 8.77 8 5.75 12 5.75s5.4 3.02 8 4.52a2 2 0 0 1 0 3.46c-2.6 1.5-4 4.52-8 4.52s-5.4-3.02-8-4.52a2 2 0 0 1 0-3.46Z";
  const BELL = "M6 9.25a6 6 0 0 1 12 0V12l1.65 2.5a1 1 0 0 1-.83 1.5H5.18a1 1 0 0 1-.83-1.5L6 12Z";
  const BELL_CLAPPER = "M10 20.5c1.3.65 2.7.65 4 0";
  const SHIELD =
    "M11.25 3.3a2 2 0 0 1 1.5 0l6.2 2.45A1.6 1.6 0 0 1 20 7.25V11.5c0 4-3 7.1-6.7 9.1Q12 21.3 10.7 20.6C7 18.6 4 15.5 4 11.5V7.25a1.6 1.6 0 0 1 1.05-1.5Z";
  const HAND =
    "M5.5 10.5H8.5L11.1 4.75a1.9 1.9 0 0 1 3.55 1.2L13.9 9.75h4.35a2.5 2.5 0 0 1 2.45 2.95l-1.15 5.85A3 3 0 0 1 16.6 21H5.5Z";
  // Rounded rect as a path (rect x/y attrs are reserved for motion params).
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  const flip = "rotate(180 12 12)";
  const slash = ["k", "path", { d: "M3.5 3.5l17 17", anim: "draw" }];
  const HEART =
    "M10.7 19.1C4.9 15.2 3 12.2 3 8.9 3 6.1 5.1 4 7.8 4c1.8 0 3.3 1 4.2 2.5C12.9 5 14.4 4 16.2 4 18.9 4 21 6.1 21 8.9c0 3.3-1.9 6.3-7.7 10.2Q12 20 10.7 19.1Z";
  const PIN = "rotate(45 12 12) translate(0 -1)";

  Icons.define("status", {
    lock: {
      els: [
        // tugged: shackle lifts, body jolts a beat later
        ["l", "path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3", anim: "bounce", y: -2.5, origin: "12 10.5" }],
        ["s", "path", { d: rr(4.5, 10.5, 15, 10.5, 3), anim: "shake", x: 1, delay: 0.18 }],
        ["c", "path", { d: "M12 14.5v2.5", anim: "shake", x: 1, delay: 0.18 }],
      ],
    },
    unlock: {
      els: [
        ["l", "path", { d: "M8 10.5V7a4 4 0 0 1 7.75-1.4", anim: "tilt", deg: -30, origin: "8 10.5" }],
        ["s", "path", { d: rr(4.5, 10.5, 15, 10.5, 3) }],
        ["c", "path", { d: "M12 14.5v2.5" }],
      ],
    },
    eye: {
      els: [
        ["s", "path", { d: EYE }],
        // pupil glances left and springs back
        ["d", "circle", { cx: 12, cy: 12, r: 2.75, anim: "nudge", x: -2.5 }],
      ],
    },
    "eye-off": {
      els: [
        ["s", "path", { d: EYE }],
        ["k", "path", { d: "M3.5 3.5l17 17", anim: "draw", delay: 0.12 }],
        // pupil sits on top of the slash so the knockout doesn't erase it
        ["d", "circle", { cx: 12, cy: 12, r: 2.75, anim: "nudge", x: -2.5 }],
      ],
    },
    bookmark: {
      // ribbon gets tugged down and springs back
      els: [
        ["s", "path", { d: roundPoly([[5, 3], [19, 3], [19, 21.25], [12, 16.75], [5, 21.25]], [3, 3, 2, 1.5, 2]), anim: "nudge", y: 2.5 }],
      ],
    },
    star: {
      els: [["s", "path", { d: roundPoly(ring(12, 12.4, 5, 11.25, 5.3), [2, 1, 2, 1, 2, 1, 2, 1, 2, 1]), anim: "twinkle", origin: "12 12.4" }]],
    },
    heart: {
      els: [["s", "path", { d: HEART, anim: "heartbeat", s: 1.16, origin: "12 12" }]],
    },
    pin: {
      // pushed in along the needle
      anim: "nudge",
      x: -2,
      y: 2,
      els: [
        ["s", "path", { d: "M9 3.5h6a1 1 0 0 1 .9 1.4L15 7v3.5l2.7 2.4a1.2 1.2 0 0 1-.8 2.1H7.1a1.2 1.2 0 0 1-.8-2.1L9 10.5V7l-.9-2.1A1 1 0 0 1 9 3.5Z", transform: PIN }],
        ["l", "path", { d: "M12 15v6", transform: PIN }],
      ],
    },
    flag: {
      els: [
        ["s", "path", { d: "M5 4c2.5-1.25 5-1.25 7 0s4.5 1.25 7 0v9c-2.5 1.25-5 1.25-7 0s-4.5-1.25-7 0Z", anim: "squash", origin: "5 8.5" }],
        ["l", "path", { d: "M5 4v17" }],
      ],
    },
    bell: {
      els: [
        ["s", "path", { d: BELL, anim: "swing", deg: 16, origin: "12 3.25" }],
        ["l", "path", { d: BELL_CLAPPER, anim: "swing", deg: 22, origin: "12 3.25", delay: 0.08 }],
      ],
    },
    "bell-off": {
      els: [
        ["s", "path", { d: BELL }],
        ["l", "path", { d: BELL_CLAPPER }],
        slash,
      ],
    },
    "info-circle": {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M12 11v5.5", anim: "squash", origin: "12 16.5", delay: 0.14 }],
        ["d", "circle", { cx: 12, cy: 7.75, r: 1.25, anim: "bounce", y: -2.5 }],
      ],
    },
    "alert-triangle": {
      // the sign rocks on its base
      anim: "wiggle",
      deg: 9,
      origin: "12 19.75",
      els: [
        ["s", "path", { d: roundPoly([[12, 0.75], [23, 20], [1, 20]], 2.5) }],
        ["c", "path", { d: "M12 9.75v3.75" }],
        ["d", "circle", { cx: 12, cy: 16.5, r: 1.25 }],
      ],
    },
    "alert-circle": {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M12 7.5v5", anim: "shake", x: 1.5 }],
        ["d", "circle", { cx: 12, cy: 16.25, r: 1.25, anim: "shake", x: 1.5, delay: 0.06 }],
      ],
    },
    "help-circle": {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M9.5 9.5a2.5 2.5 0 1 1 3.6 2.25c-.65.35-1.1.9-1.1 1.6v.4", anim: "wiggle", deg: 12, origin: "12 16.75" }],
        ["d", "circle", { cx: 12, cy: 16.75, r: 1.25, anim: "bounce", y: -1.5, delay: 0.1 }],
      ],
    },
    shield: {
      els: [["s", "path", { d: SHIELD, anim: "pop", s: 1.14, origin: "12 12" }]],
    },
    "shield-check": {
      els: [
        ["s", "path", { d: SHIELD }],
        ["c", "path", { d: "M8.75 12.25l2.25 2.25 4.25-4.5", anim: "draw" }],
      ],
    },
    key: {
      // turned in the lock around the bow
      anim: "tilt",
      deg: 30,
      origin: "8.25 8.25",
      els: [
        ["s", "circle", { cx: 8.25, cy: 8.25, r: 5.25 }],
        ["d", "circle", { cx: 8.25, cy: 8.25, r: 1.6 }],
        ["l", "path", { d: "M11.96 11.96l6.79 6.79" }],
        ["l", "path", { d: "M18.75 18.75l2.12-2.12" }],
        ["l", "path", { d: "M15.25 15.25l2.12-2.12" }],
      ],
    },
    "toggle-on": {
      els: [
        ["s", "path", { d: rr(3, 6.5, 18, 11, 5.5) }],
        ["d", "circle", { cx: 15.5, cy: 12, r: 2.75, anim: "nudge", x: -3 }],
      ],
    },
    "toggle-off": {
      els: [
        ["s", "path", { d: rr(3, 6.5, 18, 11, 5.5) }],
        ["c", "circle", { cx: 8.5, cy: 12, r: 2.25, anim: "nudge", x: 3 }],
      ],
    },
    loader: {
      els: [["l", "path", { d: "M21 12a9 9 0 1 1-9-9", anim: "spin", deg: 360, origin: "12 12" }]],
    },
    "thumbs-up": {
      anim: "tilt",
      deg: -15,
      origin: "5 21",
      els: [
        ["s", "path", { d: HAND }],
        ["k", "path", { d: rr(3, 10.5, 4, 10.5, 1.5) }],
      ],
    },
    "thumbs-down": {
      anim: "tilt",
      deg: -15,
      origin: "19 3",
      els: [
        ["s", "path", { d: HAND, transform: flip }],
        ["k", "path", { d: rr(3, 10.5, 4, 10.5, 1.5), transform: flip }],
      ],
    },
    ban: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M6.35 6.35l11.3 11.3", anim: "draw" }],
      ],
    },
    verified: {
      els: [
        ["s", "path", { d: roundPoly(ring(12, 12, 8, 10, 7.6, -90), [2, 1.5, 2, 1.5, 2, 1.5, 2, 1.5, 2, 1.5, 2, 1.5, 2, 1.5, 2, 1.5]), anim: "turn", deg: 45, origin: "12 12" }],
        ["c", "path", { d: "M8.75 12.25l2.25 2.25 4.25-4.5", anim: "draw", delay: 0.15 }],
      ],
    },
    fingerprint: {
      els: [
        ["l", "path", { d: "M3.5 15.5V12a8.5 8.5 0 0 1 15.4-5", anim: "draw" }],
        ["l", "path", { d: "M20.5 11v2.5c0 2.6-.6 5-1.75 7", anim: "draw", delay: 0.08 }],
        ["l", "path", { d: "M7.5 19V12a4.5 4.5 0 0 1 9 0v2c0 2.2-.6 4.3-1.75 6", anim: "draw", delay: 0.16 }],
        ["l", "path", { d: "M12 12v2.5c0 2-.6 4-1.75 5.75", anim: "draw", delay: 0.24 }],
      ],
    },
    "circle-dashed": {
      // 8 equal dashes (pathLength 24, dash 1 gap 2): one period = 45deg, so the loop is seamless
      els: [
        ["l", "circle", { cx: 12, cy: 12, r: 9, pathLength: 24, "stroke-dasharray": "1 2", "stroke-dashoffset": 0.5, anim: "spin", deg: 45, origin: "12 12" }],
      ],
    },
  });
})();
