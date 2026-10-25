import {expect,it} from 'vitest';
import {createHash} from 'node:crypto';
import {ARRANGEMENTS,scoreBar} from '../src/game/score';
import {performanceBar} from '../src/game/score-performance';
import {DESERT_SCALES} from '../src/game/score-desert';
import {isPercussion,pitchSteps} from '../src/game/tuning';

const mod=(n:number)=>((n%31)+31)%31;
it('builds each desert collection from seven neutral thirds with exactly 3L4s',()=>{
 const expected=[0,5,9,13,18,22,27];
 expect(Array.from({length:7},(_,i)=>mod(13+9*i)).sort((a,b)=>a-b)).toEqual(expected);
 for(const scale of Object.values(DESERT_SCALES)){
  const tonic=pitchSteps(scale[0]),degrees=scale.map(p=>pitchSteps(p)-tonic);
  expect(degrees).toEqual(expected);
  const steps=degrees.map((d,i)=>(degrees[i+1]??31)-d);
  expect(steps.filter(s=>s===5)).toHaveLength(3);expect(steps.filter(s=>s===4)).toHaveLength(4);
 }
});

it('keeps melody, accompaniment, bass and tuned drums inside the declared region, with a bounded hunters quotation',()=>{
 for(const mode of ['namar','sunpalace','skywalk','observatory','desert-battle','sun-serpent']as const){
  const intro=ARRANGEMENTS[mode].introBars??0;
  for(let bar=0;bar<32+intro;bar++){
   const i=bar-intro,middle=i>=16&&i<24;
   const root=mode==='observatory'?5:mode==='sunpalace'?(middle?0:13):middle?(mode==='sun-serpent'?5:18):0;
   const collection=[0,5,9,13,18,22,27].map(d=>mod(d+root));
   for(const n of scoreBar(mode,bar)){
    if(isPercussion(n.instrument))continue;
    if((mode==='observatory'||mode==='sun-serpent')&&n.instrument==='bell'&&[16,17].includes(i)){
     expect(['E5','Eb5','A4']).toContain(n.pitch);continue;
    }
    expect(collection,`${mode} bar ${bar+1}: ${n.instrument} ${n.pitch}`).toContain(mod(pitchSteps(n.pitch)));
   }
  }
 }
});

it('gives regional percussion its low/high stroke cycles while retaining distinct meters',()=>{
 const strokes=(mode:'namar'|'skywalk'|'sunpalace'|'sun-serpent',bar:number)=>scoreBar(mode,bar)
  .filter(n=>n.instrument==='hand-drum').map(n=>[n.beat,n.pitch==='C2'?'D':'T']);
 expect(strokes('namar',0)).toEqual([[0,'D'],[.5,'T'],[1.5,'T'],[2,'D'],[3,'T']]);
 expect(strokes('skywalk',0)).toEqual([[0,'D'],[.75,'T'],[1.5,'T'],[2,'D'],[2.75,'T'],[3.5,'T']]);
 expect(strokes('sunpalace',0)).toEqual([[0,'D'],[1,'T'],[2,'T']]);
 expect(strokes('sun-serpent',2)).toEqual([[0,'D'],[.5,'T'],[1,'T'],[1.5,'D'],[2,'T'],[2.5,'T']]);
});

it('preserves every performed event and the rubato clock of Two Seals at the Gate',()=>{
 // Fingerprint captured from main before the regional rewrite, including the
 // complete loop and its wrap. Protect the explicitly accepted arrangement.
 const cue=JSON.stringify(Array.from({length:34},(_,bar)=>performanceBar('outermooring',bar)));
 expect(createHash('sha256').update(cue).digest('hex')).toBe('5818f2e952c0ff6dda47f5d1589c120936da48712c6b7d70c30b73883f9fe42c');
});
