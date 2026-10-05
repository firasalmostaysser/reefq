# Brief for Codex: invitations, round 2 (4 October 2026)

Branch: `design/round-2`. Read `AGENTS.md` first: it is binding (visual work only, frozen functions, hooks, brand rules, Arabic/RTL).
Never push to `main`. Commit on this branch; the owner merges.

## Goal

The envelopes are done (round 1: each theme has its own construction, closure and opening). Round 2 is **what the guest
sees after the envelope opens**. Today the ten themes share one stationery system with different colours. Each theme
must become its own artwork: a guest should recognise Layl or Kairouan from a screenshot without reading its name.

Aim: an object you would want to keep, like a letterpress card from a fine Tunis atelier. Not a web template.

Reference for the level of polish (study it, never copy its files or code): wooowinvites.com demos. Their impact comes from
a photorealistic **video intro per theme** (embossed envelope whose relief lights up, then opens into light) followed
by watercolour inside pages with script titles. Reefq does the same with its own Tunisian art, and stays faster.

## Scope update (5 October 2026): Codex owns the whole look

The owner delegates **all visual work** to Codex: theme choices, landing page, envelopes, the invitation's
structure and every detail of its design and animation. Benchmark: wooowinvites.com (study it, then do better;
never copy its files, code, images or videos). Open these demos on a phone and match their level of polish:

- https://www.wooowinvites.com/invite/demo-bff9ac (Ivory Gypsophila)
- https://www.wooowinvites.com/invite/demo-37a111 (Azure Sea Vows)
- https://www.wooowinvites.com/invite/demo-785aed (Tuscan Sunset Lights)
- https://www.wooowinvites.com/save-the-date/std-demo-15ecdb (save the date)

What to take from them: the cinematic opening (personal envelope, wax seal with initials, then a reveal into
light), full-bleed painterly backgrounds, large script titles, generous spacing, sections that arrive as you scroll,
and info blocks that each feel designed (countdown, venue and map, programme/timeline, story, RSVP).
What to leave out: their music player, couple photos and portraits, drinks menus and anything that breaks the brand rules below.
Where Reefq must beat them: Tunisian identity (zellige, Kairouan, Sidi Bou Said, jasmine, olive), real Arabic
typography and RTL, and speed on a cheap Android phone.

Codex decides:
1. **Themes:** restyle the ten existing ids freely; propose and add new ones (each in `THEME_LIST` and
   `netlify/lib/themes.mts`). Retire nothing: saved invitations use every existing id.
2. **Envelopes:** construction, materials, seal, opening choreography per theme (code envelope stays the fallback for the video intro).
3. **Invitation structure:** order, layout and look of every section that exists today (hero, hosts, opening verse,
   date/venue/map, countdown, programme, story, RSVP, closing). New info blocks that need new data fields
   (dress code, transport, FAQ, gallery…) are logic: list them in the hand-back note and the owner and Claude add the data side.
4. **Landing page** (`public/index.html`, `site.css`, `landing-i18n.js`, `landing.js` effects): a hero that plays a real
   invitation opening, theme gallery with live demos, three steps, blocks showcase, pricing in TND, FAQ, CTA.
   Keep every id, form `name` and `data-*` hook.

Functional behaviour (orders, payments, guests, RSVP, studio logic) is out of scope; the owner checks it with Claude afterwards.

## Part A: video intro layer (all themes, built once)

**Status: code done** (commit "Video intro player"): `MEDIA_BASE`, `THEME_MEDIA`, `introOk`, `introHtml`, the play/fallback
logic in `render` and the `.rq-intro`, `.rq-backdrop`, `.rq-venue-art` styles. `THEME_MEDIA` is empty until the media files exist:
add a theme there once its files are in place. Restyle freely; keep the fallback rules below.

The owner generates the media (`docs/SORA_PROMPTS.md`) into `public/assets/media/themes/<id>/`:
`intro-v1.mp4`, `intro-v1.webm` (720 × 1280, silent, 5 s), `poster-v1.webp` (first frame), `inside-v1.webp`,
`inside-wide-v1.webp`, `venue-v1.webp`. Build the player so a theme uses them when they exist and falls back
to today's code-drawn envelope when they do not.

1. **One map in engine.js**, e.g. `THEME_MEDIA={layl:{v:'v1',intro:1,inside:1,venue:1},…}`, and one base constant
   `MEDIA_BASE='/assets/media/themes/'` so the files can move to a CDN later by changing one line.
2. **Closed state:** the poster fills the envelope stage, with the guest greeting and the existing `.rq3-seal`
   button laid over the seal (keep the `.rq3-seal` class and its click behaviour: tests and `play()` use it).
   Start loading the video after the page has rendered (`preload="auto"`, `muted playsinline`, no `autoplay`, no `loop`).
3. **On tap:** play the video; on `ended` (or after 6 s at the latest, or at once if playback fails) run the same
   hand-off to the open invitation that the envelope uses today, cross-fading from the video's last bright frame.
   Keep the `invitation_opened` tracking call exactly where it is.
4. **Fallback to the code envelope** when: the theme has no media, `prefers-reduced-motion`, `navigator.connection.saveData`,
   a 2g/slow-2g connection, or the video has not loaded enough data 1.5 s after the tap.
5. **Inside:** `inside-v1.webp` (portrait) / `inside-wide-v1.webp` (≥ 768 px) as the page background, fixed behind a
   readable text column; `venue-v1.webp` above the venue/map block. Lazy-load everything below the fold.
6. **Never** add an audio track, a sound button or `unmute`. Videos stay muted.

## Part B: the art of each theme (code)

For each of the ten theme ids (`reefq`, `zitouna`, `yasmine`, `layl`, `sidi`, `kairouan`, `oldmoney`, `sauge`, `bordeaux`, `sahara`):

1. **Signature ornament.** One hero motif drawn in code (SVG or canvas, deterministic with `rng`/`hash`), placed
   with intent: a header crest, a frame corner, a divider, a closing mark. Leave quiet space around names and Arabic.
2. **Composition.** A layout of its own: frame shape (arch, double keyline, deckled edge, tile border, engraved
   rectangle…), alignment and rhythm. Keep the same content and hooks; only the arrangement and styling change.
3. **Typography.** A Latin/Arabic font pairing per theme, chosen from Cormorant Garamond, Figtree, Amiri,
   Aref Ruqaa and Pinyon Script (add at most one new Google font per theme, and only if it is truly needed). The names are the
   main moment of the page: give them scale, spacing and one ornamental detail.
4. **Reveal choreography.** After the envelope hands off, sections appear in a deliberate order: the card settles,
   the ornament draws in (stroke-dashoffset), the names arrive, then details. 1.5–2.5 s in total, using
   `transform`/`opacity` only. Below the fold, reveal on scroll with one shared `IntersectionObserver`.
5. **Details and RSVP blocks.** Restyle the date, venue, map, countdown and RSVP sections so they belong to the
   theme (tile, plaque, ribbon, stamp…). Keep every id, class used by JS, `name` and `data-*` attribute.
6. **Paper and light.** Real material: grain (reuse `grainUrl()`), blind emboss, one metallic highlight at most,
   soft shadows.

Art direction (keep each to one strong idea):

| Theme | Idea |
|---|---|
| reefq | Zellige star monogram, teal ink with one antique-gold keyline; calm and modern |
| zitouna | Pressed olive branch growing asymmetrically along one edge, heritage lace border |
| yasmine | Jasmine blossoms falling sparsely, pale-blue garden arch, lots of white space |
| layl | Midnight paper, hand-placed gold-foil stars and a crescent, foil shimmer once on reveal |
| sidi | Whitewash wall, cobalt studded-door arch framing the names, one bougainvillea sprig |
| kairouan | Manuscript illumination: copper geometric frame, carved-arch header, kilim divider |
| oldmoney | Engraved laurel, blind-embossed crest with initials, serif italics, espresso ink |
| sauge | Pressed sage and olive leaves, linen texture, rounded soft frame |
| bordeaux | Burgundy card, rose-gold botanical line, velvet depth |
| sahara | Tozeur brick-relief border, palm-frond line, warm sun-wash gradient |

## Constraints (do not break)

- **Brand:** no music or audio of any kind; no women, couples, portraits or silhouettes (not even abstract);
  no alcohol, dancing or nightlife imagery. Use florals, patterns, architecture, calligraphy and objects.
- **Text:** never edit wording, Quran verses (`OPENING_LIST`) or the frozen functions listed in `AGENTS.md`.
  Arabic is never italic and its line-height stays generous; ornaments never overlap diacritics.
- **Performance:** fast on a cheap Android phone. No libraries. Only the files in Part A are heavy (intro about 1.5 MB);
  any other image stays under 60 KB. No layout-triggering animations, at most one `requestAnimationFrame` loop and stop it when idle.
  `prefers-reduced-motion`: show the final state at once.
- **Files:** `public/assets/engine.js` (visual functions and `render` markup only) and `public/assets/invitation.css`.
  New media under `public/assets/media/` as WebP. Do not edit `netlify.toml` (theme media already has a one-year cache header).

## How to work

1. **Pilot first:** build Part A, then do `layl` and `kairouan` completely (Part A with their media if the owner has
   added it, Part B either way), commit, and stop for owner review before the other eight.
2. Then one commit per theme, message `Theme <id>: <what changed>`.
3. Before each commit, run `npm run guard` and `npm test`, and check the theme with `npm run dev`
   (open the studio preview or `/i/<slug>`) in **Arabic and French at 360 px**, plus 1280 px. No horizontal overflow.
4. Do not push more than once a day: every push may cost Netlify credits.

## Done means

- A theme with media opens with its video and hands off without a flash; a theme without media, reduced motion
  or save-data shows the code envelope.
- The ten themes look clearly different from each other in a side-by-side screenshot.
- Each reveal plays smoothly on a mid-range phone, and reduced motion shows the final state.
- `npm run guard` and `npm test` pass; screenshots of each theme (AR and FR, 360 px) are attached in the hand-back note.
