/**
 * Canva → Reefq sync.
 * The designer saves templates in one Canva folder (CANVA_FOLDER_ID). Every 15 minutes new or edited
 * designs are exported (PNG, plus MP4 when the title contains [anim]) into the "files" blob store and
 * listed at /templates.json.  Title convention: "<Theme> · <Name> | tag1, tag2 [anim]"  ·  [draft] hides a design.
 * Website templates live in a second folder (CANVA_TEMPLATES_FOLDER_ID): each design becomes a template record (name, tags,
 * thumbnail); the studio adds its published address and copies the site, shown at /modeles/<slug>.
 */
import { state, files, siteTemplates, listJSON } from './stores.mts';
import { b64url, slug as slugify, env as E } from './util.mts';
import { deleteSite } from './sites.mts';
const API = 'https://api.canva.com/rest/v1';
const AUTH = 'https://www.canva.com/api/oauth/authorize';
const SCOPES = 'design:meta:read design:content:read folder:read';

/* Adapter so the sync code reads like before: env.X → Netlify env, env.STATE → state store, env.MEDIA → files store */
function mkEnv(): any {
  const st = state(), fl = files();
  return new Proxy({}, { get(_t, k: string) {
    if (k === 'STATE') return {
      get: async (key: string) => { const r: any = await st.get('canva/' + key, { type: 'json' }); if (!r) return null; if (r.exp && r.exp < Date.now()) return null; return r.v; },
      put: (key: string, v: string, o?: any) => st.setJSON('canva/' + key, { v, exp: o && o.expirationTtl ? Date.now() + o.expirationTtl * 1000 : 0 }),
      delete: (key: string) => st.delete('canva/' + key) };
    if (k === 'MEDIA') return { put: (key: string, body: any) => fl.set(key, body), delete: (key: string) => fl.delete(key) };
    if (k === 'TEMPLATES') { const t = siteTemplates(); return { list: () => listJSON(t), put: (id: string, v: any) => t.setJSON(id, v), delete: (id: string) => t.delete(id) }; }
    if (k === 'DROP_SITE') return (owner: string) => deleteSite(owner);
    return E(k);
  } });
}
export async function authStartResponse(url: URL) { return authStart(mkEnv(), url); }
export async function authCallbackResponse(url: URL) { return authCallback(mkEnv(), url); }
export async function syncNow(opts?: any) { const env = mkEnv(); if (!env.CANVA_FOLDER_ID && !env.CANVA_TEMPLATES_FOLDER_ID) return { error: 'Set CANVA_FOLDER_ID or CANVA_TEMPLATES_FOLDER_ID first.' }; return sync(env, opts || {}); }
/* A run that fails as a whole (not connected, Canva down) keeps the last counts and lists the error. */
export async function recordSyncError(e: any) { const env = mkEnv(); await putJSON(env, 'status', { ...(await getJSON(env, 'status', {})), lastRun: Date.now(), lastError: String(e?.message || e) }); }
/* For tests: the same sync with a stand-in env (STATE, MEDIA, TEMPLATES, DROP_SITE, CANVA_FOLDER_ID, CANVA_TEMPLATES_FOLDER_ID). */
export const syncWith = (env: any, opts: any = {}) => sync(env, opts);
export async function canvaStatus() { const env = mkEnv(); return { connected: !!(await env.STATE.get('refresh_token')), ...(await getJSON(env, 'status', {})) }; }
export async function catalog() { const c = await getJSON(mkEnv(), 'catalog', { items: [] }); return { updatedAt: c.updatedAt || null, items: c.items.map(({ imageKey, videoKey, editUrl, ...rest }: any) => rest) }; }

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
function redirectUri(env) { return (env.SITE_URL || env.URL).replace(/\/$/, '') + '/auth/canva/callback'; }
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
  const sites = env.CANVA_TEMPLATES_FOLDER_ID ? await syncSiteTemplates(env, force) : null;
  if (!env.CANVA_FOLDER_ID) {
    await putJSON(env, 'status', { ...(await getJSON(env, 'status', {})), lastRun: Date.now(), tookMs: Date.now() - started, lastError: null, sites });
    return { sites };
  }
  const catalog = await getJSON(env, 'catalog', { items: [] });
  const byId = Object.fromEntries(catalog.items.map(i => [i.id, i]));
  const designs = await listFolderDesigns(env, env.CANVA_FOLDER_ID);
  const next = [], report = { exported: [], unchanged: 0, skipped: [], removed: [], pending: [], failed: [] };
  const maxExports = +(env.MAX_EXPORTS_PER_RUN || 8); let done = 0;
  for (const d of designs) {
    const meta = parseTitle(d.title || '');
    if (meta.draft) { report.skipped.push(d.title); continue; }
    const prev = byId[d.id];
    if (prev && !force && prev.updatedAt === d.updated_at) { next.push({ ...prev, ...meta, title: meta.name, editUrl: d.urls && d.urls.edit_url }); report.unchanged++; continue; }
    if (done >= maxExports) { if (prev) next.push(prev); report.pending.push(meta.name); continue; }
    done++;
    // one design failing never stops the others: it keeps its previous picture and is listed in the report
    try {
      const v = d.updated_at;
      const imageKey = await exportImage(env, d, `templates/${d.id}-${v}`);
      let videoKey = null;
      if (meta.anim) { videoKey = `templates/${d.id}-${v}.mp4`; await exportTo(env, d.id, { type: 'mp4', quality: 'vertical_1080p', pages: [1] }, videoKey, 'video/mp4').catch(() => { videoKey = null; }); }
      if (prev) { for (const k of [prev.imageKey, prev.videoKey]) if (k && k !== imageKey && k !== videoKey) await env.MEDIA.delete(k); }
      next.push({ id: d.id, title: meta.name, theme: meta.theme, tags: meta.tags, anim: meta.anim, updatedAt: d.updated_at,
        imageKey, image: publicMedia(env, imageKey), videoKey, video: videoKey ? publicMedia(env, videoKey) : null,
        pageCount: d.page_count || 1, editUrl: d.urls && d.urls.edit_url });
      report.exported.push(meta.name);
    } catch (e: any) {
      if (prev) next.push(prev);
      report.failed.push({ title: meta.name, error: String(e?.message || e).slice(0, 200) });
    }
  }
  const live = new Set(designs.map(d => d.id));
  for (const old of catalog.items) if (!live.has(old.id)) {
    report.removed.push(old.title);
    for (const k of [old.imageKey, old.videoKey]) if (k) await env.MEDIA.delete(k);
  }
  next.sort((a, b) => b.updatedAt - a.updatedAt);
  await putJSON(env, 'catalog', { updatedAt: Date.now(), items: next });
  await putJSON(env, 'status', { lastRun: Date.now(), tookMs: Date.now() - started, count: next.length, lastError: null, ...report, sites });
  return { count: next.length, ...report, sites };
}

/* Website templates: one record per design of the templates folder. Name, tags and picture follow Canva; the published address,
   the saved copy and "hidden" are set in the studio and kept. Records added by hand in the studio (source "manual") are left alone. */
async function syncSiteTemplates(env, force) {
  const rep = { count: 0, updated: [], removed: [], failed: [] };
  const designs = await listFolderDesigns(env, env.CANVA_TEMPLATES_FOLDER_ID);
  const all = await env.TEMPLATES.list(), byId = Object.fromEntries(all.map(r => [r.id, r]));
  const taken = new Set(all.map(r => r.slug));
  for (const d of designs) {
    const meta = parseTitle(d.title || ''), prev = byId[d.id];
    const rec = prev ? { ...prev } : { id: d.id, source: 'canva', slug: uniqueSlug(meta.name, taken), status: 'waiting', siteUrl: '', createdAt: Date.now() };
    Object.assign(rec, { name: meta.name, theme: meta.theme, tags: meta.tags, draft: meta.draft, editUrl: d.urls && d.urls.edit_url });
    if (!prev || force || prev.designUpdatedAt !== d.updated_at || !prev.imageKey) {
      try {
        const key = await exportImage(env, d, `templates/site-${d.id}-${d.updated_at}`);
        if (prev && prev.imageKey && prev.imageKey !== key) await env.MEDIA.delete(prev.imageKey);
        Object.assign(rec, { imageKey: key, image: publicMedia(env, key), designUpdatedAt: d.updated_at });
        rep.updated.push(meta.name);
      } catch (e: any) { rep.failed.push({ title: meta.name, error: String(e?.message || e).slice(0, 200) }); }
    }
    rec.updatedAt = Date.now();
    await env.TEMPLATES.put(rec.id, rec);
    rep.count++;
  }
  const live = new Set(designs.map(d => d.id));
  for (const old of all) if (old.source === 'canva' && !live.has(old.id)) {
    if (old.imageKey) await env.MEDIA.delete(old.imageKey);
    await env.DROP_SITE('tpl--' + old.slug);
    await env.TEMPLATES.delete(old.id);
    rep.removed.push(old.name);
  }
  return rep;
}
export function uniqueSlug(name, taken) {
  const base = slugify(name || 'modele'); let s = base, n = 2;
  while (taken.has(s)) s = base + '-' + n++;
  taken.add(s); return s;
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
/* Page 1 as PNG. Website designs only export as PDF, so they (and any design whose export fails) use the design's thumbnail.
   Thumbnail links expire after a few minutes: the file is copied into our store, never linked. */
async function exportImage(env, d, base) {
  try { await exportTo(env, d.id, { type: 'png', width: 1080, pages: [1] }, base + '.png', 'image/png'); return base + '.png'; }
  catch (e) {
    const url = d.thumbnail && d.thumbnail.url;
    if (!url) throw e;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Thumbnail download failed ' + r.status);
    const type = (r.headers.get('content-type') || 'image/jpeg').split(';')[0];
    const key = base + (type === 'image/png' ? '.png' : '.jpg');
    await env.MEDIA.put(key, new Blob([await r.arrayBuffer()], { type }));
    return key;
  }
}
async function exportTo(env, designId, format, key, contentType) {
  const job = await canva(env, '/exports', { method: 'POST', body: JSON.stringify({ design_id: designId, format }) });
  let j = job.job, tries = 0;
  while (j.status === 'in_progress' && tries++ < 40) { await sleep(Math.min(1000 + tries * 500, 5000)); j = (await canva(env, '/exports/' + j.id)).job; }
  if (j.status !== 'success' || !j.urls || !j.urls[0]) throw new Error('Export failed for ' + designId + ': ' + JSON.stringify(j.error || j.status));
  const file = await fetch(j.urls[0]);
  if (!file.ok) throw new Error('Download failed ' + file.status);
  await env.MEDIA.put(key, new Blob([await file.arrayBuffer()], { type: contentType }));
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
function publicMedia(env, key) { return '/media/' + key; }
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(env, k, d) { const v = await env.STATE.get(k); return v ? JSON.parse(v) : d; }
async function putJSON(env, k, v) { await env.STATE.put(k, JSON.stringify(v)); }
