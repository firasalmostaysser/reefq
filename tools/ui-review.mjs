// Local review entry point. No deploy or test changes. Only optional --e2e mutates local application data.
import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('node tools/ui-review.mjs [--url http://localhost:8888] [--screenshots] [--e2e]\nRuns guard, unit tests and media checks. --url adds read-only browser checks.\n--screenshots saves browser images. --e2e runs the unchanged full suite against local data.\nReports: tools/promo/out/ui-review/. See docs/WORKFLOW.md.');
  process.exit(0);
}
const options = { screenshots: false, e2e: false, url: null };
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url') options.url = args[++i];
  else if (args[i] === '--screenshots') options.screenshots = true;
  else if (args[i] === '--e2e') options.e2e = true;
  else throw new Error(`Unknown option: ${args[i]}. Use --help.`);
  if (args[i] === undefined) throw new Error('--url needs a local URL.');
}
if ((options.screenshots || options.e2e) && !options.url) throw new Error('--screenshots and --e2e require --url.');
if (options.url !== null) {
  const url = new URL(options.url);
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Use a local HTTP origin without a path or token, such as http://localhost:8888.');
  }
  options.url = url.origin;
}
const output = resolve(root, 'tools/promo/out/ui-review');
await mkdir(output, { recursive: true });
const report = { startedAt: new Date().toISOString(), baseUrl: options.url, checks: [], endToEnd: 'not_run' };
let failed = false;
async function check(name, run) {
  try {
    const detail = await run();
    report.checks.push({ name, status: 'passed', detail });
    console.log(`PASS ${name}`);
  } catch (error) {
    failed = true;
    report.checks.push({ name, status: 'failed', error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
async function npmCheck(name, script, env = {}) {
  return check(name, async () => {
    const windows = process.platform === 'win32';
    // Only fixed script names reach the shell. URLs are passed through the environment.
    const result = spawnSync(windows ? 'cmd.exe' : 'npm', windows ? ['/d', '/c', 'npm', 'run', script] : ['run', script], {
      cwd: root, env: { ...process.env, ...env }, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
    });
    const log = `${result.stdout || ''}${result.stderr || ''}`;
    await writeFile(join(output, `${name}.log`), log);
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Exit ${result.status}; see tools/promo/out/ui-review/${name}.log`);
    return { command: `npm run ${script}`, exitCode: result.status };
  });
}
await npmCheck('guard', 'guard');
await npmCheck('unit-tests', 'test');
let collections = [];
await check('media-catalog', async () => {
  const catalog = JSON.parse(await readFile(join(root, 'public/assets/media/openings/catalog.json'), 'utf8'));
  const ids = new Set();
  let totalBytes = 0;
  for (const collection of catalog.collections) {
    if (!/^[a-z][a-z0-9-]*$/.test(collection.id) || ids.has(collection.id)) throw new Error(`Invalid or duplicate theme id: ${collection.id}`);
    ids.add(collection.id);
    const files = [collection.poster, collection.scene, collection.intro.mp4, collection.intro.webm, collection.reveal.mp4, collection.reveal.webm];
    for (const file of files) {
      if (!/^[a-z0-9-]+\.(webp|mp4|webm)$/.test(file)) throw new Error(`Invalid asset filename: ${file}`);
      const { size } = await stat(join(root, 'public/assets/media/openings', file));
      if (!size) throw new Error(`Empty asset: ${file}`);
      if (/\.(mp4|webm)$/.test(file) && size > 3 * 1024 * 1024) throw new Error(`Video exceeds the 3 MiB review limit: ${file}`);
      totalBytes += size;
    }
  }
  collections = catalog.collections;
  return { collections: ids.size, totalBytes };
});
function chromePath() {
  const candidates = [process.env.CHROMIUM, ...[process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean).map(path => join(path, 'Google/Chrome/Application/chrome.exe'))];
  return candidates.find(path => path && existsSync(path));
}
if (options.url) {
  await check('browser-layouts', async () => {
    const { chromium } = await import('playwright');
    const executablePath = chromePath();
    const browser = await chromium.launch(executablePath ? { executablePath } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' });
    const errors = [];
    let screens = 0;
    try {
      const context = await browser.newContext({ reducedMotion: 'reduce', locale: 'fr-FR' });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      const fits = async label => {
        const bounds = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
        if (bounds.content > bounds.viewport) throw new Error(`${label}: horizontal overflow (${bounds.content}/${bounds.viewport})`);
        screens++;
      };
      for (const language of ['fr', 'ar', 'en']) {
        for (const width of [360, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(`${options.url}/?lang=${language}`, { waitUntil: 'domcontentloaded' });
          await page.locator('#themes button').first().waitFor();
          await fits(`${language} landing at ${width}px`);
          if (options.screenshots) await page.screenshot({ path: join(output, `landing-${language}-${width}.png`) });
          await page.locator('.offer-compare > summary').click();
          await fits(`${language} offer comparison at ${width}px`);
          if (options.screenshots && width === 360) await page.locator('.offer-compare').screenshot({ path: join(output, `offers-${language}-360.png`) });
        }
      }
      await page.setViewportSize({ width: 360, height: 800 });
      await page.locator('.collection-library > summary').click();
      await page.locator('#env-gallery .rq3-seal').first().waitFor();
      await fits('Expanded gallery at 360px');
      for (const collection of collections) {
        await page.goto(`${options.url}/theme-preview.html?t=${collection.id}&lang=ar&open=1&guest=1&op=verse`, { waitUntil: 'domcontentloaded' });
        await page.locator('.rq-sheet.hero').waitFor();
        if (await page.locator('.rq-inv').getAttribute('dir') !== 'rtl') throw new Error(`${collection.id}: Arabic invitation is not RTL`);
        await fits(`${collection.id} Arabic invitation`);
        if (options.screenshots) await page.screenshot({ path: join(output, `${collection.id}-ar-360.png`) });
        await page.locator('.rq-form').scrollIntoViewIfNeeded();
        await fits(`${collection.id} Arabic RSVP`);
        if (options.screenshots) await page.screenshot({ path: join(output, `${collection.id}-rsvp-ar-360.png`) });
      }
      if (errors.length) throw new Error(errors.join('\n'));
      return { screens, javascriptErrors: errors.length, motion: 'reduce', mode: 'read-only visual review' };
    } finally { await browser.close(); }
  });
}
if (options.e2e) {
  await npmCheck('end-to-end', 'test:e2e', { BASE: options.url, ...(chromePath() ? { CHROMIUM: chromePath() } : {}) });
  report.endToEnd = report.checks.at(-1).status;
}
report.finishedAt = new Date().toISOString();
report.status = failed ? 'failed' : 'passed';
await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Report: tools/promo/out/ui-review/report.json\nFull end-to-end suite: ${report.endToEnd}`);
process.exitCode = failed ? 1 : 0;
