"use client";

import { CONTACT_PAGE, DISCLOSURES } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";

/** /contact#disclosures: every compliance note in plain words (the footer carries the first four). */
export function Disclosures() {
  const { t } = useLocale();
  return (
    <section id="disclosures" aria-labelledby="disclosures-title" className="scroll-mt-28 grid gap-8 border-t border-hairline pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <h2
        id="disclosures-title"
        className="text-[clamp(2rem,4vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-foreground ta:text-[clamp(1.7rem,3vw,2.6rem)] ta:leading-[1.4] ta:tracking-normal"
      >
        {t(CONTACT_PAGE.disclosuresTitle)}
      </h2>
      <ol className="flex flex-col border-t border-hairline">
        {DISCLOSURES.map((d, i) => (
          <li key={d.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-hairline py-4 leading-relaxed text-muted-foreground tabular-nums">
            <span className="text-sm font-semibold text-gold-ink">{i + 1}</span>
            <span>{t(d.text)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
