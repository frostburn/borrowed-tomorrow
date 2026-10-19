// Authoring only: export party atlases, NPC portrait/actor pairs or enemy actors.
// Requires ImageMagick. Gameplay uses the exported PNGs without resampling.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [hero, source, destination = 'public/art', requestedLayout] = process.argv.slice(2);
const supporting = JSON.parse(readFileSync(new URL('../assets/characters/supporting-cast.json', import.meta.url), 'utf8'));
const layout = requestedLayout ?? supporting[hero]?.layout ?? 'atlas';
if ((!['nell', 'orrin', 'kit', 'celia', 'petra'].includes(hero) && !supporting[hero]) || !source) {
  throw new Error('Usage: node scripts/import-character-atlas.mjs <character> <source.png> [output directory] [atlas|sides|pair|actor]');
}
if (!['atlas','sides','pair','actor'].includes(layout)) throw new Error('Choose atlas, sides, pair or actor layout.');
const run = (...args) => execFileSync('convert', args, { encoding: 'utf8' }).trim();
const [width, height] = run(resolve(source), '-format', '%w %h', 'info:').split(' ').map(Number);
const pairSplit = () => {
  const alpha = execFileSync('convert', [resolve(source), '-alpha', 'extract', '-depth', '8', 'gray:-'], {maxBuffer:16*1024*1024});
  let start = -1, bestStart = -1, bestLength = 0;
  const end = Math.round(height * .75);
  for (let y = Math.round(height * .35); y < end; y++) {
    let opaque = 0;
    for (let x = 0; x < width; x++) if (alpha[y * width + x] > 127) opaque++;
    if (opaque <= 1) { if (start < 0) start = y; }
    else if (start >= 0) {
      if (y - start > bestLength) { bestStart = start; bestLength = y - start; }
      start = -1;
    }
  }
  if (start >= 0 && end - start > bestLength) { bestStart = start; bestLength = end - start; }
  if (bestLength < height * .01) throw new Error('The portrait and actor need a clear transparent gap.');
  return Math.round(bestStart + bestLength / 2);
};
const split = layout === 'pair' ? pairSplit() : Math.round(height * .58), temporary = mkdtempSync(join(tmpdir(), 'bt-atlas-'));
// Authoring-only sampling phases, measured in fractions of one output pixel.
const offsets = JSON.parse(readFileSync(new URL('../assets/characters/sampling-offsets.json', import.meta.url), 'utf8'));
const sample = (path, size, w, h, offset, destination) => {
  if (!Array.isArray(offset) || offset.length !== 2 || offset.some(v => !Number.isFinite(v) || Math.abs(v) > .5)) {
    throw new Error('Sampling offsets must be two numbers between -0.5 and 0.5.');
  }
  const [sw, sh] = size, [ox, oy] = offset;
  const source = execFileSync('convert', [path, '-depth', '8', 'rgba:-'], { maxBuffer: 16 * 1024 * 1024 });
  const pixels = Buffer.alloc(80 * 80 * 4), left = Math.floor((80 - w) / 2), top = 68 - h;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = Math.max(0, Math.min(sw - 1, Math.floor((x + .5 + ox) * sw / w)));
    const sy = Math.max(0, Math.min(sh - 1, Math.floor((y + .5 + oy) * sh / h)));
    const at = (sy * sw + sx) * 4;
    source.copy(pixels, ((top + y) * 80 + left + x) * 4, at, at + 4);
  }
  // Copy complete source RGBA pixels: no interpolation, repainting or palette changes.
  execFileSync('convert', ['-size', '80x80', '-depth', '8', 'rgba:-', destination], { input: pixels });
};
const isolate = path => {
  const [w,h] = run(path, '-format', '%w %h', 'info:').split(' ').map(Number);
  const pixels = execFileSync('convert', [path, '-depth', '8', 'rgba:-'], {maxBuffer:16*1024*1024});
  const labels = new Uint32Array(w*h), queue = new Uint32Array(w*h);
  let label=0, largest=0, area=0;
  for(let seed=0;seed<w*h;seed++) {
    if(labels[seed] || !pixels[seed*4+3])continue;
    label++;let start=0,end=1;queue[0]=seed;labels[seed]=label;
    while(start<end) {
      const at=queue[start++], x=at%w, y=Math.floor(at/w);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) {
        const nx=x+dx,ny=y+dy,next=ny*w+nx;
        if(nx<0||nx>=w||ny<0||ny>=h||labels[next]||!pixels[next*4+3])continue;
        labels[next]=label;queue[end++]=next;
      }
    }
    if(end>area){largest=label;area=end;}
  }
  if(!largest)throw new Error('The character cutout is empty.');
  for(let at=0;at<w*h;at++)if(labels[at]!==largest)pixels[at*4+3]=0;
  execFileSync('convert', ['-size',`${w}x${h}`,'-depth','8','rgba:-',path], {input:pixels});
};
const trim = path => {
  // Ignore stray near-transparent edge noise when finding the cutout, while
  // copying the original RGBA pixels inside it unchanged.
  isolate(path);
  const bounds = run(path, '-alpha', 'extract', '-threshold', '50%', '-format', '%@', 'info:');
  run(path, '-crop', bounds, '+repage', path);
};
try {
  if(layout==='atlas'||layout==='pair'){
  const portrait = join(temporary, 'portrait.png');
  run(resolve(source), '-crop', `${width}x${split}+0+0`, '+repage', portrait); trim(portrait);
  run('-size', '128x128', 'xc:none', '(', portrait, '-filter', 'point', '-resize', '124x124', ')', '-gravity', 'south', '-geometry', '+0+2', '-composite', resolve(destination, `portrait-${hero}.png`));
  if(layout==='pair')isolate(resolve(destination, `portrait-${hero}.png`));
  }
  const single=layout==='pair'||layout==='actor';
  const suffixes=single?['']:layout==='sides'?['-left','-right']:['','-left','-right','-back'];
  const top=layout==='sides'||layout==='actor'?0:split;
  const views = suffixes.map((suffix, index) => {
    const left = Math.round(index * width / suffixes.length), right = Math.round((index + 1) * width / suffixes.length);
    const path = join(temporary, `${index}.png`);
    run(resolve(source), '-crop', `${right - left}x${height - top}+${left}+${top}`, '+repage', path); trim(path);
    const size = run(path, '-format', '%w %h', 'info:').split(' ').map(Number);
    return { suffix, path, size };
  });
  // One scale for the four views: never independently stretch a profile to fit.
  const target=single?supporting[hero]:undefined;
  const scale = Math.min((target?.height??64) / Math.max(...views.map(v => v.size[1])), (target?.width??72) / Math.max(...views.map(v => v.size[0])));
  for (const { suffix, path, size } of views) {
    const w = Math.round(size[0] * scale), h = Math.round(size[1] * scale);
    const output = resolve(destination, `${hero}${suffix}.png`), offset = offsets[`${hero}${suffix}`]??(single?[0,0]:undefined);
    if (offset) sample(path, size, w, h, offset, output);
    else run('-size', '80x80', 'xc:none', '(', path, '-filter', 'point', '-resize', `${w}x${h}!`, ')', '-geometry', `+${Math.floor((80-w)/2)}+${68-h}`, '-composite', output);
    // Point sampling can sever a one-pixel source bridge; remove any resulting
    // detached flecks from the final native export as well.
    isolate(resolve(destination, `${hero}${suffix}.png`));
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
