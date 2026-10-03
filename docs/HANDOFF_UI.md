# Handoff: UX agent → UI agent (GPT 5.6 sol), 3 October 2026

Branch: `design/round-1`. Read `AGENTS.md` first and follow it strictly: visual work only, keep every `id`, class used by JavaScript, form `name` and `data-*` hook, never touch the frozen engine functions, never push. Before you hand back: `npm run guard` and `npm test`, then commit on this branch.

## 1. What the UX pass changed

Four files, all allowed by the guard:

| File | What changed |
|---|---|
| `public/commande/index.html` | Client space restructured: header (eyebrow, names, meta + status pill), 4-step `#track`, then one card per step. The brief form is regrouped into six sections: **Les mariés** (groom first), **Qui invite ?**, **Le jour J** (date + time on one row, Maps full width, "Répondre avant" next to "Places par réponse" – `#b-seats-wrap` moved here from the form foot), **Le style** (theme, language, "Parties affichées" as pill checkboxes), **Le texte** (tone, closing line, opening lines, the three textareas under a `<details>`, story), **Vos invités**. Save bar `.bactions` is sticky at the bottom of the form. Payment card split into two visible sub-steps (`.paysteps > .pstep`: transfer, then receipt). Arabic label spans carry `lang="ar" dir="rtl"`. |
| `public/assets/commande.css` | Rewritten on the storefront tokens. Step track with numbered dots (teal tick = done, gold ring = now). Desktop ≥ 960 px: when the preview is open (`#b-pv:not([hidden])`) the card becomes a 2-column grid, phone sticky on the right (`:has()`, progressive). Mobile ≤ 560 px: single column, primary button full width. |
| `public/studio/index.html` | Design form grouped under four small gold stage labels (`.stage`: 1 · Who and when, 2 · Words, 3 · Look, 4 · Replies; the "Words" label has `data-theme-only` so it hides in Canva mode with its fieldset). Inline styles moved into classes (`.btnrow`, `.phead`, `.paste-row`, `.st-add`, `.od-close`, `.od-note`, …). Arabic textareas got `lang="ar"`. Nothing renamed. |
| `public/studio/studio.css` | Light palette switched from grey-green to the same ivory/teal/gold as the storefront (dark mode unchanged). Duplicate rule blocks removed, dead photo rules removed (they were squeezing the phone-number `.ph` wrapper to 74 px). Tabs scroll sideways on phones with an end fade; `#bar` (couple chips + Save) sticky under the header on desktop. Orders still collapse to cards on phones. |

Checked in the browser at 360 px (French UI with Arabic fields, RTL inputs in Amiri) and 1280 px, in both client-space states (awaiting payment with the form open; paid with the form closed). The studio was checked on the Design and Guests tabs and the mobile preview sheet.

## 2. Design direction to keep consistent

**Tokens** (defined in `site.css`, mirrored in `studio.css`; use the variables, never hard-code):

- Paper `--bg #f7f4ed`, card `--surface #fffdf8`, ink `--fg #132829`, muted `--muted #586a68`, hairline `--line #e2dccd`.
- Accent teal `--accent #147d82` (buttons, done states, links), gold `--gold #a8864a` (eyebrows, "now" step, stage labels, counters; never for buttons), soft teal `--soft #e8f1ef` (selected chips, pills).
- Status greens/ambers/reds stay as pills only (`.pill.good/.warn/.bad`).

**Type:** Cormorant Garamond 500–600 for titles and legends (h1 `clamp(30px,6vw,46px)`, card h2 23–27 px, legends 19 px), Figtree for UI (14–16 px body, 12–13 px labels and captions, weight 600 for labels), Amiri for Arabic (inputs 17 px, labels 15 px, line-height 1.5–1.9). Arabic titles on the landing use Aref Ruqaa. No letter-spacing on Arabic.

**Spacing and shape:** 16 px between blocks, 12 px between fields, 8 px between chips/buttons. Cards 18 px radius (16 on phones), fieldsets 14 px, fields 10 px, buttons and chips 999 px. Borders are 1 px `--line`; shadows are almost invisible (`0 14px 36px -30px rgb(19 40 41/.25)`). Fieldsets sit on `color-mix(var(--bg) 55%, var(--surface))` so they read as a group without heavy chrome.

**Patterns used:** numbered step track (`.track`), gold uppercase eyebrows/stage labels at 11–12 px with `.14–.2em` tracking, pill checkboxes (`.chks .chk:has(:checked)`), compact bilingual rows (French left, Arabic pushed to the end edge). Reuse these rather than inventing new ones.

**Rules you also inherit:** `dir="rtl" lang="ar"` on every Arabic field and text, `<bdi lang="ar" dir="rtl">` for Arabic inside French; groom first by default; check every screen in Arabic at 360 px; no images of women, no music, no alcohol or nightlife anywhere (never mention these rules in copy).

## 3. Your task (UI agent)

1. **Invitation themes** (`public/assets/invitation.css`, theme visuals in `engine.js` only where `AGENTS.md` allows: `sprig`, `linerTile`, `sealCanvas`, theme visuals, `render` markup). Polish the ten existing themes; keep every theme id. Open the invitation in Arabic (language switch عربي) at 360 px for each theme.
2. **Style the "who invites" and closing blocks** in `invitation.css`: `.rq-hosts`, `.rq-hosts-lead` (the lead line such as « Monsieur et Madame … » / « السيد … وحرمه »), and `.rq-closing` (du'a or closing phrase). Current rules are minimal (lines 72–78): make the hosts read as the traditional card header above the couple's names, give the lead a quieter weight, and let the closing feel like a blessing (Arabic not italic, generous line-height). Keep the text exactly as the engine emits it: restyle markup, never wording.
3. **Refresh the landing** (`public/assets/site.css`, `public/index.html`, copy in `landing-i18n.js`, visual effects only in `landing.js`). Keep every hook (`#of`, `#o-names`, `#o-phone`, `#o-date`, `#o-city`, `#o-plan`, `#o-err`, `.themes`, `.phone`, `.screen`, `.vp`, `.lsw`, …). Note that `site.css` sets `order` on `.eyebrow` and `h1` under 900 px; the client space counters this in `commande.css`, so if you change those rules check `/commande/` too.
4. Run `npm run guard` and `npm test`, commit on `design/round-1`.
5. **End with a handoff note for the Visuals agent** (same shape as this file, e.g. `docs/HANDOFF_VISUALS.md`): what you changed, the palette/type/spacing to match, which theme art, posters and silent videos are needed under `public/assets/media/` and `tools/promo/`, with the media rules from `AGENTS.md` (MP4 + WebM, no audio track, 720p, < 3 MB, poster image, `prefers-reduced-motion`; no women, no music, no alcohol; posters show **reefq.netlify.app**).
