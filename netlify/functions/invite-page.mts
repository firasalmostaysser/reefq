import type { Config } from '@netlify/functions';
import { invitations } from '../lib/stores.mts';
import { escHtml } from '../lib/util.mts';
import { sitePage } from '../lib/sites.mts';

/* Serves /i/<id> with the couple's names in the WhatsApp/Facebook link preview. A published custom design is served from our copy. */
export default async (req: Request) => {
  const url = new URL(req.url);
  const m = url.pathname.match(/^\/i\/([a-z0-9-]{3,80})\/?$/);
  let title = 'Invitation · Reefq', desc = 'Vous êtes invité·e. Touchez le sceau pour ouvrir.', inv: any = null;
  if (m && m[1] !== 'demo') {
    inv = await invitations().get(m[1], { type: 'json' });
    if (inv) {
      if (inv.a?.name && inv.b?.name) title = `${inv.a.name} & ${inv.b.name} · Invitation`;
      if (inv.date) desc = new Date(inv.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + (inv.city ? ' · ' + inv.city : '');
    }
  }
  const og = `<meta property="og:title" content="${escHtml(title)}"><meta property="og:description" content="${escHtml(desc)}"><meta property="og:image" content="${escHtml(new URL('/assets/og.jpg', url).toString())}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image">`;
  if (inv && inv.designSource === 'canva' && inv.canvaStatus === 'published' && !inv.locked) {
    const page = await sitePage(inv, { title, og }).catch(() => null);
    if (page) return new Response(page, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' } });
  }
  const page = await fetch(new URL('/i/index.html', url));
  let html = await page.text();
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(title)}</title>`).replace('</head>', og + '</head>');
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' } });
};

export const config: Config = { path: '/i/*', excludedPath: '/i/index.html' };
