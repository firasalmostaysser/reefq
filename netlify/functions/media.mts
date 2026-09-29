import type { Config } from '@netlify/functions';
import { files } from '../lib/stores.mts';
import { catalog } from '../lib/canva.mts';
import { json } from '../lib/util.mts';

const TYPES: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', mp4: 'video/mp4' };

/* Public media: invitation photos (uploads/…) and Canva exports (templates/…). Payment proofs are never served here. */
export default async (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname === '/templates.json') return json(await catalog(), 200, { 'cache-control': 'public, max-age=60' });
  const key = decodeURIComponent(url.pathname.replace(/^\/media\//, ''));
  if (!/^(uploads|templates)\/[A-Za-z0-9._-]+$/.test(key)) return new Response('Not found', { status: 404 });
  const data = await files().get(key, { type: 'arrayBuffer' });
  if (!data) return new Response('Not found', { status: 404 });
  const ext = key.split('.').pop()!.toLowerCase();
  return new Response(data, { headers: { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable' } });
};

export const config: Config = { path: ['/media/*', '/templates.json'] };
