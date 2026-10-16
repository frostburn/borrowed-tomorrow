import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(root, 'assets/maps/manifest.json'), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const [name, asset] of Object.entries(manifest)) {
  const target = resolve(root, `public/art/${name}.webp`);
  if (existsSync(target) && hash(readFileSync(target)) === asset.sha256) continue;
  const encoded = Array.from({ length: asset.parts }, (_, index) => {
    const path = resolve(root, `assets/maps/${name}.${String(index).padStart(3, '0')}.b64`);
    if (!existsSync(path)) throw new Error(`Missing map source: ${path}`);
    return readFileSync(path, 'utf8').trim();
  }).join('');
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.length !== asset.bytes || hash(bytes) !== asset.sha256) throw new Error(`Map checksum mismatch: ${name}`);
  mkdirSync(resolve(root, 'public/art'), { recursive: true });
  writeFileSync(target, bytes);
  console.log(`Restored native map: ${name} (${bytes.length} bytes)`);
}
