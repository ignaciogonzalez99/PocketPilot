import sharp from "sharp";
import { copyFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const SOURCE = "C:/Users/solro/Downloads/ChatGPT Image 25 mar 2026, 23_04_38.png";

const APP_DIR = "src/app";
const PUBLIC_DIR = "public";

function ensureDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

async function main() {
  // 1. icon.png — 32x32 (Next.js favicon for modern browsers)
  const icon32 = `${APP_DIR}/icon.png`;
  ensureDir(icon32);
  await sharp(SOURCE).resize(32, 32).png().toFile(icon32);
  console.log(`Created ${icon32}`);

  // 2. apple-icon.png — 180x180
  const appleIcon = `${APP_DIR}/apple-icon.png`;
  await sharp(SOURCE).resize(180, 180).png().toFile(appleIcon);
  console.log(`Created ${appleIcon}`);

  // 3. opengraph-image.png — 1200x630 with icon centered on #0E1512 background
  const ogImage = `${APP_DIR}/opengraph-image.png`;
  const iconBuffer = await sharp(SOURCE).resize(400, 400).png().toBuffer();
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 14, g: 21, b: 18, alpha: 1 }, // #0E1512
    },
  })
    .composite([
      {
        input: iconBuffer,
        left: Math.round((1200 - 400) / 2),
        top: Math.round((630 - 400) / 2),
      },
    ])
    .png()
    .toFile(ogImage);
  console.log(`Created ${ogImage}`);

  // 4. favicon.ico — copy 32x32 PNG (browsers accept PNG-encoded .ico)
  const favicoSrc = icon32;
  const favicoOut = `${APP_DIR}/favicon.ico`;
  copyFileSync(favicoSrc, favicoOut);
  console.log(`Created ${favicoOut}`);

  // 5. public/icon-192.png
  const icon192 = `${PUBLIC_DIR}/icon-192.png`;
  ensureDir(icon192);
  await sharp(SOURCE).resize(192, 192).png().toFile(icon192);
  console.log(`Created ${icon192}`);

  // 6. public/icon-512.png
  const icon512 = `${PUBLIC_DIR}/icon-512.png`;
  await sharp(SOURCE).resize(512, 512).png().toFile(icon512);
  console.log(`Created ${icon512}`);

  // 7. public/icon-original.png — copy original high-res
  const iconOriginal = `${PUBLIC_DIR}/icon-original.png`;
  copyFileSync(SOURCE, iconOriginal);
  console.log(`Created ${iconOriginal}`);

  console.log("\nAll icons generated successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
