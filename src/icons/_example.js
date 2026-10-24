// Reference icons (approved style). Copy this file's shape for a new category.
// These five get moved into real categories; this file is not part of the build.
Icons.define("example", {
  trash: {
    els: [
      ["s", "path", { d: "M5.5 6.5h13l-.85 11.9a3 3 0 0 1-3 2.6h-5.3a3 3 0 0 1-3-2.6Z" }],
      // lid + handle hinge up from the right end
      ["s", "path", { d: "M9 6.5V5a2.5 2.5 0 0 1 2.5-2.5h1A2.5 2.5 0 0 1 15 5v1.5Z", anim: "tilt", origin: "20.5 6.5", deg: 20 }],
      ["l", "path", { d: "M3.5 6.5h17", anim: "tilt", origin: "20.5 6.5", deg: 20 }],
      ["c", "path", { d: "M10 11v5" }],
      ["c", "path", { d: "M14 11v5" }],
    ],
  },
  clock: {
    els: [
      ["s", "circle", { cx: 12, cy: 12, r: 9 }],
      ["c", "path", { d: "M12 7.5V12l3 2", anim: "turn", origin: "12 12", deg: 360 }],
    ],
  },
  "user-group": {
    els: [
      ["s", "circle", { cx: 18.25, cy: 7.25, r: 2.25, anim: "bounce", y: -2.5, delay: 0.12 }],
      ["s", "path", { d: "M13 21h7a1.5 1.5 0 0 0 1.5-1.5v-1A3.5 3.5 0 0 0 15 16.5" }],
      ["k", "path", { d: "M3.5 19.5a5.5 5.5 0 0 1 11 0 1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5Z" }],
      ["k", "circle", { cx: 8.75, cy: 7.5, r: 3.25, anim: "bounce", y: -2.5 }],
    ],
  },
  pencil: {
    anim: "wiggle",
    origin: "5 19",
    deg: 10,
    els: [
      ["s", "path", { d: "M8.5 5a3.5 3.5 0 0 1 7 0v.5h-7Z", transform: "rotate(45 12 12) translate(0 1)" }],
      ["s", "path", { d: "M8.5 9h7v8l-2.6 3.4a1.1 1.1 0 0 1-1.8 0L8.5 17Z", transform: "rotate(45 12 12) translate(0 1)" }],
    ],
  },
  chat: {
    anim: "pop",
    els: [
      ["s", "path", { d: "M8 3.5h8a5 5 0 0 1 5 5v5a5 5 0 0 1-5 5h-6.3l-3.6 2.6a1 1 0 0 1-1.6-.8v-2.6C3.9 16.8 3 15.3 3 13.5v-5a5 5 0 0 1 5-5Z" }],
    ],
  },
});
