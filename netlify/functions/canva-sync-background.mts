import { syncNow, recordSyncError } from '../lib/canva.mts';

/* Long-running Canva export (up to 15 minutes). Triggered by canva-cron and by "Sync now" in the studio. */
export default async (req: Request) => {
  const key = (globalThis as any).Netlify.env.get('SESSION_SECRET');
  if (!key || req.headers.get('x-reefq-key') !== key) return;
  try { await syncNow({}); }
  catch (e: any) { await recordSyncError(e).catch(() => null); }
};
