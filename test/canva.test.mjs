// Offline test: fakes Canva's API, KV and R2, then runs two sync passes.
import assert from 'node:assert';
import { parseTitle, syncNow, canvaRoutes } from '../src/canva.js';
const kv = new Map(), r2 = new Map();
const env = { CANVA_CLIENT_ID: 'cid', CANVA_CLIENT_SECRET: 'sec', CANVA_FOLDER_ID: 'FAF123', SITE_URL: 'https://reefq.com',
  STATE: { get: async k => kv.has(k) ? kv.get(k) : null, put: async (k, v) => kv.set(k, v), delete: async k => kv.delete(k) },
  MEDIA: { put: async (k, b) => r2.set(k, b), get: async k => r2.has(k) ? { body: 'x', writeHttpMetadata() {}, httpEtag: 'e' } : null, delete: async k => r2.delete(k) } };
kv.set('refresh_token', 'rt0');
let designs = [
  { id: 'DAa1', title: 'Zitouna · Olivier doré | mariage, henné [anim]', updated_at: 100, urls: { edit_url: 'https://canva.com/e/1' } },
  { id: 'DAb2', title: 'Layl · Nuit étoilée', updated_at: 200, urls: { edit_url: 'https://canva.com/e/2' } },
  { id: 'DAc3', title: 'Brouillon [draft]', updated_at: 300 }];
let calls = [], refreshes = 0;
globalThis.fetch = async (url, init = {}) => {
  url = String(url); calls.push((init.method || 'GET') + ' ' + url.replace('https://api.canva.com/rest/v1', ''));
  const J = o => new Response(JSON.stringify(o), { status: 200, headers: { 'content-type': 'application/json' } });
  if (url.endsWith('/oauth/token')) { const b = new URLSearchParams(init.body); assert.equal(b.get('grant_type'), 'refresh_token'); assert.equal(b.get('refresh_token'), 'rt' + refreshes); refreshes++; return J({ access_token: 'at' + refreshes, refresh_token: 'rt' + refreshes, expires_in: 14400 }); }
  if (url.includes('/folders/FAF123/items')) return J({ items: designs.map(d => ({ type: 'design', design: d })) });
  if (url.endsWith('/exports') && init.method === 'POST') { const b = JSON.parse(init.body); return J({ job: { id: 'job-' + b.design_id + '-' + b.format.type, status: 'in_progress' } }); }
  if (url.includes('/exports/job-')) return J({ job: { id: 'x', status: 'success', urls: ['https://export-download.canva.com/' + url.split('/').pop()] } });
  if (url.startsWith('https://export-download.canva.com/')) return new Response('bytes');
  throw new Error('unexpected ' + url);
};
globalThis.setTimeout = (f) => { f(); return 0; };
assert.deepEqual(parseTitle('Zitouna · Olivier doré | mariage, henné [anim]'), { theme: 'Zitouna', name: 'Olivier doré', tags: ['mariage', 'henné'], anim: true, draft: false });
let r = await syncNow(env);
assert.equal(r.count, 2); assert.deepEqual(r.exported.sort(), ['Nuit étoilée', 'Olivier doré']); assert.deepEqual(r.skipped, ['Brouillon [draft]']);
assert.equal(kv.get('refresh_token'), 'rt1', 'rotated refresh token saved');
assert.ok(r2.has('templates/DAa1-100.png') && r2.has('templates/DAa1-100.mp4') && r2.has('templates/DAb2-200.png'));
// second pass: one edit, one deletion
designs = [{ ...designs[0], updated_at: 150 }];
calls = [];
r = await syncNow(env);
assert.deepEqual(r.exported, ['Olivier doré']); assert.deepEqual(r.removed, ['Nuit étoilée']);
assert.ok(!r2.has('templates/DAa1-100.png') && r2.has('templates/DAa1-150.png') && !r2.has('templates/DAb2-200.png'));
// public catalog
const res = await canvaRoutes(new Request('https://reefq.com/templates.json'), env, new URL('https://reefq.com/templates.json'));
const cat = await res.json();
assert.equal(cat.items[0].image, '/media/templates/DAa1-150.png');
assert.ok(!('imageKey' in cat.items[0]) && !('editUrl' in cat.items[0]));
console.log('All sync tests passed. Catalog:', JSON.stringify(cat.items[0], null, 1));
