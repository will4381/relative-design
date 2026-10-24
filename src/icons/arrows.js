// Arrows, chevrons, rotations. All strokes are open `l` glyphs unless they sit in a container.
{
  // Circular arrow around (12,12): arc from angle a0 to a1 (degrees, SVG y-down; a1 > a0 = clockwise)
  // with a 90° open head at a1, aimed along the chord of the last 25° so it follows the curve.
  const pt = (a, r) => [12 + r * Math.cos((a * Math.PI) / 180), 12 + r * Math.sin((a * Math.PI) / 180)];
  const f = (n) => +n.toFixed(2);
  const arc = (a0, a1, r = 8, len = 4.25) => {
    const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r), cw = a1 > a0;
    const [xb, yb] = pt(a1 - (cw ? 25 : -25), r);
    const m = Math.hypot(x1 - xb, y1 - yb), vx = (xb - x1) / m, vy = (yb - y1) / m, c = Math.SQRT1_2;
    const arm = (s) => `${f(x1 + len * c * (vx - s * vy))} ${f(y1 + len * c * (s * vx + vy))}`;
    return `M${f(x0)} ${f(y0)}A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${cw ? 1 : 0} ${f(x1)} ${f(y1)}` +
      `M${arm(1)}L${f(x1)} ${f(y1)}L${arm(-1)}`;
  };

  const N = (dx, dy) => ({ anim: "nudge", x: dx, y: dy });
  Icons.define("arrows", {
    "arrow-up": { els: [["l", "path", { d: "M12 19.5v-15M7 9.5l5-5 5 5", ...N(0, -3) }]] },
    "arrow-down": { els: [["l", "path", { d: "M12 4.5v15M7 14.5l5 5 5-5", ...N(0, 3) }]] },
    "arrow-left": { els: [["l", "path", { d: "M19.5 12h-15M9.5 7l-5 5 5 5", ...N(-3, 0) }]] },
    "arrow-right": { els: [["l", "path", { d: "M4.5 12h15M14.5 7l5 5-5 5", ...N(3, 0) }]] },
    "arrow-up-right": { els: [["l", "path", { d: "M6.5 17.5l11-11M9 6.5h8.5V15", ...N(2.25, -2.25) }]] },
    "arrow-down-left": { els: [["l", "path", { d: "M17.5 6.5l-11 11M15 17.5H6.5V9", ...N(-2.25, 2.25) }]] },

    "chevron-up": { els: [["l", "path", { d: "M6 15l6-6 6 6", ...N(0, -2.5) }]] },
    "chevron-down": { els: [["l", "path", { d: "M6 9l6 6 6-6", ...N(0, 2.5) }]] },
    "chevron-left": { els: [["l", "path", { d: "M15 6l-6 6 6 6", ...N(-2.5, 0) }]] },
    "chevron-right": { els: [["l", "path", { d: "M9 6l6 6-6 6", ...N(2.5, 0) }]] },
    "chevrons-up-down": {
      els: [
        ["l", "path", { d: "M7.5 9l4.5-4.5L16.5 9", ...N(0, -2) }],
        ["l", "path", { d: "M7.5 15l4.5 4.5 4.5-4.5", ...N(0, 2) }],
      ],
    },
    // leading chevron goes first, the trailing one follows
    "chevron-double-right": {
      els: [
        ["l", "path", { d: "M5.75 6.5l5.5 5.5-5.5 5.5", ...N(2.5, 0), delay: 0.08 }],
        ["l", "path", { d: "M12.75 6.5l5.5 5.5-5.5 5.5", ...N(2.5, 0) }],
      ],
    },
    "chevron-double-left": {
      els: [
        ["l", "path", { d: "M18.25 6.5L12.75 12l5.5 5.5", ...N(-2.5, 0), delay: 0.08 }],
        ["l", "path", { d: "M11.25 6.5L5.75 12l5.5 5.5", ...N(-2.5, 0) }],
      ],
    },

    "arrow-circle-right": {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M7.5 12h8.5M12.75 8.5L16.25 12l-3.5 3.5", ...N(2.5, 0) }],
      ],
    },
    "arrow-circle-up": {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: "M12 16.5V8M8.5 11.25L12 7.75l3.5 3.5", ...N(0, -2.5) }],
      ],
    },

    // two arcs are 180° apart, so a half turn lands on the rest pose
    refresh: {
      anim: "turn",
      deg: 180,
      origin: "12 12",
      els: [
        ["l", "path", { d: arc(185, 325) }],
        ["l", "path", { d: arc(5, 145) }],
      ],
    },
    "rotate-left": { anim: "tilt", deg: -30, origin: "12 12", els: [["l", "path", { d: arc(145, -145) }]] },
    "rotate-right": { anim: "tilt", deg: 30, origin: "12 12", els: [["l", "path", { d: arc(35, 325) }]] },
    // rock back around the curve's centre while the whole hook pulls toward the head
    undo: {
      anim: "tilt",
      deg: -25,
      origin: "14.5 14",
      els: [["l", "path", { d: "M9 4.5L4.5 9 9 13.5M4.5 9h10a5 5 0 0 1 0 10H11", ...N(-1.5, 0) }]],
    },
    redo: {
      anim: "tilt",
      deg: 25,
      origin: "9.5 14",
      els: [["l", "path", { d: "M15 4.5L19.5 9 15 13.5M19.5 9h-10a5 5 0 0 0 0 10H13", ...N(1.5, 0) }]],
    },
    repeat: {
      els: [
        ["l", "path", { d: "M4.5 11.5V10A3.5 3.5 0 0 1 8 6.5h11.5M16.25 3.25l3.25 3.25-3.25 3.25", ...N(2.5, 0) }],
        ["l", "path", { d: "M19.5 12.5V14a3.5 3.5 0 0 1-3.5 3.5H4.5M7.75 20.75L4.5 17.5l3.25-3.25", ...N(-2.5, 0) }],
      ],
    },
    shuffle: {
      els: [
        ["l", "path", { d: "M3.5 7h2.25c1.5 0 2.6.65 3.4 1.8l4.7 6.4c.8 1.15 1.9 1.8 3.4 1.8h2.25M16.75 13.75L20 17l-3.25 3.25", ...N(2.5, 0) }],
        ["l", "path", { d: "M3.5 17h2.25c1.5 0 2.6-.65 3.4-1.8l4.7-6.4C14.65 7.65 15.75 7 17.25 7h2.25M16.75 3.75L20 7l-3.25 3.25", ...N(2.5, 0), delay: 0.1 }],
      ],
    },
    "swap-horizontal": {
      els: [
        ["l", "path", { d: "M4.5 7.5h15M16 4l3.5 3.5L16 11", ...N(2.5, 0) }],
        ["l", "path", { d: "M19.5 16.5h-15M8 13l-3.5 3.5L8 20", ...N(-2.5, 0) }],
      ],
    },
    "swap-vertical": {
      els: [
        ["l", "path", { d: "M7.5 19.5v-15M4 8l3.5-3.5L11 8", ...N(0, -2.5) }],
        ["l", "path", { d: "M16.5 4.5v15M13 16l3.5 3.5L20 16", ...N(0, 2.5) }],
      ],
    },
    expand: {
      els: [
        ["l", "path", { d: "M14 4h6v6M20 4l-6 6", ...N(1.75, -1.75) }],
        ["l", "path", { d: "M10 20H4v-6M4 20l6-6", ...N(-1.75, 1.75) }],
      ],
    },
    collapse: {
      els: [
        ["l", "path", { d: "M14 4v6h6M14 10l6-6", ...N(-1.25, 1.25) }],
        ["l", "path", { d: "M10 20v-6H4M10 14l-6 6", ...N(1.25, -1.25) }],
      ],
    },
    move: {
      els: [
        ["l", "path", { d: "M12 10V3.5M9 6.5l3-3 3 3", ...N(0, -2) }],
        ["l", "path", { d: "M12 14v6.5M9 17.5l3 3 3-3", ...N(0, 2) }],
        ["l", "path", { d: "M10 12H3.5M6.5 9l-3 3 3 3", ...N(-2, 0) }],
        ["l", "path", { d: "M14 12h6.5M17.5 9l3 3-3 3", ...N(2, 0) }],
      ],
    },
    // arrow pushes its way; bars grow out from their left ends in reading order
    "sort-ascending": {
      els: [
        ["l", "path", { d: "M7.5 19.5v-15M4.25 7.75L7.5 4.5l3.25 3.25", ...N(0, -2.5) }],
        ["l", "path", { d: "M14 6.5h3", anim: "grow", origin: "14 6.5" }],
        ["l", "path", { d: "M14 12h4.75", anim: "grow", origin: "14 12", delay: 0.08 }],
        ["l", "path", { d: "M14 17.5h6.5", anim: "grow", origin: "14 17.5", delay: 0.16 }],
      ],
    },
    "sort-descending": {
      els: [
        ["l", "path", { d: "M7.5 4.5v15M4.25 16.25L7.5 19.5l3.25-3.25", ...N(0, 2.5) }],
        ["l", "path", { d: "M14 6.5h6.5", anim: "grow", origin: "14 6.5" }],
        ["l", "path", { d: "M14 12h4.75", anim: "grow", origin: "14 12", delay: 0.08 }],
        ["l", "path", { d: "M14 17.5h3", anim: "grow", origin: "14 17.5", delay: 0.16 }],
      ],
    },
    "external-link": {
      els: [
        ["l", "path", { d: "M10.5 6H8a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-2.5" }],
        ["l", "path", { d: "M11.5 12.5L20 4M14.5 4H20v5.5", ...N(2, -2) }],
      ],
    },
    "corner-down-right": { els: [["l", "path", { d: "M5 4.5v6a4 4 0 0 0 4 4h10.5M15 10l4.5 4.5L15 19", ...N(2.5, 0) }]] },
    return: { els: [["l", "path", { d: "M19 4.5v6a4 4 0 0 1-4 4H4.5M9 10l-4.5 4.5L9 19", ...N(-2.5, 0) }]] },
  });
}
