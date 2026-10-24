# Icon style guide

Read `src/core.js` (the engine + element kinds) and `src/icons/_example.js` (five approved icons) first.
The examples ARE the style. Match their weight, softness, and simplicity.

## Grid
- 24×24 viewBox. Default stroke 2, but icons must also look right at 1.5 and 2.5.
- Keep stroke **centerlines** inside 3–21 (so outer edges stay inside 2–22). Use the space: icons should feel big.
- Optical sizes: circle r=9 at (12,12); square ≈ 3.5→20.5 with corner radius 4; tall/wide shapes adjusted so
  they *look* the same size as the circle.
- Snap coordinates to .25 where you can.

## Shape language
- Round caps, round joins (automatic). Soft corners everywhere: radius 3 on medium shapes, 4–5 on large
  containers, 1–1.5 on small tabs/feet. No sharp corners, no hairline details.
- **No sharp points, ever.** The round join only gives a tip radius of half the stroke, which still reads
  pointy on acute corners (and the fill silhouette shows it most). Every convex tip sharper than ~100° —
  star points, drop/pin/flame tips, heart bottoms, crown peaks, triangle corners, pencil/plane noses, eye
  corners — must be drawn with an explicit arc in the path: radius ≥1.5, ≥2 for tips under ~60°. Judge it in
  the fill column: every tip should look like a soft rounded nub, like a gumdrop, never a needle.
- Minimal detail: most icons are 1–4 elements. If a detail doesn't survive at 16px, drop it.
- Parallel strokes need ≥ 2 units of clear space between their outer edges at stroke 2.5
  (i.e. centerlines ≥ 4.5 apart) or they clog.
- Arrowheads/chevrons: open `l` polylines, arms ≈ 4.5–5 long, 90° angle (e.g. `M14 7l5 5-5 5`).

## Line vs fill (both must look intentional)
- Containers (circle, square, bubble, file, bag…) → `s`, so fill = solid silhouette.
- Details sitting *inside* a container (hands, lines, check marks, dots) → `c` / `d`, so fill cuts them out.
- Overlapping/stacked parts (person in front of person, badge on a corner, cap on a pencil) → front part is `k`
  so it cuts a clean gap around itself. Never let two filled shapes merge into a blob.
- Pure-stroke glyphs (arrows, plus, menu) are `l`; fill looks identical to line, that's fine.
- Anything that must not be lost when filled: check the fill column of the sheet. A cut detail must be at
  least ~3 units from the container edge or it splits the silhouette.

## Motion (every icon animates; the bar is "delightful", not "something moves")
Presets live in `ANIMS` in core.js — read their comments. Do not add presets or edit core.js.
Parameters: `x`/`y` (grid units), `deg`, `s` (peak scale), `origin` ("x y" pivot), `delay` (s).

**Principles**
1. Act out what the object does. A bell rings, a lid lifts, a lock's shackle springs open, a heart beats,
   a plane flies, a coin drops into a slot, a hand sweeps round a clock. Ask "what would this thing do if
   you poked it?" and animate that.
2. Animate the meaningful part, not the whole icon. Whole-icon motion only when the whole object moves
   (rocket lifts off, plane flies, ghost floats, send flies).
3. Pivots must be physically right: hinges at the hinge, pendulums at the hanging point, clock hands at the
   centre, squash/bounce `origin` at the base the object stands on.
4. Two or three parts moving with small staggered delays (0.06–0.14s) beats one part moving. Use it for
   sequences: wifi arcs, chat dots, chart bars, sound waves, rain drops, the clapper after the bell.
5. Amounts: nudge 2–3 units; tilt 15–30°; swing 12–20°; wiggle 8–12°; pop s 1.12–1.22. Parts may leave the
   24 box briefly by ≤3 units (nothing clips), but the rest pose must be untouched.
5b. No part may ever cross into another part, including on the spring-back: `nudge`/`tilt`/`swing` overshoot
   past rest. A lid, shackle or anything resting on another part uses `bounce` (never goes below rest).
   Arrows move as one piece with their tail; never animate the tail while the head stays put.
6. `turn` ends rotated by `deg`, then snaps back — so `deg` must be the shape's rotational symmetry
   (gear: 360/teeth; two-arrow refresh: 180; clock hand: 360). Use it on symmetric parts only.
7. `spin` is constant speed: loaders and dashed rings only (deg = one dash period for dashed rings).
8. Never: spin or flip a whole non-symmetric icon, pulse opacity on something that isn't a signal,
   use `pop` as a default for everything (max ~15% of a category), or move a part the eye can't read.

**Recipes**
- arrows/chevrons: `nudge` along the arrow's direction (diagonals: x and y both); double chevrons stagger.
- bidirectional (swap, sort, expand, collapse): each half nudges its own way, same time.
- refresh/rotate/undo/redo: `turn` on the arrow parts (180 for two-arrow cycles; undo/redo: `tilt` ±25°
  around the curve's centre feels better than a full turn).
- history: clock hands `turn` deg -360 (rewind), arrow ring `tilt` -20° around centre, slight delay.
- navigation/compass: needle/arrow `wiggle` around its centre like it's finding north (deg 18).
- lids/doors/flaps/shackles: `tilt` around the hinge. Bells/tags/medals/hanging: `swing` from the top.
- hearts: `heartbeat`. Stars/sparkles/crowns jewels: `twinkle`. Checks/lines/charts: `draw` or staggered `grow`.
- containers receiving things (inbox, download tray, piggy bank): the thing `enter`s from above, tray `squash`.
- devices: animate the screen content or a button/light, not the device body.
- weather: sun rays `turn` (symmetry angle), rain `enter` y:-3 staggered, snowflake `turn` 60, wind lines `nudge` x staggered.

**Verify motion with the filmstrip** (see Workflow). Frame 1 and the last frame must equal the rest pose;
frames 2–9 must read clearly as the action you intended. If you can't tell what's happening, it's wrong.

## Originality (hard rule)
Draw every path yourself from geometry. Do not open, copy, trace, or adapt paths from any icon library
(Central, Hugeicons, Lucide, Feather, Tabler, Phosphor, Heroicons, Material, Radix, etc.), including any
copies on this machine or in node_modules. Common shapes (a circle, an arrow) are fine; their paths must be yours.

## Workflow
1. Write `src/icons/<category>.js` calling `Icons.define("<category>", { ... })`. Names: kebab-case.
2. Render: `node tools/sheet.cjs <scratch>/sheet.png src/icons/<category>.js` then view the PNG.
   Each cell: big line + big fill at stroke 2, then 24px row at line 1.5 / line 2 / fill 2 / fill 2.5.
3. Motion: `node tools/film.cjs <scratch>/film.png src/icons/<category>.js [--only a,b]` then view the PNG.
   One row per icon, 12 frames across one play, faint ghost = rest pose, dashed square = 24 box.
4. Fix anything off: crowding, clipping, uneven size vs neighbours, blobby fills, details lost at 24px.
   Iterate until every icon is something you'd ship. Expect 2–4 rounds.
