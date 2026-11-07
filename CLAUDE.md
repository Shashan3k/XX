cat << 'EOF' > ~/panasuna-refurbish/CLAUDE.md
# Panasuna Chits (P) Ltd. — Master Project Directives

## 1. Source of Truth (Text & Data Only — NO Legacy Images)
- Extract ONLY factual text and financial data from `old_UI.md` (chit plans, durations, director names/bios, comparisons, and contact info).
- NEVER use any `https://panasunachits.com/images/...` URLs. All legacy images are discarded.
- Design a brand-new, ultra-crisp custom SVG geometric Crown emblem for **Panasuna Chits (P) Ltd.** (Established 1975, Salem, Tamil Nadu).
- Verified Address: 419/151-A Chinna Kadai Street, Salem - 636 001.
- Verified Phones: 0427-2260611 / 2262411 | Mobile: 9842360611.
- Customer Portal Login Link: `/login` (with option to link to `/works/login.php`).
- Use ONLY the real 26 Chit Plans + 3 Join Modal schemes from `old_UI.md`.

## 2. Tech, Blender MCP & Heavy Animation Stack
- Framework: Next.js (App Router, TypeScript, Tailwind CSS)
- Component Base: Coss UI / Base UI / shadcn primitives
- Scroll-Driven & Parallax Engine: `gsap`, `@gsap/react`, `ScrollTrigger`, and `lenis` (smooth inertial scroll)
- Blender MCP -> WebGL Pipeline:
  - Use the connected **Blender MCP** server (`execute_blender_code`, scene inspection, PBR material nodes) to procedurally model, bevel, shade, and export custom `.glb` 3D assets directly into `public/models/`.
  - Export all Blender models using `bpy.ops.export_scene.gltf(filepath=..., export_format='GLB', use_selection=True, export_apply=True)` with clean topology and Principled BSDF metallic gold (`#D4AF37`) & deep emerald/obsidian (`#051311`) materials.
  - Load and animate the exported `.glb` models inside Next.js using `three`, `@react-three/fiber`, and `@react-three/drei` (`useGLTF`, `Environment`, `Float`, `PresentationControls`).
- Microinteractions: `framer-motion` (smooth number tweening on calculators, magnetic buttons, card hover lifts, fluid tab transitions)
- Bilingual Support: Complete English (`en`) and Tamil (`ta`) toggle across all pages.

## 3. Design & Anti-Slop Rules
- Follow `.claude/skills/panasuna-brand/SKILL.md` and `frontend-design` skill strictly.
- NO generic cream backgrounds, NO neon purple gradients, NO emoji icons, NO Inter/Arial fonts.
- Replace all old icons/clipart with bespoke Blender-exported `.glb` 3D assets and custom animated SVG graphics.
- Use `tabular-nums` for all ₹ INR currency values, calculators, and animated counters.
- After building each step, verify it visually using the `playwright` MCP browser tool on desktop (1440px) and mobile (375px).
cat << 'EOF' >> ~/panasuna-refurbish/CLAUDE.md

## 5. Blender 3D & Scroll-Driven WebGL Integration (The "Egg Reel" Effect)
- The client wants world-class 3D scroll-scrubbed animations inspired by high-end WebGL showcases (like the 3D egg/chicken scroll site).
- IMPLEMENTATION RULES:
  1. Store all 3D assets in `public/models/` as optimized `.glb` files.
  2. Use `@react-three/fiber` and `@react-three/drei` (`useGLTF`) to load these models into our components.
  3. Bind model rotation, scale, and camera coordinates directly to GSAP `ScrollTrigger` scrub values so scrolling down the page animates the 3D scene in real time.
  4. Provide procedural fallback geometries (e.g., sleek 3D gold toruses, boxes, and particle spheres) so the site never breaks if a GLB model is loading.
EOF
