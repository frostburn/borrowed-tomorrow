import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {CampaignSession,defaultAgent} from '../src/headless/campaign';
import {defaultSix,playSix,readSixDeparture} from '../src/headless/six';
import {chapterSixCapitalStart,chapterSixFinaleStart} from '../src/dev/canonical-saves';
import {arrival} from '../src/content/maps';
import {decodeSave} from '../src/rules/save';
import {newGame} from '../src/rules/state';

const earned=()=>readSixDeparture(readFileSync('docs/headless/chapter-five-earned.json','utf8'));
it('continues the earned Chapter Five save without replacing its resources',()=>{
 const state=earned();state.coins=41;state.bandages=1;state.party.find(p=>p.id==='kit')!.hp=18;
 for(const value of [state,{state,status:'complete'}])expect(readSixDeparture(JSON.stringify(value))).toEqual(state);
});
it('accepts mooring checkpoints only between completed expeditions',()=>{
 const state=chapterSixCapitalStart(true);state.location=arrival('outermooring','namar');
 expect(readSixDeparture(JSON.stringify(state))).toEqual(state);
 const partial=structuredClone(state);delete partial.flags.northReported;
 for(const bad of [null,{},newGame(),partial,chapterSixFinaleStart(true),{status:'failed',state}])expect(()=>readSixDeparture(JSON.stringify(bad))).toThrow();
});
it('rejects repeated, missing or unsupported expeditions without mutating the input',async()=>{
 for(const order of [['desert','desert'],['north','jungle'],['desert','north','jungle','jungle']]as const){
  const s=new CampaignSession(earned(),defaultAgent),before=structuredClone(s.state);
  await expect(playSix(s,{...defaultSix,order})).rejects.toThrow('exactly once');
  expect(s.state).toEqual(before);expect(s.events).toEqual([]);
 }
});
for(const recovered of [false,true])it(`explicitly cancels and confirms the capital return checkpoint (Nell recovered: ${recovered})`,async()=>{
 const s=new CampaignSession(chapterSixFinaleStart(recovered),defaultAgent),choice=recovered?'Climb the crown stair':'Proceed with Nell still bound';
 s.visit('palace-preparations');const before=structuredClone(s.state);s.choose(choice);
 expect(()=>s.prepare()).toThrow('checkpoint');expect(s.state).toEqual(before);
 await s.answerCheckpoint('capital-return',false);expect(s.state).toEqual(before);expect(s.checkpoints['capital-return']).toBeUndefined();
 s.visit('palace-preparations',choice);await s.answerCheckpoint('capital-return',true);
 expect(s.state.location.map).toBe('crown');expect(s.state.flags.capitalAssaultCommitted).toBe(true);expect(s.state.flags.capitalRiskAccepted).toBe(!recovered);
 const checkpoint=s.checkpoints['capital-return'];expect(checkpoint.flags.capitalAssaultCommitted).toBeFalsy();expect(checkpoint.location.map).toBe('lastpalace');expect(decodeSave(JSON.stringify(checkpoint))).toEqual(checkpoint);
 expect(s.events.filter(e=>e.event==='checkpoint-answer').map(e=>e.accepted)).toEqual([false,true]);
 await expect(s.answerCheckpoint('capital-return',true)).rejects.toThrow('No pending checkpoint');
});
