"use client";

import { FAQ } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { FaqHub } from "@/components/faq/FaqHub";

/** Home §10: searchable FAQs, with the full hub on /resources. */
export function FaqSection() {
  const { t } = useLocale();
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-hairline py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <header className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <h2
            id="faq-title"
            className="text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.06] tracking-[-0.01em] text-foreground ta:text-[clamp(1.85rem,3.4vw,2.9rem)] ta:leading-[1.4] ta:tracking-normal"
          >
            {t(FAQ.title)}
          </h2>
          <p className="text-muted-foreground">{t(FAQ.lead)}</p>
        </header>
        <FaqHub variant="home" />
      </div>
    </section>
  );
}
