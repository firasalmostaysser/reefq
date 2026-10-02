import { json, err, readJSON, b64url, env, clientIp } from './util.mts';
import { rateLimit, isProduction } from './stores.mts';

const COOKIE = 'rq_session';
const DAYS = 30;

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))));
}

export function safeEqual(a: string, b: string) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function cookieValue(req: Request, name: string) {
  const c = req.headers.get('cookie') || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export async function isStudio(req: Request) {
  const secret = env('SESSION_SECRET');
  if (!secret) return false;
  const v = cookieValue(req, COOKIE);
  if (!v) return false;
  const [exp, sig] = v.split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  return safeEqual(sig, await hmac(secret, 'studio:' + exp));
}

export async function login(req: Request, context: any) {
  const pass = env('STUDIO_PASSWORD'), secret = env('SESSION_SECRET');
  if (!pass || !secret) return err(503, 'Set STUDIO_PASSWORD and SESSION_SECRET in Netlify environment variables first.');
  /* brute-force guard on the live site (local test runs sign in many times) */
  if (isProduction() && !(await rateLimit('login/' + clientIp(req, context), 10, 900))) return err(429, 'Too many attempts. Try again in 15 minutes.');
  const { password } = await readJSON(req, 2000);
  if (!safeEqual(String(password || ''), pass)) return err(401, 'Wrong password.');
  const exp = Date.now() + DAYS * 864e5;
  const val = exp + '.' + (await hmac(secret, 'studio:' + exp));
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DAYS * 86400}${secure}` });
}

export function logout() {
  return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` });
}
