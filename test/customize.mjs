// End-to-end test of the Tunisian card options, against `npm run dev` (http://localhost:8888).
// Covers: groom's name first (and the switch), "who invites" (parents with or without the mothers, one or two families) with
// Arabic grammar, closing line, sections turned off by the couple (RSVP form), Arabic as the default language, the studio fields.
// Usage: BASE=http://localhost:8888 PASSWORD=change-me node test/customize.mjs
import { chromium } from 'playwright';
import assert from 'node:assert';
const BASE = process.env.BASE || 'http://localhost:8888', PASSWORD = process.env.PASSWORD || 'change-me';
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const errs = [];
const page = async (w, h) => { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message)); return p; };
const step = t => console.log('·', t);
const csave = async p => { await p.click('#b-save'); await p.waitForFunction(() => /^Enregistré$/.test(document.querySelector('#b-status').textContent) || !document.querySelector('#b-err').hidden); };

const c = await page(390, 844);
await c.goto(BASE + '/'); await c.fill('#o-names', 'Nour & Sami'); await c.fill('#o-phone', '98 444 555'); await c.fill('#o-date', '2027-07-03');
await c.selectOption('#o-plan', 'Signature'); await c.click('#of button[type=submit]');
await c.waitForURL(/\/commande\/RQ-/); await c.waitForSelector('#b-form:not([hidden])');
const code = c.url().match(/RQ-[A-Z0-9]{5}/)[0];

step('Arabic is the default language; the groom is asked first');
assert.equal(await c.inputValue('#b-lang'), 'ar');
assert.match(await c.locator('#b-form fieldset').first().locator('label').first().textContent(), /marié/);

step('parents of both sides with the mothers: يتشرّف … وحرمه / والسيد … وحرمه / ابنيهما, groom first, closing, RSVP off');
await c.fill('#b-b', 'Sami'); await c.fill('#b-b-ar', 'سامي'); await c.fill('#b-a', 'Nour'); await c.fill('#b-a-ar', 'نور');
await c.selectOption('#b-hmode', 'parents'); assert.equal(await c.inputValue('#b-tone'), 'hosts', 'the text switches to the continuation');
await c.fill('#b-hg-fr', 'Mohamed Ben Salah'); await c.fill('#b-hg-ar', 'محمد بن صالح'); await c.fill('#b-hb-fr', 'Ali Trabelsi'); await c.fill('#b-hb-ar', 'علي الطرابلسي');
await c.selectOption('#b-close', 'dua'); await c.uncheck('[data-show="rsvp"]');
await c.click('#b-pv-btn'); const pv = c.frameLocator('#b-frame'); await pv.locator('.rq3-seal').click();
await pv.locator('.rq-hosts').waitFor({ timeout: 8000 });
const hero = (await pv.locator('.hero').innerText()).replace(/\s+/g, ' ');
assert.match(hero, /يتشرّف السيد محمد بن صالح وحرمه والسيد علي الطرابلسي وحرمه بدعوتكم لحضور حفل زفاف ابنيهما سامي ونور/);
assert.match(hero, /بارك الله لهما وبارك عليهما وجمع بينهما في خير/);
assert.equal(await pv.locator('#rq-rsvp').count(), 0, 'the RSVP form is hidden in the preview');
await csave(c);

step('the guests see the same, in French too');
const s = await page(1300, 900);
await s.goto(BASE + '/studio/'); await s.fill('#l-pass', PASSWORD); await s.click('#l-form button'); await s.waitForSelector('#studio:not([hidden])');
const sapi = (path, opts) => s.evaluate(async ([p, o]) => { const r = await fetch(p, o && { method: o.method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(o.body) }); return { status: r.status, body: await r.json().catch(() => null) }; }, [path, opts]);
await sapi(`/api/orders/${code}/status`, { method: 'POST', body: { action: 'confirm', amountReceived: 249 } });
const iid = (await sapi(`/api/orders/${code}`)).body.inviteId;
const saved = (await sapi(`/api/invitations/${iid}`)).body;
assert.deepEqual(saved.hosts, { mode: 'parents', mothers: true, g: { fr: 'Mohamed Ben Salah', ar: 'محمد بن صالح' }, b: { fr: 'Ali Trabelsi', ar: 'علي الطرابلسي' } });
assert.equal(saved.show.rsvp, false); assert.equal(saved.lang, 'ar'); assert.equal(saved.message.ar, '');
const g = await page(390, 844);
await g.goto(`${BASE}/i/${iid}`); await g.click('.rq3-seal'); await g.locator('.rq-hosts').waitFor({ timeout: 8000 });
assert.equal(await g.locator('#rq-rsvp').count(), 0, 'no RSVP form for the guests');
await g.click('[data-lang="fr"]');
const fr = (await g.locator('.hero').innerText()).replace(/\s+/g, ' ');
assert.match(fr, /Monsieur et Madame Mohamed Ben Salah et Monsieur et Madame Ali Trabelsi ont l'honneur de vous convier au mariage de leurs enfants Sami & Nour/);
assert.equal(await g.title(), 'سامي ونور', 'the tab title follows the invitation language, with و attached');

step('one family, bride side: تتشرّف عائلة … / ابنتها; bride first when chosen');
await c.click('#b-toggle'); await c.selectOption('#b-hmode', 'families');
await c.fill('#b-hg-fr', ''); await c.fill('#b-hg-ar', ''); await c.fill('#b-hb-fr', 'Trabelsi'); await c.fill('#b-hb-ar', 'عائلة الطرابلسي');
await c.selectOption('#b-order', 'bride'); await c.check('[data-show="rsvp"]'); await csave(c);
await g.reload(); await g.click('.rq3-seal'); await g.locator('.rq-hosts').waitFor({ timeout: 8000 });
const one = (await g.locator('.hero').innerText()).replace(/\s+/g, ' ');
assert.match(one, /تتشرّف عائلة الطرابلسي بدعوتكم لحضور حفل زفاف ابنتها نور وسامي/, 'the typed "عائلة" is not repeated, bride first');
assert.equal(await g.locator('#rq-rsvp').count(), 1, 'RSVP form back');

step('a father alone (no mothers), groom side: يتشرّف السيد … / نجله; French "a … son fils"');
await c.click('#b-toggle'); await c.selectOption('#b-hmode', 'parents'); await c.uncheck('#b-hmothers');
await c.fill('#b-hg-fr', 'Mohamed Ben Salah'); await c.fill('#b-hg-ar', 'محمد بن صالح'); await c.fill('#b-hb-fr', ''); await c.fill('#b-hb-ar', '');
await c.selectOption('#b-order', 'groom'); await csave(c);
await g.reload(); await g.click('.rq3-seal'); await g.locator('.rq-hosts').waitFor({ timeout: 8000 });
assert.match((await g.locator('.hero').innerText()).replace(/\s+/g, ' '), /يتشرّف السيد محمد بن صالح بدعوتكم لحضور حفل زفاف نجله سامي ونور/);
await g.click('[data-lang="fr"]');
assert.match((await g.locator('.hero').innerText()).replace(/\s+/g, ' '), /Monsieur Mohamed Ben Salah a l'honneur de vous convier au mariage de son fils Sami & Nour/);

step('studio shows the same choices and edits them');
await s.click('#tab-list'); await s.waitForSelector(`[data-card="${iid}"]`); await s.click(`[data-card="${iid}"] [data-la=edit]`);
await s.waitForFunction(() => document.querySelector('#k-hmode').value === 'parents' && document.querySelector('#k-hg-ar').value === 'محمد بن صالح');
assert.equal(await s.isChecked('#k-hmothers'), false); assert.equal(await s.inputValue('#k-order'), 'groom');
await s.check('#k-hmothers'); await s.waitForFunction(() => document.querySelector('#status').textContent === 'Saved', null, { timeout: 8000 });
assert.equal((await sapi(`/api/invitations/${iid}`)).body.hosts.mothers, true);

await sapi(`/api/orders/${code}`, { method: 'DELETE' }); await sapi(`/api/invitations/${iid}`, { method: 'DELETE' });
assert.deepEqual(errs, []);
console.log('Customisation passed:', code, iid);
await b.close();
