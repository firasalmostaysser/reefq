# Data: where it lives, backups, seeding, and the database decision

## Where your data is stored today

Everything is in **Netlify Blobs**, a key-value store that comes with the Netlify project (no separate database, no server, no monthly bill at this size). Each record is one JSON document.

| Store | Key | What is in it |
| --- | --- | --- |
| `orders` | `RQ-XXXXX` | Every order: names, WhatsApp, offer, price, status, payment history, source (utm), referrer, client token |
| `invitations` | `nour-sami-ab12` | Every invitation: texts, theme, date, venue, guest list with personal link ids, design source |
| `rsvps` | `<invitation>/<time>-<id>` | Every guest reply |
| `opens` | `<invitation>/<guest>` | When each guest opened their link, and how many times |
| `site-templates` | design id | Website templates shown under "Modèles sur mesure" |
| `files` | `proofs/…`, `uploads/…`, `sites/…` | Payment receipts (private), uploaded pictures, copies of Canva websites |
| `state` | various | Rate limits, Canva connection, template catalog |

**Production and testing never mix.** The live site (production deploy) uses the global stores. `npm run dev`, deploy previews and branch deploys get their own empty stores (`netlify/lib/stores.mts`). So orders you placed on `reefq.netlify.app` are real production records; orders placed on `localhost:8888` exist only on your computer, in `.netlify/blobs-serve/`.

Netlify Blobs data is hosted by Netlify (AWS, outside Tunisia). It holds names and phone numbers of couples and guests: keep the studio password private, and add a short privacy notice to the site before running ads (see `docs/LAUNCH_CHECKLIST.md`).

## Backups

- **Automatic:** every Monday at 08:00 the morning summary is followed by a file `reefq-backup-YYYY-MM-DD.json` in the Telegram chat. It contains every order, invitation, reply, open and website template. Keep the chat; download a copy to your drive once a month.
- **On demand:** Studio → Settings → **Download a backup**.
- **Not in the backup:** receipt images, uploaded pictures and Canva site copies (`files` store). They are not needed to restore service: receipts already arrived in Telegram, pictures and sites can be re-uploaded or re-copied.

## Seeding (filling a local or preview site with data)

```bash
npm run dev                                   # terminal 1
npm run seed                                  # terminal 2: 9 demo couples, one in every state
npm run seed -- reefq-backup-2026-10-02.json  # or: load a real backup
```

`npm run seed` creates realistic demo data: an order waiting for payment, one with the invitation prepared but unpaid (locked), a receipt to check, paid couples with guests and replies, a couple who paid but has not filled anything, a custom design waiting for the designer, a rejected transfer, a cancelled order, and a wedding that happened yesterday (so the morning summary shows every section). It prints the client-space and guest links to open.

The import (`POST /api/import`) refuses to run on the live site, so a seed can never overwrite real couples.

### Your old test orders

The test orders you placed on the live site are in production. To keep them as test data and clean the live site:

1. Studio (live) → Settings → **Download a backup**.
2. Locally: `npm run dev`, then `npm run seed -- <that file>`. Your test orders now live on your computer for testing.
3. Studio (live) → Orders → **All** → open each test order → **Delete order**. Then Invitations → delete the test invitations (this also removes their replies and opens).

Do step 3 before launch, so your numbers (morning summary, PostHog funnel) start clean.

## Should we move to Supabase now?

**No. Not yet.** Decision and reasons:

- **Volume.** A good year is a few hundred orders and tens of thousands of guest replies. Blobs handles that with no tuning.
- **Zero operations.** No database to secure, patch, back up or pay for. Backups already arrive in Telegram.
- **Risk.** Migrating now means rewriting every API route during your launch, for no visible benefit to couples.
- **Exit is cheap.** The backup file maps one-to-one to tables (`orders`, `invitations` as JSONB, `rsvps`, `opens`). A migration later is one to two days of work.

**Move to Supabase (Postgres) when any of these becomes true:**

1. **More than ~1,000 orders**, or the Studio Orders/Invitations lists take more than 2 seconds to load. (The Studio loads every record on each visit; that is fine now and slow later.)
2. You need **reporting** that the morning summary and PostHog cannot give (revenue per source per month, cohort analysis).
3. Several team members need **their own accounts and permissions** (today the Studio has one shared password).
4. Couples should **log in** to an account (several events, repeat customers) instead of a private link.

When that day comes: create the Supabase project in the EU region, create the four tables, import a backup, switch `netlify/lib/stores.mts` helpers to Supabase queries route by route, keep Blobs for `files`.
