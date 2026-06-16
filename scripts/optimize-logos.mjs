// One-off asset optimizer. Run: node scripts/optimize-logos.mjs
// Recompresses the logo PNGs in place at ~2x their on-screen display size.
import sharp from "sharp";
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const kb = (p) => (statSync(p).size / 1024).toFixed(0) + " KB";

async function run(name, opts) {
  const file = join(root, name);
  const before = kb(file);
  const meta = await sharp(file).metadata();
  const buf = await sharp(file)
    .resize({ ...opts, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 90, palette: true })
    .toBuffer();
  await sharp(buf).toFile(file);
  console.log(`${name}: ${meta.width}x${meta.height} ${before}  ->  ${kb(file)}`);
}

// logo.png renders at h-58 (~58px tall) in the footer; logo-mark.png renders 40x40 in the header.
await run("logo.png", { height: 120 });
await run("logo-mark.png", { height: 80, width: 80 });
console.log("done");
