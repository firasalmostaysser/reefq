// Guard for UI-only branches: fails when a change touches functionality.
// Usage: npm run guard [-- <base>]   (base defaults to main; compares merge-base..working tree)
// Intentional exception, owner only: GUARD_ALLOW="netlify/lib/x.mts,public/studio/studio.js" npm run guard
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] || process.env.GUARD_BASE || 'main';
const allow = new Set((process.env.GUARD_ALLOW || '').split(',').map(s => s.trim()).filter(Boolean));
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 256 << 20 });
const mergeBase = git('merge-base', base, 'HEAD').trim();
const lines = s => s.split('\n').map(l => l.trim()).filter(Boolean);
const changed = [...new Set([...lines(git('diff', '--name-only', mergeBase)), ...lines(git('ls-files', '--others', '--exclude-standard'))])];

const oldText = p => { try { return git('show', `${mergeBase}:${p}`); } catch { return ''; } };
const newText = p => existsSync(p) ? readFileSync(p, 'utf8') : '';

const errors = [], review = [];

// 1. Locked files: backend, payments/orders/RSVP/Studio logic, tests, config, these rules.
const LOCKED = [
  /^netlify\/(?!lib\/themes\.mts$)/, /^netlify\.toml$/, /^package(-lock)?\.json$/, /^deno\.lock$/,
  /^\.env/, /^test\//, /^tools\/guard\.mjs$/, /^\.github\//, /^\.cursor\//, /^AGENTS\.md$/, /^CLAUDE\.md$/,
  /^public\/assets\/(commande|invite|analytics|site-bar|wording-templates)\.js$/,
  /^public\/assets\/vendor\//, /^public\/studio\/studio\.js$/, /^public\/apercu\.html$/, /^tools\/seed\.mjs$/,
];
const REVIEW = [/^public\/assets\/engine\.js$/, /^public\/assets\/landing\.js$/, /^netlify\/lib\/themes\.mts$/, /\.html$/];
for (const p of changed) {
  if (allow.has(p)) continue;
  if (LOCKED.some(r => r.test(p))) errors.push(`locked file changed: ${p}`);
  else if (REVIEW.some(r => r.test(p))) review.push(p);
}

// 2. engine.js: data, RSVP and link functions must stay byte-identical; public API keys must stay.
const ENGINE = 'public/assets/engine.js';
const FROZEN = ['esc', 'rng', 'hash', 'pad', 'loc', 'fmtDate', 'namesOf', 'initials', 'waLink', 'mapsHref', 'rsvpHtml', 'wireRsvp', 'renderRsvp', 'envOpts',
  'couple', 'pairText', 'hostsOf', 'hostsLines', 'hostsMsg']; // name order and the Arabic/French/English grammar of "who invites"
const fnSource = (src, name) => {
  const m = src.match(new RegExp(`^function ${name}\\(`, 'm'));
  if (!m) return null;
  const rest = src.slice(m.index + 1), end = rest.search(/^(function |var |window\.)/m);
  return src.slice(m.index, end < 0 ? undefined : m.index + 1 + end).replace(/[ \t]+$/gm, '').trim();
};
const apiKeys = src => { const m = src.match(/window\.ReefqInvite=\{([^}]*)\}/); return m ? m[1].split(',').map(kv => kv.split(':')[0].trim()) : []; };
const themeIds = src => [...src.matchAll(/\{id:'([\w-]+)',name:/g)].map(m => m[1]);
if (changed.includes(ENGINE) && !allow.has(ENGINE)) {
  const o = oldText(ENGINE), n = newText(ENGINE);
  for (const f of FROZEN) { const a = fnSource(o, f); if (a !== null && a !== fnSource(n, f)) errors.push(`engine.js: function ${f}() changed (RSVP/data logic is frozen)`); }
  for (const k of apiKeys(o)) if (!apiKeys(n).includes(k)) errors.push(`engine.js: ReefqInvite.${k} removed from the public API`);
}
// Themes: existing ids can never disappear (saved invitations use them); engine and server lists must match.
{
  const o = themeIds(oldText(ENGINE)), n = themeIds(newText(ENGINE));
  for (const id of o) if (!n.includes(id)) errors.push(`theme "${id}" removed or renamed (saved invitations use it)`);
  const srv = (newText('netlify/lib/themes.mts').match(/THEME_IDS\s*=\s*\[([^\]]*)\]/) || [, ''])[1].match(/[\w-]+/g) || [];
  if (n.join() !== srv.join()) errors.push(`theme ids differ: engine.js [${n}] vs netlify/lib/themes.mts [${srv}]`);
}

// 3. Hooks: every #id, .class, [data-x] and name= that JavaScript looks up must still exist in the markup.
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name).replace(/\\/g, '/')]);
const srcFiles = walk('public').filter(p => /\.(html|js)$/.test(p) && !p.includes('/vendor/'));
const hooksUsed = new Set(), markupOf = text => {
  const t = new Set();
  for (const m of text.matchAll(/\b(id|name|for)=\\?["']([^"'\\]+)/g)) t.add('#' + m[2]), t.add('@' + m[2]);
  for (const m of text.matchAll(/\bclass(?:Name)?=\\?["']([^"'\\]+)/g)) m[1].split(/\s+/).forEach(c => c && t.add('.' + c));
  for (const m of text.matchAll(/classList\.(?:add|toggle)\(['"]([^'"]+)/g)) t.add('.' + m[1]);
  for (const m of text.matchAll(/\.id\s*=\s*['"]([^'"]+)/g)) t.add('#' + m[1]);
  for (const m of text.matchAll(/\b(data-[\w-]+)/g)) t.add('[' + m[1]);
  return t;
};
for (const p of srcFiles.filter(p => p.endsWith('.js'))) {
  for (const m of newText(p).matchAll(/(?:querySelector(?:All)?|closest|matches|(?<![\w$])\$\$?)\(['"]([^'"]+)['"]/g)) {
    for (const h of m[1].matchAll(/#([\w-]+)|\.([\w-]+)|\[(data-[\w-]+)|\[name=["']?([\w-]+)/g)) hooksUsed.add(h[1] ? '#' + h[1] : h[2] ? '.' + h[2] : h[3] ? '[' + h[3] : '@' + h[4]);
  }
  for (const m of newText(p).matchAll(/getElementById\(['"]([\w-]+)/g)) hooksUsed.add('#' + m[1]);
}
const before = new Set(), after = new Set();
for (const p of new Set([...srcFiles, ...changed.filter(p => p.startsWith('public/'))])) {
  markupOf(oldText(p)).forEach(t => before.add(t));
  markupOf(newText(p)).forEach(t => after.add(t));
}
for (const h of hooksUsed) if (before.has(h) && !after.has(h)) errors.push(`hook ${h} is used by JavaScript but no longer exists in the markup`);

// Report
console.log(`guard: ${changed.length} changed file(s) since ${base} (${mergeBase.slice(0, 7)})`);
if (review.length) console.log('review by hand (allowed, but look at the diff):\n  ' + review.join('\n  '));
if (errors.length) { console.error('\nGUARD FAILED: this change touches functionality.\n  ' + errors.join('\n  ')); process.exit(1); }
console.log('guard: ok');
