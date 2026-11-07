import * as THREE from "three";
import { MODELS } from "./modelManifest";

/** Moving parts of auction-gavel-podium.glb, shared by the auction simulator and the journey. */
export const PODIUM_FILE = MODELS.find((m) => m.id === "auction")!.file;

export interface PodiumParts {
  beam?: THREE.Object3D;
  panL?: THREE.Object3D;
  panR?: THREE.Object3D;
  gavel?: THREE.Object3D;
  ring?: THREE.Object3D;
  coins: THREE.Object3D[];
}

export function findPodiumParts(root: THREE.Object3D): PodiumParts {
  return {
    beam: root.getObjectByName("Scale_Beam"),
    panL: root.getObjectByName("Scale_Pan_L"),
    panR: root.getObjectByName("Scale_Pan_R"),
    gavel: root.getObjectByName("Gavel"),
    ring: root.getObjectByName("Dividend_Ring"),
    coins: Array.from({ length: 8 }, (_, i) => root.getObjectByName(`Dividend_Coin_0${i + 1}`)).filter(
      (o): o is THREE.Object3D => !!o,
    ),
  };
}

const BEAM_PIVOT = new THREE.Vector3(0, 0.725, -0.18);
const PAN_ARM = 0.72;

/** Tilt the balance beam (positive lowers the left pan); the pans hang from its ends and stay level. */
export function tiltBeam({ beam, panL, panR }: PodiumParts, angle: number) {
  if (beam) beam.rotation.z = angle;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  panL?.position.set(BEAM_PIVOT.x - PAN_ARM * c, BEAM_PIVOT.y - PAN_ARM * s, BEAM_PIVOT.z);
  panR?.position.set(BEAM_PIVOT.x + PAN_ARM * c, BEAM_PIVOT.y + PAN_ARM * s, BEAM_PIVOT.z);
}

/** Horizontal axis across the gavel handle; a positive turn lifts the head off the block. */
const GAVEL_AXIS = new THREE.Vector3(0.512, 0, -0.859).normalize();

/** One strike as t runs 0 → 1: lift fast, slam, settle with a small rebound. */
export function strikeAngle(t: number) {
  if (t <= 0 || t >= 1) return 0;
  if (t < 0.45) return 0.55 * Math.sin((t / 0.45) * (Math.PI / 2));
  if (t < 0.6) return 0.55 * (1 - ((t - 0.45) / 0.15) ** 2);
  return 0.06 * Math.sin(((t - 0.6) / 0.4) * Math.PI);
}

export function poseGavel({ gavel }: PodiumParts, t: number) {
  gavel?.quaternion.setFromAxisAngle(GAVEL_AXIS, strikeAngle(t));
}
