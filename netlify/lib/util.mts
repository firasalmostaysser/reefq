export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

/* Netlify treats a 404 or 403 from a function as "not handled" and retries the path as a static page, so the API answers 410 for
   missing records and 422 for refused ones. */
export const err = (status: number, message: string) => json({ error: message }, status === 404 ? 410 : status === 403 ? 422 : status);

export async function readJSON(req: Request, maxBytes = 1_000_000): Promise<any> {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, 'Request too large');
  try { return text ? JSON.parse(text) : {}; } catch { throw new HttpError(400, 'Invalid JSON'); }
}

const ALPHA = 'abcdefghijkmnopqrstuvwxyz23456789';
export function id(n = 10): string {
  const b = crypto.getRandomValues(new Uint8Array(n));
  let s = ''; for (const x of b) s += ALPHA[x % ALPHA.length]; return s;
}

export const slug = (s: string) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'couple';

/* `a` is the bride, `b` the groom; the groom's name comes first unless the couple chose otherwise (same rule as engine.js) */
export const coupleNames = (i: any): string[] => { const a = i?.a?.name || '', b = i?.b?.name || ''; return i?.nameOrder === 'bride' ? [a, b] : [b, a]; };

/* any typed phone → international form: "98 765 432" → +21698765432, "0033 6…" → +336…, "+216…" kept (same rule as public/assets/phone.js) */
export function intlPhone(raw: unknown): string {
  const s = String(raw == null ? '' : raw).trim(), d = s.replace(/[^0-9]/g, '');
  if (!d) return '';
  if (s.startsWith('+')) return '+' + d;
  if (d.startsWith('00')) return '+' + d.slice(2);
  if (d.length === 8) return '+216' + d;
  return d.length > 8 ? '+' + d : s.slice(0, 30);
}

export const clampStr = (v: unknown, n: number) => String(v == null ? '' : v).slice(0, n);

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function b64url(bytes: Uint8Array): string {
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function escHtml(s: unknown): string {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export const env = (k: string) => (globalThis as any).Netlify?.env?.get(k) || '';

export const clientIp = (req: Request, context?: any) => context?.ip || req.headers.get('x-nf-client-connection-ip') || 'local';
