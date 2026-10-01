import type { Config } from '@netlify/functions';
import { invitations } from '../lib/stores.mts';
import { siteFile } from '../lib/sites.mts';

/* Files of a custom design: /site/<invitation id>/<version>/<path> (see lib/sites.mts). */
export default async (req: Request) => {
  const m = new URL(req.url).pathname.match(/^\/site\/([a-z0-9-]{3,80})\/([a-z0-9]{4,16})\/(.+)$/);
  if (!m) return new Response('Not found', { status: 404 });
  const [, iid, ver, path] = m;
  // our copy is served without reading the invitation; the invitation is only needed to copy a missing file
  const res = await siteFile(null, iid, ver, path);
  if (res.status !== 404) return res;
  return siteFile(await invitations().get(iid, { type: 'json' }), iid, ver, path);
};

export const config: Config = { path: '/site/*' };
