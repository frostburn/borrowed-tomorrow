import {parseArgs} from 'node:util';
import {readFileSync,writeFileSync,mkdtempSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const {values}=parseArgs({options:{from:{type:'string'},conduit:{type:'string',default:'feeds'},harbor:{type:'string',default:'dry'},'skip-optional':{type:'boolean',default:false}}});
if(!values.from)throw Error('Pass --from <earned-early-report.json>');
const directory=mkdtempSync(join(tmpdir(),'bt-comparison-')),results=[];
const policies=[['legacy','offense','baseline'],['legacy','offense','prepared'],['defensive','offense','prepared'],['defensive','support','prepared'],['defensive','offense','frugal'],['defensive','support','frugal'],['cooperative','offense','prepared'],['cooperative','support','prepared'],['cooperative','offense','frugal'],['cooperative','support','frugal']];
for(const [tactics,build,spending]of policies){
 const name=[tactics,build,spending].join('-'),output=join(directory,name+'.json');
 console.log(`Running ${name}`);
 const child=spawnSync(process.execPath,['scripts/headless.mjs','middle','--from',resolve(values.from),'--output',output,'--tactics',tactics,'--build',build,'--spending',spending,'--conduit',values.conduit,'--harbor',values.harbor,...values['skip-optional']?['--skip-optional']:[]],{encoding:'utf8',timeout:180000,maxBuffer:2**20});
 let report;try{report=JSON.parse(readFileSync(output,'utf8'));}catch{throw Error(`${name}: no report (${child.error?.message??child.stderr})`);}
 const battles=report.events.filter(e=>e.event==='battle');
 const summary={name,status:report.status,error:report.error,source:report.source,agent:report.agent,options:report.options,coins:report.state.coins,spent:0,damage:0,knockouts:0,itemsUsed:{},abilities:{},battles:[]};
 for(const e of report.events)if(typeof e.before?.coins==='number'&&typeof e.after?.coins==='number')summary.spent+=Math.max(0,e.before.coins-e.after.coins);
 for(const b of battles){
  const row={id:b.id,rounds:b.rounds,minHp:999,damage:0,knockouts:0};
  for(const t of b.turns){
   if(report.state.party.some(p=>p.id===t.actor)&&t.decision.ability){const a=t.decision.ability;summary.abilities[a]=(summary.abilities[a]??0)+1;if(['bandage','field-bandage','focus-tonic'].includes(a))summary.itemsUsed[a]=(summary.itemsUsed[a]??0)+1;}
   for(const before of t.before){
    if(!report.state.party.some(p=>p.id===before.id))continue;
    const after=t.after.find(u=>u.id===before.id);row.minHp=Math.min(row.minHp,after.hp);row.damage+=Math.max(0,before.hp-after.hp);if(before.hp>0&&after.hp===0)row.knockouts++;
   }
  }
  summary.damage+=row.damage;summary.knockouts+=row.knockouts;summary.battles.push(row);
 }
 results.push(summary);
 writeFileSync(join(directory,'summary.json'),JSON.stringify(results,null,2)+'\n');
 console.log(`${name}: ${summary.status}, ${summary.damage} HP lost, ${summary.knockouts} knockouts, ${summary.spent} marks spent, ${summary.coins} remaining`);
 if(child.status!==0)process.exitCode=1;
}
console.log(`Full reports and comparison: ${directory}`);
