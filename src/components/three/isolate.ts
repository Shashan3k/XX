import * as THREE from "three";

/**
 * A private, mount-safe copy of a cached GLTF scene (or a node of one).
 *
 * `useGLTF` returns one cached instance shared by every canvas on every page. Mounting it directly lets
 * R3F's Suspense/route-transition hiding (`visible = false`) and any material swap leak into every other
 * scene until a reload. The copy:
 *  - is a deep clone, so it can be parented and hidden independently;
 *  - owns a clone of every material, so no colour or setting can bleed between parts or scenes;
 *  - starts fully visible, whatever state the cached source was left in;
 *  - is never frustum-culled: the models are small and always framed, and culling during the
 *    view-offset camera moves must never drop a part of the model.
 * `material` optionally replaces the per-mesh clone (e.g. a coin finish); it must return a new material.
 */
export function isolatedClone<T extends THREE.Object3D>(
  source: T,
  material: (m: THREE.Material, mesh: THREE.Mesh) => THREE.Material = (m) => m.clone(),
): T {
  const clone = source.clone(true) as T;
  clone.traverse((o) => {
    o.visible = true;
    o.frustumCulled = false;
    if (!(o instanceof THREE.Mesh) || !o.material) return;
    o.material = Array.isArray(o.material) ? o.material.map((m) => material(m, o)) : material(o.material, o);
  });
  return clone;
}
