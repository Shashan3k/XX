"use client";

import { motion } from "framer-motion";
import { GOLDEN_RULES } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** /auction-process: the three rules as one composed band (hairline-divided), not a 3-up card kit. */
export function GoldenRules() {
  const { t } = useLocale();
  const reduce = usePrefersReducedMotion();
  return (
    <section aria-labelledby="golden-rules" className="flex flex-col gap-10">
      <h2
        id="golden-rules"
        className="max-w-3xl text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.1] tracking-[-0.01em] text-foreground ta:text-[clamp(1.6rem,2.8vw,2.3rem)] ta:leading-[1.4] ta:tracking-normal"
      >
        {t(GOLDEN_RULES.title)}
      </h2>
      <ol className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline md:grid-cols-3">
        {GOLDEN_RULES.rules.map((rule, i) => (
          <motion.li
            key={rule.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3 bg-background p-6 sm:p-8"
          >
            <p className="text-sm font-semibold text-muted-foreground tabular-nums">{i + 1}</p>
            <p className="text-[clamp(3rem,6vw,4.5rem)] leading-none font-semibold tracking-[-0.03em] text-gold-ink tabular-nums lining-nums">
              {rule.figure}
            </p>
            <h3 className="text-lg font-semibold text-foreground">{t(rule.title)}</h3>
            <p className="text-muted-foreground">{t(rule.body)}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
