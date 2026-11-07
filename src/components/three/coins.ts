"use client";

import * as React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { MODELS } from "./modelManifest";

export const COIN_FILE = MODELS.find((m) => m.id === "coin")!.file;
export const VAULT_FILE = MODELS.find((m) => m.id === "home")!.file;

/** One part of the crown coin, drawn as its own InstancedMesh with shared instance matrices. */
export interface CoinPart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  /** The part's transform inside the coin model. */
  matrix: THREE.Matrix4;
}

/**
 * Rich, glare-free coin gold. The exported PN_Gold is only 92% metallic: the remaining dielectric layer
 * reflects the studio's white softboxes and HDR sky *untinted*, which showed as a chalky white sheen on
 * the faces and a white rim at grazing angles. A fully metallic finish tints every reflection by the
 * gold base colour, a slightly softer roughness spreads the hot spots, and the reflection strength is
 * capped so ACES tone mapping never bleaches the brightest glints to white.
 * Returns a new material owned by the caller; the source is untouched.
 */
export const COIN_ENV_MAX = 1.15;
const COIN_BRONZE = "#7A4E12";
export function coinGold(src: THREE.Material, envMapIntensity: number): THREE.MeshStandardMaterial {
  const m = (src as THREE.MeshStandardMaterial).clone();
  m.metalness = 1;
  m.roughness = Math.max(m.roughness, 0.3);
  m.envMapIntensity = Math.min(envMapIntensity, COIN_ENV_MAX);
  // Warm bronze floor: a face mirroring the dark emerald floor reads deep antique gold, never black-green.
  m.emissive.set(COIN_BRONZE);
  m.emissiveIntensity = 0.32;
  if (m instanceof THREE.MeshPhysicalMaterial) {
    m.clearcoat = 0;
    m.sheen = 0;
    m.specularIntensity = 0;
  }
  return m;
}

/** The crown gem: obsidian without the mirror clearcoat that flashed white as the coin turned. */
function coinGem(src: THREE.Material): THREE.Material {
  const m = (src as THREE.MeshStandardMaterial).clone();
  m.roughness = Math.max(m.roughness, 0.35);
  m.envMapIntensity = 0.3;
  if (m instanceof THREE.MeshPhysicalMaterial) {
    m.clearcoat = 0;
    m.specularIntensity = 0.2;
  }
  return m;
}

/**
 * `lift` adds a faint warm emissive so faces that mirror a dark part of the room still read as
 * polished gold rather than brown (0 = no lift).
 */
export function useGltfCoinParts(envMapIntensity = 1.9, lift = 0): CoinPart[] {
  const { scene } = useGLTF(COIN_FILE);
  const parts = React.useMemo(() => {
    scene.updateMatrixWorld(true);
    const parts: CoinPart[] = [];
    scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      // Every part gets its own material instance, so nothing set here can leak to another part or scene.
      const src = o.material as THREE.MeshStandardMaterial;
      const material = src.metalness > 0.5 ? coinGold(src, envMapIntensity) : coinGem(src);
      if (lift > 0 && material instanceof THREE.MeshStandardMaterial && material.metalness > 0.5) {
        material.emissive.set("#B8860B");
        material.emissiveIntensity = lift;
      }
      parts.push({ geometry: o.geometry, material, matrix: o.matrixWorld.clone() });
    });
    return parts;
  }, [scene, envMapIntensity, lift]);
  React.useEffect(() => () => parts.forEach((p) => p.material.dispose()), [parts]);
  return parts;
}

/** Procedural stand-in (panasuna-brand §5.6): gold cylinder + torus rim, same PBR values. */
export function useProceduralCoinParts(): CoinPart[] {
  return React.useMemo(() => {
    const gold = () => coinGold(new THREE.MeshPhysicalMaterial({ color: "#D4AF37", metalness: 1, roughness: 0.3 }), 1);
    return [
      { geometry: new THREE.CylinderGeometry(0.87, 0.87, 0.12, 48).rotateX(Math.PI / 2), material: gold(), matrix: new THREE.Matrix4() },
      { geometry: new THREE.TorusGeometry(0.92, 0.07, 12, 64), material: gold(), matrix: new THREE.Matrix4() },
    ];
  }, []);
}

/** Deterministic, so a composition is identical on every visit. */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
