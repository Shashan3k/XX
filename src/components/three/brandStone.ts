import * as THREE from "three";

/**
 * Polished jade stone (client request 2026-10-29: no white in the 3D scenes). Replaces the exported
 * PN_Alabaster on the vault plinth and the podium at load time; the .glb files stay as modelled.
 */
export const JADE_STONE = new THREE.MeshPhysicalMaterial({
  name: "PN_Jade",
  color: "#0E3F32",
  metalness: 0.05,
  roughness: 0.5,
  // Matte-polished: flat tops face the bright key and the studio sky, so no clearcoat (it read mint).
  envMapIntensity: 0.4,
});

/** Lighter jade for small marks that must read against the emerald page (the simulator's payout tiles). */
export const JADE_LIGHT = "#237359";

/**
 * Swaps every PN_Alabaster material under `root` for its own copy of jade (one per mesh, so the stone
 * never shares a material with another part or canvas). Idempotent; returns `root`.
 */
export function withJadeStone<T extends THREE.Object3D>(root: T): T {
  const swap = (m: THREE.Material) => (m.name === "PN_Alabaster" ? JADE_STONE.clone() : m);
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
  });
  return root;
}
