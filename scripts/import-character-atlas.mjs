// Authoring only: separate a generated portrait + four-view atlas into native assets.
// Requires ImageMagick. Gameplay uses the exported PNGs without resampling.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [hero, source, destination = 'public/art', layout = 'atlas'] = process.argv.slice(2);
if (!['nell', 'orrin', 'kit', 'celia', 'petra'].includes(hero) || !source) {
  throw new Error('Usage: node scripts/import-character-atlas.mjs <hero> <source.png> [output directory] [atlas|sides]');
}
if (!['atlas','sides'].includes(layout)) throw new Error('Choose atlas or sides layout.');
const run = (...args) => execFileSync('convert', args, { encoding: 'utf8' }).trim();
const [width, height] = run(resolve(source), '-format', '%w %h', 'info:').split(' ').map(Number);
const split = Math.round(height * .58), temporary = mkdtempSync(join(tmpdir(), 'bt-atlas-'));
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
  if(layout==='atlas'){
  const portrait = join(temporary, 'portrait.png');
  run(resolve(source), '-crop', `${width}x${split}+0+0`, '+repage', portrait); trim(portrait);
  run('-size', '128x128', 'xc:none', '(', portrait, '-filter', 'point', '-resize', '124x124', ')', '-gravity', 'south', '-geometry', '+0+2', '-composite', resolve(destination, `portrait-${hero}.png`));
  }
  const suffixes=layout==='sides'?['-left','-right']:['','-left','-right','-back'];
  const top=layout==='sides'?0:split;
  const views = suffixes.map((suffix, index) => {
    const left = Math.round(index * width / suffixes.length), right = Math.round((index + 1) * width / suffixes.length);
    const path = join(temporary, `${index}.png`);
    run(resolve(source), '-crop', `${right - left}x${height - top}+${left}+${top}`, '+repage', path); trim(path);
    const size = run(path, '-format', '%w %h', 'info:').split(' ').map(Number);
    return { suffix, path, size };
  });
  // One scale for the four views: never independently stretch a profile to fit.
  const scale = Math.min(64 / Math.max(...views.map(v => v.size[1])), 72 / Math.max(...views.map(v => v.size[0])));
  for (const { suffix, path, size } of views) {
    const w = Math.round(size[0] * scale), h = Math.round(size[1] * scale);
    run('-size', '80x80', 'xc:none', '(', path, '-filter', 'point', '-resize', `${w}x${h}!`, ')', '-geometry', `+${Math.floor((80-w)/2)}+${68-h}`, '-composite', resolve(destination, `${hero}${suffix}.png`));
    // Point sampling can sever a one-pixel source bridge; remove any resulting
    // detached flecks from the final native export as well.
    isolate(resolve(destination, `${hero}${suffix}.png`));
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
