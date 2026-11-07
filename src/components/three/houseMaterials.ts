import * as React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { Theme } from "@/lib/theme";
import { withJadeStone } from "./brandStone";
import { isolatedClone } from "./isolate";
import { VAULT_FILE, coinGold } from "./coins";

/**
 * Theme-aware PBR skin for the villa in architectural-home-vault.glb (client revision 2026-11).
 * The .glb ships PN_Facade / PN_Travertine / PN_Glass; at load time they're swapped for one shared
 * instance per theme, so the residence reads as a bespoke sculpture on both the emerald (dark) and
 * ivory (light) pages. Gold trim (PN_Gold) is left exactly as exported.
 */
const GLASS = { emissive: "#F59E0B", emissiveIntensity: 0.65 } as const;

function skin(theme: Theme) {
  const dark = theme === "dark";
  return {
    // Dark page is emerald: a polished obsidian-graphite body so the gold and the amber glass carry it.
    // Light page is ivory: deep heritage emerald for maximum contrast.
    PN_Facade: new THREE.MeshPhysicalMaterial({
      name: "PN_Facade",
      color: dark ? "#07110F" : "#0C3329",
      metalness: 0,
      roughness: 0.5,
      // Low specular + a faint coat: the flat roofs would otherwise mirror the studio's overhead light
      // former as grey; this keeps them obsidian and leaves the highlights to the gold trim.
      specularIntensity: 0.35,
      clearcoat: 0.2,
      clearcoatRoughness: 0.2,
      envMapIntensity: dark ? 0.35 : 0.3,
    }),
    PN_Travertine: new THREE.MeshPhysicalMaterial({
      name: "PN_Travertine",
      color: dark ? "#7E6A4A" : "#A88F66",
      metalness: 0,
      roughness: 0.42,
      clearcoat: 0.25,
      clearcoatRoughness: 0.35,
      envMapIntensity: dark ? 0.55 : 0.45,
    }),
    PN_Glass: new THREE.MeshPhysicalMaterial({
      name: "PN_Glass",
      color: "#3A2508",
      metalness: 0,
      roughness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      emissive: GLASS.emissive,
      emissiveIntensity: GLASS.emissiveIntensity,
      envMapIntensity: 1.2,
    }),
  } satisfies Record<string, THREE.Material>;
}

const SKINS: Partial<Record<Theme, ReturnType<typeof skin>>> = {};
const skinFor = (theme: Theme) => (SKINS[theme] ??= skin(theme));

/** Materials created for one mesh of one model instance; safe to dispose when replaced. */
const OWNED = "pnOwned";

/**
 * Swaps the villa's facade, travertine and glass materials for the theme's. Every mesh gets its own
 * copy of the theme material, so no two parts (or two canvases) ever share a material instance and a
 * change on one can never bleed onto another. Idempotent; returns `root`.
 */
export function withHouseTheme<T extends THREE.Object3D>(root: T, theme: Theme): T {
  const s = skinFor(theme) as Record<string, THREE.Material>;
  const swap = (m: THREE.Material) => {
    const next = s[m.name];
    if (!next) return m;
    if (m.userData[OWNED]) m.dispose();
    const own = next.clone();
    own.userData[OWNED] = true;
    return own;
  };
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
  });
  return root;
}

/** Hook form for scenes that already hold the vault (or a clone of it). */
export function useHouseTheme(root: THREE.Object3D | null | undefined, theme: Theme) {
  React.useLayoutEffect(() => {
    if (root) withHouseTheme(root, theme);
  }, [root, theme]);
}

/**
 * A private, fully isolated copy of the cached villa for one canvas.
 *
 * Never mount the object `useGLTF` returns: it is a single cached instance shared by every scene on
 * every page. R3F hides committed objects (`visible = false`) while a Suspense boundary or route
 * transition is pending, and if that ever happened to the shared original, the flag stuck to it (and
 * to every later clone) until a full reload — the house vanished while the instanced coins stayed.
 * Each mount therefore gets its own deep clone, forced visible, with its own material per mesh.
 */
export function useVaultModel(theme: Theme): THREE.Group {
  const { scene } = useGLTF(VAULT_FILE);
  const model = React.useMemo(() => {
    // Deep clone, visible, never frustum-culled, one material per mesh (house, roof/trim, windows,
    // plinth, both rings and the coin stack each own theirs).
    return withJadeStone(
      isolatedClone(scene, (m, mesh) => {
        // The baked coin stack is a coin, not trim: it gets the coins' warm, glare-free gold. Its flat
        // top faces the studio's brightest overhead softbox, so it mirrors the room at a lower strength.
        const c = mesh.name === "Coin_Stack" ? coinGold(m, 0.7) : m.clone();
        c.userData[OWNED] = true;
        return c;
      }),
    );
  }, [scene]);
  useHouseTheme(model, theme);

  React.useEffect(
    () => () => {
      model.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.userData[OWNED] && m.dispose());
      });
    },
    [model],
  );
  return model;
}
