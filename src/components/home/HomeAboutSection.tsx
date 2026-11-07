"use client";

import Link from "next/link";
import { ABOUT_PAGE, DIRECTORS, HOME_ABOUT, QUOTES, navHref } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { DirectorPortrait } from "@/components/about/DirectorPortrait";

const LINK = "text-sm font-semibold text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring";

/** Home §8: who runs Panasuna — the mission, the board as a row of monograms, the founding idea. */
export function HomeAboutSection() {
  const { t } = useLocale();
  const savings = QUOTES.buffett.quotes.find((q) => q.id === ABOUT_PAGE.philosophies.buffett.headline)!;

  return (
    <section id="about" aria-labelledby="home-about-title" className="scroll-mt-20 border-t border-hairline py-24 md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 sm:px-8">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <h2
            id="home-about-title"
            className="text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.06] tracking-[-0.01em] text-foreground ta:text-[clamp(1.85rem,3.4vw,2.9rem)] ta:leading-[1.4] ta:tracking-normal"
          >
            {t(HOME_ABOUT.title)}
          </h2>
          <div className="flex flex-col gap-4 lg:pb-2">
            <p className="text-muted-foreground">{t(HOME_ABOUT.lead)}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href={`${navHref("about")}#board`} className={LINK}>
                {t(HOME_ABOUT.meet)}
              </Link>
              <Link href={navHref("about")} className={LINK}>
                {t(HOME_ABOUT.story)}
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <figure className="flex flex-col justify-center gap-5 rounded-3xl border border-hairline bg-card/40 p-6 sm:p-10">
            <p className="text-sm font-semibold text-gold-ink">{t(ABOUT_PAGE.purpose.mission.title)}</p>
            <blockquote className="text-[clamp(2rem,3.6vw,3rem)] leading-[1.1] text-foreground [font-family:var(--font-display)] ta:text-[clamp(1.5rem,2.6vw,2.1rem)] ta:leading-[1.45]">
              <p>{t(ABOUT_PAGE.purpose.motto)}</p>
            </blockquote>
            <figcaption className="leading-relaxed text-muted-foreground">{t(ABOUT_PAGE.purpose.mission.body)}</figcaption>
            <p className="border-t border-hairline pt-5 text-sm text-muted-foreground">
              “{t(savings.text)}” — {t(QUOTES.buffett.author)}
            </p>
          </figure>

          <ul aria-label={t(ABOUT_PAGE.board.title)} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {DIRECTORS.map((d) => (
              <li key={d.id}>
                <Link
                  href={`${navHref("about")}#board`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-hairline transition-[translate,border-color] duration-[160ms] hover:-translate-y-1 hover:border-hairline-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:hover:translate-y-0"
                >
                  <DirectorPortrait director={d} sizes="(min-width: 1024px) 15vw, (min-width: 640px) 30vw, 50vw" className="aspect-[4/5]" />
                  <span className="flex flex-col border-t border-hairline p-4">
                    <span className="text-sm font-semibold text-foreground">{t(d.name)}</span>
                    <span className="text-xs text-muted-foreground">{t(d.role)}</span>
                  </span>
                </Link>
              </li>
            ))}
            <li className="flex">
              <Link
                href={`${navHref("about")}#board`}
                className="flex w-full flex-col justify-end gap-2 rounded-3xl border border-dashed border-hairline-strong p-4 text-sm font-semibold text-gold-ink hover:border-gold-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="font-sans text-3xl font-light text-gold-ink tabular-nums">{DIRECTORS.length}</span>
                {t(HOME_ABOUT.meet)}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
