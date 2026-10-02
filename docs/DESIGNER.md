# Designer guide: welcome to Reefq

Reefq sells wedding invitations that open like a real envelope, on the guest's phone. Couples order on the website, prepare their invitation themselves and pay by bank transfer. Your work is what makes them choose us: the themes, the website templates, the custom sites for Prestige couples, and the visuals we post on Facebook and Instagram.

Read this once, then keep it open during your first week.

## 1. Brand rules (always, everywhere)

These are internal. Apply them; never write them in a post, a caption or on the site.

- **No images of women.** No photos, portraits, silhouettes, hands with faces, illustrations or AI images of women. No couple photos at all. Use paper, envelopes, wax seals, florals (jasmine, olive branches), patterns (zellige, kilim), architecture (arches, Sidi Bou Said doors, Kairouan), calligraphy and objects.
- **No music.** Videos are exported **without any audio track** (most people watch muted anyway; we use on-screen text). No music player, no song fields, no wording about music.
- **Halal and modest.** No alcohol, no glasses being raised, no dancing, no nightlife, nothing immodest. Wording is warm, dignified and family-oriented; blessings (Basmala, "Mabrouk", "baraka") are welcome.
- **Printed cards with a Quranic verse** carry a small note asking guests not to throw them away.

When in doubt, ask Firas before publishing.

## 2. Your accounts

| Tool | What for | Access |
| --- | --- | --- |
| **Canva** (Reefq team) | Card templates, website templates, custom sites, social media visuals | Firas invites you to the Reefq Canva team |
| **Reefq Studio** `https://reefq.netlify.app/studio/` | Publish custom sites and website templates, check couples' details | Firas gives you the password (never share it) |
| **Telegram group** "Reefq" | New orders, prepared invitations, the 08:00 summary that lists designs waiting for you | Firas adds you |
| **Cursor / Claude Code** (optional) | Coded themes in `public/assets/engine.js` | Only on a branch, following `AGENTS.md` |

## 3. Canva folders and naming

Two folders in the Reefq Canva team. The website picks them up automatically every 15 minutes (or Studio → Settings → **Sync now**).

| Folder | What goes in it | Shows on |
| --- | --- | --- |
| **Reefq** | Card designs (one invitation card per design; page 1 is shown, portrait 4:5 works best) | Landing page "designs", Studio |
| **Reefq Templates** | Sample Canva **websites** (see 5) | Landing page "Modèles sur mesure" |

**Design titles** decide how they appear: `Theme · Name | tags`

- `Sidi Bou Said · Arch blue | floral, blue`
- Add `[anim]` to also export a video, `[draft]` to keep it hidden while you work.

## 4. Custom site for a couple (Prestige or a chosen "Modèle sur mesure")

You will see these in the 08:00 summary under **🎨 Designs sur mesure à publier**, soonest wedding first.

1. **Read the couple's details.** Studio → Invitations → open the couple → Design. Their names (Latin and Arabic), date, time, venue, Maps link, wording and guest count are there; the couple filled most of it themselves. The template they chose is named in "Custom design".
2. **Build it in Canva** as a website: duplicate the chosen template (or start from our style), put in their details. Keep the brand rules.
3. **RSVP button.** Every site needs a button "Confirmer ma présence" whose link is `#rsvp` (any link containing "rsvp" works). Reefq turns it into the reply card with the guest's name. Do **not** add a Canva form: replies must go through Reefq.
4. **No audio, no Canva branding needed.** Reefq removes audio and the Canva footer from its copy, but do not add music anyway.
5. **Publish** in Canva (any `*.my.canva.site` address). Do not use "Canva Code" designs: the Studio refuses them.
6. **Studio → that invitation → Design → Look & feel → Custom design**: paste the published address, **Save**, then **Mark published**. The preview on the right must show the site. The couple's client space now shows their links.
7. **After any later edit in Canva:** publish again in Canva, then **Refresh copy** in the Studio. Guests never see the Canva address; they always open `reefq…/i/<couple>`.

**Quality check before Mark published** (open the site on your phone):

- [ ] Names, date, time, venue and city are exactly as the couple wrote them (Arabic spelling too)
- [ ] Works at 390 px wide; text never smaller than 14 px; Arabic is right-to-left and not cut
- [ ] The RSVP button works (opens the Reefq card)
- [ ] Loads in under 3 seconds on 4G (compress pictures, avoid huge videos)
- [ ] Brand rules respected

## 5. Website templates for the gallery

The gallery sells custom sites. Aim for **6 templates** by the end of week 2, each a different mood: olive/Zitouna, jasmine white, Sidi Bou Said blue, Kairouan, modern minimal, Sahara.

1. Build (or duplicate a finished client site and replace every private detail with sample names: "Yasmine & Karim", a sample venue and date).
2. RSVP button to `#rsvp` (it shows a sample reply card on the template page).
3. Publish in Canva, save the design in **Reefq Templates**.
4. After the next sync: Studio → Settings → **Website templates**: paste the published address → **Mark published**. **Upload picture** sets a nicer card image than the Canva thumbnail; **Hide** takes it off the site.

## 6. Social media visuals (with Firas)

The weekly plan and captions are in `docs/MARKETING.md`. Your part: 3 reels and 4 posts a week, plus story frames.

- **Reels:** 6 to 15 s, 1080×1920, no audio track, on-screen text in French or Tunisian Arabic, first second must show the envelope or the seal. Screen recordings of the real invitation (`/i/demo`, each theme at `/theme-preview.html?t=layl&open=1`) work very well.
- **Posts:** 1080×1350 (4:5). One idea per visual. Logo small, bottom.
- **Arabic:** use Amiri or Aref Ruqaa; check every word with Firas.
- Name exported files `YYYY-MM-DD-topic-fr.mp4` and drop them in the shared "Reefq Social" Canva folder.

## 7. Coded themes (later, optional)

Themes like Reefq, Layl or Zitouna are code in `public/assets/engine.js` + `invitation.css`. `jasmin-demo.html` shows where we want to go (animated jasmine theme). If you work on code with Cursor:

- Work on a branch, never on `main`. Follow `AGENTS.md` (visual changes only).
- Run `npm run guard` and `npm test` before asking for review.
- See every theme at `/theme-preview.html?t=<id>&open=1`.
- Local test data: `npm run dev` then `npm run seed`.

## 8. Your first week

| Day | Goal |
| --- | --- |
| Mon | Accounts (Canva team, Studio, Telegram). Open the demo `/i/demo` on your phone. Read this guide, `docs/OPERATIONS.md` sections 1–2 and `docs/MARKETING.md`. Order a test invitation yourself on a deploy preview or locally to feel the couple's path. |
| Tue | Canva brand kit: logo, colours (teal `#147d82`, gold `#a8864a`, ivory `#f7f4ed`), fonts (Cormorant Garamond, Figtree, Amiri). Social templates: post, reel cover, story. |
| Wed | Website template 1 and 2, published and listed. |
| Thu | Week 1 social batch: 3 reels + 4 posts (see the calendar). |
| Fri | Website template 3. Review with Firas: what sells, what to change. |

Questions: Telegram group or WhatsApp to Firas.
