// Authoring only: separate a generated portrait + four-view atlas into native assets.
// Requires ImageMagick. Gameplay uses the exported PNGs without resampling.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [hero, source, destination = 'public/art'] = process.argv.slice(2);
if (!['nell', 'orrin', 'kit', 'celia', 'petra'].includes(hero) || !source) {
  throw new Error('Usage: node scripts/import-character-atlas.mjs <hero> <atlas.png> [output directory]');
}
const run = (...args) => execFileSync('convert', args, { encoding: 'utf8' }).trim();
const [width, height] = run(resolve(source), '-format', '%w %h', 'info:').split(' ').map(Number);
const split = Math.round(height * .58), temporary = mkdtempSync(join(tmpdir(), 'bt-atlas-'));
const trim = path => {
  // Ignore stray near-transparent edge noise when finding the cutout, while
  // copying the original RGBA pixels inside it unchanged.
  const bounds = run(path, '-alpha', 'extract', '-threshold', '50%', '-format', '%@', 'info:');
  run(path, '-crop', bounds, '+repage', path);
};
try {
  const portrait = join(temporary, 'portrait.png');
  run(resolve(source), '-crop', `${width}x${split}+0+0`, '+repage', portrait); trim(portrait);
  run('-size', '128x128', 'xc:none', '(', portrait, '-filter', 'point', '-resize', '124x124', ')', '-gravity', 'south', '-geometry', '+0+2', '-composite', resolve(destination, `portrait-${hero}.png`));
  const views = ['', '-left', '-right', '-back'].map((suffix, index) => {
    const left = Math.round(index * width / 4), right = Math.round((index + 1) * width / 4);
    const path = join(temporary, `${index}.png`);
    run(resolve(source), '-crop', `${right - left}x${height - split}+${left}+${split}`, '+repage', path); trim(path);
    const size = run(path, '-format', '%w %h', 'info:').split(' ').map(Number);
    return { suffix, path, size };
  });
  // One scale for the four views: never independently stretch a profile to fit.
  const scale = Math.min(64 / Math.max(...views.map(v => v.size[1])), 72 / Math.max(...views.map(v => v.size[0])));
  for (const { suffix, path, size } of views) {
    const w = Math.round(size[0] * scale), h = Math.round(size[1] * scale);
    run('-size', '80x80', 'xc:none', '(', path, '-filter', 'point', '-resize', `${w}x${h}!`, ')', '-geometry', `+${Math.floor((80-w)/2)}+${68-h}`, '-composite', resolve(destination, `${hero}${suffix}.png`));
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
