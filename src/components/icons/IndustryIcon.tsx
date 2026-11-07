import type { IndustryId } from "@/data/panasunaData";
import { cn } from "@/lib/utils";

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "butt", strokeLinejoin: "round" } as const;
const EMBER = { fill: "var(--color-ember)" } as const;

/** Customer industry badges: 32 grid, 1.5px stroke, one ember dot at most (panasuna-brand §4). */
const PATHS: Record<IndustryId, React.ReactNode> = {
  silverware: (
    <>
      <path d="M9 6h14l-2 9a5 5 0 0 1-10 0z" {...STROKE} />
      <path d="M16 20v6M11 26.5h10" {...STROKE} />
      <circle cx="19.5" cy="9.5" r="1.1" {...EMBER} />
    </>
  ),
  pipes: (
    <>
      <path d="M5 10h11a6 6 0 0 1 6 6v11" {...STROKE} />
      <path d="M5 18h7a2 2 0 0 1 2 2v7" {...STROKE} />
      <path d="M5 8v12M12 27h12" {...STROKE} />
    </>
  ),
  jewellery: (
    <>
      <path d="M8 11l3-5h10l3 5-8 15z" {...STROKE} />
      <path d="M8 11h16M13 11l3 15 3-15M11 6l2 5M21 6l-2 5" {...STROKE} />
      <circle cx="16" cy="8.5" r="1.1" {...EMBER} />
    </>
  ),
  trading: (
    <>
      <path d="M5 11l11-5 11 5v14l-11 5-11-5z" {...STROKE} />
      <path d="M5 11l11 5 11-5M16 16v14" {...STROKE} />
    </>
  ),
  retail: (
    <>
      <path d="M5 13l2-7h18l2 7" {...STROKE} />
      <path d="M5 13a3.7 3.7 0 0 0 7.3 0 3.7 3.7 0 0 0 7.4 0 3.7 3.7 0 0 0 7.3 0" {...STROKE} />
      <path d="M7 17v10h18V17M13 27v-6h6v6" {...STROKE} />
    </>
  ),
  ceramics: (
    <>
      <path d="M12 5h8M13 5v4c-5 2-7 6-6 11 1 4 4 7 9 7s8-3 9-7c1-5-1-9-6-11V5" {...STROKE} />
      <path d="M8.5 17h15" {...STROKE} />
    </>
  ),
  feeds: (
    <>
      <path d="M16 28V9" {...STROKE} />
      <path d="M16 13c-3 0-5-2-5-5 3 0 5 2 5 5zM16 13c3 0 5-2 5-5-3 0-5 2-5 5zM16 19c-3 0-5-2-5-5 3 0 5 2 5 5zM16 19c3 0 5-2 5-5-3 0-5 2-5 5zM16 25c-3 0-5-2-5-5 3 0 5 2 5 5zM16 25c3 0 5-2 5-5-3 0-5 2-5 5z" {...STROKE} />
      <circle cx="16" cy="6" r="1.1" {...EMBER} />
    </>
  ),
  manufacturing: (
    <>
      <circle cx="16" cy="16" r="4" {...STROKE} />
      <path d="M14.5 4.5h3l.6 3.2 2.4 1 2.7-1.9 2.1 2.1-1.9 2.7 1 2.4 3.2.6v3l-3.2.6-1 2.4 1.9 2.7-2.1 2.1-2.7-1.9-2.4 1-.6 3.2h-3l-.6-3.2-2.4-1-2.7 1.9-2.1-2.1 1.9-2.7-1-2.4-3.2-.6v-3l3.2-.6 1-2.4-1.9-2.7 2.1-2.1 2.7 1.9 2.4-1z" {...STROKE} />
    </>
  ),
};

export function IndustryIcon({ id, className }: { id: IndustryId; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("text-gold-ink", className)}>
      {PATHS[id]}
    </svg>
  );
}
