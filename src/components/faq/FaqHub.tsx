"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";
import { CONTACT, FAQ, LOCALES, navHref, type FaqItem, type Localized } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const SPRING = { type: "spring", stiffness: 320, damping: 34, mass: 0.9 } as const;
const MOBILE = CONTACT.phones.find((p) => p.id === "mobile")!;

type Term = (typeof FAQ.terms)[number];

const fold = (s: string) => s.toLocaleLowerCase().normalize("NFC");

/** Both languages are searchable from either UI: a Tamil reader may still type "dividend". */
function haystack(...fields: (Localized | Localized<readonly string[]>)[]) {
  return fold(fields.flatMap((f) => LOCALES.flatMap((l) => f[l])).join(" "));
}

const FAQ_INDEX = FAQ.items.map((item) => ({ item, text: haystack(item.question, item.answer, item.keywords) }));
const TERM_INDEX = FAQ.terms.map((term) => ({ term, text: haystack(term.term, term.body) }));

function tokens(query: string) {
  return fold(query).split(/\s+/).filter(Boolean);
}

/** Wraps every query token in a <mark>, case-insensitively. */
function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "giu"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-gold/25 text-foreground">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * Instant-search FAQ and terminology. Home §10 shows the questions (terms appear once you search);
 * /resources shows both. `#faq-<id>` in the URL opens that answer.
 */
export function FaqHub({ variant = "page" }: { variant?: "home" | "page" }) {
  const { t, locale } = useLocale();
  const reduce = usePrefersReducedMotion();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState<ReadonlySet<FaqItem["id"]>>(() => new Set());
  const id = React.useId();
  const words = tokens(query);

  const faqs = FAQ_INDEX.filter(({ text }) => words.every((w) => text.includes(w))).map((x) => x.item);
  const terms = TERM_INDEX.filter(({ text }) => words.every((w) => text.includes(w))).map((x) => x.term);
  const showTerms = variant === "page" || words.length > 0;
  // On /resources the hub sits straight under the page h1; on home it sits under the section's h2.
  const Group = variant === "page" ? "h2" : "h3";
  const total = faqs.length + (showTerms ? terms.length : 0);

  React.useEffect(() => {
    const fromHash = () => {
      const match = FAQ.items.find((f) => window.location.hash === `#faq-${f.id}`);
      if (match) setOpen((s) => new Set(s).add(match.id));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const toggle = (faq: FaqItem["id"]) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(faq)) next.delete(faq);
      else next.add(faq);
      return next;
    });

  return (
    <div className="flex flex-col gap-8">
      <div role="search" className="flex flex-col gap-2">
        <label htmlFor={`${id}-q`} className="text-sm font-semibold text-foreground">
          {t(FAQ.search)}
        </label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id={`${id}-q`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(FAQ.placeholder)}
            autoComplete="off"
            aria-describedby={`${id}-count`}
            className="h-12 w-full rounded-full border border-hairline-strong bg-card/40 pr-12 pl-11 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t(FAQ.clear)}
              className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
        <p id={`${id}-count`} aria-live="polite" className="min-h-5 text-sm text-muted-foreground tabular-nums">
          {words.length > 0 && FAQ.results[locale](total)}
        </p>
      </div>

      <div className={cn("grid gap-12", showTerms && variant === "page" && "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16")}>
        {faqs.length > 0 && (
          <section aria-labelledby={`${id}-faqs`} className="flex flex-col gap-4">
            <Group id={`${id}-faqs`} className="font-sans text-sm font-semibold text-gold-ink">
              {t(FAQ.questionsTitle)}
            </Group>
            <ul className="flex flex-col border-t border-hairline">
              {faqs.map((faq) => (
                <Accordion
                  key={faq.id}
                  level={variant === "page" ? 3 : 4}
                  faq={faq}
                  open={open.has(faq.id)}
                  onToggle={() => toggle(faq.id)}
                  words={words}
                  reduce={reduce}
                />
              ))}
            </ul>
          </section>
        )}

        {showTerms && terms.length > 0 && (
          <section aria-labelledby={`${id}-terms`} className="flex flex-col gap-4">
            <Group id={`${id}-terms`} className="font-sans text-sm font-semibold text-gold-ink">
              {t(FAQ.termsTitle)}
            </Group>
            <dl className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline">
              {terms.map((term: Term, i) => (
                <div key={i} className="bg-background p-5">
                  <dt className="font-semibold text-foreground">
                    <Highlight text={t(term.term)} words={words} />
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground tabular-nums">
                    <Highlight text={t(term.body)} words={words} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {total === 0 && (
          <p className="rounded-3xl border border-hairline p-6 text-muted-foreground">
            {t(FAQ.empty)}{" "}
            <a href={`tel:${MOBILE.tel}`} className="font-semibold whitespace-nowrap text-foreground tabular-nums underline-offset-2 hover:underline">
              {MOBILE.display}
            </a>
          </p>
        )}
      </div>

      {variant === "home" && (
        <Link
          href={navHref("resources")}
          className="self-start text-sm font-semibold text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          {t(FAQ.more)}
        </Link>
      )}
    </div>
  );
}

function Accordion({
  faq,
  level,
  open,
  onToggle,
  words,
  reduce,
}: {
  faq: FaqItem;
  level: 3 | 4;
  open: boolean;
  onToggle: () => void;
  words: string[];
  reduce: boolean;
}) {
  const { t, locale } = useLocale();
  const panel = `faq-${faq.id}-panel`;
  return (
    <li id={`faq-${faq.id}`} className="scroll-mt-28 border-b border-hairline">
      <Heading level={level}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panel}
          onClick={onToggle}
          className="group flex w-full items-start justify-between gap-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className={cn("text-lg leading-snug transition-colors duration-[160ms]", open ? "text-foreground" : "text-foreground/85 group-hover:text-foreground")}>
            <Highlight text={t(faq.question)} words={words} />
          </span>
          <motion.span
            aria-hidden="true"
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : SPRING}
            className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border", open ? "border-gold-ink text-gold-ink" : "border-hairline-strong text-muted-foreground")}
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </button>
      </Heading>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panel}
            role="region"
            aria-label={t(faq.question)}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { height: 0, opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { height: SPRING, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="flex max-w-3xl flex-col gap-3 pb-6 leading-relaxed text-muted-foreground tabular-nums">
              {faq.answer[locale].map((p, i) => (
                <p key={i}>
                  <Highlight text={p} words={words} />
                </p>
              ))}
              {faq.id === "support" && <SupportLinks />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function Heading({ level, children }: { level: 3 | 4; children: React.ReactNode }) {
  return level === 3 ? <h3>{children}</h3> : <h4>{children}</h4>;
}

function SupportLinks() {
  return (
    <p className="flex flex-wrap gap-2 pt-1">
      {CONTACT.phones.map((p) => (
        <a
          key={p.id}
          href={`tel:${p.tel}`}
          className="rounded-full border border-hairline-strong px-3 py-1 text-sm font-semibold text-foreground tabular-nums hover:border-gold-ink focus-visible:outline-2 focus-visible:outline-ring"
        >
          {p.display}
        </a>
      ))}
    </p>
  );
}
