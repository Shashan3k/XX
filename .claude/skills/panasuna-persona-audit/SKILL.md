---
name: panasuna-persona-audit
description: UX review of the Panasuna Chits website through two Salem customer personas — a 50-year-old business owner evaluating ₹10L–₹1Cr chits, and a 28-year-old salaried professional browsing on mobile in Tamil/English. Use after building or changing any page or flow (home, plans, wizard, How a Chit Works, comparisons, team, contact, join form), before a client demo, or whenever the user asks for a UX audit, persona review, usability check or "would a customer trust this?".
---

# Panasuna persona audit

You audit the **running site** as two real customers, not as a designer. Each persona has a job to do, worries that will make them leave, and a device they actually use. Your report says where each of them succeeded, hesitated or gave up, with evidence.

## How to run an audit

1. **Start the app** (use the `run` skill if needed) and open it with the Playwright MCP.
2. **Run Persona A** at **1440px** in English, then repeat the key steps in Tamil.
3. **Run Persona A again at 375px.** They also open the site from a WhatsApp link on their phone.
4. **Run Persona B** at **375px**:
   - Do every task in both `ta` and `en`, starting in Tamil.
   - Emulate a slow phone: in `browser_run_code_unsafe`, use the CDP session for 4× CPU throttling and "Fast 3G" network.
   - Also run once with `prefers-reduced-motion: reduce`, using `browser_emulate_media`.
5. **For each task:**
   - Take a screenshot at every decision point.
   - Note the number of taps or clicks and anything the persona had to *guess*.
   - Read the console for errors (`browser_console_messages`).
6. **Cross-check every figure** shown on screen against `src/data/panasunaData.ts` (see the data integrity checks).
7. **Write the report** in the format at the end. Do not fix anything during the audit unless the user asked for fixes. Report first.

Stay in character when judging. The question is never "is this nice?" but "would *this person*, with *this worry*, keep going?"

---

## Persona A: Mr. Senthil, 50, Salem business owner

- **Who:**
  - Runs a wholesale textile business on Shevapet Road, with ~₹4 Cr annual turnover.
  - Has been in chits with three companies over 25 years, and lost money once to an unregistered operator in 2009.
  - Reads English for business but prefers Tamil for anything about money and trust. Reading glasses; he enlarges text.
- **Devices:**
  - His son's laptop (Chrome, 1440px) for the "serious look".
  - His own Android phone for everything else, mostly through links on WhatsApp.
- **Evaluating:** a ₹25 L–₹1 Cr chit for working capital before Deepavali stock buying. He compares Panasuna with two other Salem companies.
- **He leaves if:**
  - He cannot find proof that his money is secured.
  - The auction process looks opaque.
  - He has to fill in a form before seeing basic facts.
  - The site feels like "a young company's app" rather than an established house.

### What Persona A must be able to do

| # | Task | Pass when |
|---|---|---|
| A1 | Find the security guarantee within 10 seconds of landing | The **100% security deposit in a Scheduled Bank as FDR** is visible above the fold or one scroll down on the home page, in plain words (not only inside a 3D animation), in both languages. |
| A2 | Judge the company's standing | **Est. 1975 / 50+ years**, the **Board of Directors**, and directors' association roles (SCFFA, TNCFA, AIACF) are reachable within one click of home. Monogram avatars look dignified, not cartoonish. |
| A3 | Understand the auction | He can find how the monthly auction works, how the discount becomes a dividend, and that bid details are communicated promptly. The "Prize money and dividend" stage names the 5% commission cap. |
| A4 | Shortlist big-ticket plans | On the plans page he can filter **Above ₹5 L**, sort by chit value descending, and see ₹10 L, ₹15 L, ₹16 L, ₹25 L, ₹50 L, ₹75 L and both ₹1 Cr plans (50m and 20m) with exact monthly installments. The ₹1,00,00,000 figure is grouped the Indian way and does not wrap. |
| A5 | Confirm doorstep collection | **Door-to-door collection** and **daily / weekly / bi-weekly / monthly** options are stated on the plan or join flow, not only on "Why us". |
| A6 | Reach a human | `0427-2260611`, `0427-2262411` and `9842360611` are `tel:` links. The **full Salem address** is visible on every page footer. On mobile, a call action is reachable without scrolling to the footer. |
| A7 | Visit the office | The address is copyable and reads naturally in Tamil (சின்னக்கடை வீதி, சேலம் - 636 001). |
| A8 | Existing-customer login | "Customer login" is visible in the header and goes to `/login`. |

### Persona A red flags (Severity 1 when present)

- Any wording that promises or guarantees returns.
- Security or FDR information that exists only as animation or tooltip text.
- Plan figures that differ from `panasunaData.ts`.
- Text under 16px for body copy, or under 4.5:1 contrast. Gold on alabaster is the usual offender.
- A phone number that isn't tappable on mobile.
- No visible company registration details. The data file does not yet hold a Chit Funds Act registration number; flag its absence so the client can supply it.

---

## Persona B: Divya, 28, salaried professional

- **Who:**
  - A software QA engineer in Coimbatore, originally from Salem; her parents still live there.
  - Takes home ₹62,000 a month and has a credit card balance she rolls over.
  - Has heard about chits from her mother and is suspicious of them as "old people's savings".
- **Device:** a mid-range Android phone at 375px, browsing on 4G during her commute. She switches between Tamil and English mid-session and expects the toggle to remember her choice.
- **Wants:**
  - To know in under a minute which plan fits her: she is saving for a car down-payment in 2–3 years.
  - To understand how a chit actually works.
  - To be convinced it beats her bank RD and her credit card.
- **She leaves if:**
  - The page janks or a 3D scene blocks content while loading.
  - The wizard asks for her phone number before showing results.
  - Tamil text overflows or looks machine-translated.
  - The comparison feels like propaganda without numbers.

### What Persona B must be able to do

| # | Task | Pass when |
|---|---|---|
| B1 | Switch language | The `English / தமிழ்` toggle is reachable from the header on 375px. Switching keeps her scroll position and current step, and persists on reload. No English strings remain on the Tamil page, apart from proper nouns and abbreviations (FDR, SIP, NAV). |
| B2 | "Find your chit" wizard | It asks **exactly 3 questions**: goal, monthly budget, how long to save. One question per screen, with large tap targets (≥ 44×44px), progress shown, and back navigation that keeps answers. For **Vehicle / ₹5,000–₹15,000 / 2–3 years** it returns `₹3 L · 30 months · ₹10,000`. It never returns an empty state, and shows results **before** asking for contact details. |
| B3 | Understand results | Each result shows chit value, duration and monthly installment, plus the note that the installment is the full amount before dividend. Popular plans (₹6,000, ₹12,000, ₹25,000, ₹50,000/month) carry a badge. |
| B4 | "How a chit works" | It is a **5-stage** scroll story: Join, Pay, Auction, Prize & dividend, Maturity. Each stage's text is readable without the animation. Scrolling back reverses cleanly. On reduced motion, all 5 stages show as a static sequence. The 3D object never covers text on 375px. |
| B5 | Chits vs FD / loan / credit card | She can reach the comparisons in one tap from the How it works section. The rates (FD 7.5–9.5%, RD ~8.5%, personal loan 12–24%, credit card up to 40%) are visible as numbers, not buried in bullets. The credit-card comparison shows **SAVE – BORROW – PAY** vs **BUY NOW – PAY LATER**. On mobile the two columns stack or swipe without horizontal page scroll. |
| B6 | Act | From a result, "Join this chit" opens the join form with that scheme preselected. The confirmation reads "Our manager will contact you soon." in the active language. |
| B7 | Performance | First content is visible in < 2.5s on throttled 4G. Text and CTAs are usable before any `.glb` finishes loading, with a procedural fallback shown in its place. There are no layout shifts when fonts or 3D load. |

### Persona B red flags (Severity 1 when present)

- Horizontal scroll at 375px.
- A Tamil heading overflowing or clipped.
- A wizard that dead-ends.
- A scroll animation that hijacks scrolling so content can't be reached.
- A WebGL error that blanks a section.
- Counters or calculator digits jittering because `tabular-nums` is missing.

---

## Data integrity checks (both personas)

Compare what is on screen against `src/data/panasunaData.ts`:

- [ ] **Plan count:** 29 plans in total (26 from the old plans page plus 3 entry schemes: ₹40,000/40m, ₹60,000/40m, ₹90,000/30m). The join-form dropdown lists the 22 `JOIN_FORM_PLANS`, or all 29 if the client approves.
- [ ] **Popular plans** are exactly ₹3 L/50m/₹6,000, ₹3 L/25m/₹12,000, ₹10 L/40m/₹25,000 and ₹25 L/50m/₹50,000.
- [ ] **Number formatting:** every amount uses Indian grouping and `tabular-nums`.
- [ ] **Contact details:** the address reads `419/151-A, Chinna Kadai Street, Salem - 636 001`, and the phones are `0427-2260611`, `0427-2262411` and `9842360611`.
- [ ] **Directors:** 5 directors, in the order R. Viswanathan, K. Mohanasundaram, K. Karunanithy, M. Karthish, K. Harish.
- [ ] **No legacy assets:** no image loaded from `panasunachits.com/images`. Check with `browser_network_requests`.
- [ ] **Open `VERIFY` items** in the data file (email, TNCFA/AIACF full names, the testimonial placeholder, dated bank rates) are either resolved or listed in the report as open client questions.

## Severity scale

| Level | Meaning |
|---|---|
| **S1: Blocker** | The persona would leave or lose trust, or a figure is wrong. |
| **S2: Friction** | The persona finishes, but hesitates, guesses or needs extra steps. |
| **S3: Polish** | Noticeable, but it doesn't change the decision. |

## Report format

```
# Persona audit: <page or flow>, <date>

## Verdict
Persona A (Mr. Senthil): Would proceed / Would hesitate / Would leave, and the one-sentence reason.
Persona B (Divya): …

## Findings
| ID | Persona | Task | Severity | Viewport · Lang | What happened | Evidence (screenshot) | Suggested fix |
|----|---------|------|----------|-----------------|---------------|-----------------------|---------------|

## Task scorecard
A1 ✅  A2 ⚠️ (S2)  A3 ❌ (S1) …   B1 ✅ …

## Data integrity
Each check: pass/fail, plus any mismatch with the expected and actual values.

## Open client questions
The VERIFY items still unresolved.
```

Order findings by severity first, then by persona impact. Every finding must cite a screenshot or a console or network log. "Feels off" without evidence is not a finding.
