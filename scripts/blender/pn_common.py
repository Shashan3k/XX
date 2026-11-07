"""Shared helpers for Panasuna Blender asset scripts (Blender 5.2).

Run through the Blender MCP with:
    ns = {}
    for f in ("pn_common.py", "<asset>.py"):
        p = "/home/tharunmk/projects/panasuna_website/scripts/blender/" + f
        exec(compile(open(p).read(), p, "exec"), ns)
    ns["build"]()

Conventions (see .claude/skills/panasuna-brand §5):
- Geometry is built in mesh space, so object rotation/scale stay identity ("applied").
  Only documented pivot parts keep a location (hinges, ring centres, detachable tokens).
- Front faces point at Blender -Y, which becomes three.js +Z (towards the camera) after Y-up export.
- Node names = object names = mesh names, PascalCase `Asset_Part_NN`.
"""

import json
import math
import os

import bmesh
import bpy
from mathutils import Matrix, Vector

ROOT = "/home/tharunmk/projects/panasuna_website"
MODELS = os.path.join(ROOT, "public", "models")
TRI_BUDGET = 25_000


# ─── Scene & collections ──────────────────────────────────────────────────────

def scene():
    """The current scene. Assets live in their own PN_* collections; switching scenes from a
    script crashed Blender 5.2 (transform_apply under temp_override), so we never do it."""
    return bpy.context.scene


def fresh_collection(name):
    """Empty (or create) a collection in the asset scene. Never touches other scenes."""
    sc = scene()
    col = bpy.data.collections.get(name)
    if col:
        for ob in list(col.all_objects):
            data = ob.data
            bpy.data.objects.remove(ob, do_unlink=True)
            if isinstance(data, bpy.types.Mesh) and data.users == 0:
                bpy.data.meshes.remove(data)
    else:
        col = bpy.data.collections.new(name)
    if col.name not in sc.collection.children:
        sc.collection.children.link(col)
    return col


# ─── Materials ────────────────────────────────────────────────────────────────

def hex_to_linear(h):
    h = h.lstrip("#")

    def ch(c):
        c = int(c, 16) / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return (ch(h[0:2]), ch(h[2:4]), ch(h[4:6]), 1.0)


def pbr(name, hex_color, metallic, roughness, **extra):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    try:
        mat.use_nodes = True
    except (AttributeError, TypeError):
        pass
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    sock = {s.identifier: s for s in bsdf.inputs}
    sock["Base Color"].default_value = hex_to_linear(hex_color)
    sock["Metallic"].default_value = metallic
    sock["Roughness"].default_value = roughness
    for key, val in extra.items():
        sock[key].default_value = val
    mat.diffuse_color = hex_to_linear(hex_color)  # viewport only
    mat.use_backface_culling = True  # all meshes are closed → export single-sided (cheaper in three.js)
    return mat


def palette():
    return {
        # Client spec (2026-10-29): Liquid Crown Gold, metallic 0.92 / roughness 0.22.
        "gold": pbr("PN_Gold", "#D4AF37", 0.92, 0.22),
        "obsidian": pbr("PN_Obsidian", "#051311", 0.0, 0.08, **{"Coat Weight": 1.0, "Coat Roughness": 0.03}),
        "alabaster": pbr("PN_Alabaster", "#F8FAFC", 0.0, 0.55),
    }


# ─── bmesh builders (each appends to `bm` and returns the faces it created) ────

def _added(bm, fn):
    before = set(bm.faces)
    fn()
    return [f for f in bm.faces if f not in before]


def cylinder(bm, r, depth, segs, matrix=Matrix()):
    return _added(bm, lambda: bmesh.ops.create_cone(
        bm, cap_ends=True, cap_tris=False, segments=segs,
        radius1=r, radius2=r, depth=depth, matrix=matrix))


def cone(bm, r1, r2, depth, segs, matrix=Matrix()):
    return _added(bm, lambda: bmesh.ops.create_cone(
        bm, cap_ends=True, cap_tris=False, segments=segs,
        radius1=r1, radius2=r2, depth=depth, matrix=matrix))


def box(bm, sx, sy, sz, matrix=Matrix()):
    return _added(bm, lambda: bmesh.ops.create_cube(
        bm, size=1.0, matrix=matrix @ Matrix.Diagonal((sx, sy, sz, 1.0))))


def _ring_faces(bm, loops, closed_profile=True):
    """Skin consecutive vertex loops (each a list of BMVerts, same length) with quads."""
    faces = []
    n = len(loops[0])
    pairs = list(zip(loops, loops[1:] + ([loops[0]] if closed_profile else [])))
    for a, b in pairs:
        for i in range(n):
            j = (i + 1) % n
            faces.append(bm.faces.new((a[i], a[j], b[j], b[i])))
    return faces


def lathe(bm, profile, segs, matrix=Matrix(), closed_profile=True):
    """Revolve a closed (r, z) profile around local Z. Used for tubes, rims and tori."""
    loops = []
    for r, z in profile:
        loop = []
        for i in range(segs):
            a = 2 * math.pi * i / segs
            loop.append(bm.verts.new(matrix @ Vector((r * math.cos(a), r * math.sin(a), z))))
        loops.append(loop)
    return _ring_faces(bm, loops, closed_profile)


def tube(bm, r_in, r_out, depth, segs, matrix=Matrix()):
    h = depth / 2
    return lathe(bm, [(r_out, -h), (r_out, h), (r_in, h), (r_in, -h)], segs, matrix)


def torus(bm, major, minor, segs_major, segs_minor, matrix=Matrix()):
    prof = [(major + minor * math.cos(2 * math.pi * k / segs_minor),
             minor * math.sin(2 * math.pi * k / segs_minor)) for k in range(segs_minor)]
    return lathe(bm, prof, segs_major, matrix)


def prism_xz(bm, pts2d, y_front, depth, matrix=Matrix()):
    """Extrude a 2D outline (x, z) lying in the XZ plane from y_front back by `depth` (+Y).
    The front cap faces -Y."""
    front = [bm.verts.new(matrix @ Vector((x, y_front, z))) for x, z in pts2d]
    back = [bm.verts.new(matrix @ Vector((x, y_front + depth, z))) for x, z in pts2d]
    faces = [bm.faces.new(front), bm.faces.new(list(reversed(back)))]
    n = len(pts2d)
    for i in range(n):
        j = (i + 1) % n
        faces.append(bm.faces.new((front[i], back[i], back[j], front[j])))
    bmesh.ops.recalc_face_normals(bm, faces=faces)
    return faces


def frame_xz(bm, outer, inner, y_front, depth, matrix=Matrix()):
    """A flat frame between two outlines with equal vertex counts (e.g. a shield rim)."""
    fo = [bm.verts.new(matrix @ Vector((x, y_front, z))) for x, z in outer]
    fi = [bm.verts.new(matrix @ Vector((x, y_front, z))) for x, z in inner]
    bo = [bm.verts.new(matrix @ Vector((x, y_front + depth, z))) for x, z in outer]
    bi = [bm.verts.new(matrix @ Vector((x, y_front + depth, z))) for x, z in inner]
    faces = _ring_faces(bm, [fo, bo, bi, fi], closed_profile=True)
    bmesh.ops.recalc_face_normals(bm, faces=faces)
    return faces


def diamond2d(cx, cz, r):
    return [(cx, cz + r), (cx + r, cz), (cx, cz - r), (cx - r, cz)]


# ─── Objects ──────────────────────────────────────────────────────────────────

def planar_uvs(bm):
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        u, v = [(1, 2), (0, 2), (0, 1)][ax]
        for loop in f.loops:
            loop[uv].uv = (loop.vert.co[u], loop.vert.co[v])


def make_object(name, bm, col, mats, location=(0, 0, 0), bevel=None, smooth_angle=30, parent=None):
    """Create a mesh object. `bm` is in the object's local space; `location` is its pivot.
    bevel = (width, segments) adds an angle-limited, normal-hardening bevel."""
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    planar_uvs(bm)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    me.shade_smooth()
    me.set_sharp_from_angle(angle=math.radians(smooth_angle))
    ob = bpy.data.objects.new(name, me)
    col.objects.link(ob)
    if parent:
        ob.parent = parent
        ob.matrix_parent_inverse = Matrix()
    ob.location = location
    if bevel:
        mod = ob.modifiers.new("Bevel", "BEVEL")
        mod.width, mod.segments = bevel
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(30)
        mod.harden_normals = True
        mod.miter_outer = "MITER_ARC"
    return ob


def make_empty(name, col, location=(0, 0, 0)):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_type = "PLAIN_AXES"
    ob.empty_display_size = 0.2
    col.objects.link(ob)
    ob.location = location
    return ob


# ─── Verification & export ────────────────────────────────────────────────────

def _evaluated_tris(ob, dg):
    if ob.type != "MESH":
        return 0
    ev = ob.evaluated_get(dg)
    me = ev.to_mesh()
    me.calc_loop_triangles()
    n = len(me.loop_triangles)
    ev.to_mesh_clear()
    return n


def apply_transforms(col):
    """Ctrl+A (rotation & scale) done at the data level — no operator, no context override.
    Bakes any rotation/scale into the mesh and resets it; location is kept for pivots."""
    for ob in col.all_objects:
        loc = ob.location.copy()
        basis = ob.matrix_basis.copy()
        rot_scale = Matrix.Translation(-loc) @ basis
        if ob.type == "MESH" and not _is_identity(rot_scale):
            ob.data.transform(rot_scale)
            ob.data.update()
        ob.rotation_mode = "XYZ"
        ob.rotation_euler = (0, 0, 0)
        ob.scale = (1, 1, 1)
        ob.location = loc


def _is_identity(m, eps=1e-9):
    return all(abs(m[i][j] - (1.0 if i == j else 0.0)) < eps for i in range(4) for j in range(4))


def report(col, pivots=()):
    """Print per-node transforms + evaluated triangle counts. Returns (total_tris, ok)."""
    dg = bpy.context.evaluated_depsgraph_get()
    total, ok = 0, True
    lo, hi = Vector((1e9,) * 3), Vector((-1e9,) * 3)
    for ob in sorted(col.all_objects, key=lambda o: o.name):
        tris = _evaluated_tris(ob, dg)
        total += tris
        rot_ok = all(abs(a) < 1e-6 for a in ob.rotation_euler)
        scl_ok = all(abs(s - 1) < 1e-6 for s in ob.scale)
        loc_ok = ob.location.length < 1e-6 or ob.name in pivots or ob.parent is not None
        named = ob.type != "MESH" or ob.data.name == ob.name
        ok &= rot_ok and scl_ok and loc_ok and named
        if ob.type == "MESH":
            for c in ob.bound_box:
                w = ob.matrix_world @ Vector(c)
                lo = Vector(map(min, lo, w))
                hi = Vector(map(max, hi, w))
        flag = "" if (rot_ok and scl_ok and loc_ok and named) else "  <-- CHECK"
        print(f"  {ob.name:22} {ob.type:5} tris={tris:6}  loc=({ob.location.x:+.3f},{ob.location.y:+.3f},{ob.location.z:+.3f})"
              f"  rot={'I' if rot_ok else 'X'} scale={'I' if scl_ok else 'X'}"
              f"  parent={ob.parent.name if ob.parent else '-'}{flag}")
    centre = (lo + hi) / 2
    size = hi - lo
    print(f"  bbox centre=({centre.x:+.3f},{centre.y:+.3f},{centre.z:+.3f}) size=({size.x:.2f},{size.y:.2f},{size.z:.2f})")
    print(f"  TOTAL TRIS {total} / {TRI_BUDGET}  transforms+names {'OK' if ok else 'FAIL'}")
    ok &= total < TRI_BUDGET and centre.length < 0.02
    return total, ok


def recentre(col):
    """Move the whole asset so its bounding-box centre sits at the world origin.
    Root meshes at the origin get the shift baked into their mesh; pivots/empties move by location."""
    bpy.context.view_layer.update()  # matrix_world is stale for objects created this tick
    lo, hi = Vector((1e9,) * 3), Vector((-1e9,) * 3)
    for ob in col.all_objects:
        if ob.type == "MESH":
            for c in ob.bound_box:
                w = ob.matrix_world @ Vector(c)
                lo = Vector(map(min, lo, w))
                hi = Vector(map(max, hi, w))
    shift = -(lo + hi) / 2
    for ob in col.all_objects:
        if ob.parent:
            continue
        if ob.type == "MESH" and ob.location.length < 1e-9:
            ob.data.transform(Matrix.Translation(shift))
            ob.data.update()
        else:
            ob.location += shift
    bpy.context.view_layer.update()


def export_glb(col, filename):
    os.makedirs(MODELS, exist_ok=True)
    out = os.path.join(MODELS, filename)
    view_layer = bpy.context.view_layer
    for ob in view_layer.objects:
        ob.select_set(False)
    objs = list(col.all_objects)
    for ob in objs:
        ob.select_set(True)
    view_layer.objects.active = objs[0]
    try:
        bpy.ops.export_scene.gltf(
            filepath=out, export_format="GLB", use_selection=True, export_apply=True,
            export_yup=True, export_texcoords=True, export_normals=True,
            export_materials="EXPORT", export_cameras=False, export_lights=False,
            export_extras=True, export_draco_mesh_compression_enable=False,
        )
    except TypeError as e:
        print("Exporter rejected an option:", e)
        raise
    print(f"  exported {out} ({os.path.getsize(out) // 1024} KB)")
    return out


def finish(col, filename, pivots=()):
    recentre(col)
    apply_transforms(col)
    total, ok = report(col, pivots)
    if not ok:
        raise RuntimeError(f"{col.name}: verification failed — not exporting")
    return export_glb(col, filename)


def load_crown():
    with open(os.path.join(ROOT, "src", "components", "brand", "crown.json")) as fh:
        return json.load(fh)


def rod(bm, p0, p1, r, segs=8):
    """Cylinder from p0 to p1 (world/local Vectors)."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    m = Matrix.Translation((p0 + p1) / 2) @ d.to_track_quat("Z", "Y").to_matrix().to_4x4()
    return cylinder(bm, r, d.length, segs, m)


def sphere(bm, r, u=16, v=10, matrix=Matrix()):
    return _added(bm, lambda: bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r, matrix=matrix))


def set_material(faces, index):
    for f in faces:
        f.material_index = index
