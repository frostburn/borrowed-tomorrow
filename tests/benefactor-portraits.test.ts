import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import * as scenes from '../src/content/chapter-seven/scenes';
import {SAY} from '../src/content/dialogue';
import {artPath} from '../src/content/art-assets';
import {benefactorPortraitPath,BENEFACTOR_PORTRAITS} from '../src/content/benefactor-art';

it('keeps the intact voice before the mantle breaks, then shows the hollow sun speaking in fractured case',()=>{
 for(const make of [scenes.crossing,scenes.harvest,scenes.hospice,scenes.seasons,scenes.god])for(const line of make().lines.filter(l=>l.who==='The Benefactor')){
  expect(line.portrait).toBe('portrait-benefactor');expect(line.text).toMatch(/[a-z]{3}/);
 }
 const broken=scenes.sun().lines.find(l=>l.who==='The Benefactor')!;
 expect(broken.portrait).toBe(BENEFACTOR_PORTRAITS[1]);
 expect(broken.text.toLowerCase()).toBe('i was here before your stations. before your names.');
 const letters=[...broken.text].filter(c=>/[a-z]/i.test(c));
 letters.forEach((c,i)=>expect(c).toBe(i%2?c.toLowerCase():c.toUpperCase()));
 expect(scenes.sun().lines.find(l=>l.who==='Orrin')!.text).toBe('The channels are empty. It can’t build another body.');
 // Chapter Five still uses the unseen light card, never the final boss portrait.
 expect(SAY('The Benefactor','Words.').portrait).toBe('ui/portrait-light');
});

it('ships self-contained portraits matching both later native forms',()=>{
 expect(benefactorPortraitPath(0)).toBe('art/vector/benefactor/benefactor-portrait.svg');
 for(const [form,name]of [[1,'sun'],[2,'heart']]as const){
  expect(benefactorPortraitPath(form)).toBe(artPath(BENEFACTOR_PORTRAITS[form]));
  const svg=readFileSync('public/'+benefactorPortraitPath(form),'utf8');
  expect(svg).toContain('width="128" height="128"');expect(svg).toContain(`data-benefactor-form="${name}"`);
  expect(svg).not.toMatch(/<image|<script|href=/);expect(Buffer.byteLength(svg)).toBeLessThan(128*1024);
 }
});
