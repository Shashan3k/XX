"""chit-calendar-ring.glb — kinetic calendar / recurring-cycle dial: an obsidian ring carrying 12
detachable gold month tokens around a central FDR security shield with the crown emboss.
Faces -Y (three.js +Z). Each Month_Token_NN has its origin at its own centre so it can
"destack" forward independently.
Requires pn_common.py in the same exec namespace.
"""

FILE = "chit-calendar-ring.glb"
COLLECTION = "PN_Calendar"

AXIS_Y = Matrix.Rotation(math.radians(90), 4, "X")
TOKEN_R, TOKEN_SIZE, TOKEN_DEPTH = 1.525, 0.32, 0.1
SHIELD = [(0, 0.56), (0.15, 0.5), (0.45, 0.5), (0.46, 0.12), (0.42, -0.12), (0.32, -0.34),
          (0.17, -0.5), (0, -0.6), (-0.17, -0.5), (-0.32, -0.34), (-0.42, -0.12),
          (-0.46, 0.12), (-0.45, 0.5), (-0.15, 0.5)]
CROWN_SCALE = 0.0145


def scaled(pts, k):
    return [(x * k, z * k) for x, z in pts]


def build():
    crown = load_crown()
    mats = palette()
    col = fresh_collection(COLLECTION)

    bm = bmesh.new()
    tube(bm, 1.3, 1.75, 0.08, 128, AXIS_Y)
    track = torus(bm, 1.86, 0.014, 128, 8, AXIS_Y)
    set_material(track, 1)
    make_object("Cycle_Ring", bm, col, [mats["obsidian"], mats["gold"]], bevel=(0.01, 2))

    for i in range(12):
        theta = math.radians(i * 30)
        pos = Vector((TOKEN_R * math.sin(theta), -0.04 - TOKEN_DEPTH / 2, TOKEN_R * math.cos(theta)))
        bm = bmesh.new()
        box(bm, TOKEN_SIZE, TOKEN_DEPTH, TOKEN_SIZE, Matrix.Rotation(theta, 4, "Y"))
        make_object(f"Month_Token_{i + 1:02d}", bm, col, [mats["gold"]], location=pos, bevel=(0.03, 3))

    bm = bmesh.new()
    prism_xz(bm, SHIELD, -0.12, 0.18)
    make_object("Shield_FDR", bm, col, [mats["obsidian"]], bevel=(0.012, 2))

    bm = bmesh.new()
    frame_xz(bm, scaled(SHIELD, 1.12), SHIELD, -0.135, 0.21)
    make_object("Shield_Rim", bm, col, [mats["gold"]], bevel=(0.008, 2))

    cx, cy = crown["center"]
    to_xz = lambda pts: [((x - cx) * CROWN_SCALE, -(y - cy) * CROWN_SCALE + 0.04) for x, y in pts]
    bm = bmesh.new()
    for outline in (crown["body"], crown["band"]):
        prism_xz(bm, to_xz(outline), -0.14, 0.025)
    for tip in crown["tips"]:
        (x, y), r = tip["c"], tip["r"]
        prism_xz(bm, diamond2d((x - cx) * CROWN_SCALE, -(y - cy) * CROWN_SCALE + 0.04, r * CROWN_SCALE), -0.14, 0.025)
    make_object("Shield_Crown", bm, col, [mats["gold"]], bevel=(0.003, 1))

    tokens = tuple(f"Month_Token_{i + 1:02d}" for i in range(12))
    return finish(col, FILE, pivots=tokens)
