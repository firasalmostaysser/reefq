# Handoff: UI agent → Visuals agent (Gemini 3.8 Flash), 3 October 2026

Branch: `design/round-1`. Stay on this branch. Do not push, switch branches or install packages. Read `AGENTS.md` first; visual work only. Before handing back, run `npm run guard` and `npm test`, then commit.

## 1. What the UI pass changed

- `public/assets/invitation.css`: the ten saved theme ids now share a more polished stationery system but have distinct character. Reefq has a teal/gold double keyline; Zitouna warm linen and lace dots; Yasmine a pale blue garden arch; Layl a restrained celestial frame; Sidi Bou Said a cobalt arch; Kairouan copper geometry; Old Money an engraved espresso frame; Sauge rounded botanical paper; Bordeaux a blush arch; Sahara a sun-washed Tozeur rhythm.
- `.rq-hosts`, `.rq-hosts-lead` and `.rq-closing` now read as a traditional invitation header and blessing. Arabic is never italic and has a generous line-height.
- `public/index.html` and `public/assets/site.css`: the landing is now a quiet Tunisian paper atelier. The live envelope remains the hero; numbered section markers, a concierge-like four-step path, folio feature cards, calmer offer cards, a two-column FAQ and a teal reservation panel establish the visual rhythm.
- Landing-only rules are scoped under `.landing`, so the client space keeps the UX agent's layout.
- No `engine.js` art was changed in this pass. That is the main opportunity for your visual layer.

Checked at 360 px in French and Arabic, at 1280 px in French, and with all ten open and closed Arabic themes at 360 px. All ten themes had equal 360 px bounds and no horizontal overflow.

## 2. Style to match

**Palette:** ivory paper `#f7f4ed`, warm card `#fffdf8`, deep ink `#132829`, muted grey-teal `#586a68`, hairline `#e2dccd`, Reefq teal `#147d82`, antique gold `#a8864a`, soft teal `#e8f1ef`.

**Type:** Cormorant Garamond for editorial Latin titles, Figtree for UI and captions, Amiri for Arabic body text, Aref Ruqaa for Arabic display text, Pinyon Script only where the invitation calls for a handwritten accent.

**Visual language:** generous negative space, cotton paper, fine 1 px rules, blind emboss, sparse botanical or architectural line art, natural wax and one controlled metallic highlight. Keep ornament near the edges so names and Arabic diacritics remain clear. Avoid generic luxury gradients, heavy drop shadows and dense floral frames.

**Shape and rhythm:** 18–28 px cards, 999 px pills, near-invisible shadows, 8 px micro-gaps, 16 px block gaps, 32–64 px section breathing room. The landing's arched demo stage and the theme-specific card frames are the reference.

## 3. Your task

### A. Theme art in `engine.js`

Work only in the visual areas permitted by `AGENTS.md`: `sprig`, `linerTile`, `sealCanvas`, theme visuals and visual `render` markup. Do not touch the frozen RSVP/data functions, `window.ReefqInvite` keys or any existing theme id.

Build lightweight vector/canvas details that reinforce the CSS:

- **Reefq:** precise zellige star or monogram linework; teal with one antique-gold edge.
- **Zitouna:** asymmetrical olive twig and a very fine heritage-lace repeat.
- **Yasmine:** airy jasmine blossom with plenty of white space.
- **Layl:** sparse gilded stars on midnight paper; no busy galaxy effect.
- **Sidi Bou Said:** cobalt door/arch geometry with a small bougainvillea accent.
- **Kairouan:** manuscript-like copper geometry or carved-arch detail.
- **Old Money:** engraved laurel, blind emboss or restrained heraldic diamond.
- **Sauge:** pressed olive/sage branch in soft, desaturated greens.
- **Bordeaux:** burgundy and rose-gold botanical line, not a dense bouquet.
- **Sahara:** Tozeur brick rhythm, a palm-frond line or sun-washed geometric edge.

Keep art deterministic, fast on low-end phones and visually quiet behind Arabic. Recheck every theme open and closed in Arabic at 360 px.

### B. Posters in `public/assets/media/`

Use the existing source stack in `tools/promo/` (`poster.css`, `poster_scene.js`, `render_posters.cjs`) and bring it in line with the new landing. Export final posters as WebP under `public/assets/media/`; do not leave the only usable output in `tools/promo/out/`.

Create at least:

- `poster-envelope-fr.webp`
- `poster-envelope-ar.webp`
- `poster-personal-link.webp`
- `poster-theme-suite.webp`
- `poster-offers.webp`

Every poster must show **reefq.netlify.app** clearly, with safe margins and enough contrast to remain readable on a phone. Prefer the existing 4:5 and 9:16 compositions: paper field, one strong headline, one product moment, one teal action pill. Use invitation UI or compliant object/architecture imagery only.

### C. Silent promo loops

Refresh the existing scenes in `tools/promo/promo_scene.js` and `render_videos.cjs`, then export matching assets under `public/assets/media/`:

- envelope opening in French;
- personal invitation in Arabic;
- a short theme-suite or Layl loop.

For each loop provide MP4 (H.264) and WebM, 720p maximum, 6–15 seconds, ideally under 3 MB, and a matching WebP poster. Strip audio explicitly and verify there is no audio stream. If embedded, use `muted autoplay loop playsinline preload="none"` and show only the poster when `prefers-reduced-motion` is enabled.

## 4. Guardrails you inherit

- No images or illustrations of women, no couple portraits, no music or audio track, no alcohol, dancing or nightlife. Keep these as internal production rules, never customer-facing copy.
- Use florals, paper, envelopes, wax, calligraphy, zellige, kilim, arches, doors and Tunisian architecture.
- Never retype or alter Arabic wording. Preserve `lang="ar" dir="rtl"` and groom-first ordering.
- Never remove or rename an `id`, JavaScript class, form `name` or `data-*` hook.
- Do not edit any forbidden file listed in `AGENTS.md`. Do not install a Playwright browser or any package to render assets.

## 5. Definition of done

1. Theme art matches the CSS character map and stays light enough for low-end phones.
2. All final posters are WebP in `public/assets/media/` and visibly include **reefq.netlify.app**.
3. Each video has MP4 + WebM + poster, no audio stream, correct dimensions and acceptable file size.
4. Arabic invitation screens pass at 360 px with no clipping or overflow.
5. `npm run guard` and `npm test` pass; commit on `design/round-1`, do not push.
