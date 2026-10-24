// Files, data & dev icons. Block-scoped so shared consts don't clash with sibling <script>s.
{
const FILE = "M8 3h5.5L19 8.5V18a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z";
const FOLD = "M13.5 3.5v3a2 2 0 0 0 2 2h3";
const FOLDER = "M3 7a3 3 0 0 1 3-3h3.6a2 2 0 0 1 1.4.6L12.5 6H18a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z";
const CLOUD = "M7 19A4 4 0 0 1 7 11A5.5 5.5 0 0 1 18 11.1A4 4 0 0 1 17 19Z";
const CLOUD_HI = "M7 17A4 4 0 0 1 7 9A5.5 5.5 0 0 1 18 9.1A4 4 0 0 1 17 17Z";
// note: core reads x/y attrs as motion params, so every rect is written as a path
const SQUARE = "M7 3.5h10a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z";
const FINDER = "h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5Z";
const RING = "M4 6c0 1.66 3.58 3 8 3s8-1.34 8-3"; // front rim of a disc, reused for the database bands

Icons.define("files", {
  file: {
    els: [
      ["s", "path", { d: FILE }],
      // corner flips forward and back from the crease
      ["c", "path", { d: FOLD, anim: "tilt", deg: 40, origin: "13.5 3.5" }],
    ],
  },
  "file-text": {
    els: [
      ["s", "path", { d: FILE }],
      ["c", "path", { d: FOLD }],
      ["c", "path", { d: "M9 12.5h6", anim: "draw" }],
      ["c", "path", { d: "M9 17h4", anim: "draw", delay: 0.12 }],
    ],
  },
  "file-plus": {
    els: [
      ["s", "path", { d: FILE }],
      ["c", "path", { d: FOLD }],
      ["c", "path", { d: "M12 11.5v6M9 14.5h6", anim: "grow" }],
    ],
  },
  folder: {
    anim: "squash",
    origin: "12 20",
    els: [["s", "path", { d: FOLDER }]],
  },
  "folder-open": {
    els: [
      ["s", "path", { d: "M3 18V7a3 3 0 0 1 3-3h3.6a2 2 0 0 1 1.4.6L12.5 6H16a3 3 0 0 1 3 3v1.5" }],
      ["k", "path", { d: "M7.6 10.5h12.3a1.5 1.5 0 0 1 1.45 1.9l-1.6 5.6A2.75 2.75 0 0 1 17.1 20H4.5a1.5 1.5 0 0 1-1.42-1.97l2.15-5.9A2.5 2.5 0 0 1 7.6 10.5Z", anim: "tilt", deg: 15, origin: "3.5 20" }],
    ],
  },
  "folder-plus": {
    els: [
      ["s", "path", { d: FOLDER }],
      ["c", "path", { d: "M12 10v6M9 13h6", anim: "grow" }],
    ],
  },
  archive: {
    els: [
      ["s", "path", { d: "M4.5 9h15v8a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3Z", anim: "squash", origin: "12 20", delay: 0.08 }],
      ["c", "path", { d: "M10 13h4", anim: "squash", origin: "12 20", delay: 0.08 }],
      ["k", "path", { d: "M4.5 4h15A1.5 1.5 0 0 1 21 5.5v2A1.5 1.5 0 0 1 19.5 9h-15A1.5 1.5 0 0 1 3 7.5v-2A1.5 1.5 0 0 1 4.5 4Z", anim: "bounce", y: -2, origin: "12 9" }],
    ],
  },
  cloud: {
    anim: "float",
    els: [["s", "path", { d: CLOUD }]],
  },
  "cloud-upload": {
    els: [
      ["s", "path", { d: CLOUD_HI, anim: "squash", origin: "12 17", delay: 0.12 }],
      ["k", "path", { d: "M12 21v-9.5M8.5 15l3.5-3.5 3.5 3.5", anim: "nudge", y: -2.5 }],
    ],
  },
  "cloud-download": {
    els: [
      ["s", "path", { d: CLOUD_HI, anim: "squash", origin: "12 17", delay: 0.12 }],
      ["k", "path", { d: "M12 11.5V21M8.5 17.5L12 21l3.5-3.5", anim: "nudge", y: 2.5 }],
    ],
  },
  database: {
    // three stacked discs; each upper one knocks a gap into the one below, so fill stays separated
    els: [
      ["s", "path", { d: "M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3v6c0 1.66-3.58 3-8 3s-8-1.34-8-3Z", anim: "bounce", y: -2, origin: "12 21", delay: 0.16 }],
      ["k", "path", { d: RING + "v6c0 1.66-3.58 3-8 3s-8-1.34-8-3Z", anim: "bounce", y: -2, origin: "12 15", delay: 0.08 }],
      ["k", "ellipse", { cx: 12, cy: 6, rx: 8, ry: 3, anim: "bounce", y: -2, origin: "12 9" }],
    ],
  },
  server: {
    els: [
      ["s", "path", { d: SQUARE }],
      ["c", "path", { d: "M3 12h18" }],
      ["d", "circle", { cx: 7.5, cy: 7.75, r: 1.25, anim: "pulse" }],
      ["d", "circle", { cx: 7.5, cy: 16.25, r: 1.25, anim: "pulse", delay: 0.14 }],
    ],
  },
  code: {
    els: [
      ["l", "path", { d: "M7.5 7.5L3 12l4.5 4.5", anim: "nudge", x: -2 }],
      ["l", "path", { d: "M16.5 7.5L21 12l-4.5 4.5", anim: "nudge", x: 2 }],
      ["l", "path", { d: "M13.5 6l-3 12", anim: "wiggle", deg: 12, delay: 0.06 }],
    ],
  },
  terminal: {
    els: [
      ["s", "path", { d: SQUARE }],
      ["c", "path", { d: "M7.5 9l3 3-3 3", anim: "nudge", x: 1.5 }],
      ["c", "path", { d: "M13 15h3.5", anim: "pulse", delay: 0.1 }],
    ],
  },
  "git-branch": {
    els: [
      ["l", "path", { d: "M6.5 8.5v7" }],
      ["l", "path", { d: "M17.5 8.5c0 4.5-11 2.5-11 7" }],
      ["s", "circle", { cx: 6.5, cy: 6, r: 2.5, anim: "pop", s: 1.22 }],
      ["s", "circle", { cx: 17.5, cy: 6, r: 2.5, anim: "pop", s: 1.22, delay: 0.1 }],
      ["s", "circle", { cx: 6.5, cy: 18, r: 2.5, anim: "pop", s: 1.22, delay: 0.2 }],
    ],
  },
  "git-commit": {
    els: [
      ["s", "circle", { cx: 12, cy: 12, r: 4, anim: "pop", s: 1.2, delay: 0.1 }],
      ["l", "path", { d: "M3 12h5", anim: "draw" }],
      ["l", "path", { d: "M16 12h5", anim: "draw", delay: 0.2 }],
    ],
  },
  bug: {
    els: [
      // legs scuttle from their roots while the body jitters
      ["l", "path", { d: "M6.5 13H3.5M6.5 17.5l-2.5 2M6.5 9.5L4 7.5", anim: "wiggle", deg: 12, origin: "6.5 13" }],
      ["l", "path", { d: "M17.5 13h3M17.5 17.5l2.5 2M17.5 9.5l2.5-2", anim: "wiggle", deg: -12, origin: "17.5 13" }],
      ["s", "path", { d: "M12 8a5.5 5.5 0 0 1 5.5 5.5v2a5.5 5.5 0 0 1-11 0v-2A5.5 5.5 0 0 1 12 8Z", anim: "shake", x: 0.75 }],
      ["c", "path", { d: "M12 12.5v5", anim: "shake", x: 0.75 }],
      ["k", "path", { d: "M8.5 8a3.5 3.5 0 0 1 7 0Z", anim: "shake", x: 0.75 }],
    ],
  },
  package: {
    els: [
      ["s", "path", { d: "M4 7.5l8 4.5 8-4.5v9L12 21l-8-4.5Z" }],
      ["c", "path", { d: "M12 12v9" }],
      // top face lifts like a lid hinged at the back-left edge
      ["k", "path", { d: "M12 3l8 4.5-8 4.5-8-4.5Z", anim: "tilt", deg: -18, origin: "4 7.5" }],
    ],
  },
  save: {
    els: [
      ["s", "path", { d: "M7.5 3.5H16l4.5 4.5v8.5a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z" }],
      ["c", "path", { d: "M8.5 3.5V7a1 1 0 0 0 1 1h4.5a1 1 0 0 0 1-1V3.5", anim: "nudge", x: 2.5 }],
      ["c", "path", { d: "M7.5 20.5V16a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5v4.5" }],
    ],
  },
  paperclip: {
    anim: "swing",
    deg: 14,
    origin: "15.5 5",
    els: [["l", "path", { d: "M12 15V6.75a2.25 2.25 0 0 0-4.5 0V15a4.5 4.5 0 0 0 9 0V8", transform: "rotate(45 12 12)" }]],
  },
  "chart-bar": {
    els: [
      ["s", "path", { d: "M5 13h1a1.5 1.5 0 0 1 1.5 1.5v4.5A1.5 1.5 0 0 1 6 20.5H5A1.5 1.5 0 0 1 3.5 19v-4.5A1.5 1.5 0 0 1 5 13Z", anim: "grow", origin: "5.5 20.5" }],
      ["s", "path", { d: "M11.5 3.5h1A1.5 1.5 0 0 1 14 5v14a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 10 19V5a1.5 1.5 0 0 1 1.5-1.5Z", anim: "grow", origin: "12 20.5", delay: 0.1 }],
      ["s", "path", { d: "M18 8.5h1a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 18 8.5Z", anim: "grow", origin: "18.5 20.5", delay: 0.2 }],
    ],
  },
  "chart-line": {
    els: [
      ["l", "path", { d: "M3.5 3.5v13a4 4 0 0 0 4 4h13" }],
      ["l", "path", { d: "M8 14.5l3.5-4 3 3 5.5-6", anim: "draw" }],
    ],
  },
  "chart-pie": {
    els: [
      // wedge sits 4 units out so its knockout never touches the main slice's radii
      ["s", "path", { d: "M10 7A7 7 0 1 0 17 14H10Z" }],
      ["k", "path", { d: "M14 3A7 7 0 0 1 21 10H14Z", anim: "float", x: 1.5, y: -1.5 }],
    ],
  },
  "trend-up": {
    anim: "nudge", x: 2, y: -2,
    els: [
      ["l", "path", { d: "M3 17l6-6 4 4 8-8" }],
      ["l", "path", { d: "M16 7h5v5" }],
    ],
  },
  "trend-down": {
    anim: "nudge", x: 2, y: 2,
    els: [
      ["l", "path", { d: "M3 7l6 6 4-4 8 8" }],
      ["l", "path", { d: "M16 17h5v-5" }],
    ],
  },
  activity: {
    els: [["l", "path", { d: "M3 12h3.5C8 12 8 5 10 5S12 16.5 14 16.5S16 12 17.5 12H21", anim: "draw" }]],
  },
  cpu: {
    els: [
      // pins light up round the chip: top, right, bottom, left
      ["l", "path", { d: "M9.5 3v3M14.5 3v3", anim: "pulse" }],
      ["l", "path", { d: "M18 9.5h3M18 14.5h3", anim: "pulse", delay: 0.1 }],
      ["l", "path", { d: "M9.5 18v3M14.5 18v3", anim: "pulse", delay: 0.2 }],
      ["l", "path", { d: "M3 9.5h3M3 14.5h3", anim: "pulse", delay: 0.3 }],
      ["s", "path", { d: "M9 6h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z" }],
      ["c", "path", { d: "M10.75 9.75h2.5a1 1 0 0 1 1 1v2.5a1 1 0 0 1-1 1h-2.5a1 1 0 0 1-1-1v-2.5a1 1 0 0 1 1-1Z" }],
    ],
  },
  hash: {
    els: [
      ["l", "path", { d: "M10 3.5L8 20.5", anim: "draw" }],
      ["l", "path", { d: "M16 3.5l-2 17", anim: "draw", delay: 0.08 }],
      ["l", "path", { d: "M4 9h16.5", anim: "draw", delay: 0.16 }],
      ["l", "path", { d: "M3.5 15H20", anim: "draw", delay: 0.24 }],
    ],
  },
  command: {
    anim: "turn",
    deg: 90,
    els: [["l", "path", { d: "M9 9V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z" }]],
  },
  "qr-code": {
    els: [
      ["s", "path", { d: "M5 3.5" + FINDER }],
      ["s", "path", { d: "M16 3.5" + FINDER }],
      ["s", "path", { d: "M5 14.5" + FINDER }],
      ["s", "circle", { cx: 15, cy: 15, r: 0.75, anim: "pop", s: 1.5 }],
      ["s", "circle", { cx: 20, cy: 15, r: 0.75, anim: "pop", s: 1.5, delay: 0.08 }],
      ["s", "circle", { cx: 15, cy: 20, r: 0.75, anim: "pop", s: 1.5, delay: 0.16 }],
      ["s", "circle", { cx: 20, cy: 20, r: 0.75, anim: "pop", s: 1.5, delay: 0.24 }],
    ],
  },
});
}
