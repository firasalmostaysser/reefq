# Opening collections — visual handoff

This branch adds Olive, Blush, Velvet, Art Déco and Zahr from `files.zip`.
Existing theme ids and saved invitations remain available. No deployment was made.

## What is connected now

- The landing hero starts with Olive. Its full-screen link opens the selected theme and language in the existing preview page.
- Five photographic collection cards lead to Arabic previews. Each has its own frame, material caption and palette detail. All 15 interactive themes remain available in an expandable gallery, so it is not rendered on the initial mobile screen.
- Studio uses `ReefqInvite.THEME_LIST`, so all five collections are available in its existing Design picker. The API's existing `THEME_IDS` list supplies the client selector.
- Each film continues into invitation paper, borders, type, countdown, programme and RSVP in its own palette. Guest names, family wording, Quranic text, name order, dates and RSVP processing use the unchanged engine functions.
- Cinematic artwork has a fixed palette and seal. The preview shows the original artwork; names and invitation content remain editable. Client and Studio copy explains this distinction.

## Media

Production files are in `public/assets/media/openings/`. Each collection has an intro and a reveal in H.264 MP4 and VP9 WebM, plus WebP resting artwork and a background scene. The existing invitation player uses the MP4 files; WebM alternatives are supplied in the catalog for future use.

The videos preserve their supplied background soundtracks, following the owner's explicit request on 25 October 2026. MP4 audio is copied from the original source stream; WebM uses Opus. A real tap or keyboard activation plays both parts with sound. Programmatically started theme tours stay muted. The maximum video dimension is 720 px. Both parts together last about 11 seconds and play once. `preload="none"` avoids downloading gallery videos until activation. Existing skip, Escape, playback-error, stalled-playback and reduced-motion handling is retained.

The supplied Velvet reveal is landscape; it is contained on burgundy so its content remains visible on a portrait screen. Its resting artwork is square, displayed as a portrait crop. Other clips are portrait.

To prepare these assets again after extracting the archive into a local folder:

```sh
node tools/promo/prepare-openings.mjs path/to/extracted-assets
```

This offline preparation script uses Playwright, sharp, Chrome and a local FFmpeg executable (or the `FFMPEG` environment variable pointing to it). Canvas capture compresses the picture into AVC MP4 and VP9 WebM, then FFmpeg restores the source soundtrack. It does not run on Netlify or add a build step. To restore audio to already prepared clips without recompressing their video, run `node tools/promo/restore-opening-audio.mjs path/to/extracted-assets`.

## Future admin uploads / Supabase

`public/assets/media/openings/catalog.json` is an asset inventory with stable ids, filenames and paper/ink/accent colours. It is a handoff format, not a runtime database integration. The current frontend still registers assets in `engine.js` and styles them in `invitation.css`.

An owner/backend implementation is still needed for authenticated admin uploads, asset validation, storage, draft/published status and a runtime catalog. A Supabase adapter should return the same stable theme ids and media references and preserve existing invitation ids, guest links and RSVP contracts. No upload form or simulated save action has been added. Supabase credentials and deployment configuration remain untouched.

## Validation and release boundary

- `npm run guard` and `npm test` pass.
- Chrome browser checks: French desktop landing; Arabic landing, five invitations, client Arabic fields and Studio at 360 px; all 15 theme controls available; no horizontal overflow or JavaScript page errors in these checks.
- Verified natural two-part playback completion, skip, no video downloads under reduced motion, and content access after a failed video request. All 20 encoded video variants load their metadata successfully.
- Client and Studio layout checks used local API fixtures. Additional real local Netlify tests now cover persistence, guest edits, payment confirmation, stale saves, auto-save, draft restoration and invitation customisation.
- The local Netlify runtime now starts successfully. The unchanged `test/edits.mjs` and `test/customize.mjs` pass with browser contexts explicitly set to reduced motion and French locale. The ignored `tools/promo/out/reduced-motion.mjs` runner configures these browser options; it does not change the tests or application. Example: `node --import ./tools/promo/out/reduced-motion.mjs test/edits.mjs` (set `CHROMIUM` to the installed Chrome executable when needed).
- Default-motion `npm run test:e2e` still fails at `test/smoke.mjs:24`, which assumes the automatic opening finishes within 10 seconds. The editing/customisation suites also have 8-second waits that expire during the longer films. Olive's full sequence takes about 11 seconds plus delay and fade; the previous Reefq clips already totalled about 13 seconds. On mobile, the redesigned hero also places the action before the demo; the tour starts once the phone enters view. Owner review of these animation assumptions remains necessary before release. The supplied films and test assertions have not been shortened or edited to satisfy them.
- The landing was checked in French, Arabic and English at 360, 390, 768, 1024 and 1440 px. All five invitations and RSVP forms, the client Arabic inputs, and the Studio theme picker were checked at 360 px without horizontal overflow or JavaScript page errors.
- Work is on `ui/opening-atelier-polish`, created after filesystem access became available. Nothing was committed, pushed or merged.

## Second visual pass

The landing has a smaller demo on desktop, photo thumbnails in its theme controls, an accessible skip link, and a mobile order that brings the main action before the demo. Collection artwork has individual frame shapes and translated material captions. The full gallery uses a native disclosure and keeps every existing control and hook.

Invitations have small collection-specific engraved ornaments, calmer countdown separators, programme details, larger map links and reply controls, and clearer selected RSVP choices. Arabic marketing headings use Amiri for readability; invitation wording and name-order logic remain unchanged. Client sections have numbered legends and visible focus states; Studio themes have selection marks and its desktop preview clears the sticky toolbar. Light and dark UI palettes share olive and brass tones.

Preview screenshots and local review scripts are in the ignored `tools/promo/out/` directory.
