"""auction-gavel-podium.glb — stepped hexagonal auction podium with a gavel on a sound block,
a balance scale (beam pivots at centre, pans hang from beam ends) and a dividend ring of 8 coins.
Gavel is an empty at the handle end (strike pivot) parenting Gavel_Head / Gavel_Handle.
Requires pn_common.py in the same exec namespace.
"""

FILE = "auction-gavel-podium.glb"
COLLECTION = "PN_Auction"

TOP = 0.36
POST = Vector((0.0, 0.18, TOP))
BEAM_Z = 1.62
BEAM_HALF = 0.72
RING_R, RING_Z = 1.45, 0.2
HEX = Matrix.Rotation(math.radians(30), 4, "Z")


def build():
    mats = palette()
    col = fresh_collection(COLLECTION)

    bm = bmesh.new()
    cylinder(bm, 1.25, 0.14, 6, Matrix.Translation((0, 0, 0.07)) @ HEX)
    cylinder(bm, 1.05, 0.12, 6, Matrix.Translation((0, 0, 0.2)) @ HEX)
    top = cylinder(bm, 0.85, 0.10, 6, Matrix.Translation((0, 0, 0.31)) @ HEX)
    set_material(top, 1)
    block = cylinder(bm, 0.17, 0.05, 32, Matrix.Translation((0.3, -0.45, TOP + 0.025)))
    set_material(block, 2)
    make_object("Podium_Base", bm, col, [mats["obsidian"], mats["alabaster"], mats["gold"]], bevel=(0.012, 2))

    # Balance scale.
    bm = bmesh.new()
    cylinder(bm, 0.13, 0.04, 32, Matrix.Translation(POST + Vector((0, 0, 0.02))))
    rod(bm, POST, POST + Vector((0, 0, BEAM_Z - TOP + 0.05)), 0.035, 16)
    cone(bm, 0.05, 0.0, 0.12, 4, Matrix.Translation((POST.x, POST.y, BEAM_Z + 0.12)))
    make_object("Scale_Post", bm, col, [mats["gold"]], bevel=(0.004, 2))

    beam_pivot = Vector((POST.x, POST.y, BEAM_Z))
    bm = bmesh.new()
    box(bm, BEAM_HALF * 2, 0.045, 0.045)
    for s in (-1, 1):
        sphere(bm, 0.04, 16, 10, Matrix.Translation((s * BEAM_HALF, 0, 0)))
    make_object("Scale_Beam", bm, col, [mats["gold"]], location=beam_pivot, bevel=(0.006, 2))

    for name, s in (("Scale_Pan_L", -1), ("Scale_Pan_R", 1)):
        hang = beam_pivot + Vector((s * BEAM_HALF, 0, 0))
        bm = bmesh.new()
        for k in range(3):
            a = 2 * math.pi * k / 3 + math.pi / 2
            rod(bm, (0, 0, -0.03), (0.22 * math.cos(a), 0.22 * math.sin(a), -0.5), 0.005, 6)
        cone(bm, 0.07, 0.25, 0.07, 48, Matrix.Translation((0, 0, -0.535)))
        make_object(name, bm, col, [mats["gold"]], location=hang, bevel=(0.004, 2))

    # Gavel resting on the sound block; pivot at the handle end.
    head = Vector((0.3, -0.45, TOP + 0.05 + 0.075))
    handle_dir = Vector((0.75, -0.45, 0.06)).normalized()
    pivot = head + handle_dir * 0.6
    gavel = make_empty("Gavel", col, location=pivot)
    axis = Vector((handle_dir.y, -handle_dir.x, 0)).normalized()
    bm = bmesh.new()
    rod(bm, head - pivot - axis * 0.16, head - pivot + axis * 0.16, 0.075, 32)
    for s in (-1, 1):
        rod(bm, head - pivot + axis * (s * 0.16), head - pivot + axis * (s * 0.185), 0.06, 32)
    make_object("Gavel_Head", bm, col, [mats["gold"]], parent=gavel, bevel=(0.006, 2))
    bm = bmesh.new()
    rod(bm, head - pivot + handle_dir * 0.07, (0, 0, 0), 0.022, 16)
    ferrule = rod(bm, head - pivot + handle_dir * 0.07, head - pivot + handle_dir * 0.12, 0.028, 16)
    set_material(ferrule, 1)
    make_object("Gavel_Handle", bm, col, [mats["obsidian"], mats["gold"]], parent=gavel, bevel=(0.004, 1))

    # Dividend ring and its 8 coins (each detachable, origin at its own centre).
    bm = bmesh.new()
    torus(bm, RING_R, 0.02, 128, 10)
    make_object("Dividend_Ring", bm, col, [mats["gold"]], location=(0, 0, RING_Z))
    coins = []
    for k in range(8):
        a = 2 * math.pi * k / 8 + math.pi / 8
        radial = Vector((math.cos(a), math.sin(a), 0))
        pos = Vector((RING_R * radial.x, RING_R * radial.y, RING_Z + 0.02 + 0.09))
        bm = bmesh.new()
        cylinder(bm, 0.09, 0.024, 40, radial.to_track_quat("Z", "Y").to_matrix().to_4x4())
        name = f"Dividend_Coin_{k + 1:02d}"
        coins.append(name)
        make_object(name, bm, col, [mats["gold"]], location=pos, bevel=(0.004, 2))

    return finish(col, FILE, pivots=("Scale_Beam", "Scale_Pan_L", "Scale_Pan_R", "Gavel", "Dividend_Ring", *coins))
