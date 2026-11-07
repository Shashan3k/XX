"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { CONTACT, CONTACT_PAGE, CONTACT_SECTION } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";

const MOBILE = CONTACT.phones.find((p) => p.id === "mobile")!;
const EASE = [0.22, 1, 0.36, 1] as const;
const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "butt", strokeLinejoin: "round" } as const;
const pivot = (x: number, y: number): React.CSSProperties => ({ transformBox: "view-box", transformOrigin: `${x}px ${y}px` });

type CardId = "apply" | "call" | "advisor";

/** Bespoke 32-grid icons, each with one micro-animation on hover or focus (panasuna-brand §4). */
function HelpIcon({ id }: { id: CardId }) {
  const nib: Variants = { rest: { x: 0, y: 0 }, play: { x: [0, 3, -1, 2, 0], y: [0, -1, 1, 0, 0], transition: { duration: 0.8, ease: EASE } } };
  const ring: Variants = { rest: { rotate: 0 }, play: { rotate: [0, -14, 12, -8, 6, 0], transition: { duration: 0.7, ease: EASE } } };
  const needle: Variants = { rest: { rotate: 35 }, play: { rotate: [35, -40, 60, 20, 35], transition: { duration: 1.2, ease: EASE } } };
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-9 text-gold-ink">
      {id === "apply" && (
        <>
          <path d="M7 4h13l5 5v19H7z" {...STROKE} />
          <path d="M11 12h10M11 16h10M11 20h5" {...STROKE} />
          <motion.g variants={nib}>
            <path d="M20 25l7-7 2 2-7 7h-2z" {...STROKE} />
            <circle cx="28" cy="19" r="1.1" fill="var(--color-ember)" />
          </motion.g>
        </>
      )}
      {id === "call" && (
        <motion.g variants={ring} style={pivot(16, 16)}>
          <path d="M9 5l4 1 1.5 5-2.5 2a14 14 0 0 0 7 7l2-2.5 5 1.5 1 4-2 2.5C17 26 6 15 6.5 7z" {...STROKE} />
          <circle cx="24" cy="8" r="1.1" fill="var(--color-ember)" />
        </motion.g>
      )}
      {id === "advisor" && (
        <>
          <circle cx="16" cy="16" r="11.5" {...STROKE} />
          <path d="M16 3.5v2.5M16 26v2.5M3.5 16h2.5M26 16h2.5" {...STROKE} />
          <motion.g variants={needle} style={pivot(16, 16)}>
            <path d="M16 8.5l2.6 7.5-2.6 7.5-2.6-7.5z" {...STROKE} />
          </motion.g>
        </>
      )}
    </svg>
  );
}

/** The old site's "We are here to help you" cards: apply (enquiry), call (tel:), advisor (enquiry). */
export function HelpCards({ className }: { className?: string }) {
  const { t } = useLocale();
  const { openEnquiry } = useEnquiry();

  return (
    <section aria-labelledby="help-title" className={cn("flex flex-col gap-8", className)}>
      <h2
        id="help-title"
        className="text-[clamp(2rem,4vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-foreground ta:text-[clamp(1.7rem,3vw,2.6rem)] ta:leading-[1.4] ta:tracking-normal"
      >
        {t(CONTACT_PAGE.helpTitle)}
      </h2>
      <ul className="grid gap-4 md:grid-cols-3">
        {CONTACT_SECTION.cards.map((card) => {
          const id = card.id as CardId;
          const action =
            id === "call" ? (
              <a href={`tel:${MOBILE.tel}`} className={ACTION}>
                {t(card.action)}
              </a>
            ) : (
              <button type="button" onClick={() => openEnquiry()} className={ACTION}>
                {t(card.action)}
              </button>
            );
          return (
            <motion.li
              key={id}
              initial="rest"
              whileHover="play"
              whileFocus="play"
              className={cn(
                "flex flex-col gap-5 rounded-3xl border p-6 transition-[translate,border-color] duration-[160ms] hover:-translate-y-1 hover:border-hairline-strong focus-within:border-hairline-strong motion-reduce:hover:translate-y-0 sm:p-7",
                id === "call" ? "border-hairline-strong bg-gold/8" : "border-hairline bg-card/40",
              )}
            >
              <HelpIcon id={id} />
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-foreground">{t(card.title)}</h3>
                {id === "call" ? (
                  <p className="text-3xl font-light tracking-[-0.02em] text-foreground tabular-nums">{MOBILE.display}</p>
                ) : (
                  <p className="text-muted-foreground">{t(card.body)}</p>
                )}
              </div>
              <div className="mt-auto">{action}</div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

const ACTION =
  "inline-flex min-h-10 max-lg:min-h-11 items-center rounded-full border border-hairline-strong px-4 text-sm font-semibold text-foreground transition-colors hover:border-gold-ink hover:text-gold-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
