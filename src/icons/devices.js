// Devices: audio, broadcast, hardware. All paths drawn from grid geometry.
// Screens/boxes follow media.js (monitor 18×13 r3, smartphone 12×18 r3.5, headphones band r7.5).
(function () {
  const f = (v) => +v.toFixed(2);
  const rad = (a) => (a * Math.PI) / 180;
  // Polyline/polygon whose corners are true arcs of radius r (shrunk only if an edge is too short).
  const soft = (pts, r, closed = true) => {
    const n = pts.length;
    let d = closed ? "" : `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) {
      const [vx, vy] = pts[i], [px, py] = pts[(i + n - 1) % n], [nx, ny] = pts[(i + 1) % n];
      const l1 = Math.hypot(px - vx, py - vy), l2 = Math.hypot(nx - vx, ny - vy);
      const u1 = [(px - vx) / l1, (py - vy) / l1], u2 = [(nx - vx) / l2, (ny - vy) / l2];
      const half = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))) / 2;
      const t = Math.min(r / Math.tan(half), l1 / 2, l2 / 2), rho = t * Math.tan(half);
      const sweep = -u1[0] * u2[1] + u1[1] * u2[0] > 0 ? 1 : 0;
      d += `${d ? "L" : "M"}${f(vx + u1[0] * t)} ${f(vy + u1[1] * t)}A${f(rho)} ${f(rho)} 0 0 ${sweep} ${f(vx + u2[0] * t)} ${f(vy + u2[1] * t)}`;
    }
    return closed ? d + "Z" : d + `L${pts[n - 1][0]} ${pts[n - 1][1]}`;
  };
  // Rounded rect as a path (x/y attrs are reserved for motion params).
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  // Clockwise arc around (cx, cy) from angle a0 to a1, degrees measured clockwise from 12 o'clock.
  const pt = (cx, cy, r, a) => `${f(cx + r * Math.sin(rad(a)))} ${f(cy - r * Math.cos(rad(a)))}`;
  const arc = (cx, cy, r, a0, a1) => `M${pt(cx, cy, r, a0)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(cx, cy, r, a1)}`;

  // Satellite dish: a bowl (chord on top, arc below) with its two rim corners filleted, in local coords
  // around the chord centre, then rotated to face up-right.
  const bowl = (R, p) => {
    const xc = Math.sqrt((R - p) ** 2 - p * p), k = R / (R - p);
    return `M${f(-xc)} 0H${f(xc)}A${p} ${p} 0 0 1 ${f(xc * k)} ${f(p * k)}A${R} ${R} 0 0 1 ${f(-xc * k)} ${f(p * k)}A${p} ${p} 0 0 1 ${f(-xc)} 0Z`;
  };
  const DISH = { transform: "translate(12.5 10.5) rotate(45)", anim: "wiggle", deg: 10, origin: "8.25 15.25" };

  // Guitar, drawn upright on x=12 then laid on the diagonal.
  const GT = "rotate(20 12 12) translate(0 -0.5)";
  // lower lobe r4.5 at (12,17), upper lobe r3 at (12,12.5), joined at the waist (y13.5)
  const GUITAR_BODY = "M9.17 13.5A4.5 4.5 0 1 0 14.83 13.5A3 3 0 1 0 9.17 13.5Z";

  // Drum: shell (open top) and a head drawn in front of it.
  const DRUM = { anim: "squash", origin: "12 20.75", delay: 0.4 };
  const STICK = { anim: "tilt", deg: 30, origin: "20 3.5" };

  const MONITOR = rr(3, 3.5, 18, 13, 3);
  const STAND = "M12 16.5v4M8 20.5h8";
  const BAND = "M4.5 12.5V11a7.5 7.5 0 0 1 15 0v1.5";
  const BOT_ANT = { anim: "swing", deg: 16, origin: "12 8" };
  const JOY = { anim: "tilt", deg: -20, origin: "12 15" };
  const DISC_SHINE = { anim: "spin", deg: 180, origin: "12 12" };
  const KEY = (x, delay) => ["d", "path", { d: `M${x - 1.25} 5.5V10.5a1 1 0 0 0 1 1h.5a1 1 0 0 0 1-1V5.5Z`, anim: "nudge", y: 1.25, delay }];

  Icons.define("devices", {
    radio: {
      els: [
        ["l", "path", { d: "M6.5 7.5L17 3", anim: "swing", deg: -12, origin: "6.5 7.5" }],
        ["s", "path", { d: rr(3, 7.5, 18, 13, 3.5) }],
        ["c", "circle", { cx: 8.75, cy: 14, r: 2.75, anim: "heartbeat", s: 1.2, delay: 0.1 }],
        ["d", "circle", { cx: 16, cy: 11.5, r: 1.25 }],
        ["c", "path", { d: "M14.5 16.5h3" }],
      ],
    },
    podcast: {
      els: [
        ["s", "circle", { cx: 12, cy: 12.5, r: 1.25, anim: "heartbeat", s: 1.3 }],
        ["l", "path", { d: arc(12, 12.5, 5.25, -125, 125), anim: "pulse", delay: 0.08 }],
        ["l", "path", { d: arc(12, 12.5, 9.5, -120, 120), anim: "pulse", delay: 0.18 }],
        ["s", "path", { d: rr(10.75, 16.75, 2.5, 4, 1.25) }],
      ],
    },
    rss: {
      els: [
        ["s", "circle", { cx: 5.5, cy: 18.5, r: 1, anim: "heartbeat", s: 1.3 }],
        ["l", "path", { d: "M4 11.5a8.5 8.5 0 0 1 8.5 8.5", anim: "pulse", delay: 0.1 }],
        ["l", "path", { d: "M4 4.5A15.5 15.5 0 0 1 19.5 20", anim: "pulse", delay: 0.2 }],
      ],
    },
    tv: {
      els: [
        ["l", "path", { d: "M12 7.5L8 3.5", anim: "wiggle", deg: 14, origin: "12 7.5" }],
        ["l", "path", { d: "M12 7.5l4-4", anim: "wiggle", deg: -14, origin: "12 7.5", delay: 0.1 }],
        ["s", "path", { d: rr(3, 7.5, 18, 13, 3.5) }],
      ],
    },
    voicemail: {
      els: [
        ["l", "circle", { cx: 6.5, cy: 12, r: 3.5, anim: "squash", origin: "6.5 15.5" }],
        ["l", "circle", { cx: 17.5, cy: 12, r: 3.5, anim: "squash", origin: "17.5 15.5", delay: 0.12 }],
        ["l", "path", { d: "M6.5 15.5h11" }],
      ],
    },
    headset: {
      els: [
        ["l", "path", { d: BAND }],
        ["s", "path", { d: rr(3, 11.5, 5, 7, 2.5) }],
        ["s", "path", { d: rr(16, 11.5, 5, 7, 2.5) }],
        ["l", "path", { d: "M18.5 18.5a2 2 0 0 1-2 2h-3" }],
        ["s", "circle", { cx: 12.75, cy: 20.5, r: 0.75, anim: "heartbeat", s: 1.6 }],
      ],
    },
    bot: {
      els: [
        ["l", "path", { d: "M12 8V5.5", ...BOT_ANT }],
        ["s", "circle", { cx: 12, cy: 4.25, r: 1, ...BOT_ANT }],
        ["s", "path", { d: "M5 12h-.5A1.5 1.5 0 0 0 3 13.5v1A1.5 1.5 0 0 0 4.5 16H5M19 12h.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5H19" }],
        ["s", "path", { d: rr(5, 8, 14, 12.5, 4) }],
        ["d", "circle", { cx: 9.5, cy: 13.25, r: 1.4, anim: "blink", delay: 0.2 }],
        ["d", "circle", { cx: 14.5, cy: 13.25, r: 1.4, anim: "blink", delay: 0.2 }],
        ["c", "path", { d: "M10.5 17h3" }],
      ],
    },
    webcam: {
      els: [
        ["s", "circle", { cx: 12, cy: 9.5, r: 6.5 }],
        ["c", "circle", { cx: 12, cy: 9.5, r: 2.75, anim: "blink" }],
        ["l", "path", { d: "M12 16v4.5M8 20.5h8" }],
      ],
    },
    "screen-share": {
      els: [
        ["s", "path", { d: MONITOR }],
        ["c", "path", { d: "M12 13V7.25M9.25 10L12 7.25 14.75 10", anim: "nudge", y: -1.25 }],
        ["l", "path", { d: STAND }],
      ],
    },
    captions: {
      els: [
        ["s", "path", { d: rr(3, 5, 18, 14, 3.5) }],
        ["c", "path", { d: "M7 10h3.5", anim: "draw" }],
        ["c", "path", { d: "M14 10h3", anim: "draw", delay: 0.12 }],
        ["c", "path", { d: "M7 14.5h1.5", anim: "draw", delay: 0.24 }],
        ["c", "path", { d: "M12 14.5h5", anim: "draw", delay: 0.32 }],
      ],
    },
    airplay: {
      els: [
        ["l", "path", { d: "M6.5 17H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-.5" }],
        ["s", "path", { d: soft([[12, 13.5], [17, 20.5], [7, 20.5]], 1.75), anim: "bounce", y: -2.5, origin: "12 20.5" }],
      ],
    },
    "audio-waveform": {
      els: [
        ["l", "path", { d: "M3 10.5v3", anim: "squash", origin: "3 12" }],
        ["l", "path", { d: "M7.5 7v10", anim: "squash", origin: "7.5 12", delay: 0.06 }],
        ["l", "path", { d: "M12 3.5v17", anim: "squash", origin: "12 12", delay: 0.12 }],
        ["l", "path", { d: "M16.5 8v8", anim: "squash", origin: "16.5 12", delay: 0.18 }],
        ["l", "path", { d: "M21 10v4", anim: "squash", origin: "21 12", delay: 0.24 }],
      ],
    },
    disc: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: arc(12, 12, 6, 280, 340), ...DISC_SHINE }],
        ["c", "path", { d: arc(12, 12, 6, 100, 160), ...DISC_SHINE }],
        ["c", "circle", { cx: 12, cy: 12, r: 2.25 }],
      ],
    },
    album: {
      els: [
        ["s", "circle", { cx: 15, cy: 12, r: 6, anim: "nudge", x: 2.5 }],
        ["k", "path", { d: rr(3, 4.5, 11, 15, 3) }],
        ["c", "circle", { cx: 8.5, cy: 12, r: 2.25, anim: "pop", s: 1.2, delay: 0.15 }],
      ],
    },
    piano: {
      els: [
        ["s", "path", { d: rr(3, 4.5, 18, 15, 3.5) }],
        ["c", "path", { d: "M7.5 11.5v6M12 11.5v6M16.5 11.5v6" }],
        KEY(7.5, 0),
        KEY(12, 0.1),
        KEY(16.5, 0.2),
      ],
    },
    guitar: {
      // acoustic guitar drawn upright then turned 45°: two-bout body, sound hole, bridge, long neck, headstock with pegs
      anim: "wiggle",
      deg: 7,
      origin: "5 19",
      els: [
        ["s", "path", { d: "M9.7 14.18A3 3 0 1 1 14.3 14.18A4.25 4.25 0 1 1 9.7 14.18Z", transform: "rotate(45 12 12)" }],
        ["d", "circle", { cx: 12, cy: 15.6, r: 1.4, transform: "rotate(45 12 12)" }],
        ["c", "path", { d: "M10.5 19.4h3", transform: "rotate(45 12 12)" }],
        ["l", "path", { d: "M12 9.25V4", transform: "rotate(45 12 12)" }],
        ["s", "path", { d: "M11.5 .75h1a1 1 0 0 1 1 1V3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V1.75a1 1 0 0 1 1-1Z", transform: "rotate(45 12 12)" }],
      ],
    },
    drum: {
      els: [
        ["l", "path", { d: "M12.75 7.25L20 3.5", ...STICK }],
        ["s", "circle", { cx: 12.5, cy: 7.25, r: 0.75, ...STICK }],
        ["s", "path", { d: "M4 13.25v5a8 2.5 0 0 0 16 0v-5", ...DRUM }],
        ["k", "ellipse", { cx: 12, cy: 13.25, rx: 8, ry: 2.5, ...DRUM }],
      ],
    },
    "hard-drive": {
      els: [
        ["s", "path", { d: rr(3, 6, 18, 12, 3.5) }],
        ["c", "path", { d: "M7 12h3.5" }],
        ["d", "circle", { cx: 13.5, cy: 12, r: 1.15, anim: "pulse" }],
        ["d", "circle", { cx: 17, cy: 12, r: 1.15, anim: "pulse", delay: 0.14 }],
      ],
    },
    usb: {
      // the USB trident: stem with arrowhead, round end below, a branch to a circle and a branch to a square
      anim: "bounce",
      y: -2,
      origin: "12 21.5",
      els: [
        ["l", "path", { d: "M12 18V6" }],
        ["s", "path", { d: "M11.41 3.06Q12 2.25 12.59 3.06L14.16 5.19Q14.75 6 13.75 6L10.25 6Q9.25 6 9.84 5.19Z" }],
        ["s", "circle", { cx: 12, cy: 19.75, r: 1.5 }],
        ["l", "path", { d: "M12 14.5 7.5 12V10.25" }],
        ["s", "circle", { cx: 7.5, cy: 8.5, r: 1.5, anim: "pop", delay: 0.15 }],
        ["l", "path", { d: "M12 16.5l4.5-2.5v-1.5" }],
        ["s", "path", { d: "M15.75 9.25h1.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-1.5a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 .5-.5Z", anim: "pop", delay: 0.22 }],
      ],
    },
    router: {
      els: [
        ["l", "path", { d: "M7 12.5V5.5", anim: "wiggle", deg: -8, origin: "7 12.5" }],
        ["l", "path", { d: "M17 12.5V5.5", anim: "wiggle", deg: 8, origin: "17 12.5", delay: 0.08 }],
        ["s", "path", { d: rr(3, 12.5, 18, 8, 3) }],
        ["d", "circle", { cx: 7, cy: 16.5, r: 1, anim: "pulse", delay: 0.1 }],
        ["d", "circle", { cx: 10.5, cy: 16.5, r: 1, anim: "pulse", delay: 0.2 }],
        ["d", "circle", { cx: 14, cy: 16.5, r: 1, anim: "pulse", delay: 0.3 }],
      ],
    },
    gauge: {
      els: [
        ["l", "path", { d: arc(12, 12.5, 9, -130, 130) }],
        ["l", "path", { d: "M12 12.5l3.5-3.5", anim: "tilt", deg: -75, origin: "12 12.5" }],
        ["s", "circle", { cx: 12, cy: 12.5, r: 1.25 }],
      ],
    },
    projector: {
      // wide body, big lens on the right, status light on the left, two feet
      els: [
        ["s", "path", { d: "M6 8.5h12a3.5 3.5 0 0 1 3.5 3.5v1.5a3.5 3.5 0 0 1-3.5 3.5H6a3.5 3.5 0 0 1-3.5-3.5V12A3.5 3.5 0 0 1 6 8.5Z" }],
        ["l", "path", { d: "M6.5 17v2.25M17.5 17v2.25" }],
        ["d", "circle", { cx: 7, cy: 12.75, r: 1, anim: "pulse", delay: 0.1 }],
        ["k", "circle", { cx: 15.25, cy: 12.75, r: 2.5, anim: "pop", s: 1.14 }],
      ],
    },
    presentation: {
      els: [
        ["s", "path", { d: rr(3, 3.5, 18, 13, 3) }],
        ["c", "path", { d: "M8 13v-2", anim: "grow", origin: "8 13" }],
        ["c", "path", { d: "M12 13V7.5", anim: "grow", origin: "12 13", delay: 0.1 }],
        ["c", "path", { d: "M16 13V9.5", anim: "grow", origin: "16 13", delay: 0.2 }],
        ["l", "path", { d: "M10.5 16.5L9 21M13.5 16.5L15 21" }],
      ],
    },
    joystick: {
      els: [
        ["l", "path", { d: "M12 15V9.5", ...JOY }],
        ["s", "circle", { cx: 12, cy: 6.25, r: 3.25, ...JOY }],
        ["s", "path", { d: rr(15.5, 12, 3, 3, 1), anim: "squash", origin: "17 15", delay: 0.2 }],
        ["s", "path", { d: rr(3.5, 15, 17, 5.5, 2.75) }],
      ],
    },
    "satellite-dish": {
      els: [
        ["l", "path", { d: soft([[5.5, 21], [8.25, 15.25], [11, 21]], 1.5, false) }],
        ["l", "path", { d: "M0 0V-5.5", ...DISH }],
        ["s", "circle", { cx: 0, cy: -6.5, r: 1, ...DISH }],
        ["k", "path", { d: bowl(7.5, 1.5), ...DISH }],
      ],
    },
    antenna: {
      els: [
        ["l", "path", { d: "M12 8v8.5" }],
        ["s", "path", { d: soft([[12, 15.5], [15.5, 21], [8.5, 21]], 1.75) }],
        ["s", "circle", { cx: 12, cy: 7, r: 1, anim: "heartbeat", s: 1.3 }],
        ["l", "path", { d: arc(12, 7, 4.5, 235, 305), anim: "pulse", delay: 0.08 }],
        ["l", "path", { d: arc(12, 7, 4.5, 55, 125), anim: "pulse", delay: 0.08 }],
        ["l", "path", { d: arc(12, 7, 8.5, 242, 298), anim: "pulse", delay: 0.18 }],
        ["l", "path", { d: arc(12, 7, 8.5, 62, 118), anim: "pulse", delay: 0.18 }],
      ],
    },
    signal: {
      els: [
        ["l", "path", { d: "M4.5 20v-3", anim: "grow", origin: "4.5 20" }],
        ["l", "path", { d: "M9.5 20v-6.5", anim: "grow", origin: "9.5 20", delay: 0.08 }],
        ["l", "path", { d: "M14.5 20V9.5", anim: "grow", origin: "14.5 20", delay: 0.16 }],
        ["l", "path", { d: "M19.5 20V4.5", anim: "grow", origin: "19.5 20", delay: 0.24 }],
      ],
    },
    vibrate: {
      els: [
        ["s", "path", { d: rr(7.5, 3, 9, 18, 3), anim: "shake", x: 1.2 }],
        ["c", "path", { d: "M11 17.5h2", anim: "shake", x: 1.2 }],
        ["l", "path", { d: "M3.5 9v6", anim: "pulse", delay: 0.05 }],
        ["l", "path", { d: "M20.5 9v6", anim: "pulse", delay: 0.15 }],
      ],
    },
  });
})();
