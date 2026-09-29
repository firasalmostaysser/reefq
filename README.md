# Reefq · رِفق

Digital wedding invitations that open like a real envelope. One site holds everything:

| URL | What it is | Who uses it |
| --- | --- | --- |
| `/` | Landing page: live envelope demo, 10 themes, Canva templates gallery, packages, order form | Couples |
| `/commande/<code>?t=<token>` | Client space: pay the deposit by bank transfer, upload the receipt, then follow the invitation and guest replies | Couples |
| `/studio/` | Reefq Studio: invitations, guest lists, RSVPs, orders and payment checks, settings | Reefq team (password) |
| `/i/<id>` | A couple's invitation. `?g=<guest id>` greets a family by name and reserves their seats | Guests |
| `/i/demo` | Demo invitation | Anyone |
| `/api/*` | Studio and public API | The pages above |
| `/templates.json`, `/media/*` | Canva templates and uploaded photos | The pages above |

Everything runs on **Netlify**: static pages from `public/`, the API in **Netlify Functions**, and data in **Netlify Blobs** (invitations, RSVPs, orders, photos, payment receipts, Canva state). No database to manage.

## Project layout

```
public/                   static site
  index.html              landing
  commande/               client space (order, bank transfer, receipt, dashboard)
  studio/                 studio app
  i/index.html            invitation viewer
  assets/
    engine.js             invitation engine: envelope, wax seal, themes, layouts, sections, RSVP
    invitation.css        invitation styles and the 10 themes
    analytics.js          PostHog, cookieless, loaded only when POSTHOG_KEY is set
    invite.js, landing.js, site.css
    env/*.webp            pre-rendered envelope paper layers (tools/render_assets.py)
netlify/
  functions/
    api.mts               /api/*: invitations, RSVPs, orders, receipts, uploads, wording
    media.mts             /media/* and /templates.json
    invite-page.mts       /i/<id> with link-preview tags
    canva-auth.mts        /auth/canva/start and /callback
    canva-sync-background.mts, canva-cron.mts   Canva sync every 15 min
  lib/                    auth, stores (Blobs), canva, notify (Telegram/email), wording, themes
test/                     unit tests, smoke.mjs (end to end), theme-shots.mjs (screenshots)
tools/                    envelope textures, promo videos and posters
```

## Run locally

```bash
npm install
cp .env.example .env         # set STUDIO_PASSWORD and SESSION_SECRET at least
npm i -g deno                # netlify dev needs Deno for edge features
npm run dev                  # http://localhost:8888
npm test                     # unit tests, offline
npm run test:e2e             # order → receipt → studio check → invitation → guest RSVP (needs npm run dev)
```

Local data lives in `.netlify/` and never touches production.

## Deploy

The site is a Netlify project. Connect the GitHub repo in Netlify (Project configuration → Build & deploy → Link repository) and every push to `main` deploys. No build command; publish directory `public`.

### Environment variables (Netlify → Project configuration → Environment variables)

| Variable | Needed | What it does |
| --- | --- | --- |
| `STUDIO_PASSWORD` | Yes | Password for `/studio/` |
| `SESSION_SECRET` | Yes | Long random string that signs studio sessions |
| `REEFQ_WHATSAPP` | Yes | Your WhatsApp number, `216XXXXXXXX` |
| `BANK_NAME`, `BANK_HOLDER`, `BANK_RIB`, `BANK_IBAN` | Yes | Shown to clients on the payment step |
| `DEPOSIT_PERCENT` | No | Deposit share, default 50 |
| `POSTHOG_KEY`, `POSTHOG_HOST` | No | Analytics and error tracking |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | No | Alerts for new orders and receipts |
| `RESEND_API_KEY`, `ALERT_EMAIL`, `ALERT_FROM` | No | Same alerts by email |
| `ANTHROPIC_API_KEY` | No | "Write it with Claude" in the studio |
| `CANVA_CLIENT_ID`, `CANVA_CLIENT_SECRET`, `CANVA_FOLDER_ID` | No | Designer templates from Canva |
| `SITE_URL` | No | Public URL if different from Netlify's (for example `https://reefq.com`) |

The studio's **Settings → Integrations** card shows which of these are on.

## Payment by bank transfer (RIB)

1. A couple orders on the landing page and lands on their client space with a private link.
2. They transfer the deposit to your RIB with the order code as reference, then upload a photo or PDF of the receipt.
3. The team gets an alert (Telegram or email, with the receipt attached), checks the bank account, and confirms in **Studio → Orders**. Receipts are private and only viewable in the studio.
4. Confirming unlocks the client space: invitation link, guest links and live RSVPs. "Create invitation from this order" prefills the invitation.

## Integrations

- **PostHog:** pageviews, clicks, JS errors and these events: `order_created`, `client_space_viewed`, `payment_proof_uploaded`, `theme_previewed`, `invitation_opened`, `rsvp_sent`. Cookieless (no consent banner). Private link tokens (`?t=`, `?g=`) are removed before sending; no names or phone numbers are sent.
- **Telegram alerts:** create a bot with @BotFather, add it to your team group, get the chat id (send a message, then open `https://api.telegram.org/bot<TOKEN>/getUpdates`), set the two variables.
- **Email alerts:** create a Resend account, verify your domain, set the variables.
- **Canva:** see below.

## Canva

The designer saves templates in one Canva folder; they appear on the landing page and in the studio within 15 minutes.

1. At canva.com/developers, create an integration with scopes `design:meta:read`, `design:content:read`, `folder:read`, and the redirect URL `https://<your site>/auth/canva/callback`.
2. Set `CANVA_CLIENT_ID`, `CANVA_CLIENT_SECRET` and `CANVA_FOLDER_ID` (the id in the folder's URL).
3. In the studio: **Settings → Connect Canva** once, then **Sync now**.

Template names: `Theme · Name | tags`, for example `Sidi Bou Said · Arch photo | floral, blue`. Add `[anim]` to also export a video and `[draft]` to keep it hidden. Page 1 shows on the site; portrait 4:5 works best.

## Working on it

- **Invitation look:** `public/assets/engine.js` and `invitation.css`. Every page uses the same engine.
- **New theme:** add it to `THEMES`, `THEME_LIST` and `ENV_DEFAULTS` in `engine.js`, its colours in `invitation.css` (`.rq-inv[data-t=...]`), and its id in `netlify/lib/themes.mts`. Studio and landing pick it up automatically. Preview any theme at `/theme-preview.html?t=<id>&open=1&lay=arch&ph=4`, or screenshot them all with `node test/theme-shots.mjs`.
- **Layouts and sections:** `layout` (classic, arch, photo), `story`, `photos` (up to 12; 4+ become a gallery), `dressColors`, and `show` toggles on the invitation document.
- **Data:** each record is a JSON blob; new fields need no migration.

## Security notes

- The studio API needs the signed session cookie; failed logins are rate limited.
- Clients reach their order only with the secret token from checkout. Payment receipts are never public.
- Guests only receive the invitation and their own guest entry, never the guest list.
- RSVPs, orders and uploads are rate limited and have a honeypot field.
