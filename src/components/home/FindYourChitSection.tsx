"use client";

import { FIND_YOUR_CHIT } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { FindYourChit } from "@/components/widgets";

export function FindYourChitSection() {
  const { t } = useLocale();
  return (
    <section id="find-your-chit" aria-labelledby="find-title" className="scroll-mt-20 border-t border-hairline py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <h2
            id="find-title"
            className="text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.06] tracking-[-0.01em] text-foreground ta:text-[clamp(1.85rem,3.4vw,2.9rem)] ta:leading-[1.4] ta:tracking-normal"
          >
            {t(FIND_YOUR_CHIT.title)}
          </h2>
          <p className="text-muted-foreground lg:pb-2">{t(FIND_YOUR_CHIT.lead)}</p>
        </header>
        <div className="mt-12">
          <FindYourChit />
        </div>
      </div>
    </section>
  );
}
