// Offline check of the Canva title rules: node --experimental-strip-types test/canva.test.mjs
import assert from 'node:assert';
const { parseTitle } = await import('../netlify/lib/canva.mts');
assert.deepEqual(parseTitle('Zitouna · Olivier doré | mariage, henné [anim]'), { theme: 'Zitouna', name: 'Olivier doré', tags: ['mariage', 'henné'], anim: true, draft: false });
assert.deepEqual(parseTitle('Nuit étoilée'), { theme: '', name: 'Nuit étoilée', tags: [], anim: false, draft: false });
assert.equal(parseTitle('Layl - Or | x [draft]').draft, true);
console.log('Canva title rules: ok');
