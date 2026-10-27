import {parseArgs} from 'node:util';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {createServer} from 'vite';
const {values}=parseArgs({options:{inputs:{type:'string',default:'docs/headless/chapter-five-boss-inputs.json'},root:{type:'string'},output:{type:'string',default:'/tmp/borrowed-tomorrow-bosses.json'},tactics:{type:'string'}}});
if(values.tactics&&!['legacy','defensive','cooperative'].includes(values.tactics))throw Error('Invalid tactics');
const input=resolve(values.inputs),output=resolve(values.output),root=resolve(values.root??'.');
if(input===output)throw Error('Preserve the earned inputs');
const raw=readFileSync(input,'utf8'),packet=JSON.parse(raw);
if(packet.version!==1||!Array.isArray(packet.starts)||packet.starts.length!==6)throw Error('Expected the six earned Chapter Five boss starts');
const hash=s=>createHash('sha256').update(s).digest('hex');
const server=await createServer({root,configFile:false,server:{middlewareMode:true},appType:'custom'});
try{
 const {CampaignSession}=await server.ssrLoadModule('/src/headless/campaign.ts');
 const {createBattle}=await server.ssrLoadModule('/src/rules/combat.ts');
 const {playBattle}=await server.ssrLoadModule('/src/headless/battle.ts');
 const {battleMetrics}=await server.ssrLoadModule('/src/headless/support-probe.ts');
 const results=[];
 for(const start of packet.starts){
  if(!['wind-engine','alban-flagship'].includes(start.id))throw Error('Unsupported probe encounter');
  for(const party of [start.state.activeParty,['nell','kit','petra'],['nell','celia','petra']].filter((p,i,all)=>all.findIndex(q=>q.join()===p.join())===i)){
   // Construction validates the recorded current-format save. Formation uses
   // Equipment's ordinary rule; no healing, fitting or skill reset is granted.
   const agent={...start.agent,...(values.tactics?{tactics:values.tactics}:{})},s=new CampaignSession(start.state,agent);s.formation(party);
   const b=createBattle(start.id,s.state),turns=playBattle(b,agent),metrics=battleMetrics(b,turns),enemyDamage={};
   for(const t of turns)if(!s.state.party.some(p=>p.id===t.actor))for(const u of t.before.filter(u=>s.state.party.some(p=>p.id===u.id)))enemyDamage[t.actor]=(enemyDamage[t.actor]??0)+Math.max(0,u.hp-t.after.find(v=>v.id===u.id).hp);
   const row={name:start.name,id:start.id,party:s.state.activeParty,inputSha256:hash(JSON.stringify(s.state)),agent,...metrics,enemyDamage};results.push(row);
   console.log(`${row.name}/${row.id}/${row.party.join('+')}: ${row.result}, ${row.rounds} rounds, ${row.hpLost} HP lost, ${row.knockouts} knockouts`);
   if(row.result!=='victory')process.exitCode=1;
  }
 }
 const files=['src/rules/combat.ts','src/rules/ward.ts','src/rules/flagship.ts','src/content/chapter-five/encounters.ts','src/content/chapter-five/flagship.ts'];
 writeFileSync(output,JSON.stringify({version:1,source:{commit:execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),inputsSha256:hash(raw),files:Object.fromEntries(files.map(p=>[p,hash(readFileSync(join(root,p)))]))},results},null,2)+'\n');
 console.log(output);
}finally{await server.close();}
