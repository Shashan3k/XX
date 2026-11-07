"""panasuna-crown-coin.glb — bevelled gold sovereign with the Panasuna crown embossed on both faces
and a milled edge. Crown outline comes from src/components/brand/crown.json (same as the SVG logo).
Coin axis = Blender Y (front face at -Y → three.js +Z). Radius 1.
Requires pn_common.py in the same exec namespace.
"""

FILE = "panasuna-crown-coin.glb"
COLLECTION = "PN_Coin"

BODY_R, BODY_DEPTH = 0.87, 0.12
RIM_IN, RIM_OUT, RIM_DEPTH = 0.855, 0.976, 0.17
MILL_IN, MILL_LO, MILL_HI, MILL_DEPTH, RIDGES = 0.97, 0.982, 1.0, 0.15, 120
CROWN_SCALE = 0.029
EMBOSS_DEPTH, EMBED = 0.022, 0.002
GEM_PROUD, GEM_DEPTH = 0.006, 0.012

AXIS_Y = Matrix.Rotation(math.radians(90), 4, "X")   # local Z → Blender Y
MIRROR_Y = Matrix.Scale(-1, 4, (0, 1, 0))            # front emboss → back emboss


def crown_xz(points, crown):
    cx, cy = crown["center"]
    return [((x - cx) * CROWN_SCALE, -(y - cy) * CROWN_SCALE) for x, y in points]


def diamond_xz(d, crown):
    cx, cy = crown["center"]
    (x, y), r = d["c"], d["r"]
    return diamond2d((x - cx) * CROWN_SCALE, -(y - cy) * CROWN_SCALE, r * CROWN_SCALE)


def milled_outline():
    outer, inner = [], []
    period = 2 * math.pi / RIDGES
    for i in range(RIDGES):
        a = i * period
        for frac, r in ((0.0, MILL_LO), (0.15, MILL_HI), (0.5, MILL_HI), (0.65, MILL_LO)):
            t = a + frac * period
            outer.append((r * math.cos(t), r * math.sin(t)))
            inner.append((MILL_IN * math.cos(t), MILL_IN * math.sin(t)))
    return outer, inner


def emboss(bm, crown, mirror):
    face = -BODY_DEPTH / 2
    y_front = face - EMBOSS_DEPTH
    m = MIRROR_Y if mirror else Matrix()
    prism_xz(bm, crown_xz(crown["body"], crown), y_front, EMBOSS_DEPTH + EMBED, m)
    prism_xz(bm, crown_xz(crown["band"], crown), y_front, EMBOSS_DEPTH + EMBED, m)
    for tip in crown["tips"]:
        prism_xz(bm, diamond_xz(tip, crown), y_front, EMBOSS_DEPTH + EMBED, m)


def build():
    crown = load_crown()
    mats = palette()
    col = fresh_collection(COLLECTION)

    bm = bmesh.new()
    cylinder(bm, BODY_R, BODY_DEPTH, 128, AXIS_Y)
    make_object("Coin_Body", bm, col, [mats["gold"]], bevel=(0.006, 2))

    bm = bmesh.new()
    tube(bm, RIM_IN, RIM_OUT, RIM_DEPTH, 128, AXIS_Y)
    make_object("Coin_Rim", bm, col, [mats["gold"]], bevel=(0.01, 3))

    bm = bmesh.new()
    outer, inner = milled_outline()
    frame_xz(bm, outer, inner, -MILL_DEPTH / 2, MILL_DEPTH)
    make_object("Coin_Milling", bm, col, [mats["gold"]], smooth_angle=20)

    bm = bmesh.new()
    emboss(bm, crown, mirror=False)
    make_object("Crown_Emboss_Front", bm, col, [mats["gold"]], bevel=(0.004, 2))

    bm = bmesh.new()
    emboss(bm, crown, mirror=True)
    make_object("Crown_Emboss_Back", bm, col, [mats["gold"]], bevel=(0.004, 2))

    # Obsidian insets: centre gem + three band facets, on both faces.
    bm = bmesh.new()
    y_gem = -BODY_DEPTH / 2 - EMBOSS_DEPTH - GEM_PROUD
    for m in (Matrix(), MIRROR_Y):
        prism_xz(bm, diamond_xz(crown["gem"], crown), y_gem, GEM_DEPTH, m)
        for facet in crown["facets"]:
            prism_xz(bm, diamond_xz(facet, crown), y_gem, GEM_DEPTH, m)
    make_object("Crown_Gem", bm, col, [mats["obsidian"]], bevel=(0.002, 1))

    return finish(col, FILE)
