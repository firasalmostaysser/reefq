# Brief for Codex: invitations, round 2 (4 October 2026)

Branch: `design/round-2`. Read `AGENTS.md` first: it is binding (visual work only, frozen functions, hooks, brand rules, Arabic/RTL).
Never push to `main`. Commit on this branch; the owner merges.

## Goal

The envelopes are done (round 1: each theme has its own construction, closure and opening). Round 2 is **what the guest
sees after the envelope opens**. Today the ten themes share one stationery system with different colours. Each theme
must become its own artwork: a guest should recognise Layl or Kairouan from a screenshot without reading its name.

Aim: an object you would want to keep, like a letterpress card from a fine Tunis atelier. Not a web template.

## What to build, per theme

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
- **Performance:** fast on a cheap Android phone. No libraries, no images over 60 KB per theme (prefer code-drawn
  art), no layout-triggering animations, at most one `requestAnimationFrame` loop and stop it when idle.
  `prefers-reduced-motion`: show the final state at once.
- **Files:** `public/assets/engine.js` (visual functions and `render` markup only) and `public/assets/invitation.css`.
  New media under `public/assets/media/` as WebP.

## How to work

1. **Pilot first:** do `layl` and `kairouan` completely, commit, and stop for owner review before the other eight.
2. Then one commit per theme, message `Theme <id>: <what changed>`.
3. Before each commit, run `npm run guard` and `npm test`, and check the theme with `npm run dev`
   (open the studio preview or `/i/<slug>`) in **Arabic and French at 360 px**, plus 1280 px. No horizontal overflow.
4. Do not push more than once a day: every push may cost Netlify credits.

## Done means

- The ten themes look clearly different from each other in a side-by-side screenshot.
- Each reveal plays smoothly on a mid-range phone, and reduced motion shows the final state.
- `npm run guard` and `npm test` pass; screenshots of each theme (AR and FR, 360 px) are attached in the hand-back note.
