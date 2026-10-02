/* Loads the data, sends the morning summary (lib/digest.mts), cancels stale unpaid orders and, on Mondays, sends a full backup.
   Called by the daily-digest schedule and by Studio → Settings → "Send today's summary". */
import { orders, invitations, rsvps, listJSON, listEntries, DATA_STORES } from './stores.mts';
import { buildDigest, AUTO_CANCEL_DAYS, tnDate } from './digest.mts';
import { notify, siteUrl, alertsConfigured } from './notify.mts';

export async function sendDigest({ send = true, backup = false } = {}) {
  const now = Date.now();
  const [ol, il, rk] = await Promise.all([listJSON(orders()), listJSON(invitations()), rsvps().list().then((r: any) => r.blobs.map((b: any) => b.key))]);
  const d = buildDigest({ orders: ol, invitations: il, rsvpKeys: rk, now, site: siteUrl() });
  if (send) {
    for (const code of d.autoCancel) {
      const o: any = ol.find(x => x.code === code);
      o.status = 'cancelled'; o.updatedAt = now;
      o.history.push({ at: now, status: 'cancelled', note: `Annulée automatiquement après ${AUTO_CANCEL_DAYS} jours sans paiement`, by: 'system' });
      await orders().setJSON(code, o);
    }
    await notify(`Reefq · ${tnDate(now)}`, d.text);
    if (backup) await sendBackup(now);
  }
  return { ...d, alerts: alertsConfigured() };
}

/* A copy of every record, as a file in the team chat: off-site, dated, one tap to download. */
export async function sendBackup(now = Date.now()) {
  const data: any = { app: 'reefq', version: 1, exportedAt: new Date(now).toISOString() };
  for (const [name, s] of Object.entries(DATA_STORES)) data[name] = await listEntries(s());
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const counts = Object.keys(DATA_STORES).map(k => `${k}: ${data[k].length}`).join(' · ');
  await notify(`Sauvegarde Reefq ${tnDate(now)}`, `Sauvegarde hebdomadaire de toutes les données (${counts}). Gardez ce fichier.`,
    { name: `reefq-backup-${tnDate(now)}.json`, type: 'application/json', data: bytes.buffer as ArrayBuffer });
}
