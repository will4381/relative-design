// Icon engine: registry + renderer + animations. No dependencies.
// Runs as a browser <script> (global `Icons`) or in Node (`require`).
//
// Every icon draws white/black shapes into a <mask>, then paints one currentColor rect through it,
// so line and fill share a silhouette and overlapping parts can cut clean gaps.
//
// Element: [kind, tag, attrs]
//   kind  s = shape     line → outline, fill → solid
//         l = line      always a stroke
//         c = cut       line → stroke, fill → cut out of whatever is under it
//         k = knockout  clears a `gap` around itself first (front layer), then draws like `s`
//         d = dot       solid, no stroke; behaves like `c` (line → shown, fill → cut out). Standalone dots: use `s` circle r=.5
//   attrs SVG attributes, plus optional motion (see ANIMS):
//         anim    preset name
//         origin  "x y" pivot in 24-grid units (default: the part's own center)
//         delay   seconds, to stagger parts
//         x, y    distance in grid units   (nudge, shake, bounce, float, enter)
//         dx, dy  same as x, y — use these on <rect>, whose own x/y are its position
//         deg     angle in degrees         (tilt, swing, wiggle, turn, spin)
//         s       peak scale               (pop, heartbeat)
// Icon: { els: [...], anim?, origin?, x?, y?, deg?, s?, delay? }  — whole-icon motion uses the same keys.
(function () {
  const ICONS = {};

  // Presets. Each settles with a little overshoot so motion feels physical, then rests exactly where it started.
  // Parameters arrive as CSS variables (--ic-x, --ic-y, --ic-deg, --ic-s) set on the part's wrapper.
  const X = "var(--ic-x,0px)", Y = "var(--ic-y,0px)", D = "var(--ic-deg,12deg)", S = "var(--ic-s,1.18)";
  const at = (f) => `calc(${X} * ${f}),calc(${Y} * ${f})`;
  const sc = (f) => `calc(1 + (${S} - 1) * ${f})`;
  const ANIMS = {
    // move along (x, y) and spring back: arrows, sends, uploads
    nudge: `30%{transform:translate(${X},${Y})}55%{transform:translate(${at(-0.3)})}75%{transform:translate(${at(0.1)})}90%{transform:translate(${at(-0.03)})}`,
    // damped side-to-side: errors, alarms, buzzing
    shake: `12%{transform:translate(${X},${Y})}28%{transform:translate(${at(-0.85)})}44%{transform:translate(${at(0.6)})}60%{transform:translate(${at(-0.35)})}76%{transform:translate(${at(0.15)})}`,
    // hop with a squash on landing (set origin at the base): pins, notes, balls
    bounce: `30%{transform:translateY(var(--ic-y,-3px))}55%{transform:translateY(0) scale(1.06,.92)}72%{transform:translateY(calc(var(--ic-y,-3px) * .22)) scale(.98,1.02)}88%{transform:translateY(0)}`,
    // gentle hover in place, best on loop: ghosts, balloons, clouds
    float: `50%{transform:translate(${X},var(--ic-y,-2px))}`,
    // rotate to `deg` around a hinge and settle back: lids, flaps, doors, latches
    tilt: `35%{transform:rotate(var(--ic-deg,-18deg))}55%{transform:rotate(calc(var(--ic-deg,-18deg) * .8))}80%{transform:rotate(calc(var(--ic-deg,-18deg) * -.1))}`,
    // damped pendulum from a pivot: bells, tags, medals, hanging things
    swing: `14%{transform:rotate(var(--ic-deg,16deg))}32%{transform:rotate(calc(var(--ic-deg,16deg) * -.7))}50%{transform:rotate(calc(var(--ic-deg,16deg) * .42))}68%{transform:rotate(calc(var(--ic-deg,16deg) * -.2))}84%{transform:rotate(calc(var(--ic-deg,16deg) * .07))}`,
    // quick small damped rotation: tools, pencils, playful nods
    wiggle: `15%{transform:rotate(${D})}35%{transform:rotate(calc(${D} * -.8))}55%{transform:rotate(calc(${D} * .45))}75%{transform:rotate(calc(${D} * -.15))}`,
    // eased rotation by `deg` with overshoot, ends at deg — pick deg = the shape's symmetry
    // (gear tooth step, 180 for two-arrow refresh, 360 for a clock hand) so the reset is invisible
    turn: `70%{transform:rotate(calc(var(--ic-deg,360deg) * 1.04))}100%{transform:rotate(var(--ic-deg,360deg))}`,
    // constant-speed rotation by `deg`, for loaders and dashed rings (seamless on loop)
    spin: `to{transform:rotate(var(--ic-deg,360deg))}`,
    // scale up and settle: likes, stars, badges, confirmations
    pop: `35%{transform:scale(${S})}60%{transform:scale(${sc(-0.35)})}80%{transform:scale(${sc(0.12)})}`,
    // double beat: hearts, health, live
    heartbeat: `14%{transform:scale(${S})}28%{transform:scale(.96)}42%{transform:scale(${sc(0.75)})}62%{transform:scale(1)}`,
    // appear from nothing with overshoot: plus/check badges, new items
    grow: `0%{transform:scale(0)}55%{transform:scale(1.15)}75%{transform:scale(.95)}`,
    // squeeze and recover (set origin at the base): flames, shutters, jelly
    squash: `30%{transform:scale(1.14,.86)}55%{transform:scale(.94,1.06)}75%{transform:scale(1.03,.97)}`,
    // close-and-open on Y: eyes
    blink: `40%,60%{transform:scaleY(1)}50%{transform:scaleY(.08)}`,
    // shrink, twist and burst back: sparkles, stars, magic
    twinkle: `30%{transform:scale(.55) rotate(-25deg)}65%{transform:scale(1.18) rotate(8deg)}85%{transform:scale(.97) rotate(-2deg)}`,
    // slide in from (x, y) while fading in: drops, items arriving, waves
    enter: `0%{transform:translate(${X},${Y});opacity:0}60%{opacity:1}75%{transform:translate(${at(-0.12)})}`,
    // fade a part out and back: signal bars, sound waves (stagger with delay)
    pulse: `45%{opacity:.15}`,
    // stroke draws itself on: checks, lines, charts (l/c paths only)
    // finishes in the first ~40% with a quick ease-out, then holds — a full-length draw feels sluggish.
    // fades in over the first frames so round caps don't leave a dot.
    draw: `0%{stroke-dashoffset:1;opacity:0;animation-timing-function:cubic-bezier(.25,.8,.3,1)}5%{opacity:1}40%{stroke-dashoffset:0}`,
  };
  const LINEAR = ["spin"];
  const PARAMS = { x: "px", y: "px", deg: "deg", s: "" };

  const BASE =
    ".ic{overflow:visible}" +
    ".ic .ic-a{transform-box:fill-box;transform-origin:center}" +
    ".ic .ic-o{transform-box:view-box}" +
    ".ic:is(.ic-hover:hover,.ic-loop,.ic-play) .ic-a,.ic-trigger:hover .ic .ic-a{animation-duration:var(--ic-dur,.9s);" +
    "animation-timing-function:var(--ic-ease,cubic-bezier(.45,0,.25,1));animation-iteration-count:var(--ic-iter,1);" +
    // backwards: delayed parts hold their first frame while waiting (no flash before grow/enter)
    "animation-delay:calc(var(--ic-delay,0s) - var(--ic-seek,0s));animation-fill-mode:backwards}" +
    ".ic-loop{--ic-iter:infinite}" +
    LINEAR.map((a) => `.ic .ic-a-${a}{--ic-ease:linear}`).join("") +
    "@media (prefers-reduced-motion:reduce){.ic .ic-a{animation:none!important}}";

  const animCss = (a) =>
    `@keyframes ic-${a}{${ANIMS[a]}}` +
    `.ic:is(.ic-hover:hover,.ic-loop,.ic-play) .ic-a-${a},.ic-trigger:hover .ic .ic-a-${a}{animation-name:ic-${a}}`;

  // Full stylesheet: load once per page, then render with { css: false }.
  const css = () => BASE + Object.keys(ANIMS).map(animCss).join("");

  function checkMotion(name, m) {
    if (!m.anim) return;
    if (!ANIMS[m.anim]) throw new Error(`${name}: unknown anim "${m.anim}"`);
    for (const k of Object.keys(PARAMS)) if (m[k] !== undefined && typeof m[k] !== "number") throw new Error(`${name}: ${k} must be a number`);
    if (m.dx !== undefined) m = { ...m, x: m.dx };
    if (m.dy !== undefined) m = { ...m, y: m.dy };
    if (["nudge", "shake", "enter"].includes(m.anim) && !m.x && !m.y) throw new Error(`${name}: ${m.anim} needs x and/or y`);
  }

  function define(category, icons) {
    for (const [name, icon] of Object.entries(icons)) {
      if (ICONS[name]) throw new Error(`duplicate icon "${name}"`);
      for (const [kind, tag, a] of icon.els) {
        if (!"slckd".includes(kind)) throw new Error(`${name}: bad kind "${kind}"`);
        checkMotion(name, motionOf(tag, a).m);
      }
      checkMotion(name, icon);
      ICONS[name] = { ...icon, category };
    }
  }

  // Split an element's attrs into motion params and SVG attributes. <rect> keeps x/y as its position.
  function motionOf(tag, a) {
    const { anim, origin, delay, deg, s, dx, dy, ...rest } = a;
    const m = { anim, origin, delay, deg, s, x: dx, y: dy };
    if (tag !== "rect") {
      if (dx === undefined && rest.x !== undefined) { m.x = rest.x; delete rest.x; }
      if (dy === undefined && rest.y !== undefined) { m.y = rest.y; delete rest.y; }
    }
    return { m, rest };
  }

  let n = 0;
  // Options: variant "line"|"fill", stroke (px on the 24 grid), size, gap, trigger "hover"|"loop"|"play"|"none",
  // css (embed this icon's animation styles; pass false if css() is already on the page), id, title.
  function svg(name, opts = {}) {
    const icon = ICONS[name];
    if (!icon) throw new Error(`unknown icon "${name}"`);
    const { variant = "line", stroke = 2, size = 24, gap = 1.5, trigger = "hover", css: embed = true, title } = opts;
    const id = opts.id || `ic-${name}-${variant}-${++n}`;
    const fill = variant === "fill";
    const used = new Set();

    const attrs = (o) => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(" ");
    const wrap = (inner, m) => {
      if (!m.anim || trigger === "none") return inner;
      used.add(m.anim);
      const style = [
        m.origin && `transform-origin:${m.origin.split(" ").map((v) => v + "px").join(" ")}`,
        m.delay && `--ic-delay:${m.delay}s`,
        ...Object.entries(PARAMS).filter(([k]) => m[k] !== undefined).map(([k, u]) => `--ic-${k}:${m[k]}${u}`),
      ].filter(Boolean).join(";");
      return `<g class="ic-a ic-a-${m.anim}${m.origin ? " ic-o" : ""}"${style ? ` style="${style}"` : ""}>${inner}</g>`;
    };
    const W = "#fff", B = "#000";

    const body = icon.els.map(([kind, tag, a]) => {
      const { m, rest } = motionOf(tag, a);
      const { anim } = m;
      if (anim === "draw") Object.assign(rest, { pathLength: 1, "stroke-dasharray": 1 });
      const el = (paint) => `<${tag} ${attrs({ ...rest, ...paint })}/>`;
      let out;
      if (kind === "k")
        out = el({ fill: B, stroke: B, style: `stroke-width:calc(var(--ic-stroke,${stroke}px) + ${2 * gap}px)` }) +
          el(fill ? { fill: W, stroke: W } : { stroke: W });
      // tiny circles are dots: a stroked r≤1.25 circle leaves a pinhole/seam in some renderers, so draw a
      // zero-length round-capped line instead, as wide as the circle would be (2r + stroke)
      else if (kind === "s" && tag === "circle" && +rest.r <= 1.25)
        out = `<path d="M${rest.cx} ${rest.cy}h0" stroke="${W}" stroke-linecap="round" style="stroke-width:calc(var(--ic-stroke,${stroke}px) + ${2 * rest.r}px)"${rest.transform ? ` transform="${rest.transform}"` : ""}/>`;
      else if (kind === "s") out = el(fill ? { fill: W, stroke: W } : { stroke: W });
      else if (kind === "c") out = el({ stroke: fill ? B : W });
      else if (kind === "d") out = el({ fill: fill ? B : W, stroke: "none" });
      else out = el({ stroke: W });
      return wrap(out, m);
    }).join("");
    const root = wrap(body, icon);

    // The mask and paint area extend past the 24 box so motion never clips.
    const cls = `ic${trigger !== "none" ? ` ic-${trigger}` : ""}`;
    const style = embed && used.size ? `<style>${BASE}${[...used].map(animCss).join("")}</style>` : "";
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" overflow="visible"` +
      `${title ? ` role="img" aria-label="${title}"` : ` aria-hidden="true"`}>${title ? `<title>${title}</title>` : ""}${style}` +
      `<mask id="${id}" maskUnits="userSpaceOnUse" x="-6" y="-6" width="36" height="36"><rect x="-6" y="-6" width="36" height="36" fill="#000"/>` +
      `<g fill="none" style="stroke-width:var(--ic-stroke,${stroke}px)" stroke-linecap="round" stroke-linejoin="round">${root}</g></mask>` +
      `<rect x="-6" y="-6" width="36" height="36" fill="currentColor" mask="url(#${id})"/></svg>`
    );
  }

  const api = { ICONS, ANIMS, define, svg, css, get names() { return Object.keys(ICONS); } };
  globalThis.Icons = api;
  if (typeof module !== "undefined") module.exports = api;
})();
