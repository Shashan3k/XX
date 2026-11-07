---
name: panasuna-brand
description: Visual, 3D and motion identity for the Panasuna Chits (P) Ltd. website (est. 1975, Salem). Use whenever building, styling, animating or reviewing any page, component, icon, SVG, 3D scene or Blender asset for this project — including colour or font choices, the crown logo, feature icons, R3F/GSAP scroll scenes, and any Blender MCP modelling or .glb export into public/models/. Also use when a page "looks generic" or before writing Tailwind tokens.
---

# Panasuna brand: Heritage Gold on Obsidian Emerald

Panasuna is a 50-year-old Salem chit fund run by one family across three generations. The site has to feel like **a bank vault that has been in the family since 1975**: dark, heavy materials, gold that has been handled and not just printed, and calm, precise numbers. It is a luxury fintech site, and it is selling trust before it sells excitement.

Content always comes from `src/data/panasunaData.ts`. Never hardcode plan figures, names, addresses or phone numbers in components.

## 1. Banned (AI-slop list)

Treat any of these in a diff as a bug:

- Flat, generic cream, beige, sand or parchment page backgrounds (anything near `#F4F1EA`, `#FAF7F0`, `#FFF8E7`). **Exception (client-approved 2026-10-29):** the light theme's layered "warm royal ivory" (`#FAF6EE` + champagne radial, sandstone `#F2ECE1` alternate sections, white cards) in §2.
- Purple, violet or indigo gradients, and neon gradients of any kind. No `from-purple-*`, `via-indigo-*`.
- Emoji used as icons, bullets or decoration, in either language.
- The Inter, Arial, Helvetica, Roboto, Open Sans or system-ui stack as a visible face.
- Stock icon sets (Lucide, Heroicons, Font Awesome) used as **feature** icons. They are fine only for utility chrome: chevrons, close, menu, external-link.
- Any `panasunachits.com/images/...` URL, or legacy clipart and photos.
- The SaaS card kit: identical rounded cards with the same `shadow-md` in a 3-up grid.
- Tracked-out ALL-CAPS eyebrow labels above every heading, `01 / 02 / 03` numbering on content that is not a sequence (How a Chit Works *is* a sequence, so numbering is right there), and `→` appended to button text.
- Fade-and-slide-up on every section. Spend motion on one orchestrated moment per page (see §6).
- Claims of "guaranteed" or "promised" returns. Chit dividends vary with the auction, and the copy must say so.

## 2. Colour tokens

> **Updated 2026-10-29 (client spec), source of truth is `src/app/globals.css`:**
> - **Dark (default) — luminous royal emerald:** page `#09221C` with a gold/emerald radial spotlight; cards jade glass `rgba(15,48,39,0.72)` + 16px blur + gold top light; text `#FAF7F2`, muted `#C4D4CE`; primary CTA 24K gradient `#ECC454→#D4AF37` with `#071F19` text and gold glow.
> - **Light — warm royal ivory:** page `#FAF6EE` + champagne radial, sandstone `#F2ECE1` on alternate home sections, white cards with `#E2D9C5` border and soft emerald-tinted elevation; text `#0A261E`, muted `#475852`; text-safe gold `#8C5A08`; primary CTA heritage emerald `#0B3B2E` with ivory text and a gold inner rule; secondary CTA white with `#D5CBB4` border.
> - Highlight text ("Your Panasuna.", accent figures) uses `text-gold-gradient` (burnished in light, liquid 24K in dark). Not on transformed/rolling digits — `background-clip: text` doesn't reach them; use `text-gold-ink` there.
> - 3D: `Studio` uses the self-hosted city HDRI (`public/hdri/potsdamer_platz_1k.hdr`, env 1.4 light / 1.2 dark) + warm `#FFF3D1` key + front-left fill; `Home_Core` is re-skinned per theme by `three/houseMaterials.ts` (limestone in light, satin emerald-bronze in dark, 24K trim).
>
> The table below is the original 2026-10-28 palette, kept for the brand gold/ember/danger values that are unchanged.

| Token | Hex | Role |
|---|---|---|
| `--obsidian` | `#051311` | Page background. Deep heritage emerald, almost black. |
| `--emerald-900` | `#0A2A24` | Raised surfaces: panels, plan cards, modals |
| `--emerald-700` | `#123D34` | Hover surface, active tab, chart track |
| `--ink-navy` | `#0A192F` | Secondary surface only, for alternating bands. Never the main background: it is the stock "dev portfolio navy". |
| `--gold` | `#D4AF37` | Liquid crown gold: logo, key numerals, focus rings, 3D metal |
| `--gold-deep` | `#8A6A12` | Gold for text and icons **on alabaster** (AA 4.8:1) |
| `--ember` | `#F59E0B` | Glint only: specular flashes, the active auction bid, hover sparks. Keep it under 2% of any screen. |
| `--alabaster` | `#F8FAFC` | Body text on dark backgrounds, and the light architectural sections |
| `--alabaster-muted` | `#F8FAFC` at 64% | Secondary text on dark backgrounds |
| `--glass` | `rgba(10, 42, 36, 0.55)` + `backdrop-filter: blur(16px) saturate(140%)` | Glass panels over WebGL |
| `--hairline` | `rgba(212, 175, 55, 0.18)` | Borders and dividers on dark backgrounds |
| `--hairline-strong` | `rgba(212, 175, 55, 0.38)` | Focused or selected borders |
| `--danger` | `#E5484D` | The credit-card "trap" side of comparisons only |

Measured contrast:

- Gold on obsidian: 9.0:1. Fine for any size.
- Alabaster on obsidian: 18:1.
- **Gold on alabaster: 2.0:1. Never use gold for text on light backgrounds.** Use `--gold-deep` there.

Dark (obsidian) is the brand and the default. A **light "alabaster" theme** exists as a header toggle (client request, 2026-10-28):

- `<html class="dark">` is the switch. An inline script in `app/layout.tsx` applies a stored `pn-theme=light` before paint; `src/lib/theme.tsx` owns the store and the circular View Transition reveal.
- Components use **semantic tokens only**, so they work in both themes: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-hairline(-strong)`, and `text-gold-ink` for any gold *text* (gold in dark, `gold-deep` in light). Raw `text-alabaster` / `bg-obsidian` are for dark-only surfaces.
- Gold stays as a *fill* in both themes (`bg-gold` + `text-obsidian` buttons, the crown mark, 3D metal).
- Internal routes that must stay dark (`/design-system`) set `dark` on their own root.

Define every token once as a CSS variable in `globals.css` and map it in the Tailwind theme (`colors.obsidian`, `colors.gold.DEFAULT`, `colors.gold.deep`, and so on). Never use raw hex in components.

## 3. Typography

> **Updated 2026-10-29 (client spec):** Bodoni Moda and Manrope are retired. Display/headings **Plus Jakarta Sans** (700, `-0.03em`), body/UI **DM Sans**, figures **Plus Jakarta Sans** with `tabular-nums` (every non-paragraph `.tabular-nums` run is set in Jakarta), Tamil **Noto Sans Tamil** (body) and **Mukta Malar** (headings, 500–700). Latin face first in every stack so Tamil falls through. Hero: en `clamp(2.75rem,4.5vw,4.25rem)`/1.08, ta `clamp(2rem,3.1vw,3rem)`/1.25, one line per phrase from `sm`. The Bodoni-specific rules below (opsz pinning, "never ₹ in Bodoni", 32px minimum) no longer apply; the rest (tabular figures, Tamil line-height, sentence case) still do.

| Role | Latin | Tamil | Notes |
|---|---|---|---|
| Display (h1–h2, hero, big numerals) | **Bodoni Moda** (variable, opsz) | **Noto Serif Tamil** | High-contrast heritage serif. Use only at 32px and above; it breaks down at small sizes. |
| Body, UI, h3 and below | **Manrope** | **Noto Sans Tamil** | Load both, with Tamil scoped by `unicode-range`, so mixed strings render correctly. |
| Figures (₹, %, counters, calculators) | Manrope with `tabular-nums lining-nums` | Same (Tamil UI uses Western digits) | Must be tabular. See below. |

- Bodoni Moda's variable `opsz` axis goes to 96 at display sizes, where the hairlines disappear on screen (an "H" reads as "I l", a "D" loses its bowl). `globals.css` pins h1/h2 to `font-variation-settings: "opsz" 28` at weight 500. Never set a `+` or `—` in Bodoni; use Manrope for those glyphs.
- **Never set a ₹ amount in Bodoni.** Its "1" reads as a capital "I" and its commas look like full stops ("₹ I.00.000"). Large money figures use Manrope `font-light`/`font-extralight` with `tracking-[-0.02em]`; Bodoni stays for words and the 1975/50 heritage numerals.
- Load the fonts with `next/font/google`, `display: "swap"`, and expose them as CSS variables `--font-display`, `--font-body` and `--font-display-ta`. Switch the family per `<html lang>`: `:lang(ta) h1 { font-family: var(--font-display-ta) }`.
- **Every ₹ amount, percentage, month count and animated counter** gets the `tabular-nums` class (Tailwind) or `font-variant-numeric: tabular-nums lining-nums`. To verify it, render `₹1,11,111` and `₹8,88,888` stacked; their widths must match. If they differ, the face lacks `tnum`, so fix the font, not the CSS.
- Format money only through `formatINR` and `formatINRCompact` from `panasunaData.ts` (Indian grouping: ₹1,00,00,000).
- Tamil runs 20–35% longer than English and has tall stacked glyphs:
  - Set Tamil body to `line-height: 1.75` (English: 1.6).
  - Never set a fixed height on any text container.
  - Every heading must survive the Tamil string at 375px without overflow.
- Use sentence case everywhere. The only all-caps text allowed is the two mantras (`SAVE – BORROW – PAY` and `BUY NOW – PAY LATER`), which are deliberate.

## 4. Vector identity: SVGs

**Crown emblem** (`src/components/brand/CrownMark.tsx`):

- A geometric crown on a 48×48 grid:
  - Five points rising from a band. The centre point is tallest.
  - The band is inset with three facets, a nod to the three generations of directors.
- Build it from straight segments and true arcs only. No traced or organic paths.
- Stroke and fill use `currentColor`, so the mark recolours by context.
- Ship three variants:
  - **Mark:** the crown alone.
  - **Lockup:** the crown beside the "Panasuna" wordmark in Bodoni Moda, with "Chits (P) Ltd. · Est. 1975" in Manrope at 0.32 scale.
  - **Seal:** the crown inside a 1975 roundel. Use it for the trust section and the favicon.
- Animate the mark on page load: the band draws on first (`stroke-dashoffset`), the points rise one after another with a 60ms stagger, then a single gold sheen sweeps across.

**Feature icons** (`src/components/icons/`): build one bespoke SVG per icon id in `panasunaData.ts`:

- Pillars: `pillar-advisor`, `pillar-blueprint`, `pillar-calendar`, `pillar-doorstep`, `pillar-handshake`, `pillar-payout`.
- Goals: `goal-business`, `goal-home`, `goal-vehicle`, `goal-savings`, `goal-other`.
- Director avatar motifs: `crown`, `scales`, `ledger`, `ascent`, `compass`.

Every icon follows these rules:

- 32×32 grid, 1.5px stroke, round joins, butt caps, gold stroke, and no fills except one small `--ember` accent dot per icon at most.
- Each icon has one idle micro-animation tied to its meaning, triggered on hover or focus of its parent and once on entering the viewport:
  - The calendar pages flip.
  - The door swings open 20°.
  - The payout coin drops into a slot.
  - The scales settle.
- Use `aria-hidden="true"` when the icon sits next to a text label; otherwise give it a `<title>`.
- Director avatars use a monogram from `director.avatar.monogram`, set in Bodoni Moda over the motif SVG, inside a gold hairline ring, with the tone taken from `director.avatar.tone`. No photos and no generic person silhouettes.

## 5. 3D pipeline: Blender MCP → `.glb` → React Three Fiber

The connected Blender is **5.2 LTS**. All 3D assets are modelled procedurally (Blender MCP `execute_blender_code`, or the same scripts headless) and exported into `public/models/`.

**Crash rule:** never call `bpy.ops.object.transform_apply` under `bpy.context.temp_override` or switch `window.scene` from a script — that combination segfaulted Blender 5.2 through the MCP (2026-10-28), losing the open session. Apply transforms at the data level (`mesh.transform(matrix)` then reset the object), as `pn_common.apply_transforms` does, and call `bpy.context.view_layer.update()` before reading `matrix_world` for objects created in the same script. Do not use stock models, `generate_3d` or `import_asset` unless the user asks for them.

### 5.1 Asset manifest

| File | Concept | Named nodes (animatable) |
|---|---|---|
| `panasuna-crown-coin.glb` | Bevelled gold sovereign, crown embossed on both faces (same outline as the SVG logo, from `src/components/brand/crown.json`), 120-ridge milled edge | `Coin_Body`, `Coin_Rim`, `Coin_Milling`, `Crown_Emboss_Front`, `Crown_Emboss_Back`, `Crown_Gem` |
| `architectural-home-vault.glb` | Two-storey luxury villa (2026-11): recessed pillared portico, amber-glowing glass (`PN_Glass`, emissive `#F59E0B` @ 0.65), facade louvers, three roof tiers with gold overhang fascias + gold ridge/rake trim, side wing, on a stepped travertine plinth (`PN_Travertine`) with entry stairs; coin stack; two tilted orbital milestone rings. Bevel 4 segments. `PN_Facade`/`PN_Travertine`/`PN_Glass` are re-skinned per theme by `three/houseMaterials.ts`. | `Home_Core`, `Home_Plinth`, `Coin_Stack` (base pivot), `Ring_Outer`, `Ring_Inner` (centre pivots) |
| `chit-calendar-ring.glb` | Recurring-cycle dial: 12 detachable month tokens around the 100% FDR shield | `Cycle_Ring`, `Month_Token_01`…`12` (own-centre pivots), `Shield_FDR`, `Shield_Rim`, `Shield_Crown` |
| `auction-gavel-podium.glb` | Hexagonal auction podium, gavel on a sound block, balance scale, ring of 8 dividend coins | `Podium_Base`, `Gavel` (empty, handle-end pivot) › `Gavel_Head`, `Gavel_Handle`; `Scale_Post`, `Scale_Beam` (centre pivot), `Scale_Pan_L`/`_R` (hang-point pivots), `Dividend_Ring`, `Dividend_Coin_01`…`08` |
| `panasuna-heritage-1975.glb` | 50-year heritage monolith for the /about timeline: stepped obsidian plinth, 50 gold year ticks (taller each decade), five tapered obsidian strata with gold inlay bands and 1–5 decade studs, gold capstone, crown crest on a roundel. No text. | `Heritage_Plinth`, `Heritage_Year_01`…`50` (base pivots), `Heritage_Decade_01`…`05` (base pivots), `Heritage_Capstone` (base pivot), `Heritage_Crest` (roundel-centre pivot) |

Source scripts live in `scripts/blender/` (`pn_common.py` + one file per asset). Rebuild everything with
`blender -b --factory-startup --python scripts/blender/run.py -- crown_coin.py home_vault.py calendar_ring.py auction_podium.py heritage_1975.py`,
or `exec` the same files through the MCP `execute_blender_code` tool. Verify with `node scripts/verify-models.mjs`, which
checks every file against `src/components/three/modelManifest.ts`. Keep the manifest, this table and the scripts in step.

Add new rows here before modelling a new asset.

### 5.2 Modelling rules

- **Budget:** under 25,000 triangles per `.glb`, counted on the evaluated, modifier-applied mesh. Target 8k–15k.
- **Geometry:** use low-to-mid-poly forms with a Bevel modifier (2–3 segments, `limit_method='ANGLE'`, 30°), then Weighted Normal with Keep Sharp on, then Shade Auto Smooth. Gold depends on beveled edges catching highlights, so never export sharp, unbevelled 90° edges.
- **Scale:** 1 Blender unit = 1 three.js unit. Size the hero object so its largest dimension is about 2 units.
- **Transforms:** apply rotation and scale on every mesh. Location stays applied too, except on pivot parts.
- **Origins:** centre the whole asset at the world origin. Each part's origin goes on its **pivot**: the hinge for doors and pages, the centre for wheels and coins, the base for tiers that grow. This is what lets GSAP rotate the part correctly.
- **Naming:** use `Asset_Part_NN` in PascalCase for both the object and its mesh data (`obj.data.name = obj.name`). The glTF node name is the object name, and R3F reads it as `nodes.Coin_Rim`.
- **Grouping:** put parts that animate together under an Empty named `Asset_Group_Name`.
- **UVs:** use a smart UV project on every mesh, even when it is untextured, so the exporter emits tangents cleanly.
- **Textures:** no image textures by default. Colour comes from material factors. If a texture is unavoidable, use 1024px WebP.

### 5.3 Materials (Principled BSDF)

Look nodes up by type and sockets by identifier, never by display name. The 5.2 identifiers are `Base Color`, `Metallic`, `Roughness`, `Coat Weight`, `Coat Roughness`, `Transmission Weight`, `Anisotropic` and `Emission Color`. Hex colours are sRGB, but node inputs are **linear**, so always convert.

```python
import bpy

def hex_to_linear(h):
    h = h.lstrip("#")
    def ch(c):
        c = int(c, 16) / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (ch(h[0:2]), ch(h[2:4]), ch(h[4:6]), 1.0)

def pbr(name, hex_color, metallic, roughness, **extra):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    sock = {s.identifier: s for s in bsdf.inputs}
    sock["Base Color"].default_value = hex_to_linear(hex_color)
    sock["Metallic"].default_value = metallic
    sock["Roughness"].default_value = roughness
    for key, val in extra.items():
        sock[key].default_value = val
    return mat

GOLD      = pbr("PN_Gold",      "#D4AF37", 0.92, 0.22)  # client spec 2026-10-29: metallic 0.92, roughness 0.22
OBSIDIAN  = pbr("PN_Obsidian",  "#051311", 0.0, 0.08, **{"Coat Weight": 1.0, "Coat Roughness": 0.03})
ALABASTER = pbr("PN_Alabaster", "#F8FAFC", 0.0, 0.55)
```

- Name materials with the `PN_` prefix. The materials above are the whole palette; add a new one only after recording it here.
- Set `mat.use_backface_culling = True` on every PN material so closed meshes export single-sided (cheaper in three.js). Avoid Transmission on web assets. three.js transmission is expensive and breaks on mobile, so fake glass with Coat over a dark base instead.
- The glTF exporter carries Base Color, Metallic, Roughness, Coat, Emission and Anisotropy (`KHR_materials_*`). Procedural texture nodes **do not export**, so keep the node tree to a single Principled BSDF.

### 5.4 Export

```python
import bpy, os
out = "/home/tharunmk/projects/panasuna_website/public/models/coin.glb"   # absolute: Blender's cwd is not the repo
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.object.select_all(action="DESELECT")
for o in bpy.data.collections["Coin"].all_objects:   # one collection per asset
    o.select_set(True)
try:
    bpy.ops.export_scene.gltf(
        filepath=out, export_format="GLB", use_selection=True, export_apply=True,
        export_yup=True, export_texcoords=True, export_normals=True,
        export_materials="EXPORT", export_cameras=False, export_lights=False,
        export_extras=True, export_draco_mesh_compression_enable=False,
    )
except TypeError as e:
    print("Exporter rejected an option; read the valid enum values:", e)
print(os.path.getsize(out) // 1024, "KB")
```

- Keep one Blender collection per asset, named after the file.
- Leave Draco off by default; meshes this small don't need it. If a file exceeds 500 KB, enable Draco: drei's `useGLTF` decodes it automatically.
- `export_format`'s enum is dynamic in 5.2 and cannot be listed. Pass `"GLB"` inside the `try` as shown.

### 5.5 Verify every asset before it ships

1. **Triangle budget.** Run this in Blender:
   ```python
   dg = bpy.context.evaluated_depsgraph_get()
   tris = sum(len(p.vertices) - 2 for o in bpy.data.collections["Coin"].all_objects if o.type == "MESH" for p in o.evaluated_get(dg).data.polygons)
   print(tris)
   ```
   The count must be under 25,000.
2. **Transforms and origins.** Print each object's `rotation_euler`, `scale` and `location`. Rotation and scale must be identity, except on documented pivots.
3. **Look at it.** Use the MCP `look` tool on the asset under a three-point light. Check the bevel highlights read as gold, not as yellow plastic.
4. **Validate the file:**
   ```
   npx -y @gltf-transform/cli inspect public/models/coin.glb
   ```
   Check the node names, triangle count and material count.
5. **Generate typed bindings:**
   ```
   npx -y gltfjsx public/models/coin.glb --types --output src/components/three/models/Coin.tsx
   ```
   This lets components reference `nodes.Coin_Rim` with types.

### 5.6 Loading and animating in R3F

- Wrap every model in `<Suspense fallback={<ProceduralX />}>`. The fallbacks are mandatory (CLAUDE.md §5.4), so the site never shows an empty canvas:

  | Model | Procedural fallback |
  |---|---|
  | coin | gold `cylinderGeometry` with a `torusGeometry` rim |
  | crown | five `coneGeometry` points on a `torusGeometry` band |
  | calendar | stacked `boxGeometry` pages |
  | house | box walls with a `coneGeometry` roof (4 segments) |
  | vault | `cylinderGeometry` door with a `torusGeometry` wheel |
  | growth | `instancedMesh` of boxes |

  Fallbacks use the same `meshPhysicalMaterial` values as the PN materials.
- Call `useGLTF.preload("/models/x.glb")` at module level for anything above the fold.
- Lighting: drei `<Environment preset="city" environmentIntensity={0.6}>` (or a custom warm HDRI later), plus one warm key light at `#FFE2A8`. Gold with no environment map looks brown.
- **Scroll binding (the "egg reel" effect):**
  - Drive scroll-scrubbed motion from a GSAP timeline with `ScrollTrigger({ scrub: 1, pin: true })`. Tween **refs** (`ref.current.rotation`, `camera.position`), never React state.
  - Lenis must drive ScrollTrigger:
    ```ts
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    ```
  - Build timelines inside `useGSAP(() => {...}, { scope })` so they are cleaned up on unmount.
  - For R3F objects, create the timeline after the GLTF has resolved (inside the model component), and call `ScrollTrigger.refresh()` once.
- **Performance:**
  - `dpr={[1, 1.75]}`.
  - On mobile (375px) or `navigator.hardwareConcurrency <= 4`: `dpr={1}`, no post-processing, and shadows baked into the material (no `castShadow`).
  - Use `frameloop="demand"` for canvases that only move on scroll, and call `invalidate()` from the ScrollTrigger `onUpdate`.
  - Pause off-screen canvases with an IntersectionObserver.
  - At most two live WebGL canvases per page. Reuse one fixed full-screen canvas with drei `<View>` when you need more scenes.
- **Reduced motion:**
  - Under `prefers-reduced-motion: reduce`, there are no scroll-scrubbed rotations: show the final pose statically, with no Lenis smoothing and no autoplay loops.
  - Content must remain fully readable with JavaScript or WebGL off. 3D is never the only carrier of information.

## 6. Motion identity

| Token | Value | Use |
|---|---|---|
| `ease-crown` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default entrance (expo-out feel) |
| `ease-vault` | `cubic-bezier(0.65, 0, 0.35, 1)` | Heavy mechanical moves: vault door, page flips |
| `dur-micro` | 160ms | Hover, press, focus |
| `dur-ui` | 320ms | Tabs, accordions, modal open |
| `dur-story` | Scroll-scrubbed (no fixed duration) | 3D scenes, How a Chit Works |

- **Numbers tween; they don't pop.** Calculator results and counters use framer-motion `animate()` on a motion value over 600ms with `ease-crown`, render through `formatINR`, and keep `tabular-nums` on so the digits don't jitter.
- **Magnetic buttons:** primary CTAs only, with a maximum pull of 6px and a spring of `stiffness 300, damping 20`. Disable on touch devices.
- **Card hover:** lift 4px and brighten the border to `--hairline-strong`. No shadow bloom, no scale-up.
- **Tabs** (director profiles, comparisons): use framer-motion `layoutId` for the gold underline, and crossfade the content over 200ms.
- **One hero moment per page.** Home is the crown emblem assembling, then the coin dropping into the vault on scroll. Everything else is quieter.

## 7. Bilingual

- Every visible string comes from a `Localized` field. A missing `ta` value is a build-time bug, not a fallback to English.
- The language toggle shows `English | தமிழ்`. It persists in a cookie and sets `<html lang>`.
- Never set Tamil in all caps, letter-spacing or italics. Tamil has no italic form, and faux-slanted Tamil is unreadable.
- The Tamil copy in `panasunaData.ts` is a first draft. Do not ship it without native review.

## 8. Done checklist for any UI step

- [ ] No banned item from §1 (`grep -rniE "inter|purple|indigo|panasunachits.com/images" src` returns nothing relevant).
- [ ] Every ₹, % and month figure has `tabular-nums`, and the money goes through the format helpers.
- [ ] Every figure traces to `panasunaData.ts`.
- [ ] Screenshot with the Playwright MCP at **1440px and 375px, in both `en` and `ta`**, and once in the light theme.
- [ ] Reduced-motion pass shows a static final state.
- [ ] Each `.glb` is under 25k triangles, has named nodes, and has a procedural fallback.
