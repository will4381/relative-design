// Communication: messaging, mail, calls, people.
// Bubbles are soft ovals with a lower-left tail. Person proportions match user-group's front person
// (head r3.25, body 11 wide, base y21).
Icons.define("communication", {
  chat: {
    anim: "pop",
    origin: "4.5 20",
    s: 1.14,
    els: [
      ["s", "path", { d: "M3.54 14.24A9 8 0 1 1 8.63 18.92L6.04 20.27A2 2 0 0 1 3.13 18.3Z" }],
    ],
  },
  "chat-dots": {
    els: [
      ["s", "path", { d: "M3.54 14.24A9 8 0 1 1 8.63 18.92L6.04 20.27A2 2 0 0 1 3.13 18.3Z" }],
      ["d", "circle", { cx: 8, cy: 11.5, r: 1.3, anim: "bounce", y: -2.5 }],
      ["d", "circle", { cx: 12, cy: 11.5, r: 1.3, anim: "bounce", y: -2.5, delay: 0.1 }],
      ["d", "circle", { cx: 16, cy: 11.5, r: 1.3, anim: "bounce", y: -2.5, delay: 0.2 }],
    ],
  },
  "chat-double": {
    // two mirrored ovals: back one up-right with its tail on the right, front one (k) down-left
    els: [
      ["s", "path", { d: "M16.72 14.9A6.5 5.75 0 1 1 20.61 11.47L20.68 13.52A1.75 1.75 0 0 1 18.57 15.29Z", anim: "bounce", y: -2, delay: 0.12 }],
      ["k", "path", { d: "M7.28 19.4A6.5 5.75 0 1 0 3.39 15.97L3.32 18.24A1.75 1.75 0 0 0 5.63 19.95Z", anim: "pop", origin: "3.5 20.5", s: 1.14 }],
    ],
  },
  "chat-question": {
    els: [
      ["s", "path", { d: "M3.54 14.24A9 8 0 1 1 8.63 18.92L6.04 20.27A2 2 0 0 1 3.13 18.3Z" }],
      ["c", "path", { d: "M9.75 9a2.25 2.25 0 1 1 3.4 1.95c-.65.4-1.15.85-1.15 1.55v.25", anim: "wiggle", deg: 12, origin: "12 15.5" }],
      ["d", "circle", { cx: 12, cy: 15.5, r: 1.2 }],
    ],
  },
  mail: {
    els: [
      ["s", "path", { d: "M6.5 5h11a3.5 3.5 0 0 1 3.5 3.5v7a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 15.5v-7A3.5 3.5 0 0 1 6.5 5Z" }],
      ["c", "path", { d: "M7 9.5l5 3.5 5-3.5", anim: "blink", origin: "12 9.5" }],
    ],
  },
  "mail-open": {
    els: [
      ["s", "path", { d: "M3 10.6V18a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7.4a2 2 0 0 0-.9-1.67l-6.45-4.25a3 3 0 0 0-3.3 0L3.9 8.93A2 2 0 0 0 3 10.6Z" }],
      ["c", "path", { d: "M7 13l5 3.5 5-3.5", anim: "draw" }],
    ],
  },
  send: {
    anim: "nudge",
    x: 2.5,
    y: -2.5,
    els: [
      ["s", "path", { d: "M19.59 5.83Q20.5 3.5 18.17 4.41L5.35 9.43Q3.25 10.25 5.34 11.09L9.59 12.79Q10.75 13.25 11.21 14.41L12.91 18.66Q13.75 20.75 14.57 18.65Z" }],
      ["c", "path", { d: "M11 13l5-5" }],
    ],
  },
  phone: {
    anim: "wiggle",
    deg: 10,
    origin: "12 12",
    els: [
      ["s", "path", { d: "M5 3.5h3a1.5 1.5 0 0 1 1.4 1l1.1 3.1a1.5 1.5 0 0 1-.4 1.6l-1.6 1.4a11 11 0 0 0 4.9 4.9l1.4-1.6a1.5 1.5 0 0 1 1.6-.4l3.1 1.1a1.5 1.5 0 0 1 1 1.4v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z" }],
    ],
  },
  "phone-call": {
    els: [
      ["s", "path", { d: "M5 3.5h3a1.5 1.5 0 0 1 1.4 1l1.1 3.1a1.5 1.5 0 0 1-.4 1.6l-1.6 1.4a11 11 0 0 0 4.9 4.9l1.4-1.6a1.5 1.5 0 0 1 1.6-.4l3.1 1.1a1.5 1.5 0 0 1 1 1.4v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z", anim: "wiggle", deg: 10, origin: "11 13" }],
      ["l", "path", { d: "M14.5 7.5a2 2 0 0 1 2 2", anim: "pulse" }],
      ["l", "path", { d: "M14.5 3.25a6.25 6.25 0 0 1 6.25 6.25", anim: "pulse", delay: 0.12 }],
    ],
  },
  "phone-off": {
    els: [
      ["s", "path", { d: "M5 3.5h3a1.5 1.5 0 0 1 1.4 1l1.1 3.1a1.5 1.5 0 0 1-.4 1.6l-1.6 1.4a11 11 0 0 0 4.9 4.9l1.4-1.6a1.5 1.5 0 0 1 1.6-.4l3.1 1.1a1.5 1.5 0 0 1 1 1.4v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z", anim: "shake", x: 1.2 }],
      ["k", "path", { d: "M20.5 3.5l-17 17" }],
    ],
  },
  video: {
    els: [
      ["s", "path", { d: "M6.5 6h5a3.5 3.5 0 0 1 3.5 3.5v5a3.5 3.5 0 0 1-3.5 3.5h-5A3.5 3.5 0 0 1 3 14.5v-5A3.5 3.5 0 0 1 6.5 6Z" }],
      ["s", "path", { d: "M15 10L17.82 8.53A2 2 0 0 1 20.75 10.3L20.75 13.7A2 2 0 0 1 17.82 15.47L15 14Z", anim: "pop", origin: "15 12", s: 1.2 }],
    ],
  },
  "at-sign": {
    els: [
      ["l", "circle", { cx: 12, cy: 12, r: 3.5 }],
      ["l", "path", { d: "M15.5 12v1.25a2.75 2.75 0 0 0 5.5 0V12a9 9 0 1 0-3.5 7.1", anim: "tilt", deg: -25, origin: "12 12" }],
    ],
  },
  inbox: {
    els: [
      ["s", "path", { d: "M3.5 13.5l2.3-7A2.5 2.5 0 0 1 8.2 4.75h7.6a2.5 2.5 0 0 1 2.4 1.75l2.3 7V17a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17Z", anim: "squash", origin: "12 20.5", delay: 0.15 }],
      ["c", "path", { d: "M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5", anim: "enter", y: -4 }],
    ],
  },
  megaphone: {
    els: [
      ["s", "path", { d: "M3 10.75A2 2 0 0 1 5 8.75L7.74 8.75A1 1 0 0 0 8.23 8.62L13.52 5.66A2 2 0 0 1 16.5 7.41L16.5 16.59A2 2 0 0 1 13.52 18.34L8.23 15.38A1 1 0 0 0 7.74 15.25L5 15.25A2 2 0 0 1 3 13.25Z", anim: "wiggle", deg: 8, origin: "8 19" }],
      ["s", "path", { d: "M6.5 15.25l.9 3.9a1.2 1.2 0 0 0 1.15.95h.95a1 1 0 0 0 .97-1.25l-.97-3.6", anim: "wiggle", deg: 8, origin: "8 19" }],
      ["l", "path", { d: "M20 8.5a5 5 0 0 1 0 7", anim: "pulse", delay: 0.1 }],
    ],
  },
  reply: {
    anim: "nudge",
    x: -2.5,
    els: [
      ["l", "path", { d: "M9 4.5l-5 5 5 5" }],
      ["l", "path", { d: "M4 9.5h10a6 6 0 0 1 6 6v4" }],
    ],
  },
  forward: {
    anim: "nudge",
    x: 2.5,
    els: [
      ["l", "path", { d: "M15 4.5l5 5-5 5" }],
      ["l", "path", { d: "M20 9.5H10a6 6 0 0 0-6 6v4" }],
    ],
  },
  microphone: {
    els: [
      ["s", "path", { d: "M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z", anim: "bounce", y: -2, origin: "12 14" }],
      ["l", "path", { d: "M4.5 11a7.5 7.5 0 0 0 15 0" }],
      ["l", "path", { d: "M12 18.5V21" }],
    ],
  },
  "microphone-off": {
    els: [
      ["s", "path", { d: "M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z", anim: "shake", x: 1.2 }],
      ["l", "path", { d: "M4.5 11a7.5 7.5 0 0 0 15 0" }],
      ["l", "path", { d: "M12 18.5V21" }],
      ["k", "path", { d: "M4 4l16 16" }],
    ],
  },
  user: {
    els: [
      ["s", "path", { d: "M4.5 19.5a7.5 5.5 0 0 1 15 0 1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5Z" }],
      ["s", "circle", { cx: 12, cy: 7.25, r: 3.75, anim: "bounce", y: -2, origin: "12 11" }],
    ],
  },
  "user-plus": {
    els: [
      ["s", "path", { d: "M3.25 18.25a6.25 4.75 0 0 1 12.5 0 1.25 1.25 0 0 1-1.25 1.25H4.5a1.25 1.25 0 0 1-1.25-1.25Z" }],
      ["s", "circle", { cx: 9.5, cy: 7.75, r: 3.25 }],
      ["l", "path", { d: "M18.5 8v5M16 10.5h5", anim: "grow" }],
    ],
  },
  "user-minus": {
    els: [
      ["s", "path", { d: "M3.25 18.25a6.25 4.75 0 0 1 12.5 0 1.25 1.25 0 0 1-1.25 1.25H4.5a1.25 1.25 0 0 1-1.25-1.25Z" }],
      ["s", "circle", { cx: 9.5, cy: 7.75, r: 3.25 }],
      ["l", "path", { d: "M16 10.5h5", anim: "grow" }],
    ],
  },
  "user-check": {
    els: [
      ["s", "path", { d: "M3.25 18.25a6.25 4.75 0 0 1 12.5 0 1.25 1.25 0 0 1-1.25 1.25H4.5a1.25 1.25 0 0 1-1.25-1.25Z" }],
      ["s", "circle", { cx: 9.5, cy: 7.75, r: 3.25 }],
      ["l", "path", { d: "M15.75 10.5l2 2 3.25-3.25", anim: "draw" }],
    ],
  },
  "user-cross": {
    els: [
      ["s", "path", { d: "M3.25 18.25a6.25 4.75 0 0 1 12.5 0 1.25 1.25 0 0 1-1.25 1.25H4.5a1.25 1.25 0 0 1-1.25-1.25Z" }],
      ["s", "circle", { cx: 9.5, cy: 7.75, r: 3.25 }],
      ["l", "path", { d: "M16.5 8.5l4 4M20.5 8.5l-4 4", anim: "shake", x: 1.5 }],
    ],
  },
  "user-circle": {
    els: [
      ["s", "circle", { cx: 12, cy: 12, r: 9 }],
      ["c", "circle", { cx: 12, cy: 9.5, r: 3.25, anim: "bounce", y: -1, origin: "12 12.75" }],
      ["c", "path", { d: "M5.29 18A7.5 5.5 0 0 1 18.71 18" }],
    ],
  },
  "user-upload": {
    // profile photo with an upload badge: the badge pops, then its arrow lifts
    els: [
      ["s", "circle", { cx: 10.5, cy: 10.5, r: 8 }],
      ["c", "circle", { cx: 10.5, cy: 8.25, r: 2.75 }],
      ["c", "path", { d: "M4.69 16A6.25 5 0 0 1 16.31 16" }],
      ["k", "circle", { cx: 17.25, cy: 17.25, r: 4.5, anim: "pop", s: 1.12 }],
      // badge glyphs use a slightly lighter stroke so they stay open inside the small badge
      ["c", "path", { d: "M17.25 19.5v-4.25M15.5 17l1.75-1.75L19 17", style: "stroke-width:calc(var(--ic-stroke, 2px) * .8)", anim: "nudge", y: -1, delay: 0.18 }],
    ],
  },
  "user-camera": {
    // profile photo with a camera badge for "change photo": the badge pops, the lens blinks
    els: [
      ["s", "circle", { cx: 10.5, cy: 10.5, r: 8 }],
      ["c", "circle", { cx: 10.5, cy: 8.25, r: 2.75 }],
      ["c", "path", { d: "M4.69 16A6.25 5 0 0 1 16.31 16" }],
      ["k", "circle", { cx: 17.25, cy: 17.25, r: 4.5, anim: "pop", s: 1.12 }],
      ["c", "path", { d: "M15.5 16h.75l.6-.75h.8l.6.75h.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75v-2A.75.75 0 0 1 15.5 16Z", style: "stroke-width:calc(var(--ic-stroke, 2px) * .8)", anim: "squash", delay: 0.18 }],
    ],
  },
  "user-group": {
    els: [
      ["s", "circle", { cx: 17.25, cy: 6.25, r: 2.5, anim: "bounce", y: -1.5, origin: "17.25 8.75", delay: 0.1 }],
      ["s", "path", { d: "M13 15.75a4 3.5 0 0 1 8 0 1.25 1.25 0 0 1-1.25 1.25H14.25a1.25 1.25 0 0 1-1.25-1.25Z" }],
      ["k", "path", { d: "M3 19.25a6.25 4.75 0 0 1 12.5 0 1.25 1.25 0 0 1-1.25 1.25H4.25a1.25 1.25 0 0 1-1.25-1.25Z" }],
      ["k", "circle", { cx: 9.25, cy: 8.5, r: 3.25, anim: "bounce", y: -2, origin: "9.25 11.75" }],
    ],
  },
  "id-card": {
    els: [
      ["s", "path", { d: "M6.5 4.5h11a3.5 3.5 0 0 1 3.5 3.5v8a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 16V8a3.5 3.5 0 0 1 3.5-3.5Z" }],
      ["c", "circle", { cx: 8.5, cy: 9.75, r: 2 }],
      ["c", "path", { d: "M4.5 16.25a4 3 0 0 1 8 0" }],
      ["c", "path", { d: "M14.5 9.75h2.5", anim: "draw" }],
      ["c", "path", { d: "M14.5 14.25h2.5", anim: "draw", delay: 0.12 }],
    ],
  },
  "contact-book": {
    els: [
      ["s", "path", { d: "M9.5 3h7a3.5 3.5 0 0 1 3.5 3.5v11a3.5 3.5 0 0 1-3.5 3.5h-7A3.5 3.5 0 0 1 6 17.5v-11A3.5 3.5 0 0 1 9.5 3Z" }],
      ["l", "path", { d: "M4 7.5h3.5", anim: "nudge", x: -1.5 }],
      ["l", "path", { d: "M4 12h3.5", anim: "nudge", x: -1.5, delay: 0.08 }],
      ["l", "path", { d: "M4 16.5h3.5", anim: "nudge", x: -1.5, delay: 0.16 }],
      ["c", "circle", { cx: 13, cy: 9.5, r: 2.25 }],
      ["c", "path", { d: "M8.75 17a4.25 3.25 0 0 1 8.5 0" }],
    ],
  },
  translate: {
    els: [
      ["l", "path", { d: "M3.5 6.5h9M8 3.5v3M11 6.5c-1 4.2-3.5 7.2-7 8.5M6.25 9.75c1.3 2 3.2 3.6 5.5 4.75", anim: "bounce", y: -2 }],
      ["l", "path", { d: "M13 20.5L15.6 14.27A1.25 1.25 0 0 1 17.9 14.27L20.5 20.5M14.25 17.5h5", anim: "bounce", y: -2, delay: 0.14 }],
    ],
  },
});
