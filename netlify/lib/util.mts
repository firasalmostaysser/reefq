export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

/* Netlify treats a 404 from a function as "not handled" and falls back to static files, so the API answers 410 for missing records. */
export const err = (status: number, message: string) => json({ error: message }, status === 404 ? 410 : status);

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
