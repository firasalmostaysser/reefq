# Reefq · رِفق

Digital wedding invitations that open like a real envelope. One site holds everything:

| URL | What it is | Who uses it |
| --- | --- | --- |
| `/` | Landing page: live envelope demo, Canva templates gallery, packages, order form | Couples |
| `/studio/` | Reefq Studio: create invitations, guest lists, RSVPs, orders, settings | Reefq team (password) |
| `/i/<id>` | A couple's invitation. `?g=<guest id>` greets a family by name and reserves their seats | Guests |
| `/i/demo` | Demo invitation | Anyone |
| `/api/*` | Studio and public API | The pages above |
| `/templates.json`, `/media/*` | Canva templates and uploaded photos | The pages above |

Everything runs on **Cloudflare**: one Worker serves the static pages and the API, **D1** stores invitations, RSVPs and orders, **R2** stores photos and Canva exports, and **KV** holds sessions, rate limits and the Canva token.

## Project layout

```
public/                 static site (served as-is)
  index.html            landing
  studio/               studio app (index.html, studio.js, studio.css)
  i/index.html          invitation viewer
  assets/
    engine.js           invitation engine: envelope, wax seal, pages, RSVP form (shared by all pages)
    invitation.css      invitation styles and themes
    invite.js           guest page logic
    landing.js, site.css
    env/*.webp          pre-rendered envelope paper layers (see tools/render_assets.py)
src/
  index.js              router, link-preview tags for /i/<id>
  api.js                invitations, RSVPs, orders, uploads
  auth.js               studio password → signed session cookie
  canva.js              Canva folder sync (cron every 15 min)
  wording.js            "Write it with Claude" (optional)
migrations/             D1 schema
test/                   canva.test.mjs (offline), smoke.mjs (end-to-end with Playwright)
tools/                  render_assets.py (envelope textures), promo/ (social videos and posts)
docs/                   social captions
```

## Run locally

```bash
npm install
cp .dev.vars.example .dev.vars      # set STUDIO_PASSWORD and SESSION_SECRET
npm run dev                         # http://127.0.0.1:8788
npm test                            # Canva sync, offline
npm run test:e2e                    # landing → studio → guest RSVP, needs `npm run dev` running
```

Local mode keeps its own D1, KV and R2 under `.wrangler/`. Nothing touches production.

## Deploy (first time)

```bash
npx wrangler login
npx wrangler d1 create reefq               # paste database_id into wrangler.toml
npx wrangler kv namespace create STATE     # paste id into wrangler.toml
npx wrangler r2 bucket create reefq-media
npx wrangler secret put STUDIO_PASSWORD
npx wrangler secret put SESSION_SECRET     # long random string
npm run deploy
```

Then add the domain `reefq.com` to the Worker in the Cloudflare dashboard (Workers → reefq → Domains).

Optional:

- **Your WhatsApp number on the order form:** add `REEFQ_WHATSAPP = "216XXXXXXXX"` under `[vars]`.
- **Canva templates:** see "Canva" below.
- **"Write it with Claude":** `npx wrangler secret put ANTHROPIC_API_KEY`.

## Canva

The designer saves templates in one Canva folder, and they appear on the landing page ("Nos modèles") and in the studio's template picker within 15 minutes.

1. At canva.com/developers, create a **private integration** with scopes `design:meta:read`, `design:content:read` and `folder:read`. Set its redirect URL to `https://reefq.com/auth/canva/callback`.
2. Run `npx wrangler secret put CANVA_CLIENT_ID` and `npx wrangler secret put CANVA_CLIENT_SECRET`, and set `CANVA_FOLDER_ID` in `wrangler.toml` (the id in the folder's URL).
3. In the studio, go to **Settings → Connect Canva** (once), then **Sync now**.

Naming rules for the designer: `Theme · Name | tags`, for example `Zitouna · Olivier doré | mariage, henné`.

- **Theme:** one of Reefq, Zitouna, Yasmine or Layl.
- **[anim]:** also exports a video.
- **[draft]:** keeps a design hidden.
- **Page 1** is what shows on the site. Portrait 4:5 works best.

## Working on it

- **Invitation look** (envelope, seal, themes, languages): `public/assets/engine.js` and `invitation.css`. Every page uses the same engine, so a change shows everywhere.
- **New theme:** add it to `THEMES` and `ENV_DEFAULTS` in `engine.js`, its colours in `invitation.css` (`.rq-inv[data-t=...]`), and its card in `THEME_INFO` in `studio.js`.
- **Envelope textures:** edit and run `npm run assets`.
- **Data model:** an invitation is one JSON document (`invitations.data`). New fields need no migration. RSVPs and orders have their own tables.
- **Social content:** `npm run dev` in one terminal, then `npm run promo`. The results go to `tools/promo/out/`.

## Security notes

- The studio API needs the signed session cookie. Failed logins are rate limited.
- Guests only receive the invitation and their own guest entry, never the guest list.
- Guest RSVPs and orders are rate limited per connection and have a honeypot field.
