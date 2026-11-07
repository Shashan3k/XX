"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { AvatarMotif, Director } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "butt", strokeLinejoin: "round" } as const;

/**
 * Line motifs on the 32 grid (panasuna-brand §4), drawn large behind each monogram. Each is tied to
 * the director's story: the founder's crown, the advocate's scales, the backbone's ledger, the
 * young director's ascent, the returning analyst's compass.
 */
const MOTIFS: Record<AvatarMotif, React.ReactNode> = {
  crown: (
    <>
      <path d="M6 23 L5 10 L11 15 L16 6 L21 15 L27 10 L26 23 Z" {...STROKE} />
      <path d="M6 26.5h20" {...STROKE} />
      <path d="M12 23v-3.5M16 23v-4.5M20 23v-3.5" {...STROKE} />
    </>
  ),
  scales: (
    <>
      <path d="M16 5v22M10 27h12" {...STROKE} />
      <path d="M6 10h20" {...STROKE} />
      <path d="M6 10 L2.5 18 h7 Z M26 10 L22.5 18 h7 Z" {...STROKE} />
    </>
  ),
  ledger: (
    <>
      <path d="M6 5h17l3 3v19H6z" {...STROKE} />
      <path d="M10 11h12M10 15h12M10 19h8M10 23h5" {...STROKE} />
    </>
  ),
  ascent: (
    <>
      <path d="M4 26 L11 18 L16 21 L27 8" {...STROKE} />
      <path d="M21 8h6v6" {...STROKE} />
      <path d="M4 28.5h24" {...STROKE} />
    </>
  ),
  compass: (
    <>
      <circle cx="16" cy="16" r="11.5" {...STROKE} />
      <path d="M16 3.5v2.5M16 26v2.5M3.5 16h2.5M26 16h2.5" {...STROKE} />
      <path d="M16 8.5l2.6 7.5-2.6 7.5-2.6-7.5z" {...STROKE} />
    </>
  ),
};

/**
 * Director portrait: the real photograph, framed with a gold-to-emerald hairline and a soft emerald
 * foot-shade. Zooms gently on hover (parent `group` or the `hover` prop). Falls back to the bespoke
 * monogram + motif avatar below if a director has no photo.
 */
export function DirectorPortrait({
  director,
  className,
  hover = false,
  sizes = "(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw",
  priority = false,
}: {
  director: Director;
  className?: string;
  hover?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const { t } = useLocale();
  const { monogram, motif, tone } = director.avatar;

  if (director.photo) {
    return (
      <div
        className={cn(
          "relative isolate aspect-[4/5] overflow-hidden bg-emerald-900",
          // gold → emerald hairline frame that brightens on hover
          "after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-gold/35 after:transition-[box-shadow] after:duration-300",
          "group-hover:after:ring-gold/80 group-focus-visible:after:ring-gold/80",
          hover && "after:ring-gold/80",
          className,
        )}
      >
        <Image
          src={director.photo}
          alt={t(director.name)}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            "object-cover object-top transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            "group-hover:scale-[1.05] group-focus-visible:scale-[1.05]",
            hover && "scale-[1.05]",
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-1/4 bg-gradient-to-t from-emerald-900/45 to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[2px] bg-gradient-to-r from-gold/0 via-gold to-emerald-700/0 opacity-70"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate grid aspect-[4/5] place-items-center overflow-hidden",
        tone === "gold"
          ? "bg-[radial-gradient(ellipse_80%_70%_at_50%_35%,color-mix(in_oklab,var(--color-gold)_16%,transparent),transparent_70%)]"
          : "bg-[radial-gradient(ellipse_80%_70%_at_50%_35%,color-mix(in_oklab,var(--secondary)_85%,transparent),transparent_72%)]",
        className,
      )}
    >
      <motion.svg
        viewBox="0 0 32 32"
        className="absolute inset-[12%] -z-10 text-gold-ink opacity-[0.16]"
        animate={{ rotate: hover ? 4 : 0, scale: hover ? 1.04 : 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {MOTIFS[motif]}
      </motion.svg>
      <svg viewBox="0 0 200 200" className="absolute inset-[18%] text-gold-ink">
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" strokeDasharray="1 5" />
      </svg>
      {/* Monogram in the display face, medium weight, lightly tracked. */}
      <span className="font-[family-name:var(--font-jakarta)] text-[clamp(2.5rem,4.4vw,3.5rem)] leading-none font-medium tracking-[0.04em] text-foreground">
        {monogram}
      </span>
    </div>
  );
}
