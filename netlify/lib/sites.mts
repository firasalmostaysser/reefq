/**
 * Custom designs built by the designer as a Canva website, served from our own address.
 * "Mark published" saves a copy of the page (files store, sites/<invitationId>/<ver>/…); /i/<id> serves that copy with the
 * Reefq bar, and /site/<id>/<ver>/<path> serves its files, fetched from the designer's site the first time, then from our copy.
 * Guests never see the designer's address, and live invitations no longer depend on it once a file is copied.
 */
import { files } from './stores.mts';
import { HttpError, escHtml } from './util.mts';

const MAX_FILE = 15_000_000;
const PATH_RE = /^[A-Za-z0-9._~\-\/]{1,300}$/;
const TYPES: Record<string, string> = { js: 'text/javascript; charset=utf-8', mjs: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf', mp4: 'video/mp4', webm: 'video/webm' };

const isProduction = () => (globalThis as any).Netlify?.context?.deploy?.context === 'production';

/* Published Canva websites live on *.canva.site. Extra hosts (a connected domain) come from CANVA_SITE_HOSTS; local stubs only outside production. */
export function allowedSiteUrl(raw: unknown): boolean {
  let u: URL; try { u = new URL(String(raw || '')); } catch { return false; }
  const extra = String((globalThis as any).Netlify?.env?.get('CANVA_SITE_HOSTS') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (u.protocol === 'https:' && (/(^|\.)canva\.site$/i.test(u.hostname) || extra.includes(u.hostname.toLowerCase()))) return true;
  return !isProduction() && u.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(u.hostname);
}
export const cleanSiteUrl = (raw: string) => { const u = new URL(raw); u.hash = ''; u.search = ''; return u.toString(); };

/* Fetch the published page and keep a copy. Returns the version and the upstream folder its relative files come from. */
export async function snapshotSite(iid: string, canvaUrl: string) {
  if (!allowedSiteUrl(canvaUrl)) throw new HttpError(400, 'Paste the published site address (https://….my.canva.site/…).');
  const url = cleanSiteUrl(canvaUrl);
  let r: Response;
  try { r = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 13) Reefq' } }); }
  catch { throw new HttpError(502, 'The site could not be reached. Check the address.'); }
  if (!r.ok) throw new HttpError(502, `The site answered ${r.status}. Check that it is published and the address is right.`);
  const html = await r.text();
  if (!/<html[\s>]/i.test(html)) throw new HttpError(502, 'That address does not return a web page.');
  const m = html.match(/<base\s[^>]*href=["']([^"']*)["']/i);
  const base = new URL(m ? m[1] : './', r.url || url).toString();
  const ver = Date.now().toString(36);
  const s = files();
  await s.set(`sites/${iid}/${ver}/index.html`, new Blob([html], { type: 'text/html' }), { metadata: { type: 'text/html; charset=utf-8' } });
  // Warm the files named in the page; the rest are copied the first time a phone asks for them (the studio preview does this right away).
  const refs = [...new Set([...html.matchAll(/(?:src|href)=["']((?!\/|[a-z]+:)[^"'?#]+)/gi)].map(x => x[1]).filter(p => upstreamUrl(base, p)))];
  for (let i = 0; i < refs.length; i += 6) await Promise.all(refs.slice(i, i + 6).map(p => copyFile(iid, ver, base, p).catch(() => null)));
  const warnings: string[] = [];
  if (!/rsvp/i.test(html)) warnings.push('No RSVP link found in the design. Ask the designer to link the RSVP button to #rsvp. Guests can still reply from the Reefq bar.');
  return { ver, base, warnings };
}

/* A file of the designer's site: relative, inside the site's folder, same host. Anything else (//other.host, .., encoded dots) is refused. */
export function upstreamUrl(base: string, path: string): string | null {
  if (!PATH_RE.test(path) || path.startsWith('/') || path.split('/').some(seg => seg === '..' || seg === '.')) return null;
  let u: URL, b: URL; try { b = new URL(base); u = new URL(path, b); } catch { return null; }
  return u.origin === b.origin && u.pathname.startsWith(b.pathname) ? u.toString() : null;
}

async function copyFile(iid: string, ver: string, base: string, path: string) {
  const src = upstreamUrl(base, path);
  if (!src) return null;
  const up = await fetch(src, { redirect: 'error' });
  if (!up.ok) return null;
  const buf = await up.arrayBuffer();
  if (buf.byteLength > MAX_FILE) return null;
  const type = up.headers.get('content-type') || TYPES[path.split('.').pop()!.toLowerCase()] || 'application/octet-stream';
  await files().set(`sites/${iid}/${ver}/f/${path}`, new Blob([buf], { type }), { metadata: { type } });
  return { buf, type };
}

/* /site/<id>/<ver>/<path>: our copy first; otherwise copy it now, but only for the version currently published. */
export async function siteFile(inv: any | null, iid: string, ver: string, path: string): Promise<Response> {
  const nf = () => new Response('Not found', { status: 404 });
  if (!upstreamUrl('https://x.invalid/', path)) return nf();
  const key = `sites/${iid}/${ver}/f/${path}`;
  const hit: any = await files().getWithMetadata(key, { type: 'arrayBuffer' });
  let body: ArrayBuffer | null = hit?.data || null, type: string = hit?.metadata?.type || '';
  if (!body) {
    if (!inv || inv.canvaVer !== ver || !inv.canvaBase) return nf();
    const got = await copyFile(iid, ver, inv.canvaBase, path).catch(() => null);
    if (!got) return nf();
    body = got.buf; type = got.type;
  }
  return new Response(body, { headers: { 'content-type': type || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': '*' } });
}

export async function deleteSite(iid: string, keepVer?: string) {
  const s = files(), { blobs } = await s.list({ prefix: `sites/${iid}/` });
  await Promise.all(blobs.filter((b: any) => !keepVer || !b.key.startsWith(`sites/${iid}/${keepVer}/`)).map((b: any) => s.delete(b.key)));
}

/* The saved page as guests receive it: our address for every file, our title and link preview, no designer branding, no audio, and the Reefq bar. */
export async function sitePage(inv: any, head: { title: string; og: string }): Promise<string | null> {
  if (!inv.canvaVer) return null;
  const html = await files().get(`sites/${inv.id}/${inv.canvaVer}/index.html`, { type: 'text' });
  return html ? rewritePage(html, inv, head) : null;
}
export function rewritePage(html: string, inv: any, head: { title: string; og: string }): string {
  const mine = `/site/${inv.id}/${inv.canvaVer}/`;
  let out = html
    .replace(/<base\s[^>]*>/gi, '')
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s[^>]*(?:property|name)=["'](?:og:[^"']*|twitter:[^"']*|description|app-name|build-[^"']*|generator)["'][^>]*>/gi, '')
    .replace(/<link\s[^>]*rel=["'](?:canonical|icon|shortcut icon|apple-touch-icon|manifest|alternate)["'][^>]*>/gi, '')
    .replace(/<audio[\s\S]*?<\/audio>/gi, '');
  if (inv.canvaBase) out = out.split(inv.canvaBase).join(mine);
  const css = '.footer-container,.report-form-modal,#report_button,#privacy_policy_button,a[href*="canva.com"]{display:none!important}body{padding-bottom:64px}';
  const top = `<base href="${mine}"><title>${escHtml(head.title)}</title>${head.og}<link rel="icon" href="/assets/favicon.png">` +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Figtree:wght@400;500;600;700&family=Pinyon+Script&display=swap">' +
    `<style>${css}</style>`;
  const bottom = `<script src="/assets/analytics.js"></script><script src="/assets/engine.js"></script><script src="/assets/site-bar.js" data-invite="${escHtml(inv.id)}"></script>`;
  out = /<head[^>]*>/i.test(out) ? out.replace(/<head([^>]*)>/i, `<head$1>${top}`) : top + out;
  out = /<\/body>/i.test(out) ? out.replace(/<\/body>/i, `${bottom}</body>`) : out + bottom;
  return out;
}

export const personalOnly = (inv: any) => typeof inv.personalOnly === 'boolean' ? inv.personalOnly : inv.designSource === 'canva';
