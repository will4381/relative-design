// Commerce: time, shopping, places. Block-scoped so helper consts never clash with sibling files.
{
// Rounded rect as a path (x/y attrs are reserved for motion params).
const rr = (x, y, w, h, r) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
// Closed polygon with every corner rounded by a true arc. pts: [[x, y, r], ...] (r clamps to half the edge).
const poly = (pts) => {
  const f = (n) => +n.toFixed(2);
  let d = "";
  pts.forEach(([x, y, r], i) => {
    const [ax, ay] = pts[(i + pts.length - 1) % pts.length], [bx, by] = pts[(i + 1) % pts.length];
    const la = Math.hypot(ax - x, ay - y), lb = Math.hypot(bx - x, by - y);
    const ux = (ax - x) / la, uy = (ay - y) / la, vx = (bx - x) / lb, vy = (by - y) / lb;
    const half = Math.acos(Math.max(-1, Math.min(1, ux * vx + uy * vy))) / 2;
    const t = Math.min(r / Math.tan(half), la / 2, lb / 2), rr = t * Math.tan(half);
    const sweep = (x - ax) * (by - y) - (y - ay) * (bx - x) > 0 ? 1 : 0;
    d += `${i ? "L" : "M"}${f(x + ux * t)} ${f(y + uy * t)}A${f(rr)} ${f(rr)} 0 0 ${sweep} ${f(x + vx * t)} ${f(y + vy * t)}`;
  });
  return d + "Z";
};
const CAL_BODY = ["s", "path", { d: rr(3.5, 4.75, 17, 15.75, 4) }];
const CAL_RINGS = ["l", "path", { d: "M8 3v3.5M16 3v3.5" }];
const CAL_RULE = ["l", "path", { d: "M3.5 9.5h17" }];
const PLANE = poly([[12, 3.25, 1.75], [13.75, 5.25, 1.5], [13.75, 9.25, 1], [20.5, 13.5, 1.5], [20.5, 15.5, 1.25], [13.75, 14.5, 1], [13.75, 17.75, 1], [15.75, 19.25, 1.25], [15.75, 20.5, 1], [12, 19.5, 1], [8.25, 20.5, 1], [8.25, 19.25, 1.25], [10.25, 17.75, 1], [10.25, 14.5, 1], [3.5, 15.5, 1.25], [3.5, 13.5, 1.5], [10.25, 9.25, 1], [10.25, 5.25, 1.5]]);

Icons.define("commerce", {
  clock: {
    els: [
      ["s", "circle", { cx: 12, cy: 12, r: 9 }],
      ["c", "path", { d: "M12 7.5V12l3 2", anim: "turn", origin: "12 12", deg: 360 }],
    ],
  },
  calendar: {
    els: [
      CAL_BODY, CAL_RINGS, CAL_RULE,
      ["d", "circle", { cx: 8, cy: 13.5, r: 1.25, anim: "grow" }],
      ["d", "circle", { cx: 12, cy: 13.5, r: 1.25, anim: "grow", delay: 0.06 }],
      ["d", "circle", { cx: 16, cy: 13.5, r: 1.25, anim: "grow", delay: 0.12 }],
      ["d", "circle", { cx: 8, cy: 17, r: 1.25, anim: "grow", delay: 0.18 }],
      ["d", "circle", { cx: 12, cy: 17, r: 1.25, anim: "grow", delay: 0.24 }],
    ],
  },
  "calendar-check": {
    els: [CAL_BODY, CAL_RINGS, CAL_RULE, ["c", "path", { d: "M8.75 14.75 11 17l4.25-4.5", anim: "draw" }]],
  },
  "calendar-plus": {
    els: [CAL_BODY, CAL_RINGS, CAL_RULE, ["c", "path", { d: "M12 12v5.5M9.25 14.75h5.5", anim: "grow" }]],
  },
  alarm: {
    anim: "shake",
    x: 1.25,
    els: [
      ["s", "circle", { cx: 12, cy: 13.5, r: 7.5 }],
      ["c", "path", { d: "M12 10v3.5l2.5 1.5" }],
      ["l", "path", { d: "M3 6l3-3", anim: "wiggle", deg: 20, origin: "6 9" }],
      ["l", "path", { d: "M21 6l-3-3", anim: "wiggle", deg: -20, origin: "18 9", delay: 0.06 }],
    ],
  },
  hourglass: {
    anim: "turn",
    origin: "12 12",
    deg: 180,
    els: [
      ["s", "path", { d: "M7.5 3h9v2.5c0 1.7-1 3.1-2.3 4L13 10.5c-.9.7-.9 2.3 0 3l1.2 1c1.3.9 2.3 2.3 2.3 4V21h-9v-2.5c0-1.7 1-3.1 2.3-4l1.2-1c.9-.7.9-2.3 0-3L9.8 9.5c-1.3-.9-2.3-2.3-2.3-4Z" }],
      ["l", "path", { d: "M5.5 3h13M5.5 21h13" }],
    ],
  },
  stopwatch: {
    els: [
      ["s", "circle", { cx: 12, cy: 13.5, r: 7.5 }],
      ["l", "path", { d: "M12 3v3M10 3h4", anim: "nudge", y: 1.5 }],
      ["c", "path", { d: "M12 13.5V10", anim: "turn", deg: 360, origin: "12 13.5", delay: 0.1 }],
    ],
  },
  history: {
    els: [
      // the arrow ring rewinds a full turn around the face; the hands stay put
      ["l", "path", { d: "M3.5 9A9 9 0 1 1 3.3 14.3", anim: "turn", deg: -360, origin: "12 12" }],
      ["l", "path", { d: "M3.5 4.5V9H8", anim: "turn", deg: -360, origin: "12 12" }],
      ["l", "path", { d: "M12 7.5V12l3 2" }],
    ],
  },
  cart: {
    anim: "nudge",
    x: 2.5,
    els: [
      ["s", "path", { d: "M5 6.5h15a1 1 0 0 1 .97 1.24l-1.4 5.6A2 2 0 0 1 17.63 15H9.2a2 2 0 0 1-1.95-1.55Z" }],
      ["l", "path", { d: "M2.5 3.5h1a1 1 0 0 1 .97.75L5 6.5" }],
      ["s", "circle", { cx: 9.5, cy: 19.75, r: 1 }],
      ["s", "circle", { cx: 17, cy: 19.75, r: 1 }],
    ],
  },
  bag: {
    anim: "swing",
    origin: "12 4",
    deg: 12,
    els: [
      ["s", "path", { d: "M7 7.5h10a1.5 1.5 0 0 1 1.5 1.4l.9 9.4a2.5 2.5 0 0 1-2.5 2.7H7.1a2.5 2.5 0 0 1-2.5-2.7l.9-9.4A1.5 1.5 0 0 1 7 7.5Z" }],
      ["l", "path", { d: "M9 7.5V7a3 3 0 0 1 6 0v.5" }],
    ],
  },
  "credit-card": {
    anim: "tilt",
    deg: -15,
    origin: "3 18.5",
    els: [
      ["s", "path", { d: rr(3, 5.5, 18, 13, 3) }],
      ["l", "path", { d: "M3 9.75h18" }],
      ["c", "path", { d: "M7 14.5h3" }],
    ],
  },
  wallet: {
    els: [
      ["s", "path", { d: rr(3.5, 6.5, 17, 14, 4) }],
      ["l", "path", { d: "M6.5 6.5 15 3.75a2 2 0 0 1 2.5 1.9v.85", anim: "tilt", deg: -18, origin: "6.5 6.5" }],
      ["k", "path", { d: rr(14, 10.5, 7, 6, 2), anim: "nudge", x: 1.5, delay: 0.1 }],
      ["d", "circle", { cx: 17.25, cy: 13.5, r: 1.1, anim: "nudge", x: 1.5, delay: 0.1 }],
    ],
  },
  coin: {
    anim: "bounce",
    origin: "12 21",
    els: [
      ["s", "circle", { cx: 12, cy: 12, r: 9 }],
      ["c", "path", { d: "M14.5 9.5A2.5 2 0 0 0 12 7.75h-.25a2.25 2.125 0 0 0 0 4.25h.5a2.25 2.125 0 0 1 0 4.25H12a2.5 2 0 0 1-2.5-1.75M12 6v1.75M12 16.25V18" }],
    ],
  },
  tag: {
    anim: "swing",
    origin: "8 8",
    deg: 14,
    els: [
      ["s", "path", { d: poly([[3.5, 3.5, 2], [11, 3.5, 2], [20.5, 13, 3], [13, 20.5, 2], [3.5, 11, 2]]) }],
      ["d", "circle", { cx: 8, cy: 8, r: 1.5 }],
    ],
  },
  receipt: {
    els: [
      ["s", "path", { d: "M7 3h10a2.5 2.5 0 0 1 2.5 2.5V19.5a1.5 1.5 0 0 1-3 0a1.5 1.5 0 0 1-3 0a1.5 1.5 0 0 1-3 0a1.5 1.5 0 0 1-3 0a1.5 1.5 0 0 1-3 0V5.5A2.5 2.5 0 0 1 7 3Z" }],
      ["c", "path", { d: "M8.5 8.5h7", anim: "draw" }],
      ["c", "path", { d: "M8.5 13h4.5", anim: "draw", delay: 0.12 }],
    ],
  },
  gift: {
    els: [
      ["s", "path", { d: rr(4.5, 10, 15, 11, 2.5) }],
      ["c", "path", { d: "M12 12v9" }],
      ["k", "path", { d: rr(3, 7.5, 18, 4.5, 1.5), anim: "bounce", y: -3, origin: "12 12" }],
      ["c", "path", { d: "M12 7.5V12", anim: "bounce", y: -3, origin: "12 12" }],
      ["l", "path", { d: "M12 7.5V5.6A2.25 2.25 0 1 0 9.75 7.5H12Zm0 0V5.6a2.25 2.25 0 1 1 2.25 1.9H12Z", anim: "bounce", y: -3.5, origin: "12 12", delay: 0.05 }],
    ],
  },
  store: {
    els: [
      ["s", "path", { d: rr(5, 9, 14, 12, 2.5) }],
      ["c", "path", { d: "M10 21v-3a2 2 0 0 1 4 0v3" }],
      ["k", "path", { d: "M6.2 3.5h11.6a1.5 1.5 0 0 1 1.4 1L21 9.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 9.5l1.8-5a1.5 1.5 0 0 1 1.4-1Z", anim: "squash", origin: "12 3.5" }],
    ],
  },
  truck: {
    anim: "nudge",
    x: 2.5,
    els: [
      ["s", "path", { d: rr(3, 4, 10.25, 11.5, 2.5), anim: "bounce", y: -1, origin: "12 15.5", delay: 0.12 }],
      ["s", "path", { d: poly([[16, 8.5, 1], [18.25, 8.5, 1.5], [21, 12.5, 1.5], [21, 15.5, 1], [16, 15.5, 1]]), anim: "bounce", y: -1, origin: "12 15.5", delay: 0.08 }],
      ["k", "circle", { cx: 7.75, cy: 18.75, r: 2 }],
      ["k", "circle", { cx: 18.25, cy: 18.75, r: 2 }],
    ],
  },
  percent: {
    els: [
      ["l", "path", { d: "M18.5 5.5 5.5 18.5" }],
      ["s", "circle", { cx: 7.5, cy: 7.5, r: 2.5, anim: "pop", s: 1.2 }],
      ["s", "circle", { cx: 16.5, cy: 16.5, r: 2.5, anim: "pop", s: 1.2, delay: 0.12 }],
    ],
  },
  ticket: {
    anim: "wiggle",
    deg: 10,
    els: [
      ["s", "path", { d: "M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v2a2.5 2.5 0 0 0 0 5v2a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-2a2.5 2.5 0 0 0 0-5Z" }],
      ["c", "path", { d: "M9.5 8.5v7" }],
    ],
  },
  bank: {
    els: [
      ["s", "path", { d: poly([[12, 3, 2.5], [20.5, 7.5, 1.5], [20.5, 9, 1], [3.5, 9, 1], [3.5, 7.5, 1.5]]) }],
      ["l", "path", { d: "M6.5 12.5v4.5", anim: "grow", origin: "6.5 17" }],
      ["l", "path", { d: "M12 12.5v4.5", anim: "grow", origin: "12 17", delay: 0.08 }],
      ["l", "path", { d: "M17.5 12.5v4.5", anim: "grow", origin: "17.5 17", delay: 0.16 }],
      ["l", "path", { d: "M3.5 20.5h17" }],
    ],
  },
  "piggy-bank": {
    // side view facing right: round body, nub snout, ear, two legs; a coin drops into the slot on hover
    els: [
      ["s", "ellipse", { cx: 11.5, cy: 14.25, rx: 8, ry: 5.75, anim: "squash", origin: "11.5 21.5", delay: 0.35 }],
      ["l", "path", { d: "M21 13v2.25" }],
      ["l", "path", { d: "M14 8.9 15.5 6.25 17 9.6" }],
      ["l", "path", { d: "M8 19.5v2M15 19.5v2" }],
      ["d", "circle", { cx: 16, cy: 12.25, r: 1 }],
      ["c", "path", { d: "M9.25 11h2.5" }],
      ["s", "circle", { cx: 10.5, cy: 4.25, r: 1.75, anim: "enter", y: -4 }],
    ],
  },
  globe: {
    els: [
      ["s", "circle", { cx: 12, cy: 12, r: 9 }],
      // chords end on the circle, so rotating about the centre keeps them meeting the outline
      ["c", "ellipse", { cx: 12, cy: 12, rx: 4, ry: 9, anim: "wiggle", deg: 8, origin: "12 12" }],
      ["c", "path", { d: "M3.71 8.5Q12 10.5 20.29 8.5M3.71 15.5Q12 17.5 20.29 15.5", anim: "wiggle", deg: 8, origin: "12 12" }],
    ],
  },
  map: {
    anim: "squash",
    els: [
      ["s", "path", { d: "M3.5 6.6a1.5 1.5 0 0 1 1-1.4l3.6-1.3a2 2 0 0 1 1.4 0l5 1.8a2 2 0 0 0 1.4 0l2.6-.9a1.5 1.5 0 0 1 2 1.4v11.2a1.5 1.5 0 0 1-1 1.4l-3.6 1.3a2 2 0 0 1-1.4 0l-5-1.8a2 2 0 0 0-1.4 0l-2.6.9a1.5 1.5 0 0 1-2-1.4Z" }],
      ["c", "path", { d: "M8.8 4v14.1M15.2 5.9V20" }],
    ],
  },
  "map-pin": {
    anim: "bounce",
    origin: "12 21",
    els: [
      ["s", "path", { d: "M10.6 19.7C7.6 16.9 5 13.8 5 10a7 7 0 0 1 14 0c0 3.8-2.6 6.9-5.6 9.7a2 2 0 0 1-2.8 0Z" }],
      ["d", "circle", { cx: 12, cy: 10, r: 2.75 }],
    ],
  },
  compass: {
    els: [
      ["s", "circle", { cx: 12, cy: 12, r: 9 }],
      ["c", "path", { d: poly([[17.5, 6.5, 1.5], [13.75, 13.75, 1], [6.5, 17.5, 1.5], [10.25, 10.25, 1]]), anim: "wiggle", deg: 18, origin: "12 12" }],
    ],
  },
  navigation: {
    anim: "nudge",
    x: 2,
    y: -2,
    els: [["s", "path", { d: poly([[22, 2, 2], [2.25, 8, 1.5], [11, 13, 1], [16, 21.75, 1.5]]) }]],
  },
  building: {
    els: [
      ["s", "path", { d: "M7.5 3h9A2.5 2.5 0 0 1 19 5.5V21H5V5.5A2.5 2.5 0 0 1 7.5 3Z" }],
      ["l", "path", { d: "M3 21h18" }],
      ["c", "path", { d: "M9.5 8h5", anim: "draw" }],
      ["c", "path", { d: "M9.5 12.5h5", anim: "draw", delay: 0.12 }],
      ["c", "path", { d: "M10.5 21v-2.5a1.5 1.5 0 0 1 3 0V21" }],
    ],
  },
  plane: {
    anim: "nudge",
    x: 2.5,
    y: -2.5,
    els: [["s", "path", { d: PLANE, transform: "rotate(45 12 12)" }]],
  },
  car: {
    els: [
      ["l", "path", { d: "M5.5 10.5l1.4-4.2A2 2 0 0 1 8.8 5h6.4a2 2 0 0 1 1.9 1.3l1.4 4.2", anim: "bounce", y: -1.5, origin: "12 17.5" }],
      ["s", "path", { d: rr(3.5, 10.5, 17, 7, 2.5), anim: "bounce", y: -1.5, origin: "12 17.5" }],
      ["s", "path", { d: "M5.5 17.5V19a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.5ZM15.5 17.5V19a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.5Z" }],
      ["d", "circle", { cx: 7.5, cy: 14, r: 1.25, anim: "bounce", y: -1.5, origin: "12 17.5" }],
      ["d", "circle", { cx: 16.5, cy: 14, r: 1.25, anim: "bounce", y: -1.5, origin: "12 17.5" }],
    ],
  },
});
}
