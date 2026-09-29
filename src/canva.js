/**
 * Canva → Reefq sync.
 * The designer saves templates in one Canva folder (CANVA_FOLDER_ID). Every 15 minutes new or edited
 * designs are exported (PNG, plus MP4 when the title contains [anim]) into R2 and listed at /templates.json.
 * Title convention: "<Theme> · <Name> | tag1, tag2 [anim]"  ·  [draft] hides a design.
 */
import { isStudio } from './auth.js';
import { b64url } from './lib.js';
const API = 'https://api.canva.com/rest/v1';
const AUTH = 'https://www.canva.com/api/oauth/authorize';
const SCOPES = 'design:meta:read design:content:read folder:read';

export async function canvaRoutes(req, env, url) {
  const p = url.pathname;
  if (p === '/templates.json') return catalogResponse(env);
  if (p.startsWith('/media/')) return mediaResponse(env, p.slice(7));
  if (p === '/auth/canva/start') { if (!(await isStudio(req, env))) return new Response('Sign in to the studio first.', { status: 401 }); return authStart(env, url); }
  if (p === '/auth/canva/callback') return authCallback(env, url);
  return null;
}
export async function syncNow(env, opts) { if (!env.CANVA_FOLDER_ID) return { error: 'Set CANVA_FOLDER_ID first.' }; return sync(env, opts || {}); }
export async function scheduledSync(env) {
  if (!env.CANVA_FOLDER_ID || !(await env.STATE.get('refresh_token'))) return;
  try { await sync(env, {}); } catch (e) { await putJSON(env, 'status', { lastError: String(e.message || e), lastRun: Date.now() }); }
}
export async function canvaStatus(env) { return { connected: !!(await env.STATE.get('refresh_token')), ...(await getJSON(env, 'status', {})) }; }

/* ---------------- OAuth (Authorization Code + PKCE) ---------------- */
async function authStart(env, url) {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(64)));
  const challenge = b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
  const state = b64url(crypto.getRandomValues(new Uint8Array(24)));
  await env.STATE.put('pkce:' + state, verifier, { expirationTtl: 900 });
  const q = new URLSearchParams({
    code_challenge_method: 's256', response_type: 'code', client_id: env.CANVA_CLIENT_ID,
    redirect_uri: redirectUri(env), scope: SCOPES, code_challenge: challenge, state
  });
  return Response.redirect(AUTH + '?' + q.toString(), 302);
}
async function authCallback(env, url) {
  const code = url.searchParams.get('code'), state = url.searchParams.get('state');
  if (!code || !state) return new Response('Missing code', { status: 400 });
  const verifier = await env.STATE.get('pkce:' + state);
  if (!verifier) return new Response('Link expired. Start again from the studio.', { status: 400 });
  const tok = await tokenRequest(env, { grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: redirectUri(env) });
  await saveTokens(env, tok);
  await env.STATE.delete('pkce:' + state);
  return new Response('<meta charset="utf-8"><body style="font:16px system-ui;padding:40px">Reefq est connecté à Canva. <a href="/studio/">Retour au studio</a></body>', { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
function redirectUri(env) { return env.SITE_URL.replace(/\/$/, '') + '/auth/canva/callback'; }
async function tokenRequest(env, body) {
  const r = await fetch(API + '/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + btoa(env.CANVA_CLIENT_ID + ':' + env.CANVA_CLIENT_SECRET) },
    body: new URLSearchParams(body)
  });
  if (!r.ok) throw new Error('Canva token error ' + r.status + ': ' + (await r.text()).slice(0, 300));
  return r.json();
}
async function saveTokens(env, tok) {
  await env.STATE.put('refresh_token', tok.refresh_token);
  await env.STATE.put('access_token', tok.access_token, { expirationTtl: Math.max(60, (tok.expires_in || 3600) - 120) });
}
/* Canva refresh tokens are single use: every refresh returns a new one, saved immediately. */
async function accessToken(env) {
  const cached = await env.STATE.get('access_token');
  if (cached) return cached;
  const rt = await env.STATE.get('refresh_token');
  if (!rt) throw new Error('Not connected to Canva. Open /auth/canva/start from the studio once.');
  const tok = await tokenRequest(env, { grant_type: 'refresh_token', refresh_token: rt });
  await saveTokens(env, tok);
  return tok.access_token;
}
async function canva(env, path, init = {}) {
  const at = await accessToken(env);
  const r = await fetch(API + path, { ...init, headers: { Authorization: 'Bearer ' + at, 'Content-Type': 'application/json', ...(init.headers || {}) } });
  if (r.status === 429) { await sleep(3000); return canva(env, path, init); }
  if (!r.ok) throw new Error('Canva ' + path + ' → ' + r.status + ': ' + (await r.text()).slice(0, 300));
  return r.json();
}

/* ---------------- Sync ---------------- */
async function sync(env, { force = false } = {}) {
  const started = Date.now();
  const catalog = await getJSON(env, 'catalog', { items: [] });
  const byId = Object.fromEntries(catalog.items.map(i => [i.id, i]));
  const designs = await listFolderDesigns(env, env.CANVA_FOLDER_ID);
  const next = [], report = { exported: [], unchanged: 0, skipped: [], removed: [], pending: [] };
  const maxExports = +(env.MAX_EXPORTS_PER_RUN || 8); let done = 0;
  for (const d of designs) {
    const meta = parseTitle(d.title || '');
    if (meta.draft) { report.skipped.push(d.title); continue; }
    const prev = byId[d.id];
    if (prev && !force && prev.updatedAt === d.updated_at) { next.push({ ...prev, ...meta, title: meta.name, editUrl: d.urls && d.urls.edit_url }); report.unchanged++; continue; }
    if (done >= maxExports) { if (prev) next.push(prev); report.pending.push(meta.name); continue; }
    done++;
    const v = d.updated_at;
    const pngKey = `templates/${d.id}-${v}.png`;
    await exportTo(env, d.id, { type: 'png', width: 1080, pages: [1] }, pngKey, 'image/png');
    let videoKey = null;
    if (meta.anim) { videoKey = `templates/${d.id}-${v}.mp4`; await exportTo(env, d.id, { type: 'mp4', quality: 'vertical_1080p', pages: [1] }, videoKey, 'video/mp4').catch(() => { videoKey = null; }); }
    if (prev) { for (const k of [prev.imageKey, prev.videoKey]) if (k && k !== pngKey && k !== videoKey) await env.MEDIA.delete(k); }
    next.push({ id: d.id, title: meta.name, theme: meta.theme, tags: meta.tags, anim: meta.anim, updatedAt: d.updated_at,
      imageKey: pngKey, image: publicMedia(env, pngKey), videoKey, video: videoKey ? publicMedia(env, videoKey) : null,
      pageCount: d.page_count || 1, editUrl: d.urls && d.urls.edit_url });
    report.exported.push(meta.name);
  }
  const live = new Set(designs.map(d => d.id));
  for (const old of catalog.items) if (!live.has(old.id)) {
    report.removed.push(old.title);
    for (const k of [old.imageKey, old.videoKey]) if (k) await env.MEDIA.delete(k);
  }
  next.sort((a, b) => b.updatedAt - a.updatedAt);
  await putJSON(env, 'catalog', { updatedAt: Date.now(), items: next });
  await putJSON(env, 'status', { lastRun: Date.now(), tookMs: Date.now() - started, count: next.length, lastError: null, ...report });
  return { count: next.length, ...report };
}
async function listFolderDesigns(env, folderId) {
  const out = []; let cont = null;
  do {
    const q = new URLSearchParams({ item_types: 'design', limit: '100' }); if (cont) q.set('continuation', cont);
    const r = await canva(env, `/folders/${encodeURIComponent(folderId)}/items?` + q);
    for (const it of r.items || []) { const d = it.design || it; if (d && d.id) out.push(d); }
    cont = r.continuation || null;
  } while (cont);
  return out;
}
async function exportTo(env, designId, format, key, contentType) {
  const job = await canva(env, '/exports', { method: 'POST', body: JSON.stringify({ design_id: designId, format }) });
  let j = job.job, tries = 0;
  while (j.status === 'in_progress' && tries++ < 40) { await sleep(Math.min(1000 + tries * 500, 5000)); j = (await canva(env, '/exports/' + j.id)).job; }
  if (j.status !== 'success' || !j.urls || !j.urls[0]) throw new Error('Export failed for ' + designId + ': ' + JSON.stringify(j.error || j.status));
  const file = await fetch(j.urls[0]);
  if (!file.ok) throw new Error('Download failed ' + file.status);
  await env.MEDIA.put(key, file.body, { httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' } });
}
export function parseTitle(t) {
  const anim = /\[anim\]/i.test(t), draft = /\[draft\]/i.test(t);
  const clean = t.replace(/\[(anim|draft)\]/ig, '').trim();
  const [head, tagStr = ''] = clean.split('|');
  const parts = head.split(/\s[·\-–—]\s/);
  const theme = parts.length > 1 ? parts[0].trim() : '';
  const name = (parts.length > 1 ? parts.slice(1).join(' · ') : head).trim();
  const tags = tagStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return { theme, name, tags, anim, draft };
}

/* ---------------- Serving ---------------- */
async function catalogResponse(env) {
  const c = await getJSON(env, 'catalog', { items: [] });
  const items = c.items.map(({ imageKey, videoKey, editUrl, ...rest }) => rest);
  return new Response(JSON.stringify({ updatedAt: c.updatedAt || null, items }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=60' } });
}
async function mediaResponse(env, key) {
  const obj = await env.MEDIA.get(decodeURIComponent(key));
  if (!obj) return new Response('Not found', { status: 404 });
  const h = new Headers(); obj.writeHttpMetadata && obj.writeHttpMetadata(h); h.set('etag', obj.httpEtag || ''); h.set('access-control-allow-origin', '*');
  return new Response(obj.body, { headers: h });
}
function publicMedia(env, key) { return '/media/' + key; }
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(env, k, d) { const v = await env.STATE.get(k); return v ? JSON.parse(v) : d; }
async function putJSON(env, k, v) { await env.STATE.put(k, JSON.stringify(v)); }
