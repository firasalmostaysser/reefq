// End-to-end test against `npm run dev` (http://localhost:8888).
// Covers: order on the landing page → client space → bank-transfer proof → studio verification →
// invitation created (wording from templates) → Deliver QR codes → client space unlocked (guest QR) →
// guest opens personal link and replies → reply visible → archive keeps the link working →
// custom design: Canva-like site copied and served at /i/<id> with the Reefq bar, personal-link replies, opens.
// Usage: BASE=http://localhost:8888 PASSWORD=change-me node test/smoke.mjs
import { chromium } from 'playwright';
import assert from 'node:assert';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
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
const receipt = join(tmpdir(), 'reefq-receipt.png');
writeFileSync(receipt, Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000' + '1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082'.repeat(1) + '00'.repeat(1200), 'hex'));
await c.setInputFiles('#proof-file', receipt);
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
// 8. Custom design: a stand-in for a published Canva website (framing refused, designer branding, audio, an RSVP button)
const SITE_PORT = 8899;
const FILES = {
  '/olfa': ['text/html', '<!doctype html><html><head><meta charset="utf-8"><base href="/olfa/"><title>Site title</title><meta property="og:title" content="Site title"><script src="_assets/app.js" defer></script></head>' +
    '<body><h1 id="design">Olfa &amp; Ahmed</h1><img src="_assets/arch.svg" alt=""><audio src="_assets/song.mp3" autoplay></audio><a id="design-rsvp" href="#rsvp">RSVP</a>' +
    '<div class="footer-container"><a href="https://www.canva.com" aria-label="Créé avec Canva">Canva</a></div></body></html>'],
  '/olfa/_assets/app.js': ['text/javascript', "var i=document.createElement('img');i.id='late';i.src='_assets/late.svg';document.body.appendChild(i);"],
  '/olfa/_assets/arch.svg': ['image/svg+xml', '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'],
  '/olfa/_assets/late.svg': ['image/svg+xml', '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"/>']
};
const site = createServer((req, res) => { const f = FILES[req.url.split('?')[0]]; if (!f) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': f[0], 'x-frame-options': 'SAMEORIGIN' }); res.end(f[1]); });
await new Promise(r => site.listen(SITE_PORT, r));
await s.click('#tab-design'); await s.click('#btn-new');
await s.fill('#k-a-name', 'Olfa'); await s.fill('#k-b-name', 'Ahmed'); await s.fill('#k-date', '2027-07-10');
await s.click('[data-src=canva]');
assert.equal(await s.isHidden('#themes'), true);
assert.equal(await s.isChecked('#k-personal'), true);
await s.fill('#k-curl', `http://localhost:${SITE_PORT}/olfa`);
await s.click('#btn-save'); await s.waitForFunction(() => document.querySelector('#status').textContent === 'Saved');
await s.click('#tab-guests'); await s.fill('#g-paste', 'Famille Ben Ali, 22 000 000, 3'); await s.click('#g-add');
await s.waitForFunction(() => document.querySelector('#status').textContent === 'Saved');
await s.click('#tab-design'); await s.click('#c-pub');
await s.waitForFunction(() => /Published/.test(document.querySelector('#c-state').textContent), null, { timeout: 20000 });
await s.waitForSelector('#screen iframe');
const cust = await s.evaluate(async () => { const r = await (await fetch('/api/invitations')).json(); return r.items.find(i => i.a.name === 'Olfa'); });
assert.equal(cust.canvaStatus, 'published'); assert.equal(cust.guests[0].id.length, 10);
const cid = cust.id, cgid = cust.guests[0].id;

// 9. The guest opens their personal link: our address only, designer branding and audio gone, greeted by name
const g2 = await page(390, 844), g2Hosts = new Set();
g2.on('request', r => g2Hosts.add(new URL(r.url()).host));
await g2.goto(`${BASE}/i/${cid}?g=${cgid}`); await g2.waitForSelector('#design');
await g2.waitForSelector('#late'); await g2.waitForFunction(() => document.querySelector('#late').complete && document.querySelector('#late').naturalWidth > 0);
assert.ok(![...g2Hosts].some(h => h.endsWith(':' + SITE_PORT)), 'guest browser never talks to the designer site');
assert.match(await g2.title(), /Olfa & Ahmed/);
assert.equal(await g2.$eval('.footer-container', el => getComputedStyle(el).display), 'none');
assert.equal(await g2.$('audio'), null);
const html2 = await (await g2.request.get(`${BASE}/i/${cid}`)).text();
assert.ok(!html2.includes('localhost:' + SITE_PORT) && !html2.includes('Site title'));
await g2.waitForFunction(() => /Famille Ben Ali/.test(document.querySelector('#reefq-bar').shadowRoot.querySelector('.hi').textContent));

// 10. The design's RSVP button opens the Reefq card; the name is the one on the guest list
await g2.click('#design-rsvp'); await g2.waitForSelector('#reefq-bar .rq-who');
assert.equal(await g2.textContent('#reefq-bar .rq-who'), 'Famille Ben Ali');
assert.equal(await g2.$('#reefq-bar #rq-name'), null);
await g2.check('#reefq-bar #rq-att-yes'); await g2.click('#reefq-bar .rq-send'); await g2.waitForSelector('#reefq-bar .rq-thanks');

// 11. Nobody can answer under another name: a personal link keeps the listed name, the shared link cannot reply
const post = body => g2.request.post(`${BASE}/api/public/invitations/${cid}/rsvp`, { data: body });
assert.equal((await post({ guestId: cgid, name: 'Someone else', attending: false })).status(), 200);
assert.equal((await post({ name: 'Inconnu', attending: true })).status(), 422);
assert.equal((await post({ guestId: 'nope', name: 'Inconnu', attending: true })).status(), 422);
const cr = await s.evaluate(async id => (await (await fetch('/api/invitations/' + id + '/rsvps')).json()).items, cid);
assert.equal(cr.length, 2); assert.ok(cr.every(r => r.name === 'Famille Ben Ali' && r.guestId === cgid));
const pub = await (await g2.request.get(`${BASE}/api/public/invitations/${cid}?g=${cgid}`)).text();
assert.ok(!/canva|localhost:8899/i.test(pub), 'public data never names the design tool');
const anon = await page(390, 844); await anon.goto(`${BASE}/i/${cid}`); await anon.waitForSelector('#design');
await anon.click('#design-rsvp'); await anon.waitForSelector('#reefq-bar .rq-personal');

// 12. Opens are recorded per guest and shown in the guest list; once copied, the designer site is no longer needed
const op = await s.evaluate(async id => (await (await fetch('/api/invitations/' + id + '/opens')).json()).items, cid);
assert.ok(op.some(o => o.guestId === cgid && o.count >= 1));
await s.click('#tab-guests'); await s.waitForFunction(() => / 1 opened /.test(document.querySelector('#g-sum').textContent), null, { timeout: 10000 });
site.closeAllConnections?.(); await new Promise(r => site.close(r));
const g3 = await page(390, 844); await g3.goto(`${BASE}/i/${cid}?g=${cgid}`);
await g3.waitForSelector('#late'); await g3.waitForFunction(() => document.querySelector('#late').complete && document.querySelector('#late').naturalWidth > 0);

console.log('E2E passed:', code, invUrl, errs.length ? errs : '');
await b.close();
