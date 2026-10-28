import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {CampaignSession,defaultAgent} from '../src/headless/campaign';
import {defaultFive,playFive} from '../src/headless/five';
import {readReportState} from '../src/headless/middle';
import {decodeSave} from '../src/rules/save';
import {improved} from '../src/rules/improvements';

it('buys permanent improvements through real Chapter Five offers using earned money, with a medicine reserve',()=>{
 const input=readReportState(readFileSync('docs/headless/chapter-four-engaged-warden.json','utf8'));
 const before=structuredClone(input),s=new CampaignSession(input,defaultAgent);
 playFive(s,{...defaultFive,improvements:true});
 expect(input).toEqual(before);expect(s.state.boundary).toBe('chapter-six:capital-approach');
 for(const id of ['orrin-counterbalance','hp-celia','focus-celia'])expect(improved(s.state,id)).toBe(true);
 const purchases=s.events.filter(e=>e.event==='choice'&&String(e.label).startsWith('Confirm ·'));
 expect(purchases.map(e=>(e.before as {coins:number}).coins-(e.after as {coins:number}).coins)).toEqual([500,300,450]);
 expect(s.state.coins).toBeGreaterThanOrEqual(80);expect(s.state.bandages).toBeGreaterThan(0);
 expect(s.state.party.find(p=>p.id==='nell')).toMatchObject({hp:1,focus:0});
 const battles=s.events.filter(e=>e.event==='battle');expect(battles).toHaveLength(12);expect(battles.every(e=>e.result==='victory')).toBe(true);
 expect(decodeSave(JSON.stringify(s.state))).toEqual(s.state);
},90000);
