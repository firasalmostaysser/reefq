// End-to-end test of editing an invitation, against `npm run dev` (http://localhost:8888).
// Covers: live preview stays open while typing (client space and studio) → guests corrected in place keep their link →
// edits after payment reach the guests → the couple and the studio never overwrite each other silently (both choices) →
// the studio picks up the couple's changes when it comes back into view → validation messages.
// Usage: BASE=http://localhost:8888 PASSWORD=change-me node test/edits.mjs
import { chromium } from 'playwright';
import assert from 'node:assert';
const BASE = process.env.BASE || 'http://localhost:8888', PASSWORD = process.env.PASSWORD || 'change-me';
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const errs = [];
const page = async (w, h) => { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message)); return p; };
const step = t => console.log('·', t);
// saving from the client space: wait for the answer (the 'saved' banner is already there after the first save)
const csave = async (p, sel = '#b-save') => { await p.click(sel); await p.waitForFunction(() => /^(Enregistré|Dernière version chargée)$/.test(document.querySelector('#b-status').textContent) || !document.querySelector('#b-err').hidden); };

// a couple orders and lands on their client space with the form open
const c = await page(390, 844);
await c.goto(BASE + '/'); await c.fill('#o-names', 'Hana & Ali'); await c.fill('#o-phone', '98 222 333'); await c.fill('#o-date', '2027-08-14'); await c.fill('#o-city', 'Nabeul');
await c.selectOption('#o-plan', 'Signature'); await c.click('#of button[type=submit]');
await c.waitForURL(/\/commande\/RQ-/); await c.waitForSelector('#b-form:not([hidden])');
const code = c.url().match(/RQ-[A-Z0-9]{5}/)[0], tok = new URL(c.url()).searchParams.get('t');
const view = async () => (await c.request.get(`${BASE}/api/public/orders/${code}?t=${tok}`)).json();

step('client preview: once the envelope is opened, edits redraw it open with the change in view');
await c.click('#b-pv-btn'); const pv = c.frameLocator('#b-frame');
await pv.locator('.rq3-seal').click(); await pv.locator('.rq-where').waitFor({ timeout: 8000 });
await c.fill('#b-venue', 'Dar Nabeul'); await c.fill('#b-seats', '4');
await pv.locator('.rq-where', { hasText: 'Dar Nabeul' }).waitFor({ timeout: 3000 });
assert.equal(await pv.locator('.rq3-seal').count(), 0, 'the preview stays open while typing');

step('validation: both names and the date are required');
await c.fill('#b-b', ''); await c.click('#b-save');
assert.match(await c.textContent('#b-err'), /deux prénoms/); await c.fill('#b-b', 'Ali');

step('client guests: added, corrected in place (number, seats), the link id is kept');
await c.fill('#b-paste', 'Famille Trabelsi, 20 111 111, 2'); await c.click('#b-add');
await csave(c);
let v = await view(); const gid = v.brief.guests[0].id; assert.ok(gid);
await c.click('#b-toggle'); await c.click('[data-edb="0"]');
await c.fill('#ge-name', ''); await c.click('#ge-ok'); assert.equal(await c.locator('#ge-name').count(), 1, 'an empty name is refused');
await c.fill('#ge-name', 'Famille Trabelsi'); await c.fill('#ge-phone', '55 999 000'); await c.fill('#ge-seats', '5'); await c.click('#ge-ok');
assert.match(await c.textContent('#b-glist'), /55 999 000 · 5 pl\./); assert.match(await c.textContent('#b-status'), /non enregistrées/);
// a guest still being edited is kept when saving
await c.click('[data-edb="0"]'); await c.fill('#ge-seats', '6'); await csave(c);
v = await view(); assert.deepEqual(v.brief.guests.map(g => [g.id, g.phone, g.seats]), [[gid, '55 999 000', 6]]);

step('studio: sign in, confirm the payment');
const s = await page(1300, 900);
await s.goto(BASE + '/studio/'); await s.fill('#l-pass', PASSWORD); await s.click('#l-form button'); await s.waitForSelector('#studio:not([hidden])');
const sapi = (path, opts) => s.evaluate(async ([p, o]) => { const r = await fetch(p, o && { method: o.method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(o.body) }); return { status: r.status, body: await r.json().catch(() => null) }; }, [path, opts]);
assert.equal((await sapi(`/api/orders/${code}/status`, { method: 'POST', body: { action: 'confirm', amountReceived: 249 } })).status, 200);
const iid = (await sapi(`/api/orders/${code}`)).body.inviteId;
const pub = async () => (await (await s.request.get(`${BASE}/api/public/invitations/${iid}`)).json()).invitation;

step('after payment, the couple edits and guests see it on the same link');
await c.reload(); await c.waitForSelector('#b-toggle:not([hidden])'); await c.click('#b-toggle');
await c.fill('#b-venue', 'Dar Hammamet'); await c.fill('#b-time', '21:30'); await csave(c);
assert.match(await c.textContent('#b-done'), /en ligne/);
let p = await pub(); assert.equal(p.venue, 'Dar Hammamet'); assert.equal(p.time, '21:30'); assert.equal(p.maxGuests, 4);
const g = await page(390, 844); await g.goto(`${BASE}/i/${iid}?g=${gid}`); await g.click('.rq3-seal');
await g.locator('.rq-where', { hasText: 'Dar Hammamet' }).waitFor({ timeout: 8000 });
assert.match(await g.textContent('.rq-scroll'), /Famille Trabelsi|6/);

step('studio opens the invitation: latest version, preview stays open while typing');
await s.click('#tab-list'); await s.waitForSelector(`[data-card="${iid}"]`); await s.click(`[data-card="${iid}"] [data-la=edit]`);
await s.waitForFunction(() => document.querySelector('#k-venue').value === 'Dar Hammamet');
await s.click('#pv-open'); await s.locator('#screen .rq-where').waitFor();
await s.fill('#k-venue', 'Dar Hammamet Sud'); await s.locator('#screen .rq-where', { hasText: 'Dar Hammamet Sud' }).waitFor({ timeout: 3000 });
await s.fill('#k-venue', 'Dar Hammamet');

step('studio guests: corrected in place, the link is kept');
await s.click('#tab-guests'); await s.click('[data-edg="0"]'); await s.fill('#sge-phone', '55 999 111'); await s.click('#sge-ok');
await s.waitForFunction(() => document.querySelector('#status').textContent === 'Saved');
let full = (await sapi(`/api/invitations/${iid}`)).body; assert.deepEqual(full.guests.map(x => [x.id, x.phone]), [[gid, '55 999 111']]);

step('studio refreshes by itself when it comes back into view');
await c.reload(); await c.waitForSelector('#b-toggle:not([hidden])'); await c.click('#b-toggle');
await c.fill('#b-dress', 'Tenue claire'); await csave(c);
await s.click('#tab-design');
await s.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
await s.waitForFunction(() => document.querySelector('#k-dress').value === 'Tenue claire');

step('studio saving over a newer couple edit: asks; "Load latest" shows theirs');
await c.click('#b-toggle'); await c.fill('#b-venue', 'Dar Couple'); await csave(c);
await s.fill('#k-venue', 'Dar Studio'); await s.click('#btn-save');
await s.waitForSelector('#dlg[open]'); assert.match(await s.textContent('#dlg-title'), /changed meanwhile/);
await s.click('#dlg-ok'); await s.waitForFunction(() => document.querySelector('#k-venue').value === 'Dar Couple');
assert.equal((await pub()).venue, 'Dar Couple');

step('… and "Keep mine" saves the studio version');
await c.click('#b-toggle'); await c.fill('#b-venue', 'Dar Couple 2'); await csave(c);
await s.fill('#k-venue', 'Dar Studio'); await s.click('#btn-save');
await s.waitForSelector('#dlg[open]'); await s.click('#dlg-cancel');
await s.waitForFunction(() => document.querySelector('#status').textContent === 'Saved');
assert.equal((await pub()).venue, 'Dar Studio');

step('couple saving over a newer studio edit: asks; "Voir la dernière version" shows ours');
await c.click('#b-toggle'); await c.fill('#b-venue', 'Dar Couple 3');
full = (await sapi(`/api/invitations/${iid}`)).body;
assert.equal((await sapi(`/api/invitations/${iid}`, { method: 'PUT', body: { ...full, dress: 'Studio dress' } })).status, 200);
await c.click('#b-save'); await c.waitForSelector('#st-load');
await c.click('#st-load'); await c.waitForFunction(() => document.querySelector('#b-dress').value === 'Studio dress');
assert.equal(await c.inputValue('#b-venue'), 'Dar Studio');

step('… and "Garder mes modifications" saves the couple version');
await c.fill('#b-venue', 'Dar Couple 4');
full = (await sapi(`/api/invitations/${iid}`)).body;
await sapi(`/api/invitations/${iid}`, { method: 'PUT', body: { ...full, dress: 'Studio dress 2' } });
await c.click('#b-save'); await c.waitForSelector('#st-keep'); await csave(c, '#st-keep');
p = await pub(); assert.equal(p.venue, 'Dar Couple 4');

step('a stale studio copy sent straight to the API is refused, a current one is accepted');
const old = { ...full, updatedAt: 1 };
assert.equal((await sapi(`/api/invitations/${iid}`, { method: 'PUT', body: old })).status, 409);
full = (await sapi(`/api/invitations/${iid}`)).body;
assert.equal((await sapi(`/api/invitations/${iid}`, { method: 'PUT', body: full })).status, 200);

step('client space: unsaved typing survives a reload');
c.on('dialog', d => d.accept()); s.on('dialog', d => d.accept());
await c.reload(); await c.waitForSelector('#b-toggle:not([hidden])'); // the studio changed it just before: start from the latest version
await c.click('#b-toggle'); await c.fill('#b-venue', 'Dar pas encore enregistré'); await c.waitForTimeout(700);
await c.reload(); await c.waitForFunction(() => document.querySelector('#b-venue').value === 'Dar pas encore enregistré');
assert.match(await c.textContent('#b-status'), /retrouvées/);
await csave(c); assert.equal((await pub()).venue, 'Dar pas encore enregistré');
await c.reload(); await c.waitForSelector('#b-toggle:not([hidden])'); assert.doesNotMatch(await c.textContent('#b-status'), /retrouvées/, 'nothing to restore once saved');

step('studio auto-saves a saved invitation without pressing Save');
await s.click('#tab-design'); await s.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
await s.waitForFunction(() => document.querySelector('#k-venue').value === 'Dar pas encore enregistré');
await s.fill('#k-dress', 'Auto dress'); await s.waitForFunction(() => document.querySelector('#status').textContent === 'Saved', null, { timeout: 8000 });
assert.equal((await pub()).dress, 'Auto dress');

step('studio: a new couple without both names is never dropped silently, and comes back after a reload');
await s.click('#btn-new'); await s.fill('#k-a-name', 'Solo');
await s.click(`[data-inv="${iid}"]`); await s.waitForSelector('#dlg[open]'); assert.match(await s.textContent('#dlg-title'), /Leave unsaved/);
await s.click('#dlg-cancel'); assert.equal(await s.inputValue('#k-a-name'), 'Solo');
await s.reload(); await s.waitForSelector('#dlg[open]'); assert.match(await s.textContent('#dlg-title'), /Restore unsaved/);
await s.click('#dlg-ok'); await s.waitForFunction(() => document.querySelector('#k-a-name').value === 'Solo');
await s.click(`[data-inv="${iid}"]`); await s.waitForSelector('#dlg[open]'); await s.click('#dlg-ok');
await s.waitForFunction(id => document.querySelector(`[data-inv="${id}"]`).getAttribute('aria-pressed') === 'true', iid);
await s.reload(); await s.waitForSelector('#studio:not([hidden])'); await s.waitForTimeout(1500);
assert.equal(await s.locator('#dlg[open]').count(), 0, 'a discarded draft is not offered again');

step('orders: typing is never wiped by the refresh, the internal note saves itself');
await s.click('#tab-orders'); await s.click('[data-of=all]'); await s.click(`[data-od="${code}"]`);
await s.fill('#od-note', 'Called the bride'); await s.fill('#od-reason', 'still typing');
await s.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await s.waitForTimeout(2500);
assert.equal(await s.inputValue('#od-reason'), 'still typing'); assert.equal(await s.inputValue('#od-note'), 'Called the bride');
assert.equal((await sapi(`/api/orders/${code}`)).body.adminNote, 'Called the bride');

step('notifications: a new order shows up in the studio while it is open');
await s.click('#tab-list');
const n = await page(390, 844); await n.goto(BASE + '/'); await n.fill('#o-names', 'Ines & Yassine'); await n.fill('#o-phone', '98 333 444');
await n.selectOption('#o-plan', 'Essentiel'); await n.click('#of button[type=submit]'); await n.waitForURL(/\/commande\/RQ-/);
const ncode = n.url().match(/RQ-[A-Z0-9]{5}/)[0];
await s.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
await s.waitForSelector(`.toast:has-text("New order ${ncode}")`);
await s.waitForFunction(() => !document.querySelector('#o-badge').hidden && /^\(\d+\) /.test(document.title));
await s.click('#tab-orders'); await s.click('[data-of=all]'); await s.waitForSelector(`tr:has([data-od="${ncode}"]) .pill:has-text("New")`);
assert.equal(new URL(s.url()).hash, '#orders', 'the open section is kept in the address');
await sapi(`/api/orders/${ncode}`, { method: 'DELETE' });

// clean up
await sapi(`/api/orders/${code}`, { method: 'DELETE' }); await sapi(`/api/invitations/${iid}`, { method: 'DELETE' });
assert.deepEqual(errs, []);
console.log('Edit flows passed:', code, iid);
await b.close();
