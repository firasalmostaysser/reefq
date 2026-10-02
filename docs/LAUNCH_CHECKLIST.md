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

### 7. Domain `reefq.com`
Find where the domain is registered → Netlify → Domain management → **Add a domain** → follow the DNS instructions. Then env `SITE_URL=https://reefq.com`, trigger a deploy, and replace `reefq.netlify.app` in the bio links and quick replies.

### 8. PostHog funnel
PostHog → Insights → Funnel: `$pageview` (landing) → `order_created` → `brief_saved` → `payment_proof_uploaded`. Save it to a dashboard "Reefq weekly". Look at it every Monday (`docs/MARKETING.md` section 10).

### 9. Designer onboarding (Monday)
Canva team invite, Studio password, Telegram group, `docs/DESIGNER.md`. First week plan is in that guide.

### 10. Terms and privacy
Before running ads: a short **Conditions de vente** (what is included, delivery, changes, refunds: full refund before the invitation is sent to guests, none after) and **Confidentialité** (we keep names and phone numbers of couples and guests only to deliver the invitation; deletion on request). Ask Claude to add both pages to the site and link them in the footer.

### 11. Business registration
To receive transfers in the business name and later accept cards online (Konnect, Flouci), you need a registered activity (auto-entrepreneur or company) and a business bank account. Start the paperwork now; it gates `docs/ROADMAP.md` phase 2.

### 12. Five partners
Salles, traiteurs, pâtissiers near you: partner link + 20 DT per paid order (`docs/MARKETING.md` section 8).

## Optional: let Claude set variables for you
Paste the Telegram token and chat id in a Claude Code session and ask it to set them in Netlify and trigger a deploy.
