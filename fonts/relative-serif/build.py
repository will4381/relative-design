"""Build Relative Serif from Sorts Mill Goudy (Goudy Old Style revival, SIL OFL 1.1).

The look: classic Goudy old-style, set heavy and tight with soft "ink spread" edges.
1. Reshape: lowercase x-height raised (ascenders keep their length), everything
   narrowed slightly.
2. Ink: each outline is grown with a round pen (Minkowski dilation, rounds outer
   corners) then shrunk back a little (erosion, fills and rounds inner corners).
   Net growth sets the weight; the round-trip sets the softness.
3. Advances are scaled with the outlines but not grown, so the ink also tightens spacing.

Needs: pip install fonttools skia-pathops brotli
Usage: python3 build.py <SortsMillGoudy-Regular.ttf>
"""
import sys
import unicodedata
from pathlib import Path

import pathops
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

SX = 1.0  # horizontal scale
XH_BOOST = 1.14  # lowercase x-height multiplier
TRACK = -42  # font units added to every advance at Regular; other weights keep the same gaps
SOFT = 26  # corner rounding radius, font units (upm 1000)
# style -> (usWeightClass, net outline growth per side in font units)
STYLES = {
    "Light": (300, 10),
    "Regular": (400, 22),
    "Medium": (500, 30),
    "SemiBold": (600, 38),
    "Bold": (700, 48),
}
OUT = Path(__file__).parent


def lowercase_glyphs(font):
    cmap = font.getBestCmap()
    lower = {g for cp, g in cmap.items() if unicodedata.category(chr(cp)) == "Ll"}
    # f-ligatures and other alternates of lowercase letters, but not small caps
    for name in font.getGlyphOrder():
        base = name.split(".")[0]
        parts = base.split("_")
        if ".sc" in name or ".c2sc" in name:
            continue
        if all(p in lower for p in parts):
            lower.add(name)
    return lower


def reshape(points_y_fn, x_scale):
    def fn(pt):
        if pt is None:  # qCurveTo's implied on-curve point
            return None
        return (pt[0] * x_scale, points_y_fn(pt[1]))
    return fn


def glyph_path(gs, name, pt_fn):
    rec = DecomposingRecordingPen(gs)
    gs[name].draw(rec)
    path = pathops.Path()
    pen = pathops.PathPen(path)
    for op, args in rec.value:
        getattr(pen, op)(*[pt_fn(a) for a in args])
    path.simplify(fix_winding=True)
    return path


def stroke_of(path, radius):
    s = pathops.Path(path)
    s.stroke(radius * 2, pathops.LineCap.ROUND_CAP, pathops.LineJoin.ROUND_JOIN, 4)
    s.convertConicsToQuads()  # round joins come out as conics, which boolean ops reject
    return s


def ink(path, grow):
    dilated = pathops.op(path, stroke_of(path, grow + SOFT), pathops.PathOp.UNION)
    dilated.simplify(fix_winding=True)
    eroded = pathops.op(dilated, stroke_of(dilated, SOFT), pathops.PathOp.DIFFERENCE)
    eroded.simplify(fix_winding=True, clockwise=True)
    return eroded


def build(src, style, weight_class, grow):
    font = TTFont(src)
    gs = font.getGlyphSet()
    xh = font["OS/2"].sxHeight
    lower = lowercase_glyphs(font)

    def y_lower(y):  # stretch the x-height zone, shift everything above it
        return y * XH_BOOST if 0 <= y <= xh else (y + xh * (XH_BOOST - 1) if y > xh else y)

    glyf, hmtx = font["glyf"], font["hmtx"]
    new = {}
    for name in font.getGlyphOrder():
        fn = reshape(y_lower if name in lower else (lambda y: y), SX)
        path = glyph_path(gs, name, fn)
        pen = TTGlyphPen(None)
        if len(path):
            ink(path, grow).draw(Cu2QuPen(pen, max_err=1, reverse_direction=False))
        new[name] = pen.glyph()
    for name, g in new.items():  # everything is decomposed, so accents get inked too
        glyf[name] = g
    for name in font.getGlyphOrder():
        g = glyf[name]
        g.recalcBounds(glyf)
        adv = hmtx[name][0]
        track = TRACK + 2 * max(0, grow - STYLES["Regular"][1])  # extra ink on both sides needs extra room
        hmtx[name] = (round(adv * SX) + (track if adv else 0), getattr(g, "xMin", 0) if g.numberOfContours else 0)
    scale_gpos_x(font)
    for t in ("fpgm", "prep", "cvt ", "kern", "DSIG", "FFTM", "hdmx", "LTSH", "VDMX"):
        if t in font:
            del font[t]
    font["OS/2"].sxHeight = round(xh * XH_BOOST)
    font["OS/2"].recalcAvgCharWidth(font)
    rename(font, style, weight_class)
    font.save(OUT / f"RelativeSerif-{style}.ttf")
    font.flavor = "woff2"
    font.save(OUT / f"RelativeSerif-{style}.woff2")
    print("built", style)


def scale_gpos_x(font):
    """Kerning and mark positions follow the horizontal squeeze."""
    seen = set()

    def walk(obj):
        if id(obj) in seen or obj is None or isinstance(obj, (int, float, str)):
            return
        seen.add(id(obj))
        if isinstance(obj, list):
            for item in obj:
                walk(item)
            return
        if not hasattr(obj, "__dict__"):
            return
        for key, value in list(vars(obj).items()):
            if key in ("XAdvance", "XPlacement", "XCoordinate") and isinstance(value, (int, float)):
                setattr(obj, key, round(value * SX))
            else:
                walk(value)

    for tag in ("GPOS", "GDEF"):
        if tag in font:
            walk(font[tag].table)


def rename(font, style, weight_class):
    name = font["name"]
    copyright_ = name.getDebugName(0) or ""
    for nid in range(0, 26):
        if nid in (5, 8, 9, 11, 12, 13, 14):  # keep version, credits, license
            continue
        name.removeNames(nameID=nid)
    family = "Relative Serif"
    ribbi = style in ("Regular", "Bold")
    ps = f"RelativeSerif-{style}"
    name.setName(copyright_ + " Relative Serif modifications Copyright 2026 Will Kusch.", 0, 3, 1, 0x409)
    name.setName(family if ribbi else f"{family} {style}", 1, 3, 1, 0x409)
    name.setName(style if ribbi else "Regular", 2, 3, 1, 0x409)
    name.setName(f"{ps};2026", 3, 3, 1, 0x409)
    name.setName(f"{family} {style}", 4, 3, 1, 0x409)
    name.setName(ps, 6, 3, 1, 0x409)
    if not ribbi:
        name.setName(family, 16, 3, 1, 0x409)
        name.setName(style, 17, 3, 1, 0x409)
    name.names = [r for r in name.names if r.platformID == 3]  # drop stale Mac-platform names
    os2 = font["OS/2"]
    os2.usWeightClass = weight_class
    os2.fsSelection = (os2.fsSelection & ~0b1100001) | (0b100000 if style == "Bold" else 0b1000000)
    font["head"].macStyle = 1 if style == "Bold" else 0


if __name__ == "__main__":
    only = sys.argv[2:] or list(STYLES)
    for style in only:
        build(sys.argv[1], style, *STYLES[style])
