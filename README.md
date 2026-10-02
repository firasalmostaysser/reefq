# Reefq · رِفق

Digital wedding invitations that open like a real envelope. One site holds everything.

**Running the business** (flow, daily routine, designer guide, marketing plan, roadmap, data and backups): see [`docs/`](docs/README.md).

| URL | What it is | Who uses it |
| --- | --- | --- |
| `/` | Landing page: live envelope demo, 10 themes, card designs, made-to-measure website templates, packages, order form (`?modele=<slug>` preselects a template) | Couples |
| `/commande/<code>?t=<token>` | Client space: prepare the invitation (details, text, theme, guests) with a live preview, pay by bank transfer, upload the receipt, then share the links and follow guest replies | Couples |
| `/studio/` | Reefq Studio: invitations, guest lists, RSVPs, orders and payment checks, settings | Reefq team (password) |
| `/i/<id>` | A couple's invitation. `?g=<guest id>` greets a family by name and reserves their seats | Guests |
| `/modeles/<slug>` | Live preview of a website template, with "Choisir ce modèle" | Couples |
| `/site/<id>/<ver>/*` | Files of a custom design or template, served from our copy | The pages above |
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
    invite.js, landing.js, site.css, commande.js, commande.css
    site-bar.js           Reefq bar on custom designs: greeting, open tracking, reply card
    env/*.webp            pre-rendered envelope paper layers (tools/render_assets.py)
netlify/
  functions/
    api.mts               /api/*: invitations, RSVPs, orders, receipts, uploads, the couple's own invitation, backups, seeding
    daily-digest.mts      08:00 Tunis: team summary on Telegram/email, auto-cancel of stale unpaid orders, Monday backup
    media.mts             /media/* and /templates.json
    invite-page.mts       /i/<id> with link-preview tags (or our copy of a custom design)
    site.mts              /site/*: files of custom designs and website templates
    modeles.mts           /modeles/<slug>: website template previews
    canva-auth.mts        /auth/canva/start and /callback
    canva-sync-background.mts, canva-cron.mts   Canva sync every 15 min
  lib/                    auth, stores (Blobs), canva, sites (custom designs), notify (Telegram/email), digest (morning summary), themes
test/                     unit tests, smoke.mjs (end to end), theme-shots.mjs (screenshots)
tools/                    seed.mjs (demo data / restore a backup locally), guard.mjs, envelope textures, promo videos and posters
docs/                     operations, designer guide, marketing, roadmap, data
```

## Run locally

```bash
npm install
cp .env.example .env         # set STUDIO_PASSWORD and SESSION_SECRET at least
npm i -g deno                # netlify dev needs Deno for edge features
npm run dev                  # http://localhost:8888
npm test                     # unit tests, offline
npm run test:e2e             # order → couple prepares the invitation → receipt → studio check → guest RSVP → summary, backup, referral (needs npm run dev)
npm run seed                 # demo couples in every state (needs npm run dev); `npm run seed -- backup.json` loads a backup
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
| `DEPOSIT_PERCENT` | No | Share paid upfront, default 100 (full payment). 50 = deposit |
| `POSTHOG_KEY`, `POSTHOG_HOST` | No | Analytics and error tracking |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | No | Alerts for new orders and receipts |
| `RESEND_API_KEY`, `ALERT_EMAIL`, `ALERT_FROM` | No | Same alerts by email |
| `ANTHROPIC_API_KEY` | No | "Write it with Claude" in the studio |
| `CANVA_CLIENT_ID`, `CANVA_CLIENT_SECRET`, `CANVA_FOLDER_ID` | No | Designer templates from Canva |
| `CANVA_TEMPLATES_FOLDER_ID` | No | Canva folder of website templates ("Reefq Templates"), synced with the folder above |
| `CANVA_SITE_HOSTS` | No | Extra hosts allowed for custom designs, comma separated (for example `invite.reefq.com`). `*.canva.site` is always allowed |
| `SITE_URL` | No | Public URL if different from Netlify's (for example `https://reefq.com`) |

The studio's **Settings → Integrations** card shows which of these are on.

## Payment by bank transfer (RIB)

1. A couple orders on the landing page and lands on their client space with a private link.
2. They prepare their invitation there (names, date, venue, text, theme, guest list for Signature/Prestige) and see a live preview. It is saved but **locked**: guests cannot open it yet.
3. They transfer the price to your RIB with the order code as reference, then upload a photo or PDF of the receipt.
4. The team gets an alert (Telegram or email, with the receipt attached), checks the bank account, and confirms in **Studio → Orders**. Receipts are private and only viewable in the studio.
5. Confirming unlocks the invitation and the client space: invitation link, guest links and QR codes, live RSVPs. If the couple has not prepared anything yet, an invitation is created from the order for them to fill. Custom designs are shared once the designer marks them published.

Orders also record where the couple came from (`utm_*` on links; `invitation` from the footer of guests' invitations) and an optional referrer (`?ref=RQ-XXXXX` from the thank-you message: 10 % off, applied when the referring order is paid).

## Integrations

- **PostHog:** pageviews, clicks, JS errors and these events: `order_created`, `client_space_viewed`, `brief_saved`, `payment_proof_uploaded`, `theme_previewed`, `invitation_opened`, `rsvp_sent`. Cookieless (no consent banner). Private link tokens (`?t=`, `?g=`) are removed before sending; no names or phone numbers are sent.
- **Morning summary:** `daily-digest.mts` sends the team's to-do list at 08:00 (Tunis) through the same alert channels; Studio → Settings previews it. Logic in `netlify/lib/digest.mts`, tested by `test/digest.test.mjs`.
- **Telegram alerts:** create a bot with @BotFather, add it to your team group, get the chat id (send a message, then open `https://api.telegram.org/bot<TOKEN>/getUpdates`), set the two variables.
- **Email alerts:** create a Resend account, verify your domain, set the variables.
- **Canva:** see below.

## Canva

The designer saves templates in one Canva folder; they appear on the landing page and in the studio within 15 minutes.

1. At canva.com/developers, create an integration with scopes `design:meta:read`, `design:content:read`, `folder:read`, and the redirect URL `https://<your site>/auth/canva/callback`.
2. Set `CANVA_CLIENT_ID`, `CANVA_CLIENT_SECRET` and `CANVA_FOLDER_ID` (the id in the folder's URL).
3. In the studio: **Settings → Connect Canva** once, then **Sync now**.

Template names: `Theme · Name | tags`, for example `Sidi Bou Said · Arch photo | floral, blue`. Add `[anim]` to also export a video and `[draft]` to keep it hidden. Page 1 shows on the site; portrait 4:5 works best. Canva website designs only export as PDF, so the sync uses their thumbnail instead; a design that cannot be read is listed in Settings and never blocks the others.

### Custom designs (a Canva website per couple)

An invitation's design is either a Reefq theme or a custom design (**Design → Look & feel → Custom design**). Everything else (guest list, personal links, delivery, replies, tracking) is the same.

1. The designer builds the invitation as a Canva website, links its RSVP button to `#rsvp` (any link containing "rsvp" works), and publishes it to any `*.my.canva.site` address.
2. Paste that address in the studio and press **Mark published**. Reefq saves a copy of the page (`files` store, `sites/<id>/<ver>/`); its other files are copied the first time they are requested, which the studio preview does right away.
3. Guests open the usual `/i/<id>?g=<guest id>`. They get our copy, on our address, with our title and link preview, the designer branding footer hidden, audio removed, and the Reefq bar ("Cher·e <guest>", "Confirmer ma présence"). Canva sites refuse to be framed (`X-Frame-Options: SAMEORIGIN`), which is why the page is copied rather than embedded.
4. After edits in Canva, press **Refresh copy**. Changing the address puts the invitation back to "waiting for the designer".

### Website templates (the "Modèles sur mesure" gallery)

1. The designer duplicates a client site, replaces private details with sample ones, publishes it, and saves the design in the Canva folder set in `CANVA_TEMPLATES_FOLDER_ID`. The sync turns each design into a template (name, tags, Canva thumbnail; same title rules as above, `[draft]` keeps it off the website).
2. **Studio → Settings → Website templates**: paste the published address and press **Mark published**. A template can also be added there by hand (name + address), without the Canva folder. **Upload picture** replaces the Canva thumbnail on the card; **Hide** takes it off the website.
3. The landing page lists published templates. **Voir en direct** opens `/modeles/<slug>` (in a phone frame on wide screens), served from our copy like a couple's design, with a bar to choose it; its RSVP button shows a sample reply card.
4. The order keeps the chosen template (`site`). **Create invitation from this order** starts a custom design that names the template, for the designer to duplicate and personalise.

Replies: a personal link always answers with the name on the guest list. With **Replies only from personal links** (on by default for custom designs), the shared link and QR code can open the invitation but not reply. Opens are recorded per guest in the `opens` store and shown in **Guests & RSVPs**.

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
