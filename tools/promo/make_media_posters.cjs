const sharp = require('sharp');

async function poster({ source, output, width, height, position, logoWidth }) {
  const logo = await sharp('public/assets/logo-dark.webp')
    .resize({ width: logoWidth })
    .toBuffer();
  const band = Math.round(height * 0.28);
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#082f31" stop-opacity="0"/>
          <stop offset="1" stop-color="#082f31" stop-opacity=".92"/>
        </linearGradient>
      </defs>
      <rect x="0" y="${height - band}" width="${width}" height="${band}" fill="url(#shade)"/>
      <rect x="${Math.round(width * .07)}" y="${Math.round(height * .91)}" width="44" height="2" fill="#d9b96f"/>
      <text x="${Math.round(width * .07) + 64}" y="${Math.round(height * .92)}"
        fill="#fffdf8" font-family="Arial, sans-serif" font-size="${Math.round(width * .025)}"
        font-weight="700" letter-spacing="1">reefq.netlify.app</text>
    </svg>`);

  await sharp(source)
    .resize(width, height, { fit: 'cover', position })
    .composite([
      { input: svg, top: 0, left: 0 },
      { input: logo, top: Math.round(height * .055), left: Math.round(width * .07) },
    ])
    .webp({ quality: 84, effort: 6 })
    .toFile(output);
}

Promise.all([
  poster({
    source: 'public/assets/media/reefq-atelier-hero.webp',
    output: 'public/assets/media/reefq-paper-atelier-poster.webp',
    width: 1280,
    height: 720,
    position: 'centre',
    logoWidth: 180,
  }),
  poster({
    source: 'public/assets/media/reefq-sidi-collection.webp',
    output: 'public/assets/media/reefq-collections-ar-poster.webp',
    width: 720,
    height: 1280,
    position: 'centre',
    logoWidth: 150,
  }),
]).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
