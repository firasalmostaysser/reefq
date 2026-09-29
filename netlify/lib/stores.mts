import { getStore, getDeployStore } from '@netlify/blobs';

/**
 * Production keeps its data in global stores. Deploy previews, branch deploys and `netlify dev`
 * use deploy-scoped stores, so test data never mixes with real couples.
 */
export function store(name: string) {
  const ctx = (globalThis as any).Netlify?.context?.deploy?.context;
  if (ctx === 'production') return getStore({ name, consistency: 'strong' });
  return getDeployStore({ name, consistency: 'strong' } as any);
}

export const invitations = () => store('invitations');   // key: invitation id → JSON
export const rsvps = () => store('rsvps');               // key: <invitationId>/<time>-<id> → JSON
export const orders = () => store('orders');             // key: order code → JSON
export const files = () => store('files');               // uploads/…, proofs/…, templates/…
export const state = () => store('state');               // rate limits, Canva tokens, catalog

export async function listJSON(s: any, prefix?: string): Promise<any[]> {
  const { blobs } = await s.list(prefix ? { prefix } : undefined);
  const out = await Promise.all(blobs.map((b: any) => s.get(b.key, { type: 'json' })));
  return out.filter(Boolean);
}

/* Simple fixed-window rate limit kept in the state store. */
export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const s = state(), k = 'rl/' + key, now = Date.now();
  const cur = (await s.get(k, { type: 'json' })) as any;
  if (cur && cur.until > now) {
    if (cur.n >= max) return false;
    await s.setJSON(k, { n: cur.n + 1, until: cur.until });
  } else {
    await s.setJSON(k, { n: 1, until: now + windowSec * 1000 });
  }
  return true;
}
