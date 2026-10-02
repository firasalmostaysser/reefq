# Launch checklist (owner)

In priority order. Items 1–6 before the first Facebook post; 7–12 during the first two weeks.

## Before the first post

### 1. Deploy the latest version
Push `main` to GitHub; Netlify deploys it in about a minute. Check `https://reefq.netlify.app/` opens and Studio → Settings shows the new "Morning summary & backups" card.

### 2. Team alerts on Telegram (critical: today new orders arrive silently)
Production has no `TELEGRAM_*` variables yet, so nobody is told when a couple orders or sends a receipt.

1. Telegram → **@BotFather** → `/newbot` → name `Reefq Alerts` → username e.g. `reefq_alerts_bot` → copy the **token**.
2. Create a group **Reefq** (you, later the designer) → add the bot → send "hello" in the group.
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser → find `"chat":{"id":-100…` → copy that number (with the minus).
4. Netlify → reefq → Project configuration → Environment variables: add `TELEGRAM_BOT_TOKEN` (mark secret) and `TELEGRAM_CHAT_ID`. Then Deploys → **Trigger deploy**.
5. Studio → Settings → Integrations shows Telegram **On** → Morning summary → **Preview today's summary** → **Send it now**. The message arrives in the group.

### 3. Strong studio password
Netlify env `STUDIO_PASSWORD`: a long password (4 random words). Trigger a deploy. You will give it to the designer on Monday.

### 4. Clean the live data
Studio → Settings → **Download a backup** (keep it). Then delete your test orders and test invitations (see `docs/DATA.md` → "Your old test orders"). Load the backup locally with `npm run seed -- <file>` if you want to keep testing with them.

### 5. One real end-to-end test on the live site, then delete it
On your phone: order Signature → prepare the invitation with 2 guests → check the RIB shown is right (`BANK_*` variables) → upload any picture as a receipt → Telegram pings → Studio → confirm → client space shows the links → open a guest link → reply → reply appears. Then delete that order and invitation.

### 6. Facebook, Instagram, WhatsApp Business
Set up as in `docs/MARKETING.md` section 2 (bio links with `utm_…`, automatic replies, quick replies).

## First two weeks

### 7. Netlify plan (decided 2 Oct 2026: no own domain for now)
The site stays on **reefq.netlify.app**; the money goes to the Netlify subscription instead of a domain. On 2 Oct 2026 a deploy was refused with "account credit usage exceeded": Netlify → Team → Billing, take a plan with enough credits, then deploy again. Use `reefq.netlify.app` in bio links, quick replies and promo posters. A domain can come later (set `SITE_URL` then).

### 8. PostHog funnel
First check which PostHog project receives the site's data: the Netlify key `POSTHOG_KEY` (starts `phc_uEXQ`) must match the project you open in PostHog (Project settings → Project API key). On 2 Oct 2026 the PostHog account connected to Claude only had a different project (key `phc_uMA5…`). Either connect Claude to the right account, or put that project's key in Netlify and redeploy.

PostHog → Insights → Funnel: `$pageview` (landing) → `order_created` → `brief_saved` → `payment_proof_uploaded`. Save it to a dashboard "Reefq weekly". Look at it every Monday (`docs/MARKETING.md` section 10).

### 9. Designer onboarding (Monday)
Canva team invite, Studio password, Telegram group, `docs/DESIGNER.md`. First week plan is in that guide.

### 10. Terms and privacy (pages are live, review them)
Done: `/conditions.html` and `/confidentialite.html`, linked in the landing footer, under the order button and in the client space. Read both once; when the business is registered, add its legal name and tax number (matricule fiscal) in section 9 of the conditions. Refund rule: full refund until a guest opens the invitation.

### 11. Business registration
To receive transfers in the business name and later accept cards online (Konnect, Flouci), you need a registered activity (auto-entrepreneur or company) and a business bank account. Start the paperwork now; it gates `docs/ROADMAP.md` phase 2.

### 12. Five partners
Salles, traiteurs, pâtissiers near you: partner link + 20 DT per paid order (`docs/MARKETING.md` section 8).

## Optional: let Claude set variables for you
Paste the Telegram token and chat id in a Claude Code session and ask it to set them in Netlify and trigger a deploy.
