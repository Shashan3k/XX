"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { useLocale } from "@/lib/i18n";
import { CHIT_PLANS, type Localized } from "@/data/panasunaData";
import { COMMISSION_RATE, MAX_DISCOUNT_RATE, auctionOutcome } from "@/lib/auction";
import { AUCTION_COPY, PlanPicker } from "./shared";

const COPY = {
  run: { en: "Run this month's auction", ta: "இந்த மாத ஏலத்தை நடத்துங்கள்" },
  again: { en: "Run again", ta: "மீண்டும் நடத்து" },
  bidding: { en: "Bidding", ta: "ஏலம் நடக்கிறது" },
  won: { en: "Seat {n} wins", ta: "இருக்கை {n} வெற்றி" },
  shared: { en: "Dividend shared with every seat", ta: "ஈவுத்தொகை அனைத்து இருக்கைகளுக்கும் பகிரப்பட்டது" },
  discount: { en: "discount", ta: "தள்ளுபடி" },
  idle: { en: "Each seat is one member. Press run to watch a month.", ta: "ஒவ்வொரு இருக்கையும் ஒரு உறுப்பினர். ஒரு மாதத்தைப் பார்க்க அழுத்துங்கள்." },
} satisfies Record<string, Localized>;

/** Small groups only — a ring of 50+ seats stops being readable. */
const TABLE_PLANS = CHIT_PLANS.filter((p) => p.id === "cv-200000-20m" || p.id === "cv-150000-20m" || p.id === "cv-300000-25m" || p.id === "cv-500000-25m");

type Phase = "idle" | "bidding" | "won" | "shared";

interface Round {
  steps: { seat: number; rate: number }[];
  winner: number;
  rate: number;
}

function planRound(seats: number): Round {
  const final = 0.14 + Math.random() * 0.18;
  const steps: Round["steps"] = [];
  let rate = COMMISSION_RATE + 0.01;
  let last = -1;
  while (rate < final) {
    let seat = Math.floor(Math.random() * seats);
    if (seat === last) seat = (seat + 3) % seats;
    steps.push({ seat, rate });
    last = seat;
    rate += 0.015 + Math.random() * 0.025;
  }
  const winnerRate = Math.min(MAX_DISCOUNT_RATE, Math.round(final * 100) / 100);
  steps.push({ seat: steps.at(-1)!.seat, rate: winnerRate });
  return { steps, winner: steps.at(-1)!.seat, rate: winnerRate };
}

/**
 * Variant C — round table. Theatre: seats around a table, bids climb, the winner's coin leaves
 * the centre and dividends flow back to every seat. Most memorable and the best "aha" for
 * first-timers; slowest to read numbers from and needs motion to make its point.
 */
export function AuctionRoundTable() {
  const { t } = useLocale();
  const reduce = usePrefersReducedMotion();
  const [plan, setPlan] = React.useState(TABLE_PLANS[1]);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [round, setRound] = React.useState<Round | null>(null);
  const [stepIndex, setStepIndex] = React.useState(0);
  const timers = React.useRef<number[]>([]);

  const N = plan.durationMonths;
  const R = 118;
  const seatPos = (i: number) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    return { x: 150 + R * Math.cos(a), y: 150 + R * Math.sin(a) };
  };

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  React.useEffect(() => clear, []);

  const choosePlan = (p: typeof plan) => {
    clear();
    setPlan(p);
    setPhase("idle");
    setRound(null);
  };

  const run = () => {
    clear();
    const r = planRound(N);
    setRound(r);
    if (reduce) {
      setStepIndex(r.steps.length - 1);
      setPhase("shared");
      return;
    }
    setPhase("bidding");
    setStepIndex(0);
    r.steps.forEach((_, i) => timers.current.push(window.setTimeout(() => setStepIndex(i), i * 380)));
    const end = r.steps.length * 380;
    timers.current.push(window.setTimeout(() => setPhase("won"), end + 200));
    timers.current.push(window.setTimeout(() => setPhase("shared"), end + 1100));
  };

  const step = round?.steps[stepIndex];
  const currentRate = step?.rate ?? COMMISSION_RATE;
  const outcome = auctionOutcome(plan, round && phase !== "bidding" ? round.rate : currentRate);
  const winnerPos = round ? seatPos(round.winner) : null;

  const status =
    phase === "idle"
      ? t(COPY.idle)
      : phase === "bidding"
        ? `${t(COPY.bidding)} · ${Math.round(currentRate * 100)}%`
        : phase === "won"
          ? t(COPY.won).replace("{n}", String((round?.winner ?? 0) + 1))
          : t(COPY.shared);

  return (
    <div className="flex flex-col gap-6">
      <PlanPicker value={plan} onChange={choosePlan} plans={TABLE_PLANS} />

      <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-sm" aria-hidden="true">
          <circle cx="150" cy="150" r={R - 26} fill="#0A2A24" stroke="rgb(212 175 55 / 0.38)" />
          <circle cx="150" cy="150" r={R} fill="none" stroke="rgb(212 175 55 / 0.18)" strokeDasharray="2 6" />

          {Array.from({ length: N }, (_, i) => {
            const p = seatPos(i);
            const isBidder = phase === "bidding" && step?.seat === i;
            const isWinner = phase !== "bidding" && phase !== "idle" && round?.winner === i;
            return (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={9}
                initial={false}
                animate={{
                  fill: isWinner ? "#D4AF37" : isBidder ? "#F8FAFC" : "#123D34",
                  scale: isBidder ? 1.25 : 1,
                }}
                stroke="rgb(212 175 55 / 0.5)"
                transition={{ duration: 0.2 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            );
          })}

          {/* The pot: the chit value sits in the centre until it's won. */}
          <AnimatePresence>
            {phase !== "shared" && (
              <motion.circle
                key="pot"
                r={20}
                fill="#D4AF37"
                initial={{ cx: 150, cy: 150, opacity: 1 }}
                animate={phase === "won" && winnerPos ? { cx: winnerPos.x, cy: winnerPos.y, r: 9 } : { cx: 150, cy: 150 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
              />
            )}
          </AnimatePresence>

          {phase === "shared" &&
            Array.from({ length: N }, (_, i) => {
              const p = seatPos(i);
              return (
                <motion.circle
                  key={`d${i}`}
                  r={3}
                  fill="#3E7FCC"
                  initial={reduce ? { cx: p.x, cy: p.y, opacity: 0 } : { cx: 150, cy: 150, opacity: 1 }}
                  animate={{ cx: p.x, cy: p.y, opacity: reduce ? 1 : [1, 1, 0] }}
                  transition={{ duration: 0.8, delay: i * 0.015, ease: [0.22, 1, 0.36, 1] }}
                />
              );
            })}

          <text x="150" y="122" textAnchor="middle" fill="#F8FAFC" style={{ font: "500 22px var(--font-jakarta)" }} className="tabular-nums">
            {Math.round(currentRate * 100)}%
          </text>
          <text x="150" y="190" textAnchor="middle" fill="rgb(248 250 252 / 0.64)" style={{ font: "500 10px var(--font-dm-sans)" }}>
            {phase === "idle" ? "" : t(COPY.discount)}
          </text>
        </svg>

        <div className="flex flex-col gap-4">
          <p className="min-h-12 text-sm text-alabaster" aria-live="polite">
            {status}
          </p>
          <dl className="grid gap-3">
            <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2">
              <dt className="text-sm text-alabaster-muted">{t(AUCTION_COPY.prize)}</dt>
              <dd className="font-semibold text-gold">
                <AnimatedNumber value={phase === "idle" ? plan.chitValue : outcome.prize} />
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2">
              <dt className="text-sm text-alabaster-muted">{t(AUCTION_COPY.dividend)}</dt>
              <dd className="font-semibold text-alabaster">
                <AnimatedNumber value={phase === "shared" ? outcome.dividendPerMember : 0} />
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-sm text-alabaster-muted">{t(AUCTION_COPY.net)}</dt>
              <dd className="font-semibold text-alabaster">
                <AnimatedNumber value={phase === "shared" ? outcome.netInstallment : plan.monthlyInstallment} />
              </dd>
            </div>
          </dl>
          <Button onClick={run} disabled={phase === "bidding" || phase === "won"} className="self-start">
            {phase === "shared" ? t(COPY.again) : t(COPY.run)}
          </Button>
          <p className="text-xs text-alabaster-muted">
            {t(AUCTION_COPY.illustrative)}
          </p>
        </div>
      </div>
    </div>
  );
}
