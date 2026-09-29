// End-to-end smoke test against `npm run dev` (http://127.0.0.1:8788 by default).
// Usage: BASE=http://127.0.0.1:8788 PASSWORD=change-me node test/smoke.mjs
import { chromium } from 'playwright';
import assert from 'node:assert';
const BASE = process.env.BASE || 'http://127.0.0.1:8788', PASSWORD = process.env.PASSWORD || 'change-me';
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const errs = [];
const page = async (w, h) => { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message)); return p; };

// 1. Landing renders the live envelope demo
let p = await page(1280, 860);
await p.goto(BASE + '/'); await p.waitForSelector('#demo .rq3-seal');
await p.screenshot({ path: 'test/out-landing.png' });

// 2. Studio: sign in, create a couple with a guest, save
p = await page(1300, 900);
await p.goto(BASE + '/studio/'); await p.waitForSelector('#login:not([hidden])');
await p.fill('#l-pass', PASSWORD); await p.click('#l-form button');
await p.waitForSelector('#studio:not([hidden])');
await p.click('#btn-new');
await p.fill('#k-a-name', 'Rim'); await p.fill('#k-b-name', 'Walid'); await p.fill('#k-date', '2027-09-04'); await p.fill('#k-city', 'Hammamet');
await p.click('#btn-save'); await p.waitForFunction(() => document.querySelector('#status').textContent === 'Saved');
await p.click('#tab-guests');
await p.fill('#g-paste', 'Famille Jaziri, 98 000 111, 3'); await p.click('#g-add');
await p.waitForFunction(() => document.querySelector('#status').textContent === 'Saved');
const link = await p.evaluate(() => document.querySelector('[data-copyg]') && (function(){ return location.origin + '/i/' + document.querySelector('.chip[aria-pressed=true]').dataset.inv; })());
const inv = link.split('/i/')[1];
const gid = await p.evaluate(async id => (await (await fetch('/api/invitations/' + id)).json()).guests[0].id, inv);
await p.screenshot({ path: 'test/out-studio-guests.png' });

// 3. Guest opens the personal link, opens the envelope, replies
const g = await page(390, 844);
await g.goto(`${BASE}/i/${inv}?g=${gid}`); await g.waitForSelector('.rq3-seal');
assert.match(await g.textContent('.rq3-dear'), /Famille Jaziri/);
await g.click('.rq3-seal'); await g.waitForSelector('#rq-rsvp', { timeout: 8000 });
await g.check('#rq-att-yes'); await g.click('.rq-send');
await g.waitForSelector('.rq-thanks');
await g.screenshot({ path: 'test/out-guest-thanks.png' });

// 4. The reply shows in the studio
await p.click('#tab-design'); await p.click('#tab-guests');
await p.waitForFunction(() => /Coming · 3/.test(document.querySelector('#g-rows').textContent), null, { timeout: 25000 });
console.log('Smoke test passed', errs.length ? errs : '');
await b.close();
