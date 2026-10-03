# Paste into Gemini 3.8 Flash: Reefq visual production brief

You are the Visuals agent for Reefq, a Tunisian digital wedding-invitation service. Work from the current `design/round-1` branch and read `AGENTS.md` plus `docs/HANDOFF_VISUALS.md` before touching files.

Reference for merchandising quality only: https://linktr.ee/mellowcreamstudio

Do not copy that studio's layouts, names, motifs or products. Adapt only the useful qualities: realistic material photography, coherent collection families, strong mobile mockups, restrained old-money editorial styling and clear product presentation.

## Product and audience

Reefq invitations open like a real envelope on a phone. They include a wax seal, personal guest links, reserved seats, programme, Maps links, countdown and live RSVP in French, Arabic and English. The primary audience is Tunisian families. Arabic invitation screens must be excellent at 360 px and the groom's name appears first by default.

## Non-negotiable production rules

- No women, men, couples, portraits, silhouettes, faces or hands.
- No music, audio tracks, instruments, song controls or music-related copy.
- No alcohol, dancing, nightlife or immodest imagery.
- Use paper, envelopes, wax, foil, jasmine, olive branches, zellige, kilim, Tunisian arches, Sidi Bou Said doors, Kairouan details, Tozeur brick, calligraphy tools and objects.
- Do not generate Arabic lettering, Quranic verses, names, dates or fake logos inside images. Leave intentional blank text zones; the product overlays reviewed HTML text later.
- Never alter existing theme ids, invitation wording, JavaScript hooks or functional code.
- All videos must contain video only: no audio stream.

## Art direction

The visual world is a Tunisian paper atelier:

- warm ivory cotton paper with visible but subtle fibres;
- natural wax with imperfect edges and controlled highlights, never plastic;
- one fine antique-gold rule rather than shiny gold everywhere;
- deep teal ink and sparse botanical or architectural details;
- warm Mediterranean daylight, believable contact shadows and consistent light direction;
- generous negative space and edge-weighted ornament so Arabic diacritics remain clear;
- editorial, dignified and tactile rather than generic “luxury wedding” stock art.

Avoid dense floral frames, fake calligraphy, illegible generated text, excessive beige, oversaturated flowers, impossible folds, floating objects, mirrored symmetry and heavy glow effects.

## Existing style and assets

Match these existing assets under `public/assets/media/`:

- `reefq-atelier-hero.webp`
- `reefq-sidi-collection.webp`
- `reefq-map-detail.webp`
- `reefq-paper-shadow.webp`
- `reefq-paper-atelier-poster.webp`
- `reefq-collections-ar-poster.webp`

The code palette is ivory `#f7f4ed`, card `#fffdf8`, ink `#132829`, muted `#586a68`, teal `#147d82`, gold `#a8864a`, soft teal `#e8f1ef`.

## Theme collection covers

Generate one text-free 3:4 WebP cover for each existing id, sized around 900 × 1200 px:

1. `theme-reefq.webp` — ivory envelope, teal wax, antique-gold zellige liner, exacting signature look.
2. `theme-zitouna.webp` — warm linen, asymmetrical olive twig, antique lace detail, muted olive wax.
3. `theme-yasmine.webp` — white jasmine, cool mist blue, airy arched card, abundant white space.
4. `theme-layl.webp` — midnight paper, sparse gilded stars, gold wax, controlled low-key lighting.
5. `theme-sidi.webp` — whitewashed stone, cobalt arched door geometry, one bougainvillea accent.
6. `theme-kairouan.webp` — terracotta and copper, carved arch or manuscript geometry, warm mineral paper.
7. `theme-oldmoney.webp` — cream and espresso, blind emboss, engraved laurel or diamond, tailored stationery.
8. `theme-sauge.webp` — desaturated sage linen, pressed olive/sage branch, soft natural shadow.
9. `theme-bordeaux.webp` — blush ivory, burgundy wax, restrained rose-gold botanical line.
10. `theme-sahara.webp` — sand paper, Tozeur brick rhythm, terracotta wax, palm-frond shadow.

Every cover must show a plausible physical invitation suite, not a flat graphic template. Keep the invitation face blank.

## Additional still assets

Generate:

- two 16:9 cotton-paper section backgrounds with clear text-safe centers;
- one 4:3 close-up of natural wax, foil edge and paper fibres;
- one 4:3 still showing a phone with an abstract map pin beside a blank invitation;
- one 4:3 still showing a phone invitation beside a tidy RSVP summary, using shapes only and no generated names;
- one 4:5 offer poster and one 9:16 story poster.

Posters must show the exact readable address `reefq.netlify.app`. Add the address as designed text only if you can reproduce it exactly; otherwise leave a safe footer band and tell the UI agent to overlay it in code.

## Motion assets

Create three restrained 6–12 second loops:

1. envelope opening and wax reveal;
2. slow collection transition across Reefq, Sidi Bou Said and Layl;
3. invitation → venue map → RSVP summary.

Deliver each as:

- H.264 MP4;
- WebM;
- matching WebP poster;
- 720p maximum;
- under 3 MB when possible;
- no audio stream;
- no abrupt cuts, camera shake or fake hand interaction.

The page will embed videos with `muted autoplay loop playsinline preload="none"` and show the poster for `prefers-reduced-motion`.

## Workflow

1. First return a compact contact sheet showing all ten theme directions together.
2. Wait for approval of the visual family.
3. Generate the ten covers in consistent batches with the same light, lens and material realism.
4. Generate section stills and posters.
5. Generate silent loops and verify dimensions, size and absence of audio.
6. Put final WebP/MP4/WebM assets under `public/assets/media/`.
7. If code integration is requested, change only visual files allowed by `AGENTS.md`.
8. Check French and Arabic at 360 px, run `npm run guard` and `npm test`, commit on `design/round-1`, and do not merge to `main`.

Return a manifest listing every generated filename, dimensions, file size, prompt used and where it should appear on the landing page.
