/**
 * Reefq — one site:
 *   /            landing page (static, public/index.html)
 *   /studio/     Reefq Studio (static app, talks to /api)
 *   /i/<id>      a couple's invitation (public/i/index.html + link-preview tags)
 *   /api/*       studio + public API (D1)
 *   /templates.json, /media/*   Canva templates and uploaded photos (R2)
 */
import { handleApi } from './api.js';
import { canvaRoutes, scheduledSync } from './canva.js';
import { err, escHtml, HttpError } from './lib.js';

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    try {
      if (url.pathname.startsWith('/api/')) return withSecurity(await handleApi(req, env, url));
      if (url.pathname.startsWith('/i/')) return withSecurity(await invitationPage(req, env, url));
      const c = await canvaRoutes(req, env, url);
      if (c) return c;
      return env.ASSETS.fetch(req);
    } catch (e) {
      if (e instanceof HttpError) return err(e.status, e.message);
      console.error(e);
      return err(500, 'Something went wrong.');
    }
  },
  async scheduled(_evt, env, ctx) { ctx.waitUntil(scheduledSync(env)); }
};

/* Serve the viewer and set the WhatsApp/Facebook preview to the couple's names. */
async function invitationPage(req, env, url) {
  const m = url.pathname.match(/^\/i\/([a-z0-9-]{3,80})\/?$/);
  const page = await env.ASSETS.fetch(new Request(new URL('/i/', url), req));
  if (!m) return page;
  let title = 'Invitation · Reefq', desc = 'Vous êtes invité·e. Touchez le sceau pour ouvrir.';
  if (m[1] !== 'demo') {
    const r = await env.DB.prepare('SELECT data FROM invitations WHERE id=?').bind(m[1]).first();
    if (r) {
      const inv = JSON.parse(r.data), a = inv.a && inv.a.name, b = inv.b && inv.b.name;
      if (a && b) title = `${a} & ${b} · Invitation`;
      if (inv.date) desc = `${new Date(inv.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}${inv.city ? ' · ' + inv.city : ''}`;
    }
  }
  const image = new URL('/assets/og.jpg', url).toString();
  return new HTMLRewriter()
    .on('title', { element(e) { e.setInnerContent(title); } })
    .on('head', { element(e) {
      e.append(`<meta property="og:title" content="${escHtml(title)}"><meta property="og:description" content="${escHtml(desc)}"><meta property="og:image" content="${escHtml(image)}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image">`, { html: true });
    } })
    .transform(page);
}

function withSecurity(res) {
  const h = new Headers(res.headers);
  h.set('x-content-type-options', 'nosniff');
  h.set('referrer-policy', 'strict-origin-when-cross-origin');
  return new Response(res.body, { status: res.status, headers: h });
}
