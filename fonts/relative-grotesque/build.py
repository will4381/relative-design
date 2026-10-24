"""Build Relative Grotesque from Inter Tight (SIL OFL 1.1).

Twists vs. upstream:
- glyphs drawn 10% larger per em (Neue Montreal-like size and set width)
- named weights sit 60 units heavier (Regular = 460) for a denser book weight
- open digits (ss01) on by default
Usage: python3 build.py <src_dir>  (src_dir holds InterTight[wght].ttf + Italic)
"""
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.ttLib.scaleUpem import scale_upem

SCALE = 1.10
WEIGHT_SHIFT = {200: 260, 300: 360, 400: 460, 500: 560, 600: 660, 700: 760, 800: 860}
OUT = Path(__file__).parent


def bake_feature(font, tag):
    gsub = font["GSUB"].table
    lookups = {i for fr in gsub.FeatureList.FeatureRecord if fr.FeatureTag == tag for i in fr.Feature.LookupListIndex}
    mapping = {}
    for i in lookups:
        for st in gsub.LookupList.Lookup[i].SubTable:
            st = getattr(st, "ExtSubTable", st)
            mapping.update(getattr(st, "mapping", {}))
    for table in font["cmap"].tables:
        for cp, g in table.cmap.items():
            if g in mapping:
                table.cmap[cp] = mapping[g]


def shift_weights(font):
    for inst in font["fvar"].instances:
        w = inst.coordinates.get("wght")
        inst.coordinates["wght"] = WEIGHT_SHIFT.get(w, w)
    if "STAT" in font and font["STAT"].table.AxisValueArray:
        for av in font["STAT"].table.AxisValueArray.AxisValue:
            if hasattr(av, "Value"):
                av.Value = WEIGHT_SHIFT.get(av.Value, av.Value)


src = Path(sys.argv[1])
for style in ("", "-Italic"):
    font = TTFont(src / f"InterTight{style}[wght].ttf")
    upm = font["head"].unitsPerEm
    font["head"].unitsPerEm = round(upm / SCALE)
    scale_upem(font, upm)
    bake_feature(font, "ss01")
    shift_weights(font)

    for rec in font["name"].names:
        s = rec.toUnicode().replace("Inter Tight", "Relative Grotesque").replace("InterTight", "RelativeGrotesque")
        if rec.nameID == 0:
            s += " Relative Grotesque modifications Copyright 2026 Will Kusch."
        rec.string = s

    stem = f"RelativeGrotesque{style}[wght]"
    font.save(OUT / f"{stem}.ttf")
    font.flavor = "woff2"
    font.save(OUT / f"{stem}.woff2")
    print("built", stem)
