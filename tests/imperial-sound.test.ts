import {expect,it,vi} from 'vitest';
import {imperialPresentation} from '../src/game/imperial-presentation';
import {Synth,type Effect} from '../src/game/synth';
import {createBattle,enemyTurn} from '../src/rules/combat';
import {prepareImperial,imperialCore,imperialSupports} from '../src/rules/imperial-vessel';
import {bossDirectAbility} from '../src/rules/boss-direct';
import {chapterSixFinaleStart} from '../src/dev/canonical-saves';
import {ENCOUNTERS} from '../src/content/encounters';
vi.mock('phaser',()=>({default:{}}));
vi.mock('../src/game/tilemap',()=>({drawTileMap:vi.fn()}));
vi.mock('../src/game/boss-motion',()=>({bossMotionEnabled:()=>false}));

it('gives each marked Emperor attack its own sound while preserving his direct shot',()=>{
 const b=createBattle('imperial-vessel',chapterSixFinaleStart(true)),core=imperialCore(b)!,p=imperialPresentation(ENCOUNTERS[b.encounter]);
 for(const round of [1,2,3]){b.round=round;prepareImperial(b);expect(p.attackSound!(core,'judgment')).toBe('imperial-judgment');}
 expect(p.attackSound!(core,bossDirectAbility(core)!)).toBe('resonance');
 expect(p.attackSound!(imperialSupports(b)[0],'strike')).toBeUndefined();
 expect(p.attackSound!(b.units.find(u=>u.side==='party')!,'strike')).toBeUndefined();
});

it('leaves both Lightbearer sounds intact',()=>{
 const b=createBattle('lightbearer',chapterSixFinaleStart(false)),core=imperialCore(b)!,p=imperialPresentation(ENCOUNTERS[b.encounter]);
 expect(p.attackSound!(core,'judgment')).toBe('flare');expect(p.attackSound!(core,bossDirectAbility(core)!)).toBe('flare');
});

it('keeps the fourth-round pause free of attack sound triggers',()=>{
 const b=createBattle('imperial-vessel',chapterSixFinaleStart(true)),core=imperialCore(b)!,callback=vi.fn();
 b.round=4;prepareImperial(b);b.queue=[core.id,b.units[0].id];
 expect(enemyTurn(b,undefined,callback)).toBeUndefined();expect(callback).not.toHaveBeenCalled();
});

function schedule(effect:Effect){
 const context={sampleRate:48000,createBuffer:(_channels:number,length:number)=>({getChannelData:()=>new Float32Array(length)})};
 const synth=new Synth(context as never,{}as never),tones=vi.spyOn(synth,'tone').mockImplementation(()=>{}),noise=vi.spyOn(synth,'noise').mockImplementation(()=>{});
 synth.effect(effect,3);return {tones:tones.mock.calls,noise:noise.mock.calls};
}

it('distinguishes the heavy attack with bright metal, stereo falling rays and a finite pressure tail',()=>{
 const s=schedule('imperial-judgment');expect(s.noise.length).toBeGreaterThan(0);
 expect(s.tones.some(([hz])=>hz>2000)).toBe(true);expect(s.tones.some(([hz])=>hz<100)).toBe(true);
 expect(s.tones.some(([, , , , ,pan])=>pan!<0)).toBe(true);expect(s.tones.some(([, , , , ,pan])=>pan!>0)).toBe(true);
 for(const [hz,start,duration,volume,, ,end]of s.tones){expect(hz).toBeGreaterThan(0);expect(end??hz).toBeGreaterThan(0);expect(start).toBeGreaterThanOrEqual(3);expect(start+duration+.08).toBeLessThan(4.5);expect(volume).toBeLessThanOrEqual(.2);}
 for(const [start,duration,volume]of s.noise){expect(start).toBeGreaterThanOrEqual(3);expect(start+duration+.1).toBeLessThan(4.5);expect(volume).toBeLessThanOrEqual(.2);}
});

it('retains the quiet beating resonance used by the direct shot and story scenes',()=>{
 const s=schedule('resonance');expect(s.noise).toHaveLength(0);expect(s.tones.map(t=>t[0])).toEqual([146.8,149.1,440.4]);
});
