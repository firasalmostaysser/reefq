/* The morning summary sent to the team (Telegram/email) by daily-digest.mts, and the order clean-up it does.
   Pure: everything comes in as arguments, so test/digest.test.mjs runs it offline.
   Messages to couples are prefilled WhatsApp links: the team taps, checks, sends. */

export const AUTO_CANCEL_DAYS = 14;   // unpaid orders older than this are cancelled (the client can still be reopened in the studio)
const DAY = 864e5, TZ_MS = 3600e3;     // Tunisia is UTC+1 all year

export const tnDate = (t: number) => new Date(t + TZ_MS).toISOString().slice(0, 10);
export function waPhone(raw: unknown) {
  let n = String(raw || '').replace(/[^0-9]/g, '');
  if (n.length === 8) n = '216' + n;
  if (n.startsWith('00')) n = n.slice(2);
  return n.length >= 8 ? n : '';
}
export const waLink = (phone: unknown, text: string) => { const n = waPhone(phone); return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : ''; };

type Input = { orders: any[]; invitations: any[]; rsvpKeys: string[]; now: number; site: string };
export type Digest = { text: string; autoCancel: string[]; empty: boolean };

export function buildDigest({ orders, invitations, rsvpKeys, now, site }: Input): Digest {
  const today = tnDate(now), yesterday = tnDate(now - DAY), inDays = (n: number) => tnDate(now + n * DAY);
  const inYesterday = (t: number) => !!t && tnDate(t) === yesterday;
  const age = (t: number) => (now - (t || now)) / DAY;
  const invById = new Map(invitations.map(i => [i.id, i]));
  const clientLink = (o: any) => `${site}/commande/${o.code}?t=${o.token}`;
  const first = (o: any) => String(o.names || '').trim() || 'Bonjour';
  const out: string[] = [], autoCancel: string[] = [];
  const section = (title: string, lines: string[], max = 10) => {
    if (!lines.length) return;
    out.push(`${title} (${lines.length})`, ...lines.slice(0, max), ...(lines.length > max ? [`… et ${lines.length - max} autres dans le Studio`] : []), '');
  };

  /* 1. Receipts waiting: the only thing that blocks a couple */
  const proofs = orders.filter(o => o.status === 'proof_sent');
  section('🧾 Virements à vérifier', proofs.map(o => `• ${o.code} · ${o.names} · ${o.deposit} DT · reçu il y a ${Math.max(1, Math.round(age(lastAt(o, 'proof_sent')) * 24))} h`));

  /* 2. Unpaid orders: a reminder from day 1; cancelled after AUTO_CANCEL_DAYS */
  const unpaid = orders.filter(o => o.status === 'awaiting_payment' || o.status === 'rejected');
  for (const o of unpaid) if (age(o.createdAt) >= AUTO_CANCEL_DAYS && age(o.updatedAt) >= 3) autoCancel.push(o.code);
  section('⏳ Commandes non payées : relancer', unpaid.filter(o => !autoCancel.includes(o.code) && age(o.createdAt) >= 0.8).map(o => {
    const link = waLink(o.phone, `Bonjour ${first(o)}, c'est Reefq 🌿 Votre invitation vous attend ici : ${clientLink(o)}\nVous pouvez la préparer et voir l'aperçu dès maintenant. Une question sur le virement ? Répondez simplement à ce message.`);
    return `• ${o.code} · ${o.names} · ${o.plan} · ${Math.floor(age(o.createdAt))} j${link ? `\n  ${link}` : ''}`;
  }));
  if (autoCancel.length) out.push(`🗂 Annulées automatiquement (plus de ${AUTO_CANCEL_DAYS} jours sans paiement) : ${autoCancel.join(', ')}`, '');

  /* 3. Paid, but the couple has not prepared their invitation */
  const noBrief = orders.filter(o => o.status === 'paid' && !o.briefAt && age(o.paidAt) >= 1 && !(o.inviteId && hasDetails(invById.get(o.inviteId))));
  section('✍️ Payé, invitation pas encore préparée', noBrief.map(o => {
    const link = waLink(o.phone, `Bonjour ${first(o)}, merci encore pour votre confiance ! Il ne reste qu'à remplir les détails de votre invitation (lieu, heure, invités) ici : ${clientLink(o)}\nElle est prête à envoyer dès que c'est fait.`);
    return `• ${o.code} · ${o.names}${link ? `\n  ${link}` : ''}`;
  }));

  /* 4. Custom designs the designer still has to publish, soonest wedding first */
  const live = invitations.filter(i => !i.archived);
  const waiting = live.filter(i => i.designSource === 'canva' && i.canvaStatus !== 'published' && i.orderCode && !i.locked)
    .sort((a, b) => String(a.date || '9').localeCompare(String(b.date || '9')));
  section('🎨 Designs sur mesure à publier (designer)', waiting.map(i => `• ${names(i)} · mariage ${i.date || '?'}${i.siteTemplate ? ' · modèle ' + i.siteTemplate : ''}`));

  /* 5. Weddings soon: a heads-up; weddings yesterday: thank the couple and ask for a review */
  const paidInv = live.filter(i => i.orderCode && !i.locked);
  section('📅 Mariages dans les 3 prochains jours', paidInv.filter(i => i.date >= today && i.date <= inDays(3)).map(i => `• ${i.date} · ${names(i)} · ${(i.guests || []).length} invités sur la liste`));
  const byCode = new Map(orders.map(o => [o.code, o]));
  section('💛 Mariages d\'hier : remercier et demander un avis', paidInv.filter(i => i.date === yesterday).map(i => {
    const o: any = byCode.get(i.orderCode) || {};
    const link = waLink(o.phone || i.whatsapp, `Mabrouk ${names(i)} ! 🤍 Toute l'équipe Reefq vous souhaite une vie pleine de baraka.\nSi l'invitation vous a plu, un petit avis sur notre page Facebook nous aiderait beaucoup. Et si des proches se marient bientôt, ils ont -10 % avec ce lien : ${site}/?ref=${o.code || ''}`);
    return `• ${names(i)}${link ? `\n  ${link}` : ''}`;
  }));

  /* 6. Yesterday in numbers */
  const newOrders = orders.filter(o => inYesterday(o.createdAt)).length;
  const paidY = orders.filter(o => inYesterday(o.paidAt));
  const replies = rsvpKeys.filter(k => inYesterday(+(k.split('/')[1] || '').split('-')[0])).length;
  const revenue = paidY.reduce((s, o) => s + (+o.paid || 0), 0);
  const month = today.slice(0, 7), monthPaid = orders.filter(o => o.paidAt && tnDate(o.paidAt).slice(0, 7) === month);
  const stats = `📊 Hier : ${newOrders} commande(s), ${paidY.length} paiement(s) confirmé(s) (${revenue} DT), ${replies} réponse(s) d'invités.\nCe mois : ${monthPaid.length} commande(s) payée(s), ${monthPaid.reduce((s, o) => s + (+o.paid || 0), 0)} DT.`;

  const empty = !out.length;
  const text = (empty ? 'Rien à faire aujourd\'hui. Tout est à jour. ✅\n\n' : out.join('\n') + '\n') + stats + `\n\nStudio : ${site}/studio/`;
  return { text, autoCancel, empty };
}

const names = (i: any) => [i.a?.name, i.b?.name].filter(Boolean).join(' & ') || i.id;
const hasDetails = (i: any) => !!(i && i.venue && i.date);
function lastAt(o: any, status: string) {
  for (let k = (o.history || []).length - 1; k >= 0; k--) if (o.history[k].status === status) return o.history[k].at;
  return o.updatedAt || o.createdAt;
}
