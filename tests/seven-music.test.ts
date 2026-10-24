import {expect,it} from 'vitest';
import {SEVEN_MODES} from '../src/game/score-seven';
import {ARRANGEMENTS,scoreBar,scoreLength} from '../src/game/score';
import {hasExpression,hasRubato} from '../src/game/score-performance';
import {isPercussion,pitchSteps} from '../src/game/tuning';
it('keeps the domain in its approved exact 31-tone collections with complete varied forms',()=>{
 const radiant=[0,5,10,14,18,22,25,28],reflected=[0,3,6,9,13,17,21,26];
 const inverted=['takenwater','quietward','seasonstreet','domain-battle','hospice-battle','seasons-battle','hollow-sun'];
 for(const mode of SEVEN_MODES){
  const intro=ARRANGEMENTS[mode].introBars??0;expect(scoreLength(mode)).toBe(32+intro);expect(hasExpression(mode)).toBe(true);
  expect(scoreBar(mode,32+intro)).toEqual(scoreBar(mode,intro));
  const phrases=new Set<string>();
  for(let bar=intro;bar<intro+32;bar++){
   const notes=scoreBar(mode,bar);expect(notes.every(n=>n.beat>=0&&n.beat<ARRANGEMENTS[mode].beats&&n.duration>0&&Number.isFinite(n.velocity))).toBe(true);
   if(!['lastrefuge','homecoming','seaholiday'].includes(mode))for(const n of notes.filter(n=>!isPercussion(n.instrument)))expect(inverted.includes(mode)?reflected:radiant,mode+':'+n.pitch).toContain((pitchSteps(n.pitch)%31+31)%31);
   if((bar-intro)%4===0)phrases.add(JSON.stringify(notes));
  }
  expect(phrases.size,mode).toBeGreaterThanOrEqual(6);
 }
 expect(hasRubato('lastrefuge')).toBe(true);expect(hasRubato('homecoming')).toBe(true);expect(scoreBar('benefactor',0).some(n=>n.instrument==='organ')).toBe(true);
});
