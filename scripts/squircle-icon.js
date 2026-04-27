import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function createSquirclePath(size, radiusFactor = 0.2) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <path d="${createSquircleSVGPath(size, radiusFactor)}" fill="white"/>
    </svg>
  `;
  return Buffer.from(svg);
}

function createSquircleSVGPath(size, radiusFactor = 0.22) {
  const half = size / 2;
  const radius = size * radiusFactor;

  let d = '';
  const steps = 200;

  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const x = Math.pow(Math.abs(Math.cos(angle)), 0.5) * (Math.cos(angle) >= 0 ? 1 : -1);
    const y = Math.pow(Math.abs(Math.sin(angle)), 0.5) * (Math.sin(angle) >= 0 ? 1 : -1);

    const px = half + x * (half - radius);
    const py = half + y * (half - radius);

    if (i === 0) {
      d += `M ${px} ${py}`;
    } else {
      d += ` L ${px} ${py}`;
    }
  }

  d += ' Z';
  return d;
}

async function makeSquircle(inputPath, outputPath) {
  const buffer = await sharp(inputPath).toBuffer();
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const size = Math.max(metadata.width, metadata.height);

  const mask = createSquirclePath(size, 0.21);

  await image
    .resize(size, size, { fit: 'cover' })
    .composite([{
      input: mask,
      blend: 'dest-in'
    }])
    .png()
    .toFile(outputPath);

  console.log(`Created: ${outputPath}`);
}

async function resizeSquircle(size, outputPath) {
  const buffer = await sharp('./public/logo.png').resize(size, size).toBuffer();
  const mask = createSquirclePath(size, 0.21);

  await sharp(buffer)
    .composite([{
      input: mask,
      blend: 'dest-in'
    }])
    .png()
    .toFile(outputPath);

  console.log(`Created: ${outputPath}`);
}

async function main() {
  const sourceIcon = './public/logo.png';

  if (!fs.existsSync(sourceIcon)) {
    console.error('Source icon not found!');
    process.exit(1);
  }

  await resizeSquircle(512, sourceIcon);

  const sizes = [32, 64, 128, 256, 512];
  const icons = [
    { size: 512, output: './src-tauri/icons/icon.png' },
    { size: 128, output: './src-tauri/icons/128x128.png' },
    { size: 256, output: './src-tauri/icons/128x128@2x.png' },
    { size: 32, output: './src-tauri/icons/32x32.png' },
    { size: 64, output: './src-tauri/icons/64x64.png' },
    { size: 30, output: './src-tauri/icons/Square30x30Logo.png' },
    { size: 44, output: './src-tauri/icons/Square44x44Logo.png' },
    { size: 71, output: './src-tauri/icons/Square71x71Logo.png' },
    { size: 89, output: './src-tauri/icons/Square89x89Logo.png' },
    { size: 107, output: './src-tauri/icons/Square107x107Logo.png' },
    { size: 142, output: './src-tauri/icons/Square142x142Logo.png' },
    { size: 150, output: './src-tauri/icons/Square150x150Logo.png' },
    { size: 284, output: './src-tauri/icons/Square284x284Logo.png' },
    { size: 310, output: './src-tauri/icons/Square310x310Logo.png' },
    { size: 50, output: './src-tauri/icons/StoreLogo.png' },
  ];

  for (const icon of icons) {
    await resizeSquircle(icon.size, icon.output);
  }

  console.log('All icons converted to squircle shape!');
}

main().catch(console.error);
