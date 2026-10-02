# Reefq: rules for AI coding agents (Cursor, Codex, Claude…)

Reefq is a live product: couples pay, guests receive personal links and RSVP. Your job on this repo is
**visual only**: UI, landing page, videos and invitation themes. Never change how things work.

Read `README.md` for setup. Work on a branch, never on `main`.

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
- Logic files: `public/assets/commande.js`, `invite.js`, `analytics.js`, `site-bar.js`, `wording-templates.js`, `vendor/`, `public/studio/studio.js`
- In `engine.js`: `esc`, `rng`, `hash`, `pad`, `loc`, `fmtDate`, `namesOf`, `initials`, `waLink`, `mapsHref`, `rsvpHtml`, `wireRsvp`, `renderRsvp`, `envOpts`, and the keys of `window.ReefqInvite`
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

## Product copy

French UI first; Arabic where existing screens use it (RTL); English where it already exists. Keep the existing tone: warm, simple, respectful.
