import {it,expect} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import {nellIsPale,illnessPortrait,illnessDialogue} from '../src/content/illness-appearance';
import {expressivePortrait,portraitExpressions} from '../src/content/portrait-expressions';
import {artPath} from '../src/content/art-assets';
import {cinematicAssets} from '../src/content/cinematic-art';
import {SAY} from '../src/content/dialogue';
import {claim,hunters} from '../src/content/chapter-five/finale-scenes';
import {treatment,rest} from '../src/content/chapter-six/jungle/scenes';

it('uses pale portraits only during the saved illness, including Equipment',()=>{
 for(const flags of [{},{nellIll:true},{nellIll:true,nellRecovered:true}]){
  const pale=nellIsPale(flags);
  expect(illnessPortrait('portrait-nell',pale)).toBe(flags.nellIll&&!flags.nellRecovered?'portrait-nell-ill':'portrait-nell');
  expect(illnessPortrait('portrait-celia',pale)).toBe('portrait-celia');
  expect(illnessPortrait(undefined,pale)).toBeUndefined();
  const line=illnessDialogue({lines:[SAY('Nell','A line.',{expression:'worried'})]},pale).lines[0];
  expect(line.portrait).toBe(illnessPortrait('portrait-nell',pale));expect(line.expression).toBe('worried');
 }
});
it('turns pale at the staged collapse before nellIll is committed',()=>{
 const source=claim(),before=structuredClone(source),d=illnessDialogue(source,false);
 const nell=d.lines.filter(l=>l.who==='Nell');
 expect(nell.map(l=>l.portrait)).toEqual(['portrait-nell','portrait-nell-ill']);
 expect(source).toEqual(before);
 expect(illnessDialogue(hunters(),true).lines.find(l=>l.who==='Nell')!.portrait).toBe('portrait-nell-ill');
});
it('restores her colour at the treatment wake-up, while preserving the scene and callbacks',()=>{
 const source=treatment(),done=()=>{},d=illnessDialogue({...source,done},true);
 const wake=d.lines.findIndex(l=>l.shot?.actors?.nell?.face==='nell-recovered');expect(wake).toBeGreaterThan(0);
 expect(d.lines.slice(0,wake).filter(l=>l.who==='Nell').every(l=>l.portrait==='portrait-nell-ill')).toBe(true);
 expect(d.lines.slice(wake).filter(l=>l.who==='Nell').map(l=>l.portrait)).toEqual(['portrait-nell','portrait-nell']);
 expect(d.done).toBe(done);expect(d.scene).toBe(source.scene);
 expect(illnessDialogue(rest(),false).lines.find(l=>l.who==='Nell')!.portrait).toBe('portrait-nell');
 expect(cinematicAssets('rainhouse')).toContainEqual({key:'nell-recovered',url:'art/vector/nell-recovered.svg'});
});
it('ships native SVGs for every pale portrait expression and illness pose',()=>{
 expect(portraitExpressions('portrait-nell-ill')).toEqual(portraitExpressions('portrait-nell'));
 for(const expression of portraitExpressions('portrait-nell-ill')){
  const asset=expressivePortrait('portrait-nell-ill',expression)!;expect(artPath(asset)).toBe(`art/vector/${asset}.svg`);
  const svg=readFileSync(`public/${artPath(asset)}`,'utf8');expect(svg).toContain('width="128" height="128"');expect(svg).not.toContain('#c99571');
 }
 for(const pose of ['nell-faint','nell-ill','nell-bed','nell-recovered'])expect(existsSync(`public/${artPath(pose)}`)).toBe(true);
});
