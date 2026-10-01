// Offline check of the Canva title rules: node --experimental-strip-types test/canva.test.mjs
import assert from 'node:assert';
const { parseTitle } = await import('../netlify/lib/canva.mts');
assert.deepEqual(parseTitle('Zitouna · Olivier doré | mariage, henné [anim]'), { theme: 'Zitouna', name: 'Olivier doré', tags: ['mariage', 'henné'], anim: true, draft: false });
assert.deepEqual(parseTitle('Nuit étoilée'), { theme: '', name: 'Nuit étoilée', tags: [], anim: false, draft: false });
assert.equal(parseTitle('Layl - Or | x [draft]').draft, true);
console.log('Canva title rules: ok');

// Sync: a website design (PNG export refused) falls back to its thumbnail, a broken design never stops the others.
const { syncWith } = await import('../netlify/lib/canva.mts');
const mem = () => { const m = new Map(); return { m, get: async k => m.get(k) ?? null, put: async (k, v) => { m.set(k, v); }, delete: async k => { m.delete(k); } }; };
const STATE = mem(), MEDIA = mem();
await STATE.put('access_token', 'tok');
const env = { CANVA_FOLDER_ID: 'F1', STATE, MEDIA };
const designs = [
  { id: 'web1', title: 'Jasmin · Site | web', updated_at: 100, thumbnail: { url: 'https://thumb.test/web1.jpg' } },
  { id: 'card1', title: 'Zitouna · Carte', updated_at: 200, thumbnail: { url: 'https://thumb.test/card1.png' } },
  { id: 'bad1', title: 'Cassé', updated_at: 300 }
];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  const u = String(url), ok = (body, type = 'application/json') => new Response(typeof body === 'string' || body instanceof Uint8Array ? body : JSON.stringify(body), { status: 200, headers: { 'content-type': type } });
  if (u.includes('/folders/F1/items')) return ok({ items: designs.map(design => ({ type: 'design', design })) });
  if (u.endsWith('/exports') && init.method === 'POST') {
    const { design_id } = JSON.parse(init.body);
    if (design_id === 'card1') return ok({ job: { id: 'j1', status: 'success', urls: ['https://dl.test/card1.png'] } });
    return new Response('{"code":"invalid_field","message":"png export not supported for requested page(s)"}', { status: 400 });
  }
  if (u === 'https://dl.test/card1.png') return ok(new Uint8Array([1, 2, 3]), 'image/png');
  if (u === 'https://thumb.test/web1.jpg') return ok(new Uint8Array([4, 5]), 'image/jpeg');
  throw new Error('unexpected fetch ' + u);
};
try {
  const r = await syncWith(env);
  assert.deepEqual(r.exported.sort(), ['Carte', 'Site']);
  assert.equal(r.failed.length, 1); assert.equal(r.failed[0].title, 'Cassé');
  const cat = JSON.parse(await STATE.get('catalog'));
  assert.deepEqual(cat.items.map(i => i.image).sort(), ['/media/templates/card1-200.png', '/media/templates/web1-100.jpg']);
  assert.ok(MEDIA.m.has('templates/web1-100.jpg') && MEDIA.m.has('templates/card1-200.png'));
  assert.equal(JSON.parse(await STATE.get('status')).failed.length, 1);
} finally { globalThis.fetch = realFetch; }
console.log('Canva sync (website thumbnails, per-design errors): ok');
