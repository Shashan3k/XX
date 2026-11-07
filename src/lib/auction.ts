/**
 * Chit auction arithmetic, shared by the calculator, the auction simulator and the payout curve.
 * - Members N = duration in months; base installment I = the client's published monthly figure.
 * - Month 1 is the Company Chit: 100% payout, no discount, no commission, no dividend.
 * - Months 2…N follow the client's Excel `Structure` sheet (payout % per month, 70% floor → 95%).
 * - For month m ≥ 2: prize = round(V × payout%), discount D = V − prize, commission C = 5% of V,
 *   dividend pool = max(0, D − C), dividend per member = pool ÷ N, net installment = I − dividend.
 * GST and state-specific caps are deliberately ignored. Illustrative, not a quote.
 */
import { CHIT_RULES, payoutRateFor, type ChitPlan } from "@/data/panasunaData";

/** Anything with a value, a duration and an installment: a catalogue plan or a Structure reference column. */
export type PlanLike = Pick<ChitPlan, "chitValue" | "durationMonths" | "monthlyInstallment">;

export const COMMISSION_RATE = CHIT_RULES.commissionRate;
export const MAX_DISCOUNT_RATE = CHIT_RULES.maxDiscountRate;

export interface AuctionOutcome {
  discount: number;
  prize: number;
  commission: number;
  dividendPool: number;
  /** Unrounded: totals are summed first and rounded once, as the client's sheet does. Display with Math.round. */
  dividendPerMember: number;
  netInstallment: number;
}

/** The split for a given prize payout in an auctioned month (month ≥ 2). */
function outcomeForPrize(plan: PlanLike, prize: number): AuctionOutcome {
  const V = plan.chitValue;
  const discount = V - prize;
  const commission = Math.round(V * COMMISSION_RATE);
  const dividendPool = Math.max(0, discount - commission);
  const dividendPerMember = dividendPool / plan.durationMonths;
  return {
    discount,
    prize,
    commission,
    dividendPool,
    dividendPerMember,
    netInstallment: plan.monthlyInstallment - dividendPerMember,
  };
}

/** Month 1: the company chit is paid in full, with nothing to share. */
function companyChit(plan: PlanLike): AuctionOutcome {
  return {
    discount: 0,
    prize: plan.chitValue,
    commission: 0,
    dividendPool: 0,
    dividendPerMember: 0,
    netInstallment: plan.monthlyInstallment,
  };
}

/** A hypothetical bid: discount clamped between the commission floor and Panasuna's 40% cap. */
export function auctionOutcome(plan: PlanLike, discountRate: number): AuctionOutcome {
  const rate = Math.min(MAX_DISCOUNT_RATE, Math.max(COMMISSION_RATE, discountRate));
  return outcomeForPrize(plan, plan.chitValue - Math.round(plan.chitValue * rate));
}

export interface CycleMonth extends AuctionOutcome {
  month: number;
  /** Prize as a share of the gross chit value, from the Structure sheet. */
  payoutRate: number;
  discountRate: number;
  companyChit: boolean;
}

/** One month of the plan's real Structure schedule. */
export function structureMonth(plan: PlanLike, month: number): CycleMonth {
  const m = Math.max(1, Math.min(plan.durationMonths, Math.round(month)));
  if (m === 1) return { month: 1, payoutRate: 1, discountRate: 0, companyChit: true, ...companyChit(plan) };
  const payoutRate = payoutRateFor(plan.durationMonths, m);
  const o = outcomeForPrize(plan, Math.round(plan.chitValue * payoutRate));
  return { month: m, payoutRate, discountRate: o.discount / plan.chitValue, companyChit: false, ...o };
}

/** Every month 1…N of the plan's Structure schedule. */
export function simulateCycle(plan: PlanLike): CycleMonth[] {
  return Array.from({ length: plan.durationMonths }, (_, i) => structureMonth(plan, i + 1));
}

/** Whole-chit totals: dividends summed across months 1…N, then rounded once. */
export function cycleTotals(plan: PlanLike, cycle: readonly CycleMonth[] = simulateCycle(plan)) {
  const totalDividend = Math.round(cycle.reduce((sum, m) => sum + m.dividendPerMember, 0));
  return {
    totalDividend,
    averageDividend: Math.round(totalDividend / plan.durationMonths),
    netPaid: plan.chitValue - totalDividend,
  };
}

/** Everyone pays the same net installments; only *when* you take the prize changes your result. */
export function cycleSummary(cycle: CycleMonth[], takeMonth: number) {
  const totalPaid = Math.round(cycle.reduce((sum, m) => sum + m.netInstallment, 0));
  const received = cycle[takeMonth - 1]?.prize ?? 0;
  return { totalPaid, received, net: received - totalPaid };
}
