import { json, err, readJSON, b64url } from './lib.js';

const COOKIE = 'rq_session';
const DAYS = 30;

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))));
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function cookieValue(req, name) {
  const c = req.headers.get('cookie') || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export async function isStudio(req, env) {
  if (!env.SESSION_SECRET) return false;
  const v = cookieValue(req, COOKIE);
  if (!v) return false;
  const [exp, sig] = v.split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  return safeEqual(sig, await hmac(env.SESSION_SECRET, 'studio:' + exp));
}

export async function login(req, env) {
  if (!env.STUDIO_PASSWORD || !env.SESSION_SECRET) return err(503, 'Set STUDIO_PASSWORD and SESSION_SECRET first.');
  const ip = req.headers.get('cf-connecting-ip') || 'local';
  const k = 'login:' + ip, tries = +(await env.STATE.get(k)) || 0;
  if (tries >= 10) return err(429, 'Too many attempts. Try again in 15 minutes.');
  const { password } = await readJSON(req, 2000);
  if (!safeEqual(String(password || ''), env.STUDIO_PASSWORD)) {
    await env.STATE.put(k, String(tries + 1), { expirationTtl: 900 });
    return err(401, 'Wrong password.');
  }
  const exp = Date.now() + DAYS * 864e5;
  const val = exp + '.' + (await hmac(env.SESSION_SECRET, 'studio:' + exp));
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DAYS * 86400}${secure}` });
}

export function logout() {
  return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` });
}
