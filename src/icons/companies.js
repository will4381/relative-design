// Companies: well-known marks re-drawn from grid geometry (no logo files or icon sets), proportions measured
// against the real marks. Solid marks are closed `s` silhouettes: each path is the real shape inset by half a
// stroke, so fill = the mark with softened corners and line = its 2px outline. Counters are evenodd holes or cuts.
// Marks that are linear in reality (meta, airbnb, the amazon smile, uber's U) are strokes.
(function () {
  const f = (v) => +v.toFixed(2);
  const rad = (d) => (d * Math.PI) / 180;
  // Polygon whose corners are true arcs: pts = [[x, y, r], ...].
  const soft = (pts) => {
    const n = pts.length;
    let d = "";
    for (let i = 0; i < n; i++) {
      const [vx, vy, r = 0] = pts[i], [px, py] = pts[(i + n - 1) % n], [nx, ny] = pts[(i + 1) % n];
      const l1 = Math.hypot(px - vx, py - vy), l2 = Math.hypot(nx - vx, ny - vy);
      const u1 = [(px - vx) / l1, (py - vy) / l1], u2 = [(nx - vx) / l2, (ny - vy) / l2];
      const half = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))) / 2;
      if (!r) { d += `${d ? "L" : "M"}${f(vx)} ${f(vy)}`; continue; }
      const t = Math.min(r / Math.tan(half), l1 / 2, l2 / 2), rho = t * Math.tan(half);
      const sweep = -u1[0] * u2[1] + u1[1] * u2[0] > 0 ? 1 : 0;
      d += `${d ? "L" : "M"}${f(vx + u1[0] * t)} ${f(vy + u1[1] * t)}A${f(rho)} ${f(rho)} 0 0 ${sweep} ${f(vx + u2[0] * t)} ${f(vy + u2[1] * t)}`;
    }
    return d + "Z";
  };
  // Move every edge of a clockwise polygon inward by d (negative d grows it); radii ride along.
  const inset = (pts, d) => pts.map((p, i) => {
    const n = pts.length, a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const nrm = (p0, p1) => { const l = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); return [-(p1[1] - p0[1]) / l, (p1[0] - p0[0]) / l]; };
    const n1 = nrm(a, p), n2 = nrm(p, b), k = d / (1 + n1[0] * n2[0] + n1[1] * n2[1]);
    return [p[0] + (n1[0] + n2[0]) * k, p[1] + (n1[1] + n2[1]) * k, p[2]];
  });
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  const pt = (cx, cy, rx, ry, deg) => [f(cx + rx * Math.cos(rad(deg))), f(cy + ry * Math.sin(rad(deg)))];
  const circle = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  // S: two stacked elliptic bowls (an open stroke), top one opening right, bottom one opening left.
  const S = (cx, top, rx, h) => {
    const ry = h / 4, c1 = top + ry, c2 = top + 3 * ry;
    const [ax, ay] = pt(cx, c1, rx, ry, -38), [bx, by] = pt(cx, c2, rx, ry, 142);
    return `M${ax} ${ay}A${rx} ${ry} 0 1 0 ${cx} ${top + 2 * ry}A${rx} ${ry} 0 1 1 ${bx} ${by}`;
  };
  const IN = 0.9; // inset: real edge → path centreline

  // ---- pen: a closed outline through vertices joined by lines, circular arcs or cubics ----
  // Items: [x, y, r?] = line to (x, y); {to: [x, y], a: [cx, cy], s: 0|1, r?} = arc about (cx, cy), s = 1 clockwise;
  // {to, c: [x1, y1, x2, y2], r?} = cubic. The first item's join type also closes the shape. r = fillet radius at that vertex.
  const pen = (items) => {
    const V = items.map((it) => (Array.isArray(it) ? { to: [it[0], it[1]], r: it[2] || 0 } : { r: 0, ...it }));
    const n = V.length;
    const segs = V.map((v, i) => {
      const P0 = V[(i + n - 1) % n].to, P1 = v.to;
      if (v.a) {
        const [cx, cy] = v.a, R = Math.hypot(P0[0] - cx, P0[1] - cy), a0 = Math.atan2(P0[1] - cy, P0[0] - cx), a1 = Math.atan2(P1[1] - cy, P1[0] - cx);
        const k = v.s ? 1 : -1, span = (((k * (a1 - a0)) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const ang = (t) => a0 + k * span * t;
        return { len: R * span, at: (t) => [cx + R * Math.cos(ang(t)), cy + R * Math.sin(ang(t))], tan: (t) => [-k * Math.sin(ang(t)), k * Math.cos(ang(t))],
          svg: (t0, t1, q) => `A${f(R)} ${f(R)} 0 ${span * (t1 - t0) > Math.PI ? 1 : 0} ${v.s ? 1 : 0} ${q.map(f).join(" ")}` };
      }
      if (v.c) {
        const B = [P0, [v.c[0], v.c[1]], [v.c[2], v.c[3]], P1];
        const at = (t) => [0, 1].map((j) => (1 - t) ** 3 * B[0][j] + 3 * (1 - t) ** 2 * t * B[1][j] + 3 * (1 - t) * t * t * B[2][j] + t ** 3 * B[3][j]);
        const tan = (t) => { const d = [0, 1].map((j) => 3 * (1 - t) ** 2 * (B[1][j] - B[0][j]) + 6 * (1 - t) * t * (B[2][j] - B[1][j]) + 3 * t * t * (B[3][j] - B[2][j])); const l = Math.hypot(...d) || 1; return [d[0] / l, d[1] / l]; };
        let len = 0; for (let i = 1; i <= 24; i++) len += Math.hypot(at(i / 24)[0] - at((i - 1) / 24)[0], at(i / 24)[1] - at((i - 1) / 24)[1]);
        // sub-curve [t0, t1]: end handles scaled along the tangents
        const d = (t) => [0, 1].map((j) => 3 * (1 - t) ** 2 * (B[1][j] - B[0][j]) + 6 * (1 - t) * t * (B[2][j] - B[1][j]) + 3 * t * t * (B[3][j] - B[2][j]));
        return { len, at, tan, svg: (t0, t1, q) => { const p0 = at(t0), k = (t1 - t0) / 3, d0 = d(t0), d1 = d(t1);
          return `C${f(p0[0] + d0[0] * k)} ${f(p0[1] + d0[1] * k)} ${f(q[0] - d1[0] * k)} ${f(q[1] - d1[1] * k)} ${q.map(f).join(" ")}`; } };
      }
      const L = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]) || 1e-9, u = [(P1[0] - P0[0]) / L, (P1[1] - P0[1]) / L];
      return { len: L, at: (t) => [P0[0] + u[0] * L * t, P0[1] + u[1] * L * t], tan: () => u, svg: (t0, t1, q) => `L${q.map(f).join(" ")}` };
    });
    const t0 = Array(n).fill(0), t1 = Array(n).fill(1), fil = [];
    V.forEach((v, i) => {
      const A = segs[i], B = segs[(i + 1) % n];
      if (!v.r) return;
      const di = A.tan(1), dout = B.tan(0), phi = Math.acos(Math.max(-1, Math.min(1, di[0] * dout[0] + di[1] * dout[1])));
      const t = Math.min(v.r * Math.tan(phi / 2), 0.45 * A.len, 0.45 * B.len);
      t1[i] = 1 - t / A.len; t0[(i + 1) % n] = t / B.len; fil[i] = true;
    });
    let d = "";
    for (let k = 1; k <= n; k++) {
      const i = k % n, S = segs[i], q = S.at(t1[i]);
      if (!d) d = `M${S.at(t0[i]).map(f).join(" ")}`;
      d += S.svg(t0[i], t1[i], q);
      if (fil[i]) {
        const N = segs[(i + 1) % n], p = N.at(t0[(i + 1) % n]), a = S.tan(t1[i]), b = N.tan(t0[(i + 1) % n]);
        const den = a[0] * b[1] - a[1] * b[0], s = den ? ((p[0] - q[0]) * b[1] - (p[1] - q[1]) * b[0]) / den : 0;
        const c = den ? [q[0] + a[0] * s, q[1] + a[1] * s] : V[i].to;
        d += `Q${c.map(f).join(" ")} ${p.map(f).join(" ")}`;
      }
    }
    return d + "Z";
  };
  // ---- band: a centreline of lines/arcs (tangent-continuous) thickened to half-width h, square ends filleted by r ----
  // start [x, y]; segs: [x, y] line or {to, a, s} arc. Returns pen items.
  const band = (start, segs, h, r = 0.4) => {
    const pts = [start, ...segs.map((s) => (Array.isArray(s) ? s : s.to))];
    const norm = (j, end) => { // unit normal (left of travel) at the start/end of centreline segment j
      const s = segs[j], P = end ? pts[j + 1] : pts[j];
      if (s.a) { const u = [(P[0] - s.a[0]), (P[1] - s.a[1])], l = Math.hypot(...u); return s.s ? [-u[0] / l, -u[1] / l] : [u[0] / l, u[1] / l]; }
      const d = [pts[j + 1][0] - pts[j][0], pts[j + 1][1] - pts[j][1]], l = Math.hypot(...d); return [-d[1] / l, d[0] / l];
    };
    const off = (P, N, k) => [P[0] + N[0] * h * k, P[1] + N[1] * h * k];
    const m = segs.length, out = [[...off(start, norm(0), 1), r]];
    segs.forEach((s, j) => { const to = off(pts[j + 1], norm(j, true), 1); out.push(s.a ? { to, a: s.a, s: s.s } : to); });
    out[out.length - 1] = Array.isArray(out[m]) ? [...out[m], r] : { ...out[m], r };
    out.push([...off(pts[m], norm(m - 1, true), -1), r]);
    for (let j = m - 1; j >= 0; j--) { const s = segs[j], to = off(pts[j], norm(j), -1); out.push(s.a ? { to, a: s.a, s: s.s ? 0 : 1 } : to); }
    const last = out.length - 1; out[last] = Array.isArray(out[last]) ? [...out[last], r] : { ...out[last], r };
    return out;
  };


  // google: thick G band (outer r 9) with its bar; terminal cut radially at -45°
  const GOOGLE = pen([
    [18.36, 5.64, 0.3],
    { to: [21, 12.08], a: [12, 12], s: 0, r: 0.4 },
    [13.37, 12.08, 0.35],
    [13.37, 12.78, 0.35],
    [19.91, 12.78],
    { to: [17.62, 6.38], a: [12, 12], s: 1, r: 0.3 },
  ]);

  // apple: two top lobes, round bite on the right, narrower bottom with a soft dip; leaf angled up-right
  const APPLE = pen([
    { to: [12, 9.05], c: [10.2, 8.1, 11.2, 8.45] },
    { to: [15.5, 8.25], c: [13.1, 8.3, 14.3, 8.05] },
    { to: [17.85, 9.5], c: [16.6, 8.4, 17.3, 8.85], r: 0.75 },
    { to: [18.2, 16.3], a: [20, 12.75], s: 0, r: 0.75 },
    { to: [15.75, 20.1], c: [17.6, 18.1, 16.9, 20] },
    { to: [12, 19.6], c: [14.7, 20.2, 13.4, 19.6] },
    { to: [8.25, 20.1], c: [10.6, 19.6, 9.3, 20.2] },
    { to: [5.6, 13.75], c: [7, 20, 5.6, 17] },
    { to: [9, 8.1], c: [5.6, 10.25, 7.2, 8.1] },
  ]);
  const LEAF = "M12.6 6A3.6 3.6 0 0 1 15.4 3A3.6 3.6 0 0 1 12.6 6Z";

  // amazon: double-storey "a" (arch, stem with a foot flick, round bowl and counter) over the smile arrow
  const AMAZON_A = pen([
    [8.8, 6.25, 0.3],
    { to: [15.3, 7.4], a: [11.95, 7.4], s: 1 },
    [15.3, 13.1],
    [16.1, 13.7, 0.4],
    [15.15, 14.6, 0.4],
    [14.5, 13.95],
    [14.5, 13.25],
    { to: [14.5, 9.05], a: [12.15, 11.15], s: 1 },
    [14.5, 7.4],
    { to: [9.55, 6.53], a: [11.95, 7.4], s: 0, r: 0.3 },
  ]) + circle(12.15, 11.15, 2.6);
  const SMILE_END = [20.25, 16.5];
  const SMILE = `M3.5 16.5Q12.5 22.25 ${SMILE_END.join(" ")}`;
  const SMILE_HEAD = "M17.28 16.08L20.25 16.5L19.83 19.47";

  // stripe: heavy italic S, two tangent bowls, square-cut terminals
  const STRIPE = (() => {
    const C1 = [11.25, 8.75], C2 = [12.5, 15.4], r = Math.hypot(C2[0] - C1[0], C2[1] - C1[1]) / 2, M = [(C1[0] + C2[0]) / 2, (C1[1] + C2[1]) / 2];
    return pen(band([16.75, C1[1] - r], [[C1[0], C1[1] - r], { to: M, a: C1, s: 0 }, { to: [C2[0], C2[1] + r], a: C2, s: 1 }, [7, C2[1] + r]], 1.4, 0.5));
  })();

  // paypal: two solid italic P's, the upper-left one in front
  const PP = (dx, dy) => pen([
    [6.43 + dx, 16.4 + dy, 0.5],
    [6.43 + dx, 3.9 + dy, 0.6],
    [11.94 + dx, 3.9 + dy],
    { to: [11.94 + dx, 11 + dy], a: [11.94 + dx, 7.45 + dy], s: 1 },
    [8.3 + dx, 11 + dy],
    [8.3 + dx, 16.4 + dy, 0.5],
  ]);
  const ITALIC = "translate(1.77 0) skewX(-8.4)";

  // meta: the leaning infinity; loops lean in at the top, out at the bottom (its band is our stroke weight)
  const META = "M12 11.25C13.3 9.3 14.2 7 15.6 7C17.6 7 20.05 10 20.05 13.75C20.05 15.8 19.1 17.05 17.75 17.05C16.2 17.05 14.75 15.4 12 11.25" +
    "C10.7 9.3 9.8 7 8.4 7C6.4 7 3.95 10 3.95 13.75C3.95 15.8 4.9 17.05 6.25 17.05C7.8 17.05 9.25 15.4 12 11.25Z";

  // shopify: the bag in perspective (peaked top edge, folded side panel), handle, S cut into the front
  const BAG = inset([[7.5, 7.3, 0.6], [15.1, 5.25, 0.4], [17.9, 6.45, 0.5], [19.9, 19.8, 0.6], [14.3, 20.95, 0.4], [4.1, 19.1, 0.6]], IN);
  const onTop = (x) => { const [a, b] = BAG, t = (x - a[0]) / (b[0] - a[0]); return `${x} ${f(a[1] + t * (b[1] - a[1]))}`; };
  const HANDLE = `M${onTop(8.9)}C9.25 4.6 10.3 3.75 11.4 3.75C12.5 3.75 12.95 4.75 ${onTop(12.75)}`;
  const SLIT = `M${BAG[1].slice(0, 2).map(f).join(" ")}L${BAG[4].slice(0, 2).map(f).join(" ")}`;

  // notion: the cube (front face open) with its serif N
  const CUBE = soft(inset([[3.4, 4, 0.75], [15.4, 3, 0.75], [20.6, 6.5, 0.75], [20.6, 19.6, 0.75], [6.5, 20.95, 0.75], [3.4, 17.4, 0.75]], IN)) +
    soft([[6.75, 7.5, 0.5], [18.75, 6.75, 0.5], [18.75, 18.25, 0.5], [6.75, 19, 0.5]]);

  // slack: four pills, each with its dot, 90° rotational symmetry
  const PILL = rr(3.9, 8.65, 6.7, 1.95, 0.975);
  const DOT = pen([[8.65, 3.9, 0.85], [10.6, 3.9, 0.85], [10.6, 5.85, 0.15], [8.65, 5.85, 0.85]]);

  // airbnb: the bélo (a thin band in reality, so a stroke)
  const BELO = "M12 16.6C13.4 15 14.4 13.8 14.4 12.6A2.4 2.4 0 0 0 9.6 12.6C9.6 13.8 10.6 15 12 16.6C13.6 18.6 15.3 20.45 16.75 20.45" +
    "C18.6 20.45 21.01 18.53 19.95 16.6L13.3 4.5C12.77 3.54 11.23 3.54 10.7 4.5L4.05 16.6C2.99 18.53 5.4 20.45 7.25 20.45C8.7 20.45 10.4 18.6 12 16.6Z";

  // dropbox: five flat rhombi in the real layout, each shrunk a little about its centre so the soft corners keep gaps
  const RA = 2.75, RB = 1.6;
  const rhomb = (cx, cy) => soft([[cx - RA, cy, 0.4], [cx, cy - RB, 0.2], [cx + RA, cy, 0.4], [cx, cy + RB, 0.2]]);

  // openai: six round lobes around a hexagonal hole, seams swirling out from its corners
  const LOBE_D = 5.75, LOBE_R = 3.5;
  const DIP_M = LOBE_D * Math.cos(rad(30)) + Math.sqrt(LOBE_R ** 2 - (LOBE_D / 2) ** 2);
  const ROSETTE = [0, 1, 2, 3, 4, 5].map((i) => `${i ? "" : `M${pt(12, 12, DIP_M, DIP_M, -60).join(" ")}`}A${LOBE_R} ${LOBE_R} 0 1 1 ${pt(12, 12, DIP_M, DIP_M, 60 * i).join(" ")}`).join("") + "Z";
  const HOLE = soft([0, 1, 2, 3, 4, 5].map((i) => [...pt(12, 12, 3, 3, -90 + 60 * i), 0.75]));
  const SEAMS = [0, 1, 2, 3, 4, 5].map((i) => `M${pt(12, 12, 3, 3, -90 + 60 * i).join(" ")}L${pt(12, 12, DIP_M - 0.5, DIP_M - 0.5, -60 + 60 * i).join(" ")}`).join("");

  // anthropic: flat-topped A with its triangular counter, and the backslash slab
  const ANTHRO_A = soft(inset([[3, 18.25, 0.6], [8, 5.7, 0.5], [10.6, 5.7, 0.5], [15.8, 18.25, 0.6], [13, 18.25, 0.3], [11.97, 15.65, 0.2], [6.83, 15.65, 0.2], [5.8, 18.25, 0.3]], IN)) +
    soft(inset([[9.4, 9.2, 0.2], [11.05, 13.35, 0.2], [7.75, 13.35, 0.2]], -IN));
  const ANTHRO_SLASH = soft(inset([[12.25, 5.7, 0.6], [15, 5.7, 0.3], [21, 18.25, 0.6], [18.25, 18.25, 0.3]], IN));

  // chrome: three tangents off the inner ring, 120° apart
  const CHROME = [0, 120, 240].map((a) => {
    const c = Math.cos(rad(a)), s = Math.sin(rad(a)), R = (x, y) => [f(12 + (x - 12) * c - (y - 12) * s), f(12 + (x - 12) * s + (y - 12) * c)];
    return `M${R(12, 8).join(" ")}L${R(12 + Math.sqrt(81 - 16), 8).join(" ")}`;
  }).join("");

  // safari: long needle on the real diagonal (SW half cut), ticks round the dial clear of the needle's path
  const NU = [Math.cos(rad(-39)), Math.sin(rad(-39))], NN = [-NU[1], NU[0]];
  const NP = (a, b) => [12 + NU[0] * a + NN[0] * b, 12 + NU[1] * a + NN[1] * b];
  const NEEDLE = soft([[...NP(7.25, 0), 1.2], [...NP(0, 1.6), 0.4], [...NP(-7.25, 0), 1.2], [...NP(0, -1.6), 0.4]]);
  const NEEDLE_SW = soft([[...NP(-7.25, 0), 1.2], [...NP(0, -1.6), 0.3], [...NP(0, 1.6), 0.3]]);
  const TICKS = [0, 30, 60, 90, 180, 210, 240, 270].map((a) => `M${pt(12, 12, 6.5, 6.5, a).join(" ")}L${pt(12, 12, 7.25, 7.25, a).join(" ")}`).join("");

  // firefox: the fox wrapped round an open globe: tail spike top-left, ear top-centre, snout poking into the globe
  const GLOBE_C = [12.4, 12.3];
  const FOX = pen([
    [17.21, 5.79, 0.4],
    { to: [7.35, 5.37], a: [12, 12], s: 1, r: 1 },
    [7.87, 10.19, 0.3],
    [11, 10.9, 1.2],
    [7.57, 13.59, 0.3],
    { to: [11.96, 7.32], a: GLOBE_C, s: 0 },
    [14.6, 3.3, 1.2],
  ]);

  Icons.define("companies", {
    google: {
      // a lively wind-up twist about the centre
      anim: "tilt",
      deg: -20,
      origin: "12 12",
      els: [["s", "path", { d: GOOGLE }]],
    },
    "apple-logo": {
      els: [
        ["s", "path", { d: APPLE }],
        // the leaf flips up from its stem end and settles
        ["s", "path", { d: LEAF, anim: "tilt", deg: -16, origin: "12.6 6" }],
      ],
    },
    microsoft: {
      els: [[3, 3], [13.5, 3], [13.5, 13.5], [3, 13.5]].map(([x, y], i) => ["s", "path", { d: rr(x, y, 7.5, 7.5, 1.25), anim: "pop", s: 1.08, delay: i * 0.08 }]),
    },
    meta: {
      els: [["l", "path", { d: META, anim: "draw" }]],
    },
    amazon: {
      els: [
        ["s", "path", { d: AMAZON_A, "fill-rule": "evenodd" }],
        ["l", "path", { d: SMILE, anim: "draw" }],
        ["l", "path", { d: SMILE_HEAD, anim: "grow", origin: SMILE_END.join(" "), delay: 0.3 }],
      ],
    },
    stripe: {
      anim: "wiggle",
      deg: 10,
      origin: "12 12",
      els: [["s", "path", { d: STRIPE, transform: "translate(2.12 0) skewX(-10)" }]],
    },
    paypal: {
      els: [
        ["s", "path", { d: PP(3, 3.6), transform: ITALIC, anim: "bounce", y: -1.5, origin: "14 21", delay: 0.1 }],
        ["k", "path", { d: PP(0, 0), transform: ITALIC, anim: "bounce", y: -1.5, origin: "6.5 17.5" }],
      ],
    },
    shopify: {
      anim: "bounce",
      y: -2.5,
      origin: "12 20.5",
      els: [
        ["s", "path", { d: soft(BAG) }],
        ["l", "path", { d: HANDLE }],
        ["c", "path", { d: SLIT }],
        ["c", "path", { d: S(9.6, 9.75, 2.2, 8), transform: "translate(2.42 0) skewX(-10)" }],
      ],
    },
    figma: {
      els: [
        ["s", "path", { d: "M12 9.25H9.25a2.75 2.75 0 0 1 0-5.5H12Z", anim: "pop", s: 1.14, origin: "12 9.25" }],
        ["s", "path", { d: "M12 3.75h2.75a2.75 2.75 0 0 1 0 5.5H12Z", anim: "pop", s: 1.14, origin: "12 9.25", delay: 0.08 }],
        ["s", "path", { d: "M12 9.25H9.25a2.75 2.75 0 0 0 0 5.5H12Z" }],
        ["s", "circle", { cx: 14.75, cy: 12, r: 2.75, anim: "pop", s: 1.14, origin: "12 9.25", delay: 0.16 }],
        ["s", "path", { d: "M12 14.75V17.5a2.75 2.75 0 1 1-2.75-2.75Z", anim: "pop", s: 1.14, origin: "12 14.75", delay: 0.24 }],
        ["c", "path", { d: "M12 3.75V14.75M7.75 9.25H16.25M7.75 14.75H12" }],
      ],
    },
    notion: {
      els: [
        ["s", "path", { d: CUBE, "fill-rule": "evenodd" }],
        ["l", "path", { d: "M9.5 10.25H12M13.75 10.25H16.25M9.5 16H12" }],
        ["l", "path", { d: "M10.75 16V10.25L13.65 14.17Q15 16 15 13.73V10.25", anim: "draw" }],
      ],
    },
    slack: {
      // a quarter turn of the pinwheel
      anim: "turn",
      deg: 90,
      origin: "12 12",
      els: [0, 90, 180, 270].flatMap((a) => [["s", "path", { d: PILL, transform: `rotate(${a} 12 12)` }], ["s", "path", { d: DOT, transform: `rotate(${a} 12 12)` }]]),
    },
    airbnb: {
      anim: "heartbeat",
      s: 1.12,
      origin: "12 12",
      els: [["l", "path", { d: BELO }]],
    },
    uber: {
      // the wordmark U: bowl into a full-height right stem
      els: [["l", "path", { d: "M7.25 4V15.25A4.75 4.75 0 0 0 16.75 15.25M16.75 4V20", anim: "nudge", x: 2 }]],
    },
    dropbox: {
      els: [
        ["s", "path", { d: rhomb(7.5, 7.2), anim: "tilt", deg: -20, origin: `${7.5 - RA} 7.2` }],
        ["s", "path", { d: rhomb(16.5, 7.2), anim: "tilt", deg: 20, origin: `${16.5 + RA} 7.2`, delay: 0.06 }],
        ["s", "path", { d: rhomb(7.5, 12.95) }],
        ["s", "path", { d: rhomb(16.5, 12.95) }],
        ["s", "path", { d: rhomb(12, 16.75) }],
      ],
    },
    zoom: {
      // zooms in
      anim: "pop",
      s: 1.12,
      origin: "12 12",
      els: [
        ["s", "path", { d: rr(3.25, 8.25, 11.25, 7.5, 2) }],
        ["s", "path", { d: soft([[17.5, 10.5, 0.4], [20.75, 8.75, 0.6], [20.75, 15.25, 0.6], [17.5, 13.5, 0.4]]) }],
      ],
    },
    openai: {
      els: [["s", "path", { d: ROSETTE, anim: "turn", deg: 60, origin: "12 12" }], ["c", "path", { d: HOLE + SEAMS, anim: "turn", deg: 60, origin: "12 12" }]],
    },
    anthropic: {
      els: [
        ["s", "path", { d: ANTHRO_A, "fill-rule": "evenodd", anim: "bounce", y: -1.75, origin: "9.4 18.25" }],
        ["s", "path", { d: ANTHRO_SLASH, anim: "bounce", y: -1.75, origin: "16.6 18.25", delay: 0.1 }],
      ],
    },
    chrome: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "circle", { cx: 12, cy: 12, r: 4 }],
        ["c", "path", { d: CHROME, anim: "turn", deg: 120, origin: "12 12" }],
      ],
    },
    safari: {
      els: [
        ["s", "circle", { cx: 12, cy: 12, r: 9 }],
        ["c", "path", { d: TICKS }],
        ["c", "path", { d: NEEDLE, anim: "wiggle", deg: 14, origin: "12 12" }],
        ["d", "path", { d: NEEDLE_SW, anim: "wiggle", deg: 14, origin: "12 12" }],
      ],
    },
    firefox: {
      // the fox curls round its globe
      anim: "wiggle",
      deg: 8,
      origin: GLOBE_C.join(" "),
      els: [["s", "path", { d: FOX }]],
    },
  });
})();
