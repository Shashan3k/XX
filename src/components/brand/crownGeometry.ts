/**
 * Panasuna crown — single source of truth for the SVG emblem AND the Blender coin emboss.
 * The numbers live in `crown.json`, which `scripts/blender/crown_coin.py` also reads, mapping
 *   X = (x - center.x) * scale,  Z = -(y - center.y) * scale
 * so the coin face and the logo are the same drawing.
 * Grid: 48 units, SVG convention (y grows downward).
 */
import crown from "./crown.json";

export type Pt = readonly [number, number];
export interface Diamond {
  c: Pt;
  r: number;
}

export const VIEWBOX = crown.viewBox.join(" ");
export const CENTER = crown.center as unknown as Pt;

/** Five peaks (centre tallest), flared outer edges, straight base. Clockwise. */
export const CROWN_BODY = crown.body as unknown as readonly Pt[];
/** The band sits below the body with a 2-unit gap. */
export const CROWN_BAND = crown.band as unknown as readonly Pt[];
/** Three facets on the band — one per generation of directors. */
export const BAND_FACETS = crown.facets as unknown as readonly Diamond[];
/** Diamond tips above each peak, left → right. These rise in the load animation. */
export const PEAK_TIPS = crown.tips as unknown as readonly Diamond[];
/** Obsidian gem inset in the centre peak. */
export const CENTRE_GEM = crown.gem as unknown as Diamond;

export function polygonPath(points: readonly Pt[]): string {
  return `M${points.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
}

export function diamondPath({ c: [x, y], r }: Diamond): string {
  return `M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z`;
}
