"use server";

import { CHIT_PLANS, normalizeIndianMobile, type Locale } from "@/data/panasunaData";

export interface EnquiryInput {
  name: string;
  mobile: string;
  planId: string;
  locale: Locale;
}

export type EnquiryResult = { ok: true } | { ok: false; error: "invalid" | "unavailable" };

/**
 * Join enquiry from the "Request more information" modal.
 * Delivery goes to ENQUIRY_WEBHOOK_URL (a CRM, sheet or mail relay) as JSON. Until that is configured,
 * development logs the lead and reports success, and production reports "unavailable" so the visitor
 * is pointed at the phone number instead of being told a request was received when it wasn't.
 */
export async function submitEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  const name = input.name.trim().replace(/\s+/g, " ").slice(0, 80);
  const mobile = normalizeIndianMobile(input.mobile);
  const plan = CHIT_PLANS.find((p) => p.id === input.planId);
  if (name.length < 2 || !mobile || !plan) return { ok: false, error: "invalid" };

  const lead = {
    name,
    mobile,
    locale: input.locale === "ta" ? "ta" : "en",
    plan: {
      id: plan.id,
      chitValue: plan.chitValue,
      durationMonths: plan.durationMonths,
      monthlyInstallment: plan.monthlyInstallment,
    },
    receivedAt: new Date().toISOString(),
  };

  const url = process.env.ENQUIRY_WEBHOOK_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") return { ok: false, error: "unavailable" };
    console.info("[enquiry] ENQUIRY_WEBHOOK_URL is not set; lead not delivered:", lead);
    return { ok: true };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? { ok: true } : { ok: false, error: "unavailable" };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
