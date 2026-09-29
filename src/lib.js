export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });

export const err = (status, message) => json({ error: message }, status);

export async function readJSON(req, maxBytes = 1_000_000) {
  const len = +req.headers.get('content-length') || 0;
  if (len > maxBytes) throw new HttpError(413, 'Request too large');
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, 'Request too large');
  try { return text ? JSON.parse(text) : {}; } catch { throw new HttpError(400, 'Invalid JSON'); }
}

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export const id = (n = 10) => {
  const a = 'abcdefghijkmnopqrstuvwxyz23456789', b = crypto.getRandomValues(new Uint8Array(n));
  let s = ''; for (const x of b) s += a[x % a.length]; return s;
};

export const slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'couple';

export const clampStr = (v, n) => String(v == null ? '' : v).slice(0, n);

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export function b64url(bytes) {
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
