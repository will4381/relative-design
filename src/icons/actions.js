// Actions: more arrows, chevrons, boxed actions. Arrow heads match arrows.js (5-unit straight heads,
// 4.5 on corner arrows, 4.25 arms on curved ones).
(function () {
  const f = (v) => +v.toFixed(2);
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
  // Rounded rect as a path (x/y attrs are reserved for motion params).
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  // Circular arrow around (cx, cy) from angle a0 to a1 (degrees, y-down; a1 > a0 = clockwise),
  // 90° open head at a1 aimed along the chord of the last 25° so it follows the curve.
  const pt = (a, r, cx, cy) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const arc = (a0, a1, r = 8, len = 4.25, cx = 12, cy = 12) => {
    const [x0, y0] = pt(a0, r, cx, cy), [x1, y1] = pt(a1, r, cx, cy), cw = a1 > a0;
    const [xb, yb] = pt(a1 - (cw ? 25 : -25), r, cx, cy);
    const m = Math.hypot(x1 - xb, y1 - yb), vx = (xb - x1) / m, vy = (yb - y1) / m, c = Math.SQRT1_2;
    const arm = (s) => `${f(x1 + len * c * (vx - s * vy))} ${f(y1 + len * c * (s * vx + vy))}`;
    return `M${f(x0)} ${f(y0)}A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${cw ? 1 : 0} ${f(x1)} ${f(y1)}` +
      `M${arm(1)}L${f(x1)} ${f(y1)}L${arm(-1)}`;
  };

  const N = (x, y, delay) => ({ anim: "nudge", x, y, ...(delay ? { delay } : {}) });
  const SQ = rr(3.5, 3.5, 17, 17, 4);
  const STEP = [[4.5, 5, 1.5], [4.5, 19, 1.5], [15, 12, 1.5]];
  const flipX = (pts) => pts.map(([x, y, r]) => [24 - x, y, r]);
  // Box with a gap in its lid for the arrow to pass through.
  const BOX = "M9 9.5H7a3.5 3.5 0 0 0-3.5 3.5v4A3.5 3.5 0 0 0 7 20.5h10a3.5 3.5 0 0 0 3.5-3.5v-4A3.5 3.5 0 0 0 17 9.5h-2";
  const ARCHIVE_BODY = "M4.5 9h15v8a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3Z";
  const ARCHIVE_LID = "M4.5 4h15A1.5 1.5 0 0 1 21 5.5v2A1.5 1.5 0 0 1 19.5 9h-15A1.5 1.5 0 0 1 3 7.5v-2A1.5 1.5 0 0 1 4.5 4Z";

  Icons.define("actions", {
    "arrow-up-left": { els: [["l", "path", { d: "M17.5 17.5l-11-11M15 6.5H6.5V15", ...N(-2.25, -2.25) }]] },
    "arrow-down-right": { els: [["l", "path", { d: "M6.5 6.5l11 11M9 17.5h8.5V9", ...N(2.25, 2.25) }]] },
    // two halves overlap in the middle, so pulling apart stretches the shaft without a gap
    "arrow-left-right": {
      els: [
        ["l", "path", { d: "M14 12H4.5M9.5 7l-5 5 5 5", ...N(-2, 0) }],
        ["l", "path", { d: "M10 12h9.5M14.5 7l5 5-5 5", ...N(2, 0) }],
      ],
    },
    "arrow-up-down": {
      els: [
        ["l", "path", { d: "M12 14V4.5M7 9.5l5-5 5 5", ...N(0, -2) }],
        ["l", "path", { d: "M12 10v9.5M7 14.5l5 5 5-5", ...N(0, 2) }],
      ],
    },
    "corner-up-left": { els: [["l", "path", { d: "M19 19.5v-6a4 4 0 0 0-4-4H4.5M9 5L4.5 9.5 9 14", ...N(-2.5, 0) }]] },
    "corner-up-right": { els: [["l", "path", { d: "M5 19.5v-6a4 4 0 0 1 4-4h10.5M15 5l4.5 4.5L15 14", ...N(2.5, 0) }]] },
    "corner-down-left": { els: [["l", "path", { d: "M19 4.5v6a4 4 0 0 1-4 4H4.5M9 10l-4.5 4.5L9 19", ...N(-2.5, 0) }]] },

    // leading chevron goes first, the trailing one follows
    "chevrons-up": {
      els: [
        ["l", "path", { d: "M6.5 18.25l5.5-5.5 5.5 5.5", ...N(0, -2.5, 0.08) }],
        ["l", "path", { d: "M6.5 11.25l5.5-5.5 5.5 5.5", ...N(0, -2.5) }],
      ],
    },
    "chevrons-down": {
      els: [
        ["l", "path", { d: "M6.5 5.75l5.5 5.5 5.5-5.5", ...N(0, 2.5, 0.08) }],
        ["l", "path", { d: "M6.5 12.75l5.5 5.5 5.5-5.5", ...N(0, 2.5) }],
      ],
    },
    // chevron runs up to the wall, the wall gives a little
    "chevron-first": {
      els: [
        ["l", "path", { d: "M17.5 6l-6 6 6 6", ...N(-2, 0) }],
        ["l", "path", { d: "M6.5 6v12", ...N(-1, 0, 0.1) }],
      ],
    },
    "chevron-last": {
      els: [
        ["l", "path", { d: "M6.5 6l6 6-6 6", ...N(2, 0) }],
        ["l", "path", { d: "M17.5 6v12", ...N(1, 0, 0.1) }],
      ],
    },
    "reply-all": {
      els: [
        ["l", "path", { d: "M7.5 5L3 9.5 7.5 14", ...N(-2, 0) }],
        ["l", "path", { d: "M14 5L9.5 9.5 14 14M9.5 9.5H14a6 6 0 0 1 6 6v4", ...N(-2, 0, 0.08) }],
      ],
    },
    // a bar marks where you were; the triangle steps off, the bar follows
    "step-forward": {
      els: [
        ["s", "path", { d: soft(STEP.map(([x, y, r]) => [x + 5, y, r])), ...N(2.5, 0) }],
        ["l", "path", { d: "M4.5 5v14", ...N(1.5, 0, 0.12) }],
      ],
    },
    "step-back": {
      els: [
        ["s", "path", { d: soft(flipX(STEP.map(([x, y, r]) => [x + 5, y, r]))), ...N(-2.5, 0) }],
        ["l", "path", { d: "M19.5 5v14", ...N(-1.5, 0, 0.12) }],
      ],
    },

    "check-check": {
      els: [
        ["l", "path", { d: "M3 12.5l4.5 4.5L17 7.5", anim: "draw" }],
        ["l", "path", { d: "M13.25 16.25l.75.75 7-7", anim: "draw", delay: 0.18 }],
      ],
    },
    "filter-x": {
      els: [
        ["s", "path", { d: soft([[3, 4.5, 1.75], [16, 4.5, 1.75], [10.75, 10.75, 1.5], [10.75, 20, 1.25], [7.25, 20, 1.25], [7.25, 10.75, 1.5]]), anim: "squash", origin: "9.5 4.5" }],
        ["l", "path", { d: "M15 14l5 5M20 14l-5 5", anim: "turn", deg: 90, origin: "17.5 16.5", delay: 0.06 }],
      ],
    },
    delete: {
      els: [
        ["s", "path", { d: soft([[3, 12, 2], [8.5, 5, 2.5], [21, 5, 3.5], [21, 19, 3.5], [8.5, 19, 2.5]]) }],
        ["c", "path", { d: "M12 9.5l5 5M17 9.5l-5 5", anim: "shake", x: 1.25 }],
      ],
    },
    // old box top-left, new box bottom-right, arrows trade places along the circle
    replace: {
      els: [
        ["s", "path", { d: rr(3.5, 3.5, 6.5, 6.5, 2) }],
        ["s", "path", { d: rr(14, 14, 6.5, 6.5, 2) }],
        ["l", "path", { d: arc(-80, -12, 7.5, 3.5), ...N(0.4, 1.25) }],
        ["l", "path", { d: arc(100, 168, 7.5, 3.5), ...N(-0.4, -1.25) }],
      ],
    },
    import: {
      els: [
        ["l", "path", { d: "M12 3v12M8.5 11.5L12 15l3.5-3.5", ...N(0, 2.5) }],
        ["l", "path", { d: BOX, anim: "squash", origin: "12 20.5", delay: 0.2 }],
      ],
    },
    export: {
      els: [
        ["l", "path", { d: "M12 15V3M8.5 6.5L12 3l3.5 3.5", ...N(0, -3) }],
        ["l", "path", { d: BOX }],
      ],
    },
    "archive-restore": {
      els: [
        ["s", "path", { d: ARCHIVE_BODY }],
        ["c", "path", { d: "M12 17.25V12.5M9.75 14.75L12 12.5l2.25 2.25", ...N(0, -1, 0.1) }],
        ["k", "path", { d: ARCHIVE_LID, anim: "bounce", y: -2.5, origin: "12 9" }],
      ],
    },
    "copy-check": {
      els: [
        ["s", "path", { d: rr(3.5, 3.5, 12, 12, 3), ...N(-1.5, -1.5) }],
        ["k", "path", { d: rr(8.5, 8.5, 12, 12, 3) }],
        ["c", "path", { d: "M11.75 14.75l2 2 3.75-3.75", anim: "draw", delay: 0.12 }],
      ],
    },
    "plus-square": {
      els: [
        ["s", "path", { d: SQ }],
        ["c", "path", { d: "M12 8v8M8 12h8", anim: "turn", deg: 90, origin: "12 12" }],
      ],
    },
    "minus-square": {
      els: [
        ["s", "path", { d: SQ }],
        ["c", "path", { d: "M8 12h8", anim: "draw" }],
      ],
    },
    "x-square": {
      els: [
        ["s", "path", { d: SQ }],
        ["c", "path", { d: "M9.25 9.25l5.5 5.5M14.75 9.25l-5.5 5.5", anim: "turn", deg: 90, origin: "12 12" }],
      ],
    },
    // mirror of refresh: two arcs 180° apart, half turn back lands on the rest pose
    "refresh-ccw": {
      anim: "turn",
      deg: -180,
      origin: "12 12",
      els: [
        ["l", "path", { d: arc(355, 215) }],
        ["l", "path", { d: arc(175, 35) }],
      ],
    },
    // loop round clockwise, then shoot off along the top
    "iteration-cw": {
      anim: "tilt",
      deg: 20,
      origin: "10 13.5",
      els: [["l", "path", { d: "M16.4 14.63A6.5 6.5 0 1 1 10 7h10.5M16.5 3l4 4-4 4", ...N(1.5, 0) }]],
    },
    // pointer taps in toward the click point, the rays burst out from it
    "mouse-pointer-click": {
      els: [
        ["s", "path", { d: soft([[8, 8, 1.75], [19.5, 16.25, 1.5], [14.25, 16.25, 0.75], [16.25, 20.25, 1.25], [13.25, 21, 1.25], [11.25, 17, 0.75], [8, 20, 1.5]]), ...N(-1, -1) }],
        ["l", "path", { d: "M8 3v2", anim: "pop", s: 1.3, origin: "8 8", delay: 0.14 }],
        ["l", "path", { d: "M4.5 4.5L6 6", anim: "pop", s: 1.3, origin: "8 8", delay: 0.18 }],
        ["l", "path", { d: "M3 8h2", anim: "pop", s: 1.3, origin: "8 8", delay: 0.22 }],
      ],
    },
  });
})();
