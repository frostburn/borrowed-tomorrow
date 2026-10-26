import { createRequire } from 'node:module';
import { dirname,join } from 'node:path';
import type { Plugin } from 'vite';

const require=createRequire(import.meta.url);
/** Use the pinned package's maintained no-physics entry, without vendoring Phaser. */
export const phaserCanvasSource=join(dirname(require.resolve('phaser/package.json')),'src/phaser-no-physics.js');

export function phaserCanvasBuild():Plugin {
  return {
    name:'phaser-canvas-build',apply:'build',enforce:'pre',
    transform(code,id){
      if(!/[\\/]phaser[\\/]src[\\/].*\.js$/.test(id))return;
      // Phaser intentionally tests `typeof FLAG` as a build-time boolean. These
      // match its Webpack DefinePlugin expressions, not ordinary runtime flags.
      return code.replace(/typeof (CANVAS_RENDERER|WEBGL_RENDERER|WEBGL_DEBUG|FEATURE_SOUND|EXPERIMENTAL)\b/g,(_,flag)=>flag==='CANVAS_RENDERER'?'true':'false')
        .replace(/\bglobal\.Phaser\b/g,'globalThis.Phaser');
    },
  };
}
