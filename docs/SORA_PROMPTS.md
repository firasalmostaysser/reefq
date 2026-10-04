# Theme intro videos and inside backgrounds (Sora / ChatGPT images)

Owner makes these in ChatGPT (Sora for video, image generation for stills), then drops the files in
`public/assets/media/themes/<id>/`. Codex wires them into the invitation (see `docs/CODEX_BRIEF_ROUND2.md`).

## Rules for every generation (check each result before keeping it)

- **No people at all:** no women, no couple, no hands, no silhouettes, no faces in reflections or paintings.
- No alcohol, glasses, candles on a dinner table with drinks, dancing, nightlife.
- No text, letters, names or logos in the image (names are added live by Reefq; AI text comes out garbled).
- Video: **9:16 vertical, 5 seconds, static camera or a very slow push-in**, no cuts. Delete any audio track.
- Keep the centre third calm: the guest's name and the seal sit there.

## Shared video structure (paste first, then the theme block)

> Vertical 9:16 macro product shot, photorealistic, soft studio light, shallow depth of field, static camera.
> A closed luxury paper wedding envelope fills the whole frame, seen from directly above, with a wax seal in the exact centre.
> Seconds 0–1: completely still (this frame is the poster). Seconds 1–3.5: the embossed relief motifs slowly light up from
> within with a warm glow, the glow travels outward from the seal along the motifs. Seconds 3.5–5: the top flap opens
> upward toward the camera and soft light floods out, the last frame is almost entirely bright, blank warm paper.
> No people, no hands, no text, no letters. Elegant, quiet, timeless.

## Theme blocks

| id | Add to the shared prompt |
|---|---|
| reefq | Ivory cotton paper with deep teal blind-embossed eight-point zellige stars along the edges, a teal wax seal with a gold rim; the glow is soft gold tracing the star lines. |
| zitouna | Warm linen-textured ivory paper, embossed asymmetric olive branches with small olives climbing from the bottom corners, antique-gold olive-green wax seal; the leaves glow gold one by one. |
| yasmine | Pale blue-white paper, delicate embossed jasmine blossoms scattered sparsely, a white pearl wax seal; each blossom softly glows white like moonlight. |
| layl | Midnight navy paper with gold-foil stars and a thin crescent moon, a deep gold wax seal; the stars twinkle and light up in sequence, faint gold dust drifts as the flap opens. |
| sidi | Whitewashed textured paper shaped like a Sidi Bou Said doorway, embossed cobalt-blue studded arch door motif, a single bougainvillea sprig in magenta, a cobalt wax seal; the door studs glow and the flap opens like a door into bright Mediterranean light. |
| kairouan | Terracotta-ochre handmade paper, embossed copper geometric Kairouan mosque-carving and kilim patterns, a copper wax seal; the geometry glows copper line by line like an illuminated manuscript. |
| oldmoney | Heavy cream cardstock with a deckled edge, engraved espresso-brown laurel wreath border, a dark brown wax seal with a classic crest; a soft warm candle-like glow sweeps across the engraving. |
| sauge | Soft sage-green linen paper with pressed dried sage and olive leaves embossed in relief, a pale sage wax seal; the leaves glow gently in soft daylight. |
| bordeaux | Deep burgundy velvet-textured paper, embossed rose-gold peony and leaf linework, a rose-gold wax seal; the rose-gold lines shimmer and glow warm pink-gold. |
| sahara | Sand-coloured paper with embossed Tozeur brick-relief geometric border and a palm-frond line, a terracotta wax seal; the brick pattern glows like desert sunset light. |

## Inside backgrounds (image generation, 1080 × 1920, then one wide 1920 × 1080 variant)

> Soft watercolour illustration on textured cold-press paper, very light and airy, mostly empty pale paper in the centre
> for text, decorative elements only along the edges and corners. No people, no text, no letters.

| id | Add |
|---|---|
| reefq | faint teal zellige tiles and a thin gold line border |
| zitouna | olive branches and a distant olive grove at the bottom edge |
| yasmine | jasmine sprigs falling from the top corners, pale blue wash |
| layl | deep navy wash with tiny gold stars, crescent in a top corner (dark background, text will be gold) |
| sidi | white walls, cobalt door and window frames at the edges, bougainvillea spilling from the top |
| kairouan | ochre wash, Kairouan arches and kilim geometric bands at the bottom |
| oldmoney | cream paper, engraved-style laurel corners in espresso ink |
| sauge | sage and eucalyptus leaves in the corners, linen texture |
| bordeaux | blush wash, burgundy and rose-gold peony corners |
| sahara | sand wash, Tozeur brick pattern and palm fronds at the bottom edge |

Also make one **venue illustration** per theme (square, 1080 × 1080): a watercolour Tunisian place with no people:
a dar courtyard with a fountain, a Sidi Bou Said terrace, an olive grove at golden hour, a Djerba houch, a Tozeur oasis.

## Files to drop in `public/assets/media/themes/<id>/`

Name the raw downloads `intro-raw.mp4`, `inside-raw.png`, `inside-wide-raw.png`, `venue-raw.png`, then run:

```
tools/media/encode-theme.sh <id>
```

It makes `intro-v1.mp4`, `intro-v1.webm` (720 × 1280, no audio, about 1.5 MB), `poster-v1.webp` (the first frame),
`inside-v1.webp`, `inside-wide-v1.webp`, `venue-v1.webp`, and deletes the raw files. After replacing a video, bump the
version (`v2`) so guests' phones fetch the new one (media is cached for a year).

Order: do **layl** and **kairouan** first (the Codex pilot), then the rest.
