// Offline asset preparation: node tools/promo/prepare-openings.mjs <extracted archive>
// Requires Playwright, sharp, Chrome and FFmpeg (or the FFMPEG executable path).
// Canvas compresses the video; FFmpeg restores the original soundtrack afterwards.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { checkFfmpeg, restoreOpeningAudio } from './restore-opening-audio.mjs';

const source = resolve(process.argv[2] || 'tools/promo/out/opening-source');
const output = resolve('public/assets/media/openings');
const ids = ['olive', 'blush', 'velvet', 'artdeco', 'zahr'];
checkFfmpeg();
await mkdir(output, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const name = basename(decodeURIComponent(req.url.slice(1)));
    if (!name) { res.end('<!doctype html><title>Asset preparation</title>'); return; }
    const bytes = await readFile(resolve(source, name));
    res.setHeader('Content-Type', 'video/mp4');
    res.end(bytes);
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling'] });
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  for (const id of ids) {
    // A real envelope frame is the resting state, including collections whose opening image has no envelope.
    await sharp(resolve(source, `${id}-keyframe.jpg`)).resize({ width: 480, height: 720, fit: 'inside' }).webp({ quality: 82 }).toFile(resolve(output, `${id}-poster.webp`));
    const backdrop = id === 'olive' ? 'olive-keyframe.jpg' : `${id}-opening.jpg`;
    await sharp(resolve(source, backdrop)).resize({ width: 480, height: 720, fit: 'inside' }).webp({ quality: 78 }).toFile(resolve(output, `${id}-scene.webp`));
    for (const part of ['intro', 'reveal']) {
      const name = id === 'zahr' && part === 'intro' ? 'zahr-clip1-teaser.mp4' : `${id}-clip${part === 'intro' ? '1-opening' : '2-reveal'}.mp4`;
      const result = await page.evaluate(async ({ name }) => {
        const video = document.createElement('video');
        video.muted = true; video.playsInline = true; video.src = `/${name}`;
        await new Promise((done, fail) => { video.onloadeddata = done; video.onerror = fail; });
        const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(video.videoWidth * scale / 2) * 2;
        canvas.height = Math.floor(video.videoHeight * scale / 2) * 2;
        const context = canvas.getContext('2d', { alpha: false });
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const stream = canvas.captureStream(24);
        const types = ['video/mp4;codecs=avc1.42001E', 'video/webm;codecs=vp9'];
        if (!types.every(type => MediaRecorder.isTypeSupported(type))) throw new Error('Chrome must support AVC MP4 and VP9 WebM recording');
        const chunks = types.map(() => []);
        const recorders = types.map((mimeType, i) => {
          const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1300000 });
          recorder.ondataavailable = event => { if (event.data.size) chunks[i].push(event.data); };
          return recorder;
        });
        const stopped = recorders.map(recorder => new Promise(done => { recorder.onstop = done; }));
        const draw = () => { context.drawImage(video, 0, 0, canvas.width, canvas.height); if (!video.ended) video.requestVideoFrameCallback(draw); };
        video.requestVideoFrameCallback(draw);
        recorders.forEach(recorder => recorder.start());
        await video.play();
        await new Promise(done => { video.onended = done; });
        recorders.forEach(recorder => recorder.stop());
        await Promise.all(stopped);
        stream.getTracks().forEach(track => track.stop());
        const encoded = await Promise.all(chunks.map(async (parts, i) => {
          const bytes = new Uint8Array(await new Blob(parts, { type: types[i] }).arrayBuffer());
          let binary = ''; for (let n = 0; n < bytes.length; n += 32768) binary += String.fromCharCode(...bytes.subarray(n, n + 32768));
          return btoa(binary);
        }));
        return { encoded, width: canvas.width, height: canvas.height, duration: video.duration, audioTracks: stream.getAudioTracks().length };
      }, { name });
      for (const [i, ext] of ['mp4', 'webm'].entries()) await writeFile(resolve(output, `${id}-${part}.${ext}`), Buffer.from(result.encoded[i], 'base64'));
      console.log(`${id}/${part}: ${result.width}×${result.height}, ${result.duration}s, ${result.audioTracks} audio tracks`);
    }
  }
} finally { await browser.close(); server.close(); }
await restoreOpeningAudio(source);
