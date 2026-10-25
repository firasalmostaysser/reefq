// Preserve the supplied opening soundtracks without recompressing the prepared video.
import { spawnSync } from 'node:child_process';
import { mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const localFfmpeg = resolve('tools/promo/out/ffmpeg.exe');
const ffmpeg = process.env.FFMPEG || (existsSync(localFfmpeg) ? localFfmpeg : 'ffmpeg');
export function checkFfmpeg() {
  const result = spawnSync(ffmpeg, ['-version'], { encoding: 'utf8', windowsHide: true });
  if (result.error || result.status !== 0) throw new Error('FFmpeg is required. Install it locally or set FFMPEG to its executable path.');
}
export async function restoreOpeningAudio(source) {
  checkFfmpeg();
  const output = resolve('public/assets/media/openings');
  const temporary = resolve('tools/promo/out/audio-mux');
  await mkdir(temporary, { recursive: true });
  for (const id of ['olive', 'blush', 'velvet', 'artdeco', 'zahr']) {
    for (const part of ['intro', 'reveal']) {
      const name = id === 'zahr' && part === 'intro' ? 'zahr-clip1-teaser.mp4' : `${id}-clip${part === 'intro' ? '1-opening' : '2-reveal'}.mp4`;
      const original = resolve(source, name);
      const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', original], { encoding: 'utf8', windowsHide: true });
      if (!/Stream #.*Audio:/.test(probe.stderr || '')) throw new Error(`No source audio found: ${name}`);
      for (const extension of ['mp4', 'webm']) {
        const filename = `${id}-${part}.${extension}`;
        const prepared = resolve(output, filename);
        const restored = resolve(temporary, filename);
        const audio = extension === 'mp4' ? ['-c:a', 'copy', '-movflags', '+faststart'] : ['-c:a', 'libopus', '-b:a', '96k'];
        const result = spawnSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', prepared, '-i', original,
          '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', ...audio, restored], { encoding: 'utf8', windowsHide: true });
        if (result.error || result.status !== 0) throw new Error(`Audio restore failed for ${filename}: ${result.error?.message || result.stderr}`);
        await copyFile(restored, prepared);
      }
      console.log(`${id}/${part}: original soundtrack restored in MP4 and WebM`);
    }
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await restoreOpeningAudio(resolve(process.argv[2] || 'tools/promo/out/opening-source'));
}
