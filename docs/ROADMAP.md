# Business plan and roadmap

Reefq should earn while you sleep: couples find it, prepare their invitation, pay, and send it, with one human step left (checking the bank transfer). This page is the plan to get there and stay there. Numbers are planning assumptions; review them on the first Monday of each month.

## 1. Decisions taken on 2 October 2026

| Decision | Why |
| --- | --- |
| **Couples prepare their own invitation** in the client space (names, venue, text, theme, guests) with a live preview | It was the biggest manual task. Self-service makes theme invitations ready in minutes, day or night. |
| **Prepare and preview before paying**; the invitation stays locked to guests until the payment is confirmed | Seeing their own names on the envelope is the strongest reason to pay; it removes the "can I trust them?" doubt of a bank transfer. |
| **Full payment upfront** (was 50 % deposit) | The invitation is delivered instantly, so there is no "rest on delivery" to chase. `DEPOSIT_PERCENT=50` brings the deposit back if conversion drops. |
| **Morning summary** on Telegram, **auto-cancel** unpaid orders after 14 days, **weekly backup** | Turns the business into a 10-minute daily checklist with ready-made WhatsApp messages. |
| **Referral link** after each wedding (-10 %, automatic) and an **invitation footer link** | Every wedding shows Reefq to 200–400 guests, many of them future couples. |
| **Source tracking** on every order (`utm_…`) | You will know which post, ad or partner sells, and stop paying for what does not. |
| **No database migration yet** (stay on Netlify Blobs) | See `docs/DATA.md`: no benefit at this volume, real risk during launch, cheap to migrate later. |
| Reworded the Layl caption that mentioned late nights | Brand rule: no nightlife references. |

## 2. Offers and unit economics

| Offer | Price | Team time | Main cost | Margin per order (before ads) |
| --- | --- | --- | --- | --- |
| Essentiel | 149 DT | ~3 min (payment check) | — | ~149 DT |
| Signature | 249 DT | ~3 min | — | ~249 DT |
| Prestige | from 349 DT | 2–4 h designer + sending to guests | Designer per site | depends on designer rate |
| Options | +49 DT 2nd event, +30 DT express | 10–30 min | — | — |

Fixed costs to plan for (estimates, confirm actual prices): Canva team plan, domain (~once a year), ads (300–450 DT/month from week 3), designer. Netlify stays free at this size.

**Keep it passive:** pay the designer **per piece** (per custom site, per gallery template, per weekly social batch) rather than a full salary, so costs follow sales. Price Prestige so the designer's fee is at most a third of it. If Prestige orders become frequent, raise "dès 349" to "dès 449".

**Break-even:** with ~1,000 DT/month of fixed costs (ads + designer base), about **5 Signature orders a month**.

## 3. Targets

| Period | Paid orders / month | Notes |
| --- | --- | --- |
| Oct–Dec 2026 | 5 → 20 | Organic + partners + small ads; engagements and contracts |
| Jan–Mar 2027 | 20 → 40 | Pre-season planning push; lighter during Ramadan |
| Apr–Sep 2027 | 50 → 100 | Wedding season; ads on; referrals compound |

Year-one scenarios: conservative ~150 paid orders (~35k DT), base ~350 (~80k DT), ambitious ~600 (~140k DT). Which one happens depends mostly on content consistency (3 reels a week) and the payment rate (paid / orders > 50 %).

## 4. Roadmap, by trigger

Build the next step when its trigger is reached, not before.

| Phase | Trigger | What | Effort |
| --- | --- | --- | --- |
| **0. Launch** | Now | `docs/LAUNCH_CHECKLIST.md` | 1 day (you) |
| **1. Content engine** | Now | 6 website templates, 3 reels + 4 posts a week, 5 partners | Designer + you |
| **2. Online payment** | > 20 paid orders/month, or payment checks > 30 min/day, or many couples stop at the payment step | Card / e-dinar payment with **Konnect** or **Flouci**: their confirmation calls our API, which runs the same "confirm payment" step. Theme orders become zero-touch. Keep bank transfer as an option. Needs business registration and a merchant account. | ~1 day dev |
| **3. Client space in Arabic** | Soon after launch (many families write in Arabic) | Arabic and English versions of the client space and its form (the invitation itself is already trilingual) | ~1 day |
| **4. WhatsApp automation** | > 50 orders/month | WhatsApp Business Platform (Cloud API) to send the reminders and thank-yous from the morning summary automatically, with Meta-approved templates | 1–2 days + Meta verification |
| **5. Database** | `docs/DATA.md` triggers | Supabase (Postgres) | 1–2 days |
| **6. More products** | After the first season | "Save the date" (49 DT), henna/engagement-only invitation (99 DT), thank-you card after the wedding (49 DT), Prestige printed QR cards with a print partner | Per product |

## 5. Risks and answers

| Risk | Answer |
| --- | --- |
| Couples don't trust a bank transfer to a new brand | Preview before paying, the demo link, reviews after each wedding, a real WhatsApp number answering fast, then online payment (phase 2). |
| Copycats (designers selling Canva video invitations at 30–80 DT) | Our value is not the picture: personal links with seats, live replies, Excel for the caterer, three languages, the envelope. Show those in every reel. |
| Seasonality | Plan cash: most revenue Apr–Sep. Keep fixed costs low and variable (designer per piece). |
| One person depends on everything | The morning summary, backups, these docs, and tests (`npm test`, `npm run test:e2e`) make it possible for someone else to run it for a week. |
| Data loss | Weekly backups in Telegram + on-demand download. |
