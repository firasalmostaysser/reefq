# Reefq: notes for Claude and contributors

Read `README.md` for setup, architecture and deploy.

## Brand principles (internal: apply them everywhere, never state them in copy, marketing or UI)

Every feature, template, text, image, ad and social post must respect these. Do not announce or explain them to customers; simply build that way.

- **No music:** no music player, song field, audio track, or wording that mentions music or songs. Promo videos are exported without a music track.
- **No images of women:** no photo uploads of the couple, no portraits, silhouettes or illustrations of women in templates, ads or promo. Use paper, florals, patterns, architecture, calligraphy and objects instead.
- **Halal and modest (wara'):** no mention of alcohol, drinks lists with alcohol, dancing, nightlife or anything immodest. Wording stays dignified and family-oriented; blessings are welcome when fitting.
- **Printed cards with Quranic verses** carry a small note asking guests not to throw them away.

When a request would break one of these, build the closest compliant alternative and flag it to the owner in one line.

## Code conventions

- The invitation engine (`public/assets/engine.js`) is plain JavaScript shared by landing, studio and invitations; keep it framework-free and fast on low-end phones.
- Themes live in one list (`THEME_LIST` in engine.js) plus `netlify/lib/themes.mts`.
- Never commit `.env`. Secrets and bank details live in Netlify environment variables only.
- Run `npm test` and `npm run test:e2e` (with `npm run dev` running) before pushing.
- Outside agents (Cursor etc.) follow `AGENTS.md`; their branches must pass `npm run guard`, which fails when a UI change touches functionality. Owner exceptions: `GUARD_ALLOW=path,path npm run guard`.
