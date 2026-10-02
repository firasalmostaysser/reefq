# Reefq: on-demand Canva designs + local themes (handoff for Claude Code)

Brief from a Cowork session (30 Sep – 1 Oct 2026). Put this file at the repo root, then tell Claude Code:
"Read REEFQ_THEMES_HANDOFF.md, explore the repo, and propose a plan for Phase 1 before coding."

## 1. Product decision (final, 1 Oct)

- Reefq keeps **one flow** for every invitation: order → payment (bank transfer/RIB) → Studio (couple data) → guest list → personal guest links → delivery (WhatsApp/QR) → RSVP → tracking. **Do not change this flow.**
- Each invitation gets a **design source**:
  1. **Local theme** (existing: Reefq, Old Money; later new coded themes).
  2. **On-demand Canva design**: the designer calls the couple, builds a custom Canva *website*, and publishes it to an address Studio reserved.
- Canva sites hold **visuals only**. All config, policies, guest management, RSVP, QR, tracking stay in Reefq, so a policy change never requires editing Canva designs.
- Video reels: dropped.

## 2. What exists already

- Site: reefq.netlify.app (Netlify site id `2b315793-ace9-4606-ae9d-06edba774b73`). Studio at `/studio` (tabs: Invitations, Design, Guests & RSVPs, Deliver, Orders, Settings). Guest invitation pages at `/i/<slug>`.
- Canva app "reefq" (Canva Developers app `AAHOGKGL5Gg`): scopes `design:meta:read`, `design:content:read`, `folder:read`; redirect `https://reefq.netlify.app/auth/canva/callback`; OAuth tested OK (`/auth/canva/start`).
- Netlify env: `CANVA_CLIENT_ID=OC-AaDzgrCKvWJS`, `CANVA_CLIENT_SECRET` (secret, set), `CANVA_FOLDER_ID=FAHWsmZKVTk` (Canva folder "Reefq").
- Existing sync (Studio → Settings → Sync now) exports each design in the folder as PNG.
  - **Bug:** Canva *website* designs only support **PDF** export (verified via API: website → `pdf` only; regular design → pdf/png/jpg/gif/mp4/pptx). Sync fails with `png export not supported for requested page(s)`. Fix: use the design's `thumbnail.url` from the designs/folder API for previews, never PNG export for websites; isolate errors per design.
- `jasmin-demo.html` (next to this file): prototype of a coded animated theme (envelope opening, RSVP, countdown, data binding). Reference only for future local themes.

## 3. Domain plan

- `reefq.com` → Netlify (Reefq site, Studio, `/i/...`, `/r/...`). Currently the site runs on reefq.netlify.app; connecting reefq.com to Netlify is a separate DNS step.
- `invite.reefq.com` → Canva (requires Canva Pro/Teams/Business; up to 5 own domains, unlimited sites per domain). DNS: record given in Canva's "connect existing domain" wizard (typically an A record, host `invite`; Canva docs list `103.169.142.0` for A records). Activation up to 72 h.
- Do **not** proxy Canva under a path of reefq.com (fragile).
- Unknown, check at first publish: how Canva names each site's path on a connected domain. If it can't be chosen, Studio stores whatever final URL the designer pastes.

## 4. Target behaviour

### 4.1 Studio
- Invitation gets `designSource: "theme" | "canva"`, plus for canva: `canvaUrl`, `canvaDesignId?`, `canvaStatus: "waiting_designer" | "published"`, `reservedPath` (e.g. `olfa-ahmed`).
- Design tab: choose source. For canva, show the reserved address to give the designer, a field to paste/confirm the published URL, and a "Mark published" action.

### 4.2 Guest experience (same links as today)
- Guest opens `reefq.com/i/<slug>?<guest token>` (existing personal link).
- If source = canva: Reefq records the open, remembers the guest (cookie/localStorage with guest token), then:
  - **(a) preferred:** full-screen iframe of `canvaUrl` + a small Reefq bar ("Bonjour <guest>", "Confirmer ma présence"), **if Canva allows framing**;
  - **(b) fallback:** short Reefq greeting screen → redirect to `canvaUrl`.
- Every Canva site includes an RSVP button linking to `reefq.com/r/<slug>`. That page reads the remembered guest token, so the guest doesn't retype their name, and posts to the existing RSVP backend. No token → guest picks their name from the list or types it.

### 4.3 Template gallery (new sync)
- Designer duplicates a client site, replaces private data with sample data, publishes to e.g. `invite.reefq.com/t/<template-slug>`, saves the design in a Canva folder "Reefq Templates" (new env var, e.g. `CANVA_TEMPLATES_FOLDER_ID`).
- Sync lists that folder (title, thumbnail, design id, updated_at). Published URL isn't in the API → derive from title slug or let Studio set it once per template.
- Public "Modèles" page on reefq.com: cards (thumbnail, name) → live preview in a phone frame (iframe if allowed; fallback: open in new tab, or nightly headless screenshots/scroll video).
- Couple picks a template → order notes the template → designer duplicates and personalises it (back to 4.1).

## 5. Phases

**Phase 0: checks (do first)**
1. Can a `*.my.canva.site` page be iframed? `curl -sI https://mellowcreamstudio.my.canva.site/mellowcreamstudiog01 | grep -iE "x-frame-options|content-security-policy"` (look for `frame-ancestors`). Decides 4.2 (a) vs (b) and the gallery preview method.
2. Explore the repo: data model for invitations/guests/RSVP, `/i/<slug>` rendering, guest token mechanism, Studio Design tab, Canva sync code, storage used (DB? Netlify Blobs?).

**Phase 1: Canva as a design source**
3. Fix the website-export sync bug (thumbnail fallback, per-design errors).
4. Add `designSource` + Canva fields to invitations; Studio UI for them.
5. `/i/<slug>` branch for canva (wrapper or redirect) with open tracking + guest memory.
6. `/r/<slug>` RSVP page that recognises the remembered guest.

**Phase 2: templates gallery**
7. Templates folder sync + template records.
8. Public "Modèles" page with live previews.
9. Link template choice into the order flow.

**Manual setup Firas does in parallel**
- Canva Pro (or Teams) on the Reefq Canva account.
- Find where reefq.com DNS is managed; connect reefq.com to Netlify; connect `invite.reefq.com` to Canva.
- Designer: publish one test site to `invite.reefq.com`, include an RSVP button to `reefq.com/r/test`.
- Designer guide (to write): duplicate, replace private data, RSVP button link, publish, paste URL in Studio.

## 6. Constraints
- Never commit secrets. Canva client secret only in Netlify env.
- Keep existing local themes and flow working; additive changes only.
- French UI copy (Arabic where existing screens use it).
