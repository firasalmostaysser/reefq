// End-to-end test against `npm run dev` (http://localhost:8888).
// Covers: order on the landing page → client space → bank-transfer proof → studio verification →
// invitation created (wording from templates) → Deliver QR codes → client space unlocked (guest QR) →
// guest opens personal link and replies → reply visible → archive keeps the link working.
// Usage: BASE=http://localhost:8888 PASSWORD=change-me node test/smoke.mjs
import { chromium } from 'playwright';
import assert from 'node:assert';
import { writeFileSync } from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:8888', PASSWORD = process.env.PASSWORD || 'change-me';
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const errs = [];
const page = async (w, h) => { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message)); return p; };
const shot = (p, n) => process.env.SHOTS && p.screenshot({ path: `test/out-${n}.png` });

// 1. A couple orders on the landing page and lands on their client space
const c = await page(390, 844);
await c.goto(BASE + '/'); await c.waitForSelector('#demo .rq3-seal');
// the landing demo opens its envelope by itself once it is on screen (about 1.5 s + the opening animation)
await c.waitForFunction(() => !document.querySelector('#demo .rq3') && document.querySelector('#demo .rq-scroll'), null, { timeout: 10000 });
await c.fill('#o-names', 'Nour & Sami'); await c.fill('#o-phone', '98 765 432'); await c.fill('#o-date', '2027-06-19'); await c.fill('#o-city', 'Sfax');
await c.selectOption('#o-plan', 'Signature');
await c.click('#of button[type=submit]');
await c.waitForURL(/\/commande\/RQ-/); await c.waitForSelector('#pay:not([hidden])');
assert.match(await c.textContent('#p-amount'), /125 DT/);
const clientUrl = c.url(), code = clientUrl.match(/RQ-[A-Z0-9]{5}/)[0];
await shot(c, '1-pay');

// 2. They upload the transfer receipt
writeFileSync('/tmp/reefq-receipt.png', Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000' + '1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082'.repeat(1) + '00'.repeat(1200), 'hex'));
await c.setInputFiles('#proof-file', '/tmp/reefq-receipt.png');
await c.click('#proof-send'); await c.waitForSelector('#checking:not([hidden])');
await shot(c, '2-checking');

// 3. Studio: sign in, review the proof, confirm, create the invitation
const s = await page(1300, 900);
await s.goto(BASE + '/studio/'); await s.waitForSelector('#login:not([hidden])');
await s.fill('#l-pass', PASSWORD); await s.click('#l-form button'); await s.waitForSelector('#studio:not([hidden])');
await s.click('#tab-orders'); await s.waitForSelector(`[data-od="${code}"]`);
await s.click(`[data-od="${code}"]`); await s.waitForSelector('#od-proof img, #od-proof a');
await shot(s, '3-review');
await s.fill('#od-amount', '125'); await s.click('#od-confirm');
await s.waitForFunction(() => /Paid/.test(document.querySelector('#od-status').textContent));
await s.click('#od-invite'); await s.waitForFunction(() => document.querySelector('#k-a-name').value === 'Nour');
// wording comes from the ready-made texts (no AI): occasion + tone fill the three languages
await s.selectOption('#w-tone', 'families'); await s.selectOption('#w-open', 'bismillah'); await s.click('#w-use');
await s.waitForFunction(() => document.querySelector('#k-msg-fr').value.length > 20 && document.querySelector('#k-msg-ar').value.length > 10);
await s.fill('#k-venue', 'Dar Sfax'); await s.click('#btn-save'); await s.waitForFunction(() => document.querySelector('#status').textContent === 'Saved');
await s.click('#tab-guests'); await s.fill('#g-paste', 'Famille Karray, 22 111 333, 2'); await s.click('#g-add');
await s.waitForFunction(() => document.querySelector('#status').textContent === 'Saved');
// Deliver shows the invitation QR and one QR per guest
await s.click('#tab-deliver'); await s.waitForSelector('#qr svg'); await s.waitForSelector('[data-gq="0"][data-k=png]');
assert.equal(await s.isDisabled('#gq-print'), false);

// 4. Client space is unlocked (client role): invitation link + guest links
await c.reload(); await c.waitForSelector('#space:not([hidden]) #inv-box:not([hidden])');
const invUrl = await c.textContent('#inv-link');
await c.waitForSelector('[data-gl="0"]'); await c.waitForSelector('[data-gq="0"][data-k=png]');
await shot(c, '4-client-space');

// 5. The guest opens their personal link and replies
const inv = invUrl.split('/i/')[1];
const saved = await s.evaluate(async id => (await (await fetch('/api/invitations/' + id)).json()), inv);
assert.equal(saved.opening, 'bismillah');
const gid = saved.guests[0].id;
const g = await page(390, 844);
await g.goto(`${BASE}/i/${inv}?g=${gid}`); await g.waitForSelector('.rq3-seal');
assert.match(await g.textContent('.rq3-dear'), /Famille Karray/);
await g.click('.rq3-seal'); await g.waitForSelector('#rq-rsvp', { timeout: 8000 });
await g.check('#rq-att-yes'); await g.click('.rq-send'); await g.waitForSelector('.rq-thanks');

// 6. Couple sees the reply in their client space
await c.reload(); await c.waitForFunction(() => document.querySelector('#t-coming').textContent === '2');
await shot(c, '5-client-replies');

// 7. Invitations list: the card shows the reply; archiving hides it from Active but the link keeps working
await s.click('#tab-list'); await s.waitForSelector(`[data-card="${inv}"]`);
await s.waitForFunction(id => /1 reply/.test(document.querySelector(`[data-card="${id}"] [data-rc]`).textContent), inv);
await s.click(`[data-card="${inv}"] [data-la=arch]`); await s.waitForSelector(`[data-card="${inv}"]`, { state: 'detached' });
assert.equal((await g.request.get(`${BASE}/api/public/invitations/${inv}`)).status(), 200);
await s.click('[data-lf=archived]'); await s.click(`[data-card="${inv}"] [data-la=arch]`);
await s.waitForSelector(`[data-card="${inv}"]`, { state: 'detached' });
console.log('E2E passed:', code, invUrl, errs.length ? errs : '');
await b.close();
