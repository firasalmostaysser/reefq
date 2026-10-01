import type { Config } from '@netlify/functions';
import { invitations, siteTemplates, listJSON } from '../lib/stores.mts';
import { siteFile } from '../lib/sites.mts';

/* Files of a custom design: /site/<owner>/<version>/<path>. The owner is an invitation id, or tpl--<slug> for a website template. */
export default async (req: Request) => {
  const m = new URL(req.url).pathname.match(/^\/site\/([a-z0-9-]{3,80})\/([a-z0-9]{4,16})\/(.+)$/);
  if (!m) return new Response('Not found', { status: 404 });
  const [, owner, ver, path] = m;
  // our copy is served without reading the owner; the owner is only needed to copy a missing file
  const res = await siteFile(null, owner, ver, path);
  if (res.status !== 404) return res;
  const rec = owner.startsWith('tpl--')
    ? (await listJSON(siteTemplates())).find((t: any) => t.slug === owner.slice(5)) || null
    : await invitations().get(owner, { type: 'json' });
  return siteFile(rec, owner, ver, path);
};

export const config: Config = { path: '/site/*' };
