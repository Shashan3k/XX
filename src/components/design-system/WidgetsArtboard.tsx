"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WizardStepped } from "@/components/widgets/wizard/WizardStepped";
import { WizardSentence } from "@/components/widgets/wizard/WizardSentence";
import { WizardMatrix } from "@/components/widgets/wizard/WizardMatrix";
import { AuctionBidSlider } from "@/components/widgets/auction/AuctionBidSlider";
import { AuctionCycle } from "@/components/widgets/auction/AuctionCycle";
import { AuctionRoundTable } from "@/components/widgets/auction/AuctionRoundTable";
import { Section } from "./Section";

type Verdict = "pass" | "partial" | "fail";

interface Review {
  label: string;
  name: string;
  selected?: boolean;
  rationale: string;
  strengths: string[];
  tradeoffs: string[];
  audit: { task: string; verdict: Verdict; note: string }[];
  Widget: () => React.JSX.Element;
}

/** Design-review notes (internal, English). Audit tasks reference .claude/skills/panasuna-persona-audit. */
const WIZARDS: Review[] = [
  {
    label: "A",
    name: "Stepped",
    selected: true,
    rationale:
      "One decision per screen — the way a branch advisor in Salem would ask across the counter. Built for Persona B on a 375px phone.",
    strengths: [
      "Meets B2 to the letter: three questions, one per screen, progress rail, Back keeps answers, results before any contact form.",
      "56px tap targets; goal icons carry meaning, not decoration.",
      "Live “N plans match so far” count reassures before the last tap; focus moves to each question for screen readers.",
    ],
    tradeoffs: [
      "Three taps before any result — slower for Persona A, who already knows he wants ₹25 L+.",
      "Answers can't be compared side by side; changing one means stepping back.",
    ],
    audit: [
      { task: "B2", verdict: "pass", note: "3 questions, one per screen, never empty" },
      { task: "B3", verdict: "pass", note: "value · months · installment, popular badge, dividend note" },
      { task: "A4", verdict: "partial", note: "big-ticket plans reachable, but not browsable" },
    ],
    Widget: WizardStepped,
  },
  {
    label: "B",
    name: "Sentence builder",
    rationale: "All three answers live in one sentence the user edits in place; results stay visible underneath.",
    strengths: [
      "Zero-to-result instantly — sensible defaults show a real plan on first paint.",
      "Native pickers on mobile; reads as personal rather than form-like.",
    ],
    tradeoffs: [
      "Breaks B2's one-question-per-screen; the Tamil sentence wraps to 4–5 lines at 375px.",
      "Pre-filled defaults answer for the user and can anchor the choice.",
    ],
    audit: [
      { task: "B2", verdict: "partial", note: "3 questions, but all on one screen with defaults" },
      { task: "B3", verdict: "pass", note: "same result list as A" },
      { task: "A4", verdict: "partial", note: "fast to re-query, still one slice at a time" },
    ],
    Widget: WizardSentence,
  },
  {
    label: "C",
    name: "Plan matrix",
    rationale: "Total transparency: every one of the 29 plans on a value × duration grid; answers light up the fits.",
    strengths: [
      "Persona A sees the whole ladder, ₹40K to ₹1 Cr, with nothing hidden behind a funnel.",
      "Each filter is optional and independent — useful for browsing, not just matching.",
    ],
    tradeoffs: [
      "17 × 6 grid is dense at 375px and scrolls sideways inside its frame.",
      "Number-heavy; a first-time saver gets a spreadsheet, not an answer.",
    ],
    audit: [
      { task: "B2", verdict: "fail", note: "not a stepped 3-question flow" },
      { task: "B3", verdict: "partial", note: "compact cells; details only after a tap" },
      { task: "A4", verdict: "pass", note: "best plan explorer — reuse on /chit-plans" },
    ],
    Widget: WizardMatrix,
  },
];

const AUCTIONS: Review[] = [
  {
    label: "A",
    name: "Bid slider",
    selected: true,
    rationale:
      "One month, one lever: drag the winning discount and watch where the chit value goes. Shipped on home §7 and /auction-process with every plan, the 3D podium and the full statutory breakdown; the calculator covers the whole cycle.",
    strengths: [
      "Clearest cause → effect: prize, commission and dividend pool in one split bar.",
      "Small and fast; works as an inline explainer next to any plan card.",
    ],
    tradeoffs: [
      "A single month hides the real decision — when to take the money.",
      "Starting from a slider is abstract for Persona A, who thinks in rupees, not percentages.",
    ],
    audit: [
      { task: "A3", verdict: "partial", note: "explains dividend + commission cap, not the cycle" },
      { task: "B5", verdict: "partial", note: "no comparison against loans or cards" },
    ],
    Widget: AuctionBidSlider,
  },
  {
    label: "B",
    name: "Cycle scrubber",
    rationale:
      "The whole group at once: for every month you could take the prize, what you pay versus what you receive. Answers “borrow early or save and wait?” in rupees.",
    strengths: [
      "Shows the real trade-off with exact ₹ totals; early months read as a borrowing cost, late months as a saving gain.",
      "Diverging bars on one zero baseline, legend + direct label + table view — never colour alone (palette validated: ΔE ≥ 25).",
      "Discloses its assumption curve, satisfying Persona A's transparency test.",
    ],
    tradeoffs: [
      "More reading than A or C; the legend is required to decode blue vs gold.",
      "Uses a modelled bid curve — real groups vary, so it must stay labelled as an illustration.",
    ],
    audit: [
      { task: "A3", verdict: "pass", note: "auction → discount → dividend, across the full cycle" },
      { task: "B5", verdict: "pass", note: "early-month cost is directly comparable to a 12–24% loan" },
    ],
    Widget: AuctionCycle,
  },
  {
    label: "C",
    name: "Round table",
    rationale: "Theatre: seats around a table, bids climb, the pot goes to one seat and dividends flow back to all.",
    strengths: [
      "Most memorable — a first-timer understands “one member takes the pot, everyone shares the discount” in five seconds.",
      "Natural fit for the 5-stage How a Chit Works scroll story.",
    ],
    tradeoffs: [
      "Randomised bids change every run, so numbers can't be compared.",
      "Depends on motion; limited to ≤ 25-member groups, which excludes Persona A's big plans.",
    ],
    audit: [
      { task: "A3", verdict: "partial", note: "shows the mechanism, hides the arithmetic" },
      { task: "B4", verdict: "pass", note: "reuse as the auction stage of the scroll story" },
    ],
    Widget: AuctionRoundTable,
  },
];

const VERDICT_STYLE: Record<Verdict, string> = {
  pass: "text-success-foreground",
  partial: "text-warning-foreground",
  fail: "text-danger",
};

function ReviewBlock({ r }: { r: Review }) {
  return (
    <article
      className={cn(
        "grid gap-6 rounded-2xl border p-5 sm:p-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]",
        r.selected ? "border-gold/60 bg-emerald-900/50" : "border-hairline",
      )}
    >
      <div className="min-w-0">
        <header lang="en" className="mb-5 flex flex-wrap items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full border border-hairline-strong font-[family-name:var(--font-jakarta)] text-gold">
            {r.label}
          </span>
          <h3 className="text-xl font-semibold text-alabaster">{r.name}</h3>
          {r.selected && <Badge className="border-gold/50 bg-gold text-obsidian">Selected for main pages</Badge>}
        </header>
        <r.Widget />
      </div>

      <aside lang="en" className="flex flex-col gap-4 border-hairline text-sm lg:border-l lg:pl-6">
        <p className="text-alabaster">{r.rationale}</p>
        <div>
          <h4 className="mb-1.5 font-semibold text-success-foreground">Strengths</h4>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-alabaster-muted marker:text-hairline-strong">
            {r.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-1.5 font-semibold text-warning-foreground">Trade-offs</h4>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-alabaster-muted marker:text-hairline-strong">
            {r.tradeoffs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-1.5 font-semibold text-alabaster">Persona audit</h4>
          <ul className="flex flex-col gap-1">
            {r.audit.map((a) => (
              <li key={a.task} className="flex gap-2">
                <span className="w-8 shrink-0 font-mono text-alabaster">{a.task}</span>
                <span className={cn("w-14 shrink-0 font-medium capitalize", VERDICT_STYLE[a.verdict])}>{a.verdict}</span>
                <span className="text-alabaster-muted">{a.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </article>
  );
}

export function WidgetsArtboard() {
  return (
    <div className="flex flex-col gap-16">
      <Section
        title="Three ways to find your chit"
        note="Same data (WIZARD, GOALS, matchPlans) and the same result list; only the structure differs. Judged against panasuna-persona-audit tasks B2, B3 and A4."
      >
        <div className="flex flex-col gap-6">
          {WIZARDS.map((r) => (
            <ReviewBlock key={r.label} r={r} />
          ))}
        </div>
      </Section>
      <Section
        title="Three ways to show an auction"
        note="Shared arithmetic in src/lib/auction.ts: foreman commission from CHIT_RULES (assumed 5%), discount capped at 40% (Panasuna's cap, the ceiling the Act allows). Judged against A3, B4 and B5."
      >
        <div className="flex flex-col gap-6">
          {AUCTIONS.map((r) => (
            <ReviewBlock key={r.label} r={r} />
          ))}
        </div>
      </Section>
    </div>
  );
}
