import { BAND_FACETS, CROWN_BAND, CROWN_BODY, VIEWBOX, diamondPath, polygonPath } from "@/components/brand/crownGeometry";
import { cn } from "@/lib/utils";

/** Where each crown sits down the page: alternating sides so they fill the margins beside short sections. */
const MARKS = [
  { top: "14%", side: "right", size: "min(34rem,62vw)", tilt: -8 },
  { top: "38%", side: "left", size: "min(40rem,70vw)", tilt: 6 },
  { top: "62%", side: "right", size: "min(36rem,64vw)", tilt: -4 },
  { top: "84%", side: "left", size: "min(32rem,60vw)", tilt: 8 },
] as const;

/**
 * Faint outlined crowns drawn behind every public page, in the empty margins beside the content.
 * Decorative only: no pointer events, hidden from assistive tech, and kept under 8% opacity so text stays crisp.
 */
export function PageWatermark() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {MARKS.map((m, i) => (
        <svg
          key={i}
          viewBox={VIEWBOX}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinejoin="round"
          className={cn("absolute aspect-square -translate-y-1/2 text-gold-ink opacity-[0.07]", m.side === "right" ? "-right-[8%]" : "-left-[8%]")}
          style={{ top: m.top, width: m.size, rotate: `${m.tilt}deg` }}
        >
          <path d={polygonPath(CROWN_BODY)} />
          <path d={polygonPath(CROWN_BAND)} />
          {BAND_FACETS.map((f, j) => (
            <path key={j} d={diamondPath(f)} />
          ))}
        </svg>
      ))}
    </div>
  );
}
