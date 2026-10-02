# Reefq: rules for AI coding agents (Cursor, Codex, Claude…)

Reefq is a live product: couples pay, guests receive personal links and RSVP. Your job on this repo is
**visual only**: UI, landing page, videos and invitation themes. Never change how things work.

Read `README.md` for setup. Work on a branch, never on `main`. Every merge to `main` is a production deploy and costs Netlify credits (the free allowance ran out on 2 Oct 2026): the owner merges finished branches together, at most once a day.

## Before you finish, always run

```
npm run guard     # fails if a change touches functionality
npm test
```

If `npm run guard` fails, undo the change it names. Do not edit the guard, the tests or this file to make it pass.

## You may change

- Styles: `public/assets/site.css`, `invitation.css`, `commande.css`, `public/studio/studio.css`
- Layout and copy in the HTML pages (`public/index.html`, `public/commande/index.html`, `public/studio/index.html`, `public/i/index.html`), keeping every hook below
- Landing copy and translations: `public/assets/landing-i18n.js`; landing animations in `public/assets/landing.js` (visual effects only)
- Invitation themes: the drawing and markup functions in `public/assets/engine.js` (`sprig`, `linerTile`, `sealCanvas`, theme visuals, `render` markup) and new themes
- New images, illustrations and videos (see Media rules)

## You must not change

- Anything in `netlify/` (API, orders, payments, guests, RSVP, Canva sync, invitation pages), except adding a new theme id to `netlify/lib/themes.mts`
- `netlify.toml`, `package.json`, `package-lock.json`, `.env*`, `test/`, `tools/guard.mjs`, `.github/`, `.cursor/`, `AGENTS.md`, `CLAUDE.md`
- Logic files: `public/assets/commande.js`, `invite.js`, `analytics.js`, `site-bar.js`, `wording-templates.js`, `phone.js`, `vendor/`, `public/studio/studio.js`, `public/apercu.html` (client-space preview), `tools/seed.mjs`
- In `engine.js`: `esc`, `rng`, `hash`, `pad`, `loc`, `fmtDate`, `namesOf`, `initials`, `waLink`, `mapsHref`, `rsvpHtml`, `wireRsvp`, `renderRsvp`, `envOpts`, `couple`, `pairText`, `hostsOf`, `hostsLines`, `hostsMsg`, `openingsOf` (name order, invitation grammar, opening lines), and the keys of `window.ReefqInvite`. You may restyle the markup of `pairHtml` and `hostsHtml` but keep their text.
- Existing theme ids (`reefq`, `zitouna`, `yasmine`, `layl`, `sidi`, `kairouan`, `oldmoney`, `sauge`, `bordeaux`, `sahara`): saved invitations use them. Restyle a theme freely, but never rename or remove its id. A new theme goes in both `THEME_LIST` (engine.js) and `THEME_IDS` (netlify/lib/themes.mts).

## Hooks: keep them exactly

JavaScript finds elements by `id`, `class`, `name` and `data-*` attributes (`$('#l-form')`, `.rq-form`, `#rq-rsvp`, `[data-pick]`…).
Restyle them as much as you like, move them, wrap them, but **never rename or remove** an id, a class used by JS,
a form field `name`, or a `data-*` attribute. Add new classes for styling instead of renaming old ones.
Do not remove or rename buttons, forms and inputs; keep `type="submit"` buttons inside their forms.

## Brand rules (internal; never state them in copy, UI or marketing)

- **No music:** no music player, audio track, song field, or wording about music or songs. Every video is exported **without an audio track**.
- **No images of women:** no photos, portraits, silhouettes, hands-with-faces or illustrations of women, including AI-generated images and video frames. No couple photos. Use paper, envelopes, wax seals, florals (jasmine, olive), patterns (zellige, kilim), architecture (arches, Sidi Bou Said doors), calligraphy and objects.
- **Halal and modest:** no alcohol (no wine or champagne glasses, no toasts), no dancing, nightlife or anything immodest. Wording stays dignified and family-oriented.
- Printed cards with Quranic verses keep their small note asking guests not to throw them away.

## Media rules (landing videos and images)

- Videos: MP4 (H.264) plus WebM, no audio track (strip it, e.g. `ffmpeg -an`), 720p max, aim under 3 MB each, 6–15 s loops.
- Embed with `muted autoplay loop playsinline preload="none"` and a `poster` image; load below-the-fold videos lazily. The site must stay fast on low-end phones.
- Images: WebP, sized for their display box. Put media under `public/assets/media/`.
- Respect `prefers-reduced-motion`: show the poster instead of playing.

## Arabic and RTL (most couples are Tunisian and read the invitation in Arabic)

- Every Arabic input, textarea and text block has `dir="rtl" lang="ar"`. Arabic inside a French or English sentence goes in `<bdi lang="ar" dir="rtl">…</bdi>`; inside an `<option>` (no HTML allowed) wrap it with U+2067 … U+2069.
- Quran verses and opening lines live in `OPENING_LIST` (engine.js): never edit, shorten or re-diacritize them; restyle `.rq-openings`, `.rq-basmala`, `.rq-ayah` freely.
- Never retype or "fix" Arabic wording in code: texts live in `wording-templates.js` and the grammar in the frozen engine functions above (verb agreement يتشرّف / تتشرّف, نجله / نجلهما / كريمتهما / ابنيهما, "و" attached to the second name). Report wording problems to the owner instead.
- The groom's name comes first by default (`nameOrder`); `a` is the bride and `b` the groom in the data.
- Check every screen you change in Arabic at 360 px wide: the invitation (language switch عربي) and the client space fields.
- Tunisian month names are used (جانفي، فيفري، … جويلية، أوت); keep Western digits.

## Product copy

French UI first; Arabic where existing screens use it (RTL); English where it already exists. Keep the existing tone: warm, simple, respectful.

## Handoff, 2 October 2026: state and who does what

**State.** Everything on `main` passes `npm test` and `npm run test:e2e` (`test/smoke.mjs`, `test/edits.mjs`, `test/customize.mjs`). Latest features: couples edit their invitation with a live preview that stays open; guests are edited in place and keep their link; saves never overwrite each other (409 → "load latest / keep mine"); studio auto-save, restore of unsaved typing, order alerts and badges; Tunisian cards: groom first, "who invites" (parents with or without « وحرمه », or families) with automatic Arabic/French/English grammar, closing line (du'a, …), and sections the couple can switch off (RSVP form, countdown, programme, story). Arabic is the default invitation language.

**Live site.** reefq.netlify.app (no own domain for now). A push to GitHub does not deploy; the owner (or Claude) deploys. Netlify credits ran out on 2 Oct 2026, so the newest code may not be live yet.

**Suggested split** (each on its own branch, `npm run guard` + `npm test` before handing back):
- **UX agent:** client space flow (`public/commande/index.html`, `commande.css`) and studio layout (`public/studio/index.html`, `studio.css`): fewer steps on screen, clearer grouping, mobile first, Arabic checked at 360 px. Keep every id and `data-*` hook.
- **UI agent:** invitation themes and the look of the new parts (`invitation.css`: `.rq-hosts`, `.rq-hosts-lead`, `.rq-closing`), landing page (`site.css`, `index.html`, `landing-i18n.js`).
- **Visuals agent:** illustrations, theme art, posters and silent videos under `public/assets/media/` and `tools/promo/`, following the brand and media rules above (no women, no music, no alcohol). Posters show **reefq.netlify.app**.

Logic changes (anything under "You must not change") go back to the owner and Claude.
