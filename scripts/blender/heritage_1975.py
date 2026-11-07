"""panasuna-heritage-1975.glb — the 50-year heritage monolith for the /about timeline.

A stepped obsidian plinth ringed by fifty gold year ticks (a taller one each decade), a tapered
monolith of five obsidian strata (one per decade, each with a gold inlay band and one gold stud
per decade on its front), a gold capstone, and the Panasuna crown crest on a roundel at the top.
No text: the years are told by the ticks and strata; the page supplies 1975 / 2025.

Pivots (so R3F can animate the build-up):
- Heritage_Year_01..50   base of each tick (grows upward)
- Heritage_Decade_01..05 base of each stratum (drops into place)
- Heritage_Capstone      base of the capstone
- Heritage_Crest         centre of the roundel (rises and turns)
Requires pn_common.py in the same exec namespace.
"""

FILE = "panasuna-heritage-1975.glb"
COLLECTION = "PN_Heritage"

YEARS = 50
DECADES = 5

PLINTH_R, PLINTH_H = 1.0, 0.12          # lower step
STEP_R, STEP_H = 0.8, 0.08              # upper step
PLINTH_TOP = PLINTH_H + STEP_H          # 0.20
TICK_R = 0.9                            # ticks stand on the lower step's outer ring
TICK_W, TICK_D = 0.024, 0.07            # tangential width, radial depth
TICK_H, DECADE_TICK_H = 0.05, 0.12

STRATUM_H = 0.32
BASE_W, BASE_D = 0.62, 0.42             # monolith footprint (x, y) at the bottom
TOP_W, TOP_D = 0.48, 0.32               # and at the top of the fifth stratum
INLAY_H, INLAY_PROUD = 0.022, 0.008
STUD_R = 0.022

CAP_H = 0.06
CREST_R, CREST_DEPTH = 0.4, 0.08
CREST_RIM_IN, CREST_RIM_OUT, CREST_RIM_DEPTH = 0.37, 0.43, 0.11
CROWN_SCALE = 0.0165
CROWN_DEPTH, CROWN_EMBED = 0.02, 0.002

SEGS = 64                               # crest roundel: seen face-on and close
PLINTH_SEGS = 48                        # plinth: seen from above at a distance; keeps the file under 500 KB

AXIS_Y = Matrix.Rotation(math.radians(90), 4, "X")   # local Z → Blender Y (faces the camera)
MIRROR_Y = Matrix.Scale(-1, 4, (0, 1, 0))

MONOLITH_TOP = PLINTH_TOP + DECADES * STRATUM_H
CREST_Z = MONOLITH_TOP + CAP_H + CREST_RIM_OUT + 0.02


def footprint(z):
    """Monolith half-extents at height z (linear taper from the plinth to the capstone)."""
    t = (z - PLINTH_TOP) / (DECADES * STRATUM_H)
    return (BASE_W + (TOP_W - BASE_W) * t) / 2, (BASE_D + (TOP_D - BASE_D) * t) / 2


def frustum(bm, z0, z1, local_z0):
    """A tapered box between heights z0 and z1, written relative to local_z0 (the pivot)."""
    (wx0, wy0), (wx1, wy1) = footprint(z0), footprint(z1)
    lo, hi = z0 - local_z0, z1 - local_z0
    v = [bm.verts.new(c) for c in (
        (-wx0, -wy0, lo), (wx0, -wy0, lo), (wx0, wy0, lo), (-wx0, wy0, lo),
        (-wx1, -wy1, hi), (wx1, -wy1, hi), (wx1, wy1, hi), (-wx1, wy1, hi),
    )]
    faces = [bm.faces.new(f) for f in (
        (v[0], v[3], v[2], v[1]), (v[4], v[5], v[6], v[7]),
        (v[0], v[1], v[5], v[4]), (v[1], v[2], v[6], v[5]),
        (v[2], v[3], v[7], v[6]), (v[3], v[0], v[4], v[7]),
    )]
    bmesh.ops.recalc_face_normals(bm, faces=faces)
    return faces


def crown_xz(points, crown):
    cx, cy = crown["center"]
    return [((x - cx) * CROWN_SCALE, -(y - cy) * CROWN_SCALE) for x, y in points]


def crown_diamond(d, crown):
    cx, cy = crown["center"]
    (x, y), r = d["c"], d["r"]
    return diamond2d((x - cx) * CROWN_SCALE, -(y - cy) * CROWN_SCALE, r * CROWN_SCALE)


def build():
    crown = load_crown()
    mats = palette()
    col = fresh_collection(COLLECTION)
    obsidian, gold = mats["obsidian"], mats["gold"]

    # ── Plinth: two obsidian steps, gold rule round the lower step ──
    bm = bmesh.new()
    cylinder(bm, PLINTH_R, PLINTH_H, PLINTH_SEGS, Matrix.Translation((0, 0, PLINTH_H / 2)))
    cylinder(bm, STEP_R, STEP_H, PLINTH_SEGS, Matrix.Translation((0, 0, PLINTH_H + STEP_H / 2)))
    set_material(tube(bm, PLINTH_R - 0.004, PLINTH_R + 0.012, 0.022, PLINTH_SEGS, Matrix.Translation((0, 0, PLINTH_H - 0.025))), 1)
    set_material(tube(bm, STEP_R - 0.004, STEP_R + 0.01, 0.016, PLINTH_SEGS, Matrix.Translation((0, 0, PLINTH_TOP - 0.02))), 1)
    make_object("Heritage_Plinth", bm, col, [obsidian, gold], bevel=(0.01, 2))

    # ── Fifty year ticks, clockwise from the front (-Y), one taller every decade ──
    for i in range(YEARS):
        decade = (i + 1) % 10 == 0
        h = DECADE_TICK_H if decade else TICK_H
        a = -math.pi / 2 - 2 * math.pi * i / YEARS          # start at -Y, go clockwise seen from above
        rot = Matrix.Rotation(a, 4, "Z")
        bm = bmesh.new()
        box(bm, TICK_D, TICK_W * (1.6 if decade else 1), h, rot @ Matrix.Translation((0, 0, h / 2)))
        pivot = (TICK_R * math.cos(a), TICK_R * math.sin(a), PLINTH_H)
        make_object(f"Heritage_Year_{i + 1:02d}", bm, col, [gold], location=pivot, bevel=(0.004, 1))

    # ── Five strata: tapered obsidian blocks, gold inlay band on top, one stud per decade ──
    for d in range(DECADES):
        z0 = PLINTH_TOP + d * STRATUM_H
        z1 = z0 + STRATUM_H
        bm = bmesh.new()
        frustum(bm, z0, z1 - INLAY_H, z0)
        (bx, by) = footprint(z1 - INLAY_H)
        set_material(box(bm, (bx + INLAY_PROUD) * 2, (by + INLAY_PROUD) * 2, INLAY_H,
                         Matrix.Translation((0, 0, STRATUM_H - INLAY_H / 2))), 1)
        # Studs on the front face: d + 1 of them, centred, a third of the way up the stratum.
        zc = z0 + STRATUM_H * 0.42
        hx, hy = footprint(zc)
        n = d + 1
        for k in range(n):
            x = (k - (n - 1) / 2) * 0.075
            m = Matrix.Translation((x, -hy - 0.004, zc - z0)) @ AXIS_Y
            set_material(cylinder(bm, STUD_R, 0.016, 16, m), 1)
        make_object(f"Heritage_Decade_{d + 1:02d}", bm, col, [obsidian, gold], location=(0, 0, z0), bevel=(0.008, 2))

    # ── Capstone: a gold slab sealing the monolith ──
    bm = bmesh.new()
    (cx, cy) = footprint(MONOLITH_TOP)
    box(bm, cx * 2 + 0.05, cy * 2 + 0.05, CAP_H, Matrix.Translation((0, 0, CAP_H / 2)))
    make_object("Heritage_Capstone", bm, col, [gold], location=(0, 0, MONOLITH_TOP), bevel=(0.012, 2))

    # ── Crest: obsidian roundel, gold rim, the crown embossed front and back ──
    bm = bmesh.new()
    cylinder(bm, CREST_R, CREST_DEPTH, SEGS, AXIS_Y)
    set_material(tube(bm, CREST_RIM_IN, CREST_RIM_OUT, CREST_RIM_DEPTH, SEGS, AXIS_Y), 1)
    y_front = -CREST_DEPTH / 2 - CROWN_DEPTH
    for mirror in (Matrix(), MIRROR_Y):
        for outline in (crown["body"], crown["band"]):
            set_material(prism_xz(bm, crown_xz(outline, crown), y_front, CROWN_DEPTH + CROWN_EMBED, mirror), 1)
        for tip in crown["tips"]:
            set_material(prism_xz(bm, crown_diamond(tip, crown), y_front, CROWN_DEPTH + CROWN_EMBED, mirror), 1)
    make_object("Heritage_Crest", bm, col, [obsidian, gold], location=(0, 0, CREST_Z), bevel=(0.004, 1))

    pivots = [f"Heritage_Year_{i + 1:02d}" for i in range(YEARS)] + [f"Heritage_Decade_{d + 1:02d}" for d in range(DECADES)]
    return finish(col, FILE, pivots=pivots + ["Heritage_Capstone", "Heritage_Crest"])
