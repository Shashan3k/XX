"""architectural-home-vault.glb — luxury architectural residence ("wealth villa") on a stepped travertine
plinth, a gold coin stack, and two tilted orbital milestone rings.

Client revision (2026-11): replaces the plain gabled prism with a two-storey villa:
- stepped three-tier travertine foundation plinth with entry stairs,
- recessed entrance portico: two gold-capped pillars carrying a cantilevered canopy slab,
- warm glowing glass (door, ribbon windows, wing window): PN_Glass, emissive #F59E0B @ 0.65,
- horizontal facade louvers on the flanking bays,
- multi-tiered roof: first-floor slab, flat roof slab and a top gable, each with a crisp gold overhang
  fascia, plus a gold ridge rod and gold rake trims,
- a single-storey side wing with its own gold-edged flat roof.
Every part carries a 4-segment angle-limited bevel with hardened normals.

Animatable nodes (unchanged): Home_Core, Home_Plinth, Coin_Stack (base pivot), Ring_Outer, Ring_Inner (centre pivots).
Materials: PN_Facade, PN_Gold, PN_Glass, PN_Travertine — re-skinned per theme at runtime by
src/components/three/houseMaterials.ts.
Requires pn_common.py in the same exec namespace.
"""

FILE = "architectural-home-vault.glb"
COLLECTION = "PN_HomeVault"

PLINTH_TOP = 0.22
RING_CENTRE = Vector((0.0, 0.0, 0.72))
BEVEL_SEGMENTS = 4

# Material slots on Home_Core.
FACADE, GOLD, GLASS = 0, 1, 2


def T(x, y, z):
    return Matrix.Translation((x, y, z))


def slab(bm, x0, x1, y0, y1, z0, z1, mat=None):
    """Axis-aligned box from min/max extents (Blender coords: -Y is the front)."""
    faces = box(bm, x1 - x0, y1 - y0, z1 - z0, T((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
    if mat is not None:
        set_material(faces, mat)
    return faces


def house_materials():
    mats = palette()
    mats["facade"] = pbr("PN_Facade", "#0E3B30", 0.25, 0.32, **{"Coat Weight": 0.6, "Coat Roughness": 0.08})
    mats["glass"] = pbr(
        "PN_Glass", "#2A1A06", 0.0, 0.12,
        **{"Emission Color": hex_to_linear("#F59E0B"), "Emission Strength": 0.65, "Coat Weight": 1.0, "Coat Roughness": 0.02},
    )
    mats["travertine"] = pbr("PN_Travertine", "#B9A27A", 0.0, 0.46)
    return mats


def build():
    mats = house_materials()
    col = fresh_collection(COLLECTION)
    b = PLINTH_TOP

    # ── Stepped travertine plinth + entry stairs ───────────────────────────────
    bm = bmesh.new()
    slab(bm, -1.2, 1.2, -0.8, 0.8, 0.0, 0.08)
    slab(bm, -1.07, 1.07, -0.7, 0.7, 0.08, 0.15)
    slab(bm, -0.95, 0.95, -0.6, 0.6, 0.15, b)
    # Three entry treads up to the portico (front edge of the top tier is y = -0.6).
    hx = -0.25
    for i, (y0, z1) in enumerate(((-0.86, 0.08), (-0.76, 0.15), (-0.66, b))):
        slab(bm, hx - 0.2 + i * 0.02, hx + 0.2 - i * 0.02, y0, y0 + 0.12, 0.0, z1)
    make_object("Home_Plinth", bm, col, [mats["travertine"]], bevel=(0.008, BEVEL_SEGMENTS))

    # ── Home_Core: the villa ───────────────────────────────────────────────────
    bm = bmesh.new()
    left, right = hx - 0.475, hx + 0.475  # main block, as wide as the old prism
    bay = 0.17  # half-width of the recessed centre bay
    g0, g1 = b, b + 0.42  # ground storey
    u0, u1 = g1 + 0.04, g1 + 0.38  # upper storey (above the first-floor slab)

    # Ground storey: two forward flanking bays and a recessed centre bay (the portico).
    slab(bm, left, hx - bay, -0.40, 0.36, g0, g1, FACADE)
    slab(bm, hx + bay, right, -0.40, 0.36, g0, g1, FACADE)
    slab(bm, hx - bay, hx + bay, -0.26, 0.36, g0, g1, FACADE)

    # Recessed glass door in a gold frame (one gold slab behind, glass standing proud of it).
    slab(bm, hx - 0.09, hx + 0.09, -0.275, -0.26, g0, g0 + 0.325, GOLD)
    slab(bm, hx - 0.072, hx + 0.072, -0.282, -0.275, g0 + 0.012, g0 + 0.31, GLASS)
    # Transom light above the door.
    slab(bm, hx - 0.12, hx + 0.12, -0.272, -0.26, g0 + 0.345, g1 - 0.02, GLASS)

    # Portico pillars: travertine-free gold capitals and bases on facade shafts.
    for px in (hx - 0.13, hx + 0.13):
        cylinder_faces = cylinder(bm, 0.024, g1 - g0 - 0.06, 14, T(px, -0.45, (g0 + g1) / 2))
        set_material(cylinder_faces, FACADE)
        slab(bm, px - 0.038, px + 0.038, -0.488, -0.412, g0, g0 + 0.03, GOLD)
        slab(bm, px - 0.038, px + 0.038, -0.488, -0.412, g1 - 0.03, g1, GOLD)

    # Facade louvers on both flanking bays: four horizontal gold slats over a glowing window.
    for x0, x1 in ((left + 0.05, hx - bay - 0.05), (hx + bay + 0.05, right - 0.05)):
        slab(bm, x0, x1, -0.408, -0.40, g0 + 0.1, g1 - 0.07, GLASS)
        for k in range(4):
            z = g0 + 0.13 + k * 0.06
            slab(bm, x0 - 0.01, x1 + 0.01, -0.43, -0.40, z, z + 0.012, GOLD)

    # First-floor slab: cantilevers over the portico, gold overhang fascia on the front and sides.
    # (A gold rim slab with a facade cap on top: the fascia shows on every edge from two boxes.)
    slab(bm, left - 0.065, right + 0.065, -0.535, 0.43, g1, u0, GOLD)
    slab(bm, left - 0.05, right + 0.05, -0.52, 0.415, u0 - 0.008, u0 + 0.004, FACADE)

    # Upper storey, set back, with a full-width ribbon window and gold mullions.
    ul, ur = left + 0.06, right - 0.06
    slab(bm, ul, ur, -0.32, 0.30, u0, u1, FACADE)
    slab(bm, ul + 0.05, ur - 0.05, -0.328, -0.32, u0 + 0.08, u1 - 0.07, GLASS)
    n_mull = 4
    for k in range(n_mull + 1):
        x = ul + 0.05 + k * (ur - ul - 0.1) / n_mull
        slab(bm, x - 0.006, x + 0.006, -0.336, -0.32, u0 + 0.075, u1 - 0.065, GOLD)
    slab(bm, ul + 0.04, ur - 0.04, -0.34, -0.32, u0 + 0.065, u0 + 0.08, GOLD)  # sill

    # Roof tier 1: flat roof slab with a gold overhang fascia all round.
    r0, r1 = u1, u1 + 0.035
    slab(bm, ul - 0.075, ur + 0.075, -0.41, 0.39, r0, r1, GOLD)
    slab(bm, ul - 0.06, ur + 0.06, -0.395, 0.375, r1 - 0.008, r1 + 0.004, FACADE)

    # Roof tier 2: the gable, inset from the slab, ridge running front-to-back.
    gw, gh = 0.34, 0.27
    gable = prism_xz(bm, [(hx - gw, r1), (hx + gw, r1), (hx, r1 + gh)], -0.30, 0.58)
    set_material(gable, FACADE)
    # Gold rake trims on the front gable edges and the ridge rod.
    for sgn in (-1, 1):
        rod_faces = rod(bm, (hx + sgn * (gw + 0.015), -0.31, r1 - 0.005), (hx, -0.31, r1 + gh + 0.012), 0.012, 8)
        set_material(rod_faces, GOLD)
    ridge = rod(bm, (hx, -0.32, r1 + gh), (hx, 0.29, r1 + gh), 0.016, 12)
    set_material(ridge, GOLD)
    # Gable oculus: a small glowing diamond window.
    oc = prism_xz(bm, diamond2d(hx, r1 + 0.1, 0.045), -0.308, 0.01)
    set_material(oc, GLASS)

    # Side wing (left), single storey, its own gold-edged flat roof.
    w0, w1 = -0.92, left
    wz = g0 + 0.32
    slab(bm, w0, w1 + 0.02, -0.28, 0.28, g0, wz, FACADE)
    slab(bm, w0 + 0.035, w1 - 0.03, -0.288, -0.28, g0 + 0.08, wz - 0.05, GLASS)
    slab(bm, w0 - 0.045, w1 + 0.02, -0.34, 0.33, wz, wz + 0.03, GOLD)
    slab(bm, w0 - 0.03, w1 + 0.02, -0.325, 0.315, wz + 0.022, wz + 0.034, FACADE)

    make_object("Home_Core", bm, col, [mats["facade"], mats["gold"], mats["glass"]], bevel=(0.004, BEVEL_SEGMENTS))

    # ── Coin stack — pivot at its base so it can grow from the plinth ──────────
    stack_pivot = Vector((0.62, -0.12, PLINTH_TOP))
    bm = bmesh.new()
    jitter = [(0, 0), (0.012, -0.006), (-0.008, 0.01), (0.01, 0.008), (-0.012, -0.004), (0.006, -0.01)]
    for i, (jx, jy) in enumerate(jitter):
        cylinder(bm, 0.2, 0.045, 36, Matrix.Translation((jx, jy, 0.0225 + i * 0.048)))
    make_object("Coin_Stack", bm, col, [mats["gold"]], location=stack_pivot, bevel=(0.006, 2))

    # ── Orbital milestone rings, tilt baked into the mesh, pivots at the composition centre ──
    for name, major, minor, tilt_x, tilt_y, beads in (
        ("Ring_Outer", 1.5, 0.022, 18, 8, 5),
        ("Ring_Inner", 1.15, 0.018, -12, -10, 3),
    ):
        tilt = Matrix.Rotation(math.radians(tilt_y), 4, "Y") @ Matrix.Rotation(math.radians(tilt_x), 4, "X")
        bm = bmesh.new()
        torus(bm, major, minor, 128, 10, tilt)
        for k in range(beads):
            a = 2 * math.pi * k / beads + 0.4
            sphere(bm, minor * 2.4, 14, 8, tilt @ Matrix.Translation((major * math.cos(a), major * math.sin(a), 0)))
        make_object(name, bm, col, [mats["gold"]], location=RING_CENTRE)

    return finish(col, FILE, pivots=("Coin_Stack", "Ring_Outer", "Ring_Inner"))
