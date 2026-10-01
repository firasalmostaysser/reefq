import type { Config } from '@netlify/functions';
import { siteTemplates, listJSON } from '../lib/stores.mts';
import { escHtml } from '../lib/util.mts';
import { sitePage } from '../lib/sites.mts';
import { isStudio } from '../lib/auth.mts';

/* /modeles/<slug>: live preview of a website template, served from our copy with the Reefq template bar. /modeles → the gallery. */
export default async (req: Request) => {
  const url = new URL(req.url);
  const m = url.pathname.match(/^\/modeles\/([a-z0-9-]{1,60})\/?$/);
  if (!m) return Response.redirect(new URL('/#modeles', url).toString(), 302);
  const t: any = (await listJSON(siteTemplates())).find((x: any) => x.slug === m[1]);
  // hidden and draft templates are only shown to the studio
  if (t && t.status === 'published' && ((!t.hidden && !t.draft) || (await isStudio(req)))) {
    const title = `${t.name} · Modèle Reefq`;
    const og = `<meta property="og:title" content="${escHtml(title)}"><meta property="og:description" content="Une invitation sur mesure, personnalisée à vos prénoms et vos dates."><meta property="og:image" content="${escHtml((t.cover || t.image) ? new URL(t.cover || t.image, url).toString() : new URL('/assets/og.jpg', url).toString())}"><meta property="og:type" content="website">`;
    const page = await sitePage({ ...t, id: 'tpl--' + t.slug }, { title, og }, `data-template="${escHtml(t.slug)}" data-name="${escHtml(t.name)}"`).catch(() => null);
    if (page) return new Response(page, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': t.hidden || t.draft ? 'private, no-store' : 'public, max-age=60' } });
  }
  return Response.redirect(new URL('/#modeles', url).toString(), 302);
};

export const config: Config = { path: ['/modeles', '/modeles/*'] };
