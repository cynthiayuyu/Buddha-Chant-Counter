import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [192, 512];

async function generateIcons() {
  const svgBuffer = readFileSync(join(__dirname, '../public/icon.svg'));

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, `../public/pwa-${size}x${size}.png`));

    console.log(`✓ Generated pwa-${size}x${size}.png`);
  }

  console.log('✓ All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
