import {beforeAll,it,expect} from 'vitest';
import {newGame,type GameState} from '../src/rules/state';
import {decodeSave} from '../src/rules/save';
import {nextChapter} from '../src/content/chapters';
import {ENCOUNTERS} from '../src/content/encounters';
import {CampaignSession,defaultAgent} from '../src/headless/campaign';
import {playEarly} from '../src/headless/run';
import {playMiddle} from '../src/headless/middle';
import {playFive} from '../src/headless/five';
import {defaultSix,playSix} from '../src/headless/six';
import {playSeven,readSevenDeparture} from '../src/headless/seven';

// Deliberately opt-in: earn the shared prefix under today's rules rather than
// importing an old earned save or a development canonical fixture.
let departure:GameState;
function victories(s:CampaignSession,start:GameState,count:number){
 const battles=s.events.filter(e=>e.event==='battle');
 expect(battles).toHaveLength(count);
 expect(new Set(battles.map(e=>e.id)).size).toBe(count);
 expect(battles.every(e=>e.result==='victory')).toBe(true);
 const spent=s.events.reduce((sum,e)=>{
  const before=e.before as {coins?:number}|undefined,after=e.after as {coins?:number}|undefined;
  return sum+(before?.coins!==undefined&&after?.coins!==undefined?Math.max(0,before.coins-after.coins):0);
 },0);
 expect(s.state.coins).toBe(start.coins+battles.reduce((sum,e)=>sum+ENCOUNTERS[e.id as string].coins,0)-spent);
 expect(decodeSave(JSON.stringify(s.state))).toEqual(s.state);
}
beforeAll(()=>{
 const early=newGame(),events:{battle?:string;result?:string}[]=[];
 playEarly(early,events);
 expect(events.filter(e=>e.battle)).toHaveLength(7);
 expect(events.filter(e=>e.battle).every(e=>e.result==='victory')).toBe(true);
 const middle=new CampaignSession(early,defaultAgent);playMiddle(middle);victories(middle,early,8);
 const five=new CampaignSession(middle.state,defaultAgent);playFive(five);victories(five,middle.state,12);
 departure=decodeSave(JSON.stringify(five.state));
 expect(departure.flags.nellRecovered).toBeFalsy();
 expect(departure.flags.nellIll).toBe(true);
},300000);

it('earns the recovered ending from newGame through all three Benefactor forms',async()=>{
 const before=structuredClone(departure),six=new CampaignSession(departure,defaultAgent);
 await playSix(six);victories(six,departure,14);
 const seven=new CampaignSession(readSevenDeparture(JSON.stringify(six.state)),defaultAgent);
 playSeven(seven);victories(seven,six.state,9);
 expect(seven.state.flags).toMatchObject({nellRecovered:true,benefactorBodyWon:true,benefactorSunWon:true,benefactorHeartWon:true,daysReturned:true,homecomingSeen:true,realSeaSeen:true,chapterSevenComplete:true});
 expect(seven.state.flags.nellLost).toBeFalsy();
 expect(seven.state.location.map).toBe('seaholiday');
 expect(seven.state.boundary).toBeNull();expect(nextChapter(seven.state)).toBeUndefined();
 expect(departure).toEqual(before);
},300000);

it('earns the uncured ending from the same fresh prefix and retains the pre-assault return save',async()=>{
 const before=structuredClone(departure),six=new CampaignSession(departure,defaultAgent);
 await playSix(six,{...defaultSix,order:['desert','north'],optional:false});victories(six,departure,10);
 expect(six.state.flags).toMatchObject({emperorWon:true,lightbearerWon:true,nellLost:true,emptySeatSeen:true,lightbearerEnding:true});
 for(const flag of ['nellRecovered','capitalMorningSeen','chapterSixComplete','chapterSevenComplete'])expect(six.state.flags[flag]).toBeFalsy();
 expect(six.state.party.find(p=>p.id==='nell')!.hp).toBe(0);
 expect(six.state.activeParty).not.toContain('nell');
 expect(six.state.location.map).toBe('laststation');
 expect(six.state.boundary).toBeNull();expect(nextChapter(six.state)).toBeUndefined();
 expect(()=>readSevenDeparture(JSON.stringify(six.state))).toThrow();
 const checkpoint=decodeSave(JSON.stringify(six.checkpoints['capital-return']));
 expect(checkpoint.flags.capitalAssaultCommitted).toBeFalsy();
 expect(checkpoint.flags.nellLost).toBeFalsy();
 expect(checkpoint.party.find(p=>p.id==='nell')!.hp).toBe(1);
 expect(departure).toEqual(before);
},300000);
