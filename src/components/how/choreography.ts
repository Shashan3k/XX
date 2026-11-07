import * as THREE from "three";
import { mulberry32, smoothstep } from "@/components/three/coins";

/**
 * The "How a chit works" journey as pure functions of scroll progress, so scrubbing backwards
 * retraces every move exactly. `progress` runs 0 → 4, one unit per stage; the camera holds on a
 * station for the middle half of each unit and travels during the rest.
 */
export interface JourneyRig {
  progress: number;
  /** 0 → 1 while the section scrolls into view: the members gather into their group. */
  assemble: number;
}

export const STAGE_COUNT = 5;
export const LAST_STAGE = STAGE_COUNT - 1;

const clamp01 = (x: number) => THREE.MathUtils.clamp(x, 0, 1);
/** Local 0 → 1 progress of a beat that runs between two progress values. */
export const span = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));
export const ease = (t: number) => smoothstep(0, 1, t);
/** ease-vault: heavy mechanical moves. */
export const easeVault = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const bump = (t: number) => Math.sin(Math.PI * clamp01(t));
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

/** Which leg of the journey we're on, and how far through its camera move (eased). */
export function travel(p: number) {
  const k = THREE.MathUtils.clamp(Math.floor(p), 0, LAST_STAGE - 1);
  return { k, f: smoothstep(0.25, 0.75, p - k) };
}

/** Where reduced motion parks the scene for a stage: just after that stage's beat has played. */
export const poseFor = (stage: number) => (stage >= LAST_STAGE ? LAST_STAGE : stage + 0.18);

/** Nearest stage to a progress value, for the stage dots and the active card. */
export const stageAt = (p: number) => THREE.MathUtils.clamp(Math.round(p), 0, LAST_STAGE);

// ─── World: stations along +X ─────────────────────────────────────────────────

export const CALENDAR_AT = new THREE.Vector3(8, 0.35, 0);
export const PODIUM_AT = new THREE.Vector3(17, 0, 0);
export const VAULT_AT = new THREE.Vector3(25, 0, 0);

interface Shot {
  target: THREE.Vector3;
  az: number;
  el: number;
  r: number;
}

const SHOTS: readonly Shot[] = [
  { target: new THREE.Vector3(0, -0.25, 0), az: 0.36, el: 0.56, r: 10.6 }, // the member ring, from above
  { target: CALENDAR_AT.clone(), az: 0.16, el: 0.1, r: 12 }, // the dial, nearly face on
  { target: new THREE.Vector3(PODIUM_AT.x, -0.2, 0), az: 0.6, el: 0.44, r: 10.2 }, // the podium, three-quarter
  { target: new THREE.Vector3(PODIUM_AT.x, 0.1, 0), az: -0.12, el: 1.1, r: 10 }, // crane overhead
  { target: new THREE.Vector3(VAULT_AT.x + 0.25, 0.1, 0), az: -0.42, el: 0.2, r: 8.2 }, // the vault, low
];

/** Camera position and look-at for a progress value; `fit` widens the shot for narrow frames. */
export function cameraPose(p: number, fit: number, pos: THREE.Vector3, target: THREE.Vector3) {
  const { k, f } = travel(p);
  const a = SHOTS[k];
  const b = SHOTS[k + 1];
  // A crane arc between stations: up and back mid-move, settling on arrival.
  const arc = Math.sin(Math.PI * f) * (a.target.distanceTo(b.target) > 1 ? 1 : 0.35);
  const az = THREE.MathUtils.lerp(a.az, b.az, f);
  const el = THREE.MathUtils.lerp(a.el, b.el, f) + arc * 0.16;
  const r = (THREE.MathUtils.lerp(a.r, b.r, f) + arc * 1.8) * fit;
  target.lerpVectors(a.target, b.target, f);
  pos.set(
    target.x + r * Math.cos(el) * Math.sin(az),
    target.y + r * Math.sin(el),
    target.z + r * Math.cos(el) * Math.cos(az),
  );
}

// ─── Members: 40 crown coins, plus the pooled chit at the centre of stage 1 ────

export const MEMBERS = 40;
/** The pooled coin is drawn as one extra instance after the members. */
export const COIN_INSTANCES = MEMBERS + 1;
/** Seat 6 faces the stage-3 camera, so the winning bid rises toward the viewer. */
export const WINNER = 6;
const BIDS: Readonly<Record<number, { h: number; at: number }>> = {
  2: { h: 0.55, at: 1.78 },
  11: { h: 0.8, at: 1.86 },
  [WINNER]: { h: 1.08, at: 1.94 },
};

const COIN_SCALE = 0.17;
const RING_R = 2.35;
const BEZEL_R = 2.62;
const TABLE_R = 2.3;
const WINNER_HOVER = new THREE.Vector3(PODIUM_AT.x, 1.7, PODIUM_AT.z);
const DOOR = new THREE.Vector3(VAULT_AT.x - 0.22, 0.2, 0.5);

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const FLAT = new THREE.Quaternion().setFromAxisAngle(X, -Math.PI / 2);
const UPRIGHT = new THREE.Quaternion();
const FACING_VAULT_SHOT = new THREE.Quaternion().setFromAxisAngle(Y, SHOTS[LAST_STAGE].az);
/** A raised bid stands up and faces the stage-3 camera, like a paddle. */
const FACING_AUCTION_SHOT = new THREE.Quaternion().setFromAxisAngle(Y, SHOTS[2].az);

const rand = mulberry32(1975);
const SCATTER = Array.from(
  { length: MEMBERS },
  () => new THREE.Vector3((rand() - 0.5) * 11, 1.6 + rand() * 3.6, -1.2 - rand() * 4.5),
);
const SCATTER_TURN = Array.from({ length: MEMBERS }, () =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 6.28, rand() * 6.28, 0)),
);

/** The three seatings the group takes: a flat ring, a bezel round the dial, the auction table. */
function seat(layout: 0 | 1 | 2, i: number, pos: THREE.Vector3, quat: THREE.Quaternion) {
  const t = (i / MEMBERS) * Math.PI * 2;
  if (layout === 0) {
    pos.set(Math.cos(t) * RING_R, -0.5, Math.sin(t) * RING_R);
    quat.copy(FLAT);
  } else if (layout === 1) {
    const a = Math.PI / 2 - t; // clockwise from twelve o'clock, like the month tokens
    pos.set(CALENDAR_AT.x + Math.cos(a) * BEZEL_R, CALENDAR_AT.y + Math.sin(a) * BEZEL_R, 0.15);
    quat.copy(UPRIGHT);
  } else {
    pos.set(PODIUM_AT.x + Math.cos(t) * TABLE_R, -0.8, PODIUM_AT.z + Math.sin(t) * TABLE_R);
    quat.copy(FLAT);
  }
}
const layoutFor = (stage: number): 0 | 1 | 2 => (stage <= 0 ? 0 : stage === 1 ? 1 : 2);

/** Angular distance on a circle, 0 → π. */
const arcDistance = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

/** The monthly payment pulse that runs once round the dial while stage 2 holds. */
export function paymentPulse(p: number) {
  const w = span(p, 0.74, 1.16);
  const envelope = smoothstep(0, 0.1, w) * (1 - smoothstep(0.9, 1, w));
  return { angle: Math.PI / 2 - w * Math.PI * 2, envelope };
}
export function pulseAt(angle: number, p: number, width = 0.06) {
  const { angle: at, envelope } = paymentPulse(p);
  return envelope * Math.exp(-(arcDistance(angle, at) ** 2) / width);
}

const A = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };
const B = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };
const spin = new THREE.Quaternion();
const turn = new THREE.Quaternion();
const from = new THREE.Vector3();

/** Pose of coin instance `i` (members, then the pooled coin) at progress `p`. Writes into `out`. */
export function coinPose(
  i: number,
  rig: JourneyRig,
  time: number,
  out: { pos: THREE.Vector3; quat: THREE.Quaternion; scale: number },
) {
  const p = rig.progress;

  if (i === MEMBERS) {
    // The pooled chit: one large coin turning at the ring's centre, gone once the group moves on.
    const grow = ease(span(rig.assemble, 0.55, 1)) * (1 - ease(span(p, 0.2, 0.55)));
    out.pos.set(0, 0.45 + Math.sin(time * 0.8) * 0.04, 0);
    out.quat.setFromAxisAngle(Y, time * 0.45);
    out.scale = 0.52 * grow;
    return;
  }

  // Seating: move between layouts with a per-coin stagger, so the group flows rather than jumps.
  const { k } = travel(p);
  const la = layoutFor(k);
  const lb = layoutFor(k + 1);
  seat(la, i, A.pos, A.quat);
  if (la !== lb) {
    seat(lb, i, B.pos, B.quat);
    const stagger = (i / MEMBERS) * 0.3;
    const g = ease(clamp01((span(p, k + 0.22, k + 0.86) - stagger) / 0.7));
    out.pos.lerpVectors(A.pos, B.pos, g);
    out.pos.y += bump(g) * 1.1;
    out.quat.slerpQuaternions(A.quat, B.quat, g);
  } else {
    out.pos.copy(A.pos);
    out.quat.copy(A.quat);
  }
  out.scale = COIN_SCALE;

  // Assembly from a loose scatter while the section scrolls in.
  if (rig.assemble < 1 && p < 0.5) {
    const g = ease(clamp01((rig.assemble - (i / MEMBERS) * 0.45) / 0.55));
    out.pos.lerpVectors(SCATTER[i], out.pos, g);
    out.quat.slerpQuaternions(SCATTER_TURN[i], out.quat, g);
  }

  // Stage 2: as the pulse passes, each member steps in toward the dial to pay.
  const t = (i / MEMBERS) * Math.PI * 2;
  const pay = pulseAt(Math.PI / 2 - t, p, 0.08);
  if (pay > 0.001) {
    const a = Math.PI / 2 - t;
    out.pos.x -= Math.cos(a) * 0.32 * pay;
    out.pos.y -= Math.sin(a) * 0.32 * pay;
    out.pos.z += 0.3 * pay;
  }

  // Stage 3: three members bid, each higher than the last; the losers sit back down in stage 4.
  const bid = BIDS[i];
  if (bid) {
    const up = ease(span(p, bid.at, bid.at + 0.14));
    const down = i === WINNER ? 0 : ease(span(p, 2.68, 2.88));
    const raised = up * (1 - down);
    out.pos.y += bid.h * raised;
    out.quat.slerp(FACING_AUCTION_SHOT, raised);
  }

  // Stage 4: the dividend reaches every seat at once — one shared hop, equal shares.
  if (i !== WINNER) out.pos.y += bump(span(p, 3.04, 3.24)) * 0.24;

  if (i === WINNER) {
    // Rise to hover over the scale…
    const lift = ease(span(p, 2.72, 2.98));
    if (lift > 0) {
      from.copy(out.pos);
      out.pos.lerpVectors(from, WINNER_HOVER, lift);
      out.pos.y += bump(lift) * 0.3;
      out.quat.slerp(spin.copy(FLAT).premultiply(turn.setFromAxisAngle(Y, time * 0.7)), lift);
      out.scale = THREE.MathUtils.lerp(COIN_SCALE, 0.45, lift);
    }
    // …then fly to the vault in stage 5 and pass through its door.
    const fly = ease(span(p, 3.22, 3.78));
    if (fly > 0) {
      out.pos.lerpVectors(WINNER_HOVER, DOOR, fly);
      out.pos.y += bump(fly) * 1.9;
      out.quat.slerpQuaternions(FLAT, FACING_VAULT_SHOT, fly);
      out.scale = THREE.MathUtils.lerp(0.45, 0.26, fly);
    }
    const enter = ease(span(p, 3.74, 3.88));
    if (enter > 0) {
      out.pos.z -= enter * 0.3;
      out.scale *= 1 - enter;
    }
  }
}

// ─── Station beats ────────────────────────────────────────────────────────────

/** Stations outside the current shot are hidden, so a distant model never crowds another stage. */
export const stationVisible = {
  calendar: (p: number) => p < 1.85,
  podium: (p: number) => p > 0.9 && p < 3.9,
  vault: (p: number) => p > 2.6,
};

/** Stage 3: bids rise, then the gavel falls and the beam tips toward the discount. */
export const auctionBeat = (p: number) => ({
  tilt: -0.22 * ease(span(p, 1.78, 2.12)),
  strike: span(p, 2.1, 2.27),
});

/** Stage 4: the dividend ring opens out to the member ring and its coins fly to every seat. */
export const dividendBeat = (p: number) => ({
  ring: ease(span(p, 2.9, 3.12)),
  coins: ease(span(p, 2.92, 3.14)),
});

/** Stage 5: the vault rings wind down and lock; the FDR shield drops in front and seats itself. */
export const vaultBeat = (p: number) => {
  const drop = span(p, 3.6, 3.92);
  return {
    lock: easeVault(span(p, 3.55, 3.95)),
    shieldVisible: p > 3.3,
    shieldDrop: drop <= 0 ? 0 : easeOutBack(drop),
    shieldTurn: ease(drop),
    shieldAz: SHOTS[LAST_STAGE].az,
  };
};
