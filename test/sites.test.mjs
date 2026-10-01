// Offline check of custom designs served from our address: node --experimental-strip-types test/sites.test.mjs
import assert from 'node:assert';
const { rewritePage, allowedSiteUrl, personalOnly, upstreamUrl } = await import('../netlify/lib/sites.mts');

globalThis.Netlify = { context: { deploy: { context: 'production' } }, env: { get: k => k === 'CANVA_SITE_HOSTS' ? 'invite.reefq.com' : '' } };
assert.ok(allowedSiteUrl('https://studio.my.canva.site/olfa-ahmed'));
assert.ok(allowedSiteUrl('https://invite.reefq.com/olfa'));
assert.ok(!allowedSiteUrl('http://studio.my.canva.site/x'));
assert.ok(!allowedSiteUrl('https://evil.example/x'));
assert.ok(!allowedSiteUrl('https://canva.site.evil.example/x'));
assert.ok(!allowedSiteUrl('http://localhost:8899/x'));
globalThis.Netlify.context.deploy.context = 'dev';
assert.ok(allowedSiteUrl('http://localhost:8899/x'));

const src = `<!doctype html><html><head><meta charset="utf-8"><base href="/olfa/"><title>Mail</title>
<meta property="og:title" content="Mail"><meta name="app-name" content="export_website"/><link rel="icon" href="https://x.my.canva.site/favicon.ico">
<script src="_assets/app.js" integrity="sha512-abc"></script></head><body><img src="https://x.my.canva.site/olfa/_assets/a.png">
<audio src="_assets/song.mp3" autoplay></audio><a href="#rsvp">RSVP</a>
<div class="footer-container"><a href="https://www.canva.com" aria-label="Créé avec Canva">c</a></div></body></html>`;
const inv = { id: 'olfa-ahmed-ab12', canvaVer: 'v1', canvaBase: 'https://x.my.canva.site/olfa/' };
const out = rewritePage(src, inv, { title: 'Olfa & Ahmed · Invitation', og: '<meta property="og:title" content="Olfa &amp; Ahmed">' });
assert.match(out, /<head><base href="\/site\/olfa-ahmed-ab12\/v1\/">/);
assert.equal((out.match(/<base /g) || []).length, 1);
assert.match(out, /<title>Olfa &amp; Ahmed · Invitation<\/title>/);
assert.ok(!/<title>Mail/.test(out) && !/content="Mail"/.test(out) && !/app-name/.test(out) && !/favicon\.ico/.test(out));
assert.ok(!/<audio/i.test(out));
assert.ok(!out.includes('x.my.canva.site'), 'no designer address left in the page');
assert.match(out, /src="\/site\/olfa-ahmed-ab12\/v1\/_assets\/a\.png"/);
assert.match(out, /integrity="sha512-abc"/);
assert.match(out, /\.footer-container[^{]*\{display:none!important\}/);
assert.match(out, /<script src="\/assets\/site-bar\.js" data-invite="olfa-ahmed-ab12"><\/script><\/body>/);

assert.equal(personalOnly({ designSource: 'canva' }), true);
assert.equal(personalOnly({ designSource: 'theme' }), false);
assert.equal(personalOnly({ designSource: 'canva', personalOnly: false }), false);
assert.equal(personalOnly({ personalOnly: true }), true);
// files are only ever fetched from inside the designer's site folder
const base = 'https://x.my.canva.site/olfa/';
assert.equal(upstreamUrl(base, '_assets/app.js'), 'https://x.my.canva.site/olfa/_assets/app.js');
for (const bad of ['//evil.example/x.js', '/other/x.js', '../x.js', '_assets/../../x.js', '%2e%2e/x.js', '_assets/%2E%2E/%2e%2e/x', 'a b.js', 'https:x', './x'])
  assert.equal(upstreamUrl(base, bad), null, bad);
console.log('Custom design pages: ok');
