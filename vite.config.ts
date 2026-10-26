import { defineConfig } from 'vite';
import { compactTiledMaps } from './scripts/build/tiled.ts';
import { phaserCanvasSource,phaserCanvasBuild } from './scripts/build/phaser.ts';
export default defineConfig(({command})=>({
  base: './',
  json:{stringify:true},
  resolve:command==='build'?{alias:[{find:/^phaser$/,replacement:phaserCanvasSource}]}:undefined,
  plugins:[compactTiledMaps(),phaserCanvasBuild()],
  build: { manifest:true,rolldownOptions: { output: { codeSplitting: { groups: [
    {name:'phaser',test:/node_modules[\\/](phaser|eventemitter3)[\\/]/,priority:10},
    {name:id=>`maps-${/chapter-([a-z]+)/.exec(id)![1]}`,debugName:'chapter maps and scenery',test:/[\\/]content[\\/]chapter-[a-z]+[\\/].*\.json(?:\.js)?$/,includeDependenciesRecursively:false},
    {name:'story',test:/[\\/]content[\\/](?:chapter-[a-z]+[\\/].*scenes|scenes)\.ts$/,includeDependenciesRecursively:false},
    {name:'tile-data',test:/[\\/]assets[\\/]tiles[\\/]|[\\/]content[\\/]tile-(runs|catalog)\.ts$/},
  ] } } } },
}));
