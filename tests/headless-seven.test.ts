import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {CampaignSession,defaultAgent} from '../src/headless/campaign';
import {defaultSeven,playSeven,readSevenDeparture,type SevenOptions} from '../src/headless/seven';
import {chapterSevenRefugeStart,chapterSevenStart,chapterSixFinaleStart} from '../src/dev/canonical-saves';
import {newGame} from '../src/rules/state';

const earned=()=>readSevenDeparture(readFileSync('docs/headless/chapter-six-earned.json','utf8'));
it('reads earned departures and completed reports without replacing resources',()=>{
 const s=earned();s.coins=41;s.bandages=1;s.party[0].hp=18;
 for(const value of [s,{state:s,status:'complete'}])expect(readSevenDeparture(JSON.stringify(value))).toEqual(s);
});
it('resumes only safe refuge checkpoints, not partial transformations, unrelated chapters or failed reports',()=>{
 const session=new CampaignSession(chapterSevenRefugeStart(),defaultAgent);session.resume();const s=session.state;
 expect(readSevenDeparture(JSON.stringify(s))).toEqual(s);
 const pending=structuredClone(s);Object.assign(pending.flags,{benefactorSeen:true,benefactorBodyConfronted:true,benefactorBodyWon:true});
 for(const bad of [null,{},newGame(),chapterSixFinaleStart(false),chapterSevenStart(),pending,{status:'failed',state:earned()}])expect(()=>readSevenDeparture(JSON.stringify(bad))).toThrow();
 pending.flags.hollowSunSeen=true;expect(readSevenDeparture(JSON.stringify(pending))).toEqual(pending);
 Object.assign(pending.flags,{benefactorSunConfronted:true,benefactorSunWon:true});expect(()=>readSevenDeparture(JSON.stringify(pending))).toThrow();
 pending.flags.fragmentReturned=true;expect(readSevenDeparture(JSON.stringify(pending))).toEqual(pending);
});
it('rejects unknown, repeated, empty and oversized formations or endpoints before entering the chapter',()=>{
 for(const change of [{party:[]},{party:['nell','nell']},{party:['nell','kit','celia','petra']},{party:['unknown']},{through:'halfway'}]){
  const s=new CampaignSession(earned(),defaultAgent),before=structuredClone(s.state);
  expect(()=>playSeven(s,{...defaultSeven,...change}as SevenOptions)).toThrow('distinct available');
  expect(s.state).toEqual(before);expect(s.events).toEqual([]);
 }
});
it('cannot use the guarded season supplies by returning from the final refuge',()=>{
 const s=new CampaignSession(chapterSevenRefugeStart(),defaultAgent);s.resume();s.visit('refuge-seasons');const before=structuredClone(s.state);
 expect(()=>s.visit('season-rest','Rest · restore everyone’s HP and focus')).toThrow('Unavailable interaction');expect(s.state).toEqual(before);
});
it('can stop at the refuge without confronting a final form or marking the campaign complete',()=>{
 const s=new CampaignSession(chapterSevenRefugeStart(),defaultAgent);s.resume();
 playSeven(s,{...defaultSeven,through:'refuge'});
 expect(s.events.some(e=>e.event==='battle')).toBe(false);expect(s.state.flags.benefactorSeen).toBeFalsy();expect(s.state.flags.chapterSevenComplete).toBeFalsy();
 expect(readSevenDeparture(JSON.stringify(s.checkpoints['seven-refuge']))).toEqual(s.state);
});
