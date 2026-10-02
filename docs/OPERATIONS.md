# How Reefq runs, day to day

This is the operating manual: what happens from the first click to the day after the wedding, what is automatic, and the few things a person does. Read it once fully; after that, the **morning summary** tells you what to do each day.

## 1. The flow at a glance

```
Couple sees a post / an invitation footer / a friend's -10 % link
        │  (source is recorded: utm_source, ?ref=…)
        ▼
Landing page → order form (names, date, city, WhatsApp, offer, theme or website template)
        │  → Telegram: "Nouvelle commande RQ-XXXXX"            [automatic]
        ▼
Client space /commande/RQ-XXXXX?t=…
   1. "Préparez votre invitation": names, date, venue, Maps link, theme, text, guests (Signature/Prestige)
      → live preview on a phone frame, with their own names on the envelope       [self-service]
      → Telegram: "Invitation préparée"                                          [automatic]
   2. Bank transfer of the full price, then photo/PDF of the receipt
      → Telegram: "Justificatif reçu" with the receipt attached                   [automatic]
        ▼
YOU: check the bank account, Studio → Orders → Confirm payment                    [~2 minutes, the only daily task]
        │  → invitation goes live instantly (it was locked until now)              [automatic]
        ▼
Client space unlocks: invitation link, one personal link + QR per guest, live replies, Excel export
Couple sends links on WhatsApp themselves; guests open, reply; couple watches replies live    [self-service]
        ▼
Morning summary the day after the wedding: thank-you + review request + -10 % referral link   [1 tap]
```

Custom designs (Prestige or a "Modèle sur mesure" chosen on the website) add one step: the designer builds the Canva website from the couple's details and presses **Mark published** (see `docs/DESIGNER.md`). Until then the client space says the designer is working on it.

## 2. What is automatic and what is not

| Step | Who | Notes |
| --- | --- | --- |
| Order, client space, preview | Automatic | Couples can prepare everything before paying. |
| Payment | Couple (bank transfer) | Full price upfront by default (`DEPOSIT_PERCENT`, default 100). |
| Payment check | **You** | Look at the bank app, confirm in the Studio. Nobody can automate a Tunisian RIB transfer check without a payment gateway (see `docs/ROADMAP.md`). |
| Invitation goes live | Automatic | Confirming the payment unlocks it, or creates an empty one for the couple to fill. |
| Sending to guests | Couple | WhatsApp text and QR per guest are ready in their client space. Prestige: the team does it from Studio → Guests & RSVPs. |
| Reminders to unpaid couples | You, 1 tap | Prefilled WhatsApp links in the morning summary. |
| Stale unpaid orders | Automatic | Cancelled after 14 days without payment (reopen any time in the Studio). |
| Backups | Automatic | A full backup file arrives in Telegram every Monday. |
| Custom designs | Designer | Listed in the morning summary until published. |

## 3. Your daily routine (10 minutes)

**08:00, Telegram "Reefq · date"** (needs the Telegram variables, see `docs/LAUNCH_CHECKLIST.md`). It lists, in order:

1. **🧾 Virements à vérifier.** Open your bank app. For each one: Studio → Orders (the badge shows the count) → Review → check the amount and the reference `RQ-XXXXX` → **Confirm payment & open client space**. If you cannot find the transfer, type the reason and press **Proof not valid**: the couple sees it and can send a new receipt.
2. **⏳ Commandes non payées : relancer.** Tap each WhatsApp link, read, send. One reminder per order is enough; the system cancels it at 14 days.
3. **✍️ Payé, invitation pas encore préparée.** Tap, send. Most couples just need a nudge.
4. **🎨 Designs sur mesure à publier.** Forward to the designer if they are not on the Telegram group.
5. **📅 Mariages dans les 3 prochains jours.** Nothing to do unless the couple asks; good moment for a "bon courage" message.
6. **💛 Mariages d'hier.** Tap, send the thank-you. It asks for a Facebook review and carries their -10 % referral link.
7. **📊 Numbers.** Yesterday and this month.

During the day, Telegram also pings you for each new order, each prepared invitation and each receipt. You can confirm payments as they arrive instead of waiting for the morning.

No Telegram yet? Studio → Settings → **Preview today's summary** shows the same list.

## 4. Special cases

| Situation | What to do |
| --- | --- |
| Transfer received but amount is different | Enter the real amount in "Amount received" and confirm; add an internal note. If too low, ask the difference on WhatsApp before confirming. |
| Couple paid but wrote no reference | Find it by amount and name, confirm as usual. |
| Couple wants a refund before using it | Cancel the order in the Studio, refund by transfer, note it. After the invitation was sent to guests: no refund (say so in the terms). |
| Couple wants a change after sending | They edit it themselves in the client space ("Modifier"); guests see it on the same link. Guests are corrected in place (name, number, seats) and keep their link. If the couple and the studio edit at the same time, whoever saves second is asked to load the latest version or keep theirs; nothing is overwritten silently. For theme photos, stories in three languages, program with several events (henné, contrat), use the Studio → Design. |
| Second event (+49 DT) | Studio → Design → program (events). Ask the +49 DT on WhatsApp, note it on the order. |
| Express 24 h (+30 DT) | Self-service is instant; only applies to custom designs. Tell the designer. |
| Couple lost their client space link | Studio → Orders → find them → **Send client space on WhatsApp**. |
| Guest says "I can't reply" | With "Replies only from personal links" on, the shared link can't reply. Send them their personal link (client space or Studio → Guests). |
| Spam or test order | Studio → Orders → Review → **Delete order** (paid orders ask you to type the code). |
| Printed cards (Prestige) | Quote on WhatsApp. Cards with a Quranic verse carry the small note asking guests not to throw them away. QR cards: Studio → Deliver → printable QR cards. |

## 5. WhatsApp quick replies

Save these in WhatsApp Business → Settings → Business tools → Quick replies (type `/` to use them).

`/prix`
> Bonjour et merci pour votre message 🌿 Nos invitations digitales : Essentiel 149 DT, Signature 249 DT (chaque invité reçoit son lien à son nom, avec ses places réservées), Prestige dès 349 DT (design sur mesure). Paiement unique, invités illimités. Vous pouvez préparer votre invitation et voir l'aperçu avant de payer : https://reefq.netlify.app/?utm_source=whatsapp&utm_medium=reply

`/demo`
> Voici une invitation de démonstration, ouvrez-la comme vos invités : https://reefq.netlify.app/i/demo — touchez le sceau pour l'ouvrir 💌

`/paiement`
> Le paiement se fait par virement bancaire, en une fois. Dans votre espace client vous trouvez notre RIB et la référence à indiquer, puis vous envoyez la photo du reçu. Dès que nous confirmons (en général dans la journée), votre invitation est en ligne.

`/modif`
> Vous pouvez modifier votre invitation à tout moment depuis votre espace client (bouton « Modifier »). Vos invités voient les changements sur le même lien, sans rien renvoyer.

`/reponses`
> Chaque réponse arrive en direct dans votre espace client, avec le nombre de personnes et les remarques. Le bouton « Télécharger (Excel) » donne la liste pour le traiteur.

`/papier`
> Pour les invités qui préfèrent le papier, l'offre Prestige ajoute des cartes imprimées avec un QR code qui ouvre l'invitation. Nous vous faisons un devis selon le nombre de cartes.

Arabic (Tunisian):

`/soum`
> عسلامة ومرحبا بيكم 🌿 الدعوات متاعنا: Essentiel ب149 د، Signature ب249 د (كل ضيف يوصلو رابط باسمو وبعدد البلايص متاعو)، Prestige من 349 د (تصميم خاص بيكم). دفعة وحدة وضيوف بلا حدود. تنجمو تحضّرو الدعوة وتشوفوها قبل ما تخلصو: https://reefq.netlify.app/?lang=ar&utm_source=whatsapp&utm_medium=reply

`/khlas`
> الخلاص بتحويل بنكي مرة وحدة. في الفضاء متاعكم تلقاو الـRIB والمرجع، وبعد تبعثو تصويرة الوصل. أول ما نأكدو التحويل، الدعوة تولّي جاهزة.

Replace `reefq.netlify.app` by `reefq.com` once the domain is connected.

## 6. Where to look when something is wrong

- **Studio → Settings → Integrations**: which services are on.
- **Netlify → Logs → Functions** (`api`, `daily-digest`): errors with times.
- **PostHog**: JavaScript errors from couples' and guests' phones, and the order funnel.
- **Backups**: Telegram, every Monday. To inspect one locally: `npm run dev`, then `npm run seed -- reefq-backup-YYYY-MM-DD.json` (see `docs/DATA.md`).
