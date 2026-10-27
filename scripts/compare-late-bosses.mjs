import {parseArgs} from 'node:util';
import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createServer} from 'vite';

// Isolated balance probes, not evidence of an earned Chapter Six/Seven journey.
// --root lets the same authored inputs exercise an earlier rules checkout.
const {values}=parseArgs({options:{root:{type:'string'},output:{type:'string',default:'/tmp/borrowed-tomorrow-late-bosses.json'},tactics:{type:'string',default:'defensive'}}});
if(!['legacy','defensive','cooperative'].includes(values.tactics))throw Error('Invalid tactics');
const root=resolve(values.root??'.'),output=resolve(values.output);
const inputs=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
const rules=await createServer({root,configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
const hash=s=>createHash('sha256').update(s).digest('hex');
try{
 const canon=await inputs.ssrLoadModule('/src/dev/canonical-saves.ts');
 const {createBattle,awardVictory}=await rules.ssrLoadModule('/src/rules/combat.ts');
 const {playBattle}=await rules.ssrLoadModule('/src/headless/battle.ts');
 const {battleMetrics}=await rules.ssrLoadModule('/src/headless/support-probe.ts');
 const {level}=await rules.ssrLoadModule('/src/rules/state.ts');
 const {validParty}=await rules.ssrLoadModule('/src/rules/party.ts');
 const {heroAvailable}=await rules.ssrLoadModule('/src/rules/availability.ts');
 const results=[],agent={tactics:values.tactics,build:'offense',spending:'prepared'};
 const recovered=[['nell','orrin','celia'],['nell','kit','petra'],['nell','celia','petra']];
 const ill=[['kit','orrin','celia'],['kit','orrin','petra'],['kit','celia','petra']];
 const starts=[
  ['hammer-carrier',()=>canon.chapterFiveStart(),recovered],
  ...[false,true].flatMap(well=>[
   ['sun-serpent',()=>canon.chapterSixDragonStart(well),well?recovered:ill],
   ['winter-dragon',()=>canon.chapterSixDragonStart(well),well?recovered:ill],
  ]),
  ['imperial-vessel',()=>canon.chapterSixFinaleStart(true),recovered],
  ['lightbearer',()=>canon.chapterSixFinaleStart(false),ill],
  ...['domain-collector','domain-furnace','domain-ward','domain-dragon'].map(id=>[id,()=>canon.chapterSevenStart(),recovered]),
 ];
 function probe(id,state,sequence){
  const b=createBattle(id,state),turns=playBattle(b,agent),metrics=battleMetrics(b,turns);
  const enemyActions={},enemyDamage={};
  for(const t of turns)if(t.decision.kind==='enemy'){
   const name=t.decision.ability??'pause';enemyActions[name]=(enemyActions[name]??0)+1;
   for(const u of t.before.filter(u=>b.units.some(v=>v.id===u.id&&v.side==='party')))enemyDamage[t.actor]=(enemyDamage[t.actor]??0)+Math.max(0,u.hp-t.after.find(v=>v.id===u.id).hp);
  }
  const row={id,sequence,fixture:'authored canonical; no earned late-game playthrough claimed',nell:state.flags.nellRecovered?'recovered':state.flags.nellIll?'ill':'well',party:[...state.activeParty],level:level(state),inputSha256:hash(JSON.stringify(state)),...metrics,enemyActions,enemyDamage};
  results.push(row);console.log(`${id}/${row.nell}/${row.party.join('+')}: ${row.result}, ${row.rounds} rounds, ${row.hpLost} HP lost, ${row.knockouts} knockouts`);
  if(row.result!=='victory')process.exitCode=1;
  return b;
 }
 for(const [id,make,parties]of starts)for(const party of parties){
  const state=make();
  if(!validParty(party,state.party.filter(h=>heroAvailable(state,h.id)).map(h=>h.id)))throw Error('Invalid probe formation');
  state.activeParty=[...party];probe(id,state,'isolated');
 }
 // The three final forms share real victory recovery and remaining supplies.
 // No rest, refill, reward-free restart or retry between these fights.
 for(const party of recovered){
  const state=canon.chapterSevenRefugeStart();state.activeParty=[...party];
  for(const id of ['benefactor-body','benefactor-sun','benefactor-heart']){
   const b=probe(id,state,'consecutive final forms');if(b.result!=='victory')break;awardVictory(b,state);
  }
 }
 const files=['src/rules/combat.ts','src/rules/abilities.ts','src/dev/canonical-saves.ts'];
 try{readFileSync(join(root,'src/rules/boss-direct.ts'));files.push('src/rules/boss-direct.ts');}catch{}
 writeFileSync(output,JSON.stringify({version:1,source:{commit:execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:Object.fromEntries(files.map(p=>[p,hash(readFileSync(join(root,p)))]))},agent,results},null,2)+'\n');
 console.log(output);
}finally{await rules.close();await inputs.close();}
