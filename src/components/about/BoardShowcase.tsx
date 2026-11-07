"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ABOUT_PAGE, ASSOCIATIONS, DIRECTORS, type Director } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { pageScroll } from "@/components/providers/SmoothScroll";
import { Button } from "@/components/ui/button";
import { Sheet, SheetDescription, SheetHeader, SheetPanel, SheetPopup, SheetTitle } from "@/components/ui/sheet";
import { DirectorPortrait } from "./DirectorPortrait";

const copy = ABOUT_PAGE.board;
const EASE = [0.22, 1, 0.36, 1] as const;

const H2 =
  "text-[clamp(2rem,4vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-foreground ta:text-[clamp(1.7rem,3vw,2.6rem)] ta:leading-[1.4] ta:tracking-normal";

/** /about: the five directors as editorial monogram cards; each opens a slide-over bio drawer. */
export function BoardShowcase() {
  const { t } = useLocale();
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<string | null>(null);
  const index = DIRECTORS.findIndex((d) => d.id === openId);

  const open = (id: string) => {
    setOpenId(id);
    pageScroll.lock();
  };
  const onOpenChange = (next: boolean) => {
    if (next) return;
    setOpenId(null);
    pageScroll.unlock();
  };

  return (
    <section id="board" aria-labelledby="board-title" className="scroll-mt-24">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <h2 id="board-title" className={H2}>
          {t(copy.title)}
        </h2>
        <p className="text-muted-foreground lg:pb-2">{t(copy.lead)}</p>
      </header>

      <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {DIRECTORS.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => open(d.id)}
              onPointerEnter={() => setHover(d.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(d.id)}
              onBlur={() => setHover(null)}
              aria-haspopup="dialog"
              className={cn(
                "group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-hairline bg-card/40 text-left",
                "transition-[translate,border-color] duration-[160ms] hover:-translate-y-1 hover:border-hairline-strong motion-reduce:hover:translate-y-0",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              <DirectorPortrait director={d} hover={hover === d.id} />
              <span className="flex flex-1 flex-col gap-3 border-t border-hairline p-4 sm:p-5">
                <span className="flex flex-col">
                  <span className="font-semibold text-foreground">{t(d.name)}</span>
                  <span className="text-sm text-muted-foreground">{t(d.role)}</span>
                </span>
                <span className="mt-auto flex flex-wrap gap-1.5">
                  {d.badges.map((b, j) => (
                    <span
                      key={j}
                      className="rounded-full border border-hairline-strong px-2 py-0.5 text-[0.7rem] font-semibold text-gold-ink"
                    >
                      {ASSOCIATIONS[b.association].abbr}
                    </span>
                  ))}
                </span>
                <span className="text-sm font-semibold text-gold-ink underline-offset-4 group-hover:underline">{t(copy.readBio)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={openId !== null} onOpenChange={onOpenChange}>
        <SheetPopup data-lenis-prevent side="right" className="sm:max-w-lg" closeProps={{ "aria-label": t(copy.close) }}>
          {index >= 0 && <DirectorDrawer director={DIRECTORS[index]} index={index} onNavigate={(i) => setOpenId(DIRECTORS[i].id)} />}
        </SheetPopup>
      </Sheet>
    </section>
  );
}

function DirectorDrawer({ director, index, onNavigate }: { director: Director; index: number; onNavigate: (i: number) => void }) {
  const { t, locale } = useLocale();
  const reduce = usePrefersReducedMotion();
  const n = DIRECTORS.length;
  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={director.id}
          initial={reduce ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -16 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <SheetHeader className="flex-row items-center gap-4 pe-14">
            <DirectorPortrait director={director} sizes="80px" className="w-20 shrink-0 rounded-2xl border border-hairline [&>span]:text-2xl" />
            <div className="flex min-w-0 flex-col gap-1">
              <SheetTitle className="font-sans text-2xl leading-tight font-semibold">{t(director.name)}</SheetTitle>
              <SheetDescription className="text-base">{t(director.role)}</SheetDescription>
            </div>
          </SheetHeader>
          <SheetPanel className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              {director.bio[locale].map((p, i) => (
                <p key={i} className="leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t(ABOUT_PAGE.board.associations)}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {director.badges.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-2xl border border-hairline p-3">
                    <span className="shrink-0 rounded-full border border-gold-ink px-2 py-0.5 text-xs font-semibold text-gold-ink">
                      {ASSOCIATIONS[b.association].abbr}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm text-foreground">
                        {t(b.title)}
                        <span className="text-muted-foreground"> · {t(b.current ? ABOUT_PAGE.board.current : ABOUT_PAGE.board.past)}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{t(ASSOCIATIONS[b.association].name)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </SheetPanel>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-between gap-3 border-t border-hairline px-6 py-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate((index - 1 + n) % n)} aria-label={t(ABOUT_PAGE.board.previous)}>
          <ChevronLeft aria-hidden="true" />
          <span className="max-w-[9rem] truncate">{t(DIRECTORS[(index - 1 + n) % n].name)}</span>
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {index + 1} / {n}
        </span>
        <Button variant="ghost" size="sm" onClick={() => onNavigate((index + 1) % n)} aria-label={t(ABOUT_PAGE.board.next)}>
          <span className="max-w-[9rem] truncate">{t(DIRECTORS[(index + 1) % n].name)}</span>
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </>
  );
}
