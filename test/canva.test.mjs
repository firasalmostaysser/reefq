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

// Website templates folder: records follow Canva (name, tags, picture); address and copy set in the studio are kept;
// designs removed from the folder are removed with their copy; templates added by hand are never touched.
{
  const STATE2 = mem(), MEDIA2 = mem(), recs = new Map(), dropped = [];
  await STATE2.put('access_token', 'tok');
  const TEMPLATES = { list: async () => [...recs.values()], put: async (id, v) => { recs.set(id, structuredClone(v)); }, delete: async id => { recs.delete(id); } };
  recs.set('m-hand', { id: 'm-hand', source: 'manual', slug: 'fait-main', name: 'Fait main' });
  recs.set('gone1', { id: 'gone1', source: 'canva', slug: 'ancien', name: 'Ancien', imageKey: 'templates/site-gone1-1.jpg' });
  const env2 = { CANVA_TEMPLATES_FOLDER_ID: 'T1', STATE: STATE2, MEDIA: MEDIA2, TEMPLATES, DROP_SITE: async o => { dropped.push(o); } };
  let folder = [
    { id: 'site1', title: 'Jasmin · Olivier | vert, jardin', updated_at: 10, thumbnail: { url: 'https://thumb.test/site1.jpg' } },
    { id: 'site2', title: 'Olivier', updated_at: 11, thumbnail: { url: 'https://thumb.test/site2.jpg' } }
  ];
  const realFetch2 = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.includes('/folders/T1/items')) return new Response(JSON.stringify({ items: folder.map(design => ({ type: 'design', design })) }), { headers: { 'content-type': 'application/json' } });
    if (u.endsWith('/exports')) return new Response('{"message":"png export not supported"}', { status: 400 });
    if (u.startsWith('https://thumb.test/')) return new Response(new Uint8Array([9]), { headers: { 'content-type': 'image/jpeg' } });
    throw new Error('unexpected fetch ' + u);
  };
  try {
    const r = await syncWith(env2);
    assert.equal(r.sites.count, 2); assert.deepEqual(r.sites.removed, ['Ancien']); assert.deepEqual(dropped, ['tpl--ancien']);
    assert.equal(recs.get('site1').slug, 'olivier'); assert.equal(recs.get('site2').slug, 'olivier-2');
    assert.deepEqual(recs.get('site1').tags, ['vert', 'jardin']); assert.equal(recs.get('site1').image, '/media/templates/site-site1-10.jpg');
    assert.ok(recs.has('m-hand'));
    // the studio publishes site1; a later edit in Canva updates name and picture but keeps the address, copy and slug
    Object.assign(recs.get('site1'), { siteUrl: 'https://x.my.canva.site/olivier', status: 'published', canvaVer: 'v1' });
    folder[0] = { ...folder[0], title: 'Jasmin · Olivier doré | vert', updated_at: 12 };
    await syncWith(env2);
    const s1 = recs.get('site1');
    assert.equal(s1.name, 'Olivier doré'); assert.equal(s1.slug, 'olivier'); assert.equal(s1.status, 'published'); assert.equal(s1.canvaVer, 'v1');
    assert.equal(s1.image, '/media/templates/site-site1-12.jpg'); assert.ok(!MEDIA2.m.has('templates/site-site1-10.jpg'));
  } finally { globalThis.fetch = realFetch2; }
  console.log('Canva website templates sync: ok');
}
