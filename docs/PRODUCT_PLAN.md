# Reefq product plan

Working product-management plan, 25 October 2026. The purpose is to make a couple's invitation easier to prepare, help the trusted super admin operate the business, and build the private partner system around the owner's protected allocation.

Architecture and financial rules: [PLATFORM_BLUEPRINT.md](PLATFORM_BLUEPRINT.md). Team process and review commands: [WORKFLOW.md](WORKFLOW.md). This plan distinguishes implemented UI from proposed backend work; it does not change existing prices or paid customers' entitlements.

## Product outcomes

| Audience | Outcome | Evidence to collect |
| --- | --- | --- |
| Couple | Understand the offer, open a private space, prepare and preview an invitation, then pay and share. | Successful order creation; saved briefs; receipts; confirmed payments; support questions by stage. |
| Guest | Open a matching invitation, find the venue and send a clear reply. | Opening/RSVP success on target phones; reply errors; family/seat accuracy. |
| Super admin | Handle a visible queue of customer, design, payment and payout tasks. | Outstanding work by age; time to resolve; save/conflict outcomes; reconciled payouts. |
| Partner | Know which referrals qualified, what was earned and what can be withdrawn. | Authorised referral status, reconciled ledger and completed payout evidence. Future feature. |
| Owner | Delegate operations while preserving the agreed allocation and visibility of exceptions. | Protected-share reconciliation, operating costs, exception report and restore checks. Future financial controls. |

## Current delivery: conversion and editing

The current UI pass implements:

- A clearer landing message around choosing, preparing, previewing and sharing, with pricing/payment reassurance next to the main action.
- Offer descriptions that explain the relevant use case, a factual Signature badge, and a native expandable comparison of existing shared-link, personal-link and custom-design capabilities.
- An order form grouped into contact details and package/event preferences. The two required contact fields appear first. Existing fields, defaults, identifiers and submission behaviour are preserved; all previously visible fields remain visible.
- Product examples explicitly labelled as welcome, reply and confirmation stages.
- A client-side editorial review guide with links to names, event details and wording, plus a reminder of the existing save behaviour.
- A Studio workflow guide, clearer wording-application instructions and larger multilingual text-editing areas. Existing save, auto-save, conflict, preview and delivery actions stay intact.
- Persistent section navigation in the client editor and Studio, with selected-section styling and focusable destinations. Short landscape screens keep the navigation in the document flow to preserve editing space.
- A labelled client preview with a return-to-details link and save reminder, plus keyboard-accessible reply-table scrolling with sticky column headings.
- Contextual Studio guidance for the five cinematic collections: text and event details are editable; changing the baked-in opening artwork requires choosing another theme. The guidance stays hidden for classic themes and custom Canva designs.

These are usability/conversion hypotheses. No uplift is claimed without a measured baseline. Account, money, AI and editable-layer controls are not displayed as functioning features before their implementation exists.

## Ordered backlog

| ID | Priority | Item / owner | Acceptance |
| --- | --- | --- | --- |
| RQ-001 | Current | Landing clarity and contact-first order form — visual | FR/AR/EN render at 360 px; names + a valid WhatsApp number can create an order without a date; existing plan-selection links and optional fields still work. |
| RQ-002 | Current | Offer decision support — visual | Comparison opens by keyboard/touch; package capabilities match the current product; selecting a plan reaches the existing form with that plan selected. |
| RQ-003 | Current | Client review guidance — visual | Guide opens without submitting; its links reach the existing sections; Arabic inputs survive navigation, saving and reload. |
| RQ-004 | Current | Studio editing readability — visual | Textareas are readable at 360 px; long Arabic text remains RTL; wording application and existing save/preview actions work. |
| RQ-013 | Current | Editing navigation and preview orientation — visual | Client and Studio section links focus their destination; sticky navigation stays visible at 360 and 1440 px without horizontal page overflow; preview return preserves input; cinematic guidance follows the selected theme/source. |
| RQ-005 | P0 release | Default-motion regression tests — owner/backend-test implementer | Normal cinematic opening duration and the mobile demo's viewport behaviour are tested as supported user flows. The full unchanged intended order/payment/guest journey passes. Existing guard/test files remain protected in the visual workstream. |
| RQ-006 | P0 platform | Named accounts, roles, audit and access isolation — backend | Super admin can operate daily work; partners can access only their permitted records; only owner policy can change the protected allocation. |
| RQ-007 | P0 platform | Quotes, verified settlement and commission ledger — backend | Both discount sponsors are recorded; owner amount is preserved; duplicate confirmations do not duplicate earnings; partial/unverified payment does not create withdrawable money. |
| RQ-008 | P1 | Partner portal and QR provisioning — backend + visual | Public printed QR is never a login token; authenticated assignment is atomic; last-eligible-link policy is explicit; portal receives only authorised progress. |
| RQ-009 | P1 | Withdrawal workflow — backend + visual | Strictly >200 TND eligibility, quoted fees, reserved funds, completed-payment evidence and refund adjustments reconcile under concurrent requests. |
| RQ-010 | P1 | Versioned template editor and media library — backend + visual | Fonts, backgrounds, overlays and supported motion settings save/render; originals and published versions are retained; shared invitations stay pinned to their version. |
| RQ-011 | P2 | AI-assisted design drafts and reusable custom work — backend + design | Cost limits and queued jobs work; an operator reviews outputs; personal data is removed before a custom design becomes a reusable template. |
| RQ-012 | P1 | Full Arabic client-space interface — owner/backend + translation | Dynamic statuses, field help, errors, dates and previews use the same selected language; the complete Arabic flow is checked on a real 360 px phone. Current Arabic fields are not described as a fully translated client space. |

Prioritise RQ-005 through RQ-007 before a partner rollout. The editor document/media model can be designed alongside these, but money handling must not rely on UI-only state or generated AI decisions.

## Measurement plan

Start by recording a baseline and repeated support questions; choose targets after there is enough real traffic to assess them.

| Question | Definition / current source |
| --- | --- |
| Do visitors understand the designs? | Existing `theme_previewed` and `invitation_opened` events indicate demo engagement; inspect stage/device breakdowns without treating repeated events as distinct people. |
| Do orders become prepared invitations? | Cohort of unique orders with a saved brief (`briefAt`) divided by orders created in the same cohort. Use server records for an order-level count. |
| Where does payment stall? | Separate saved brief, receipt submitted, and payment confirmed stages. Current `paid` means the existing application status; full financial settlement needs the future payment-ledger work. |
| Are guests able to reply? | Existing successful `rsvp_sent` events and RSVP records, alongside observed errors and manual device checks. |
| Does the super admin have less repetitive work? | Tag support requests by stage; track queue age and operator handling time rather than guessing from page views. |

Existing analytics code is unchanged. Additional instrumentation, cohort correlation and new financial reporting are backend/analytics tasks. Keep names, phone numbers, client/guest-link tokens, bank details and commission data out of public analytics payloads.

## Delivery rhythm

1. Pick one customer/operator outcome and its acceptance check.
2. Ship one bounded change on a feature branch; keep the current customer/guest contracts stable.
3. Run `node tools/ui-review.mjs --url http://localhost:8888 --screenshots` and inspect the relevant client/Studio screen separately.
4. Record what was actually verified. Keep default end-to-end failures visible even when visual, unit or reduced-motion checks pass.
5. The trusted super admin supplies customer questions and operational exceptions; the owner configures commercial boundaries and handles policy exceptions as required.
6. Review the measured funnel and task queue at a regular product review; choose the next backlog item from the observed friction.

The owner batches reviewed releases to `main` under the repository's deployment rule. No automatic production deployment, partner recruitment message or new paid service subscription is authorised by this document.
