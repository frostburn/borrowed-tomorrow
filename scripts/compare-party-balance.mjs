import {parseArgs} from 'node:util';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {createServer} from 'vite';

// Authored formations, not an earned campaign or a character tier score.
// Both versions use this checkout's fixtures; --root selects only the rules.
const {values}=parseArgs({options:{root:{type:'string'},output:{type:'string',default:'/tmp/borrowed-tomorrow-party-balance.json'}}});
const root=resolve(values.root??'.'),output=resolve(values.output),hash=s=>createHash('sha256').update(s).digest('hex');
const config={configFile:false,optimizeDeps:{noDiscovery:true},server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'};
const inputs=await createServer(config);
const rules=await createServer({...config,root});
try{
 const canon=await inputs.ssrLoadModule('/src/dev/canonical-saves.ts');
 const {createBattle}=await rules.ssrLoadModule('/src/rules/combat.ts');
 const {playBattle}=await rules.ssrLoadModule('/src/headless/battle.ts');
 const {battleMetrics}=await rules.ssrLoadModule('/src/headless/support-probe.ts');
 const {level}=await rules.ssrLoadModule('/src/rules/state.ts');
 const heroes=['nell','orrin','kit','celia','petra'],parties=[];
 for(let a=0;a<3;a++)for(let b=a+1;b<4;b++)for(let c=b+1;c<5;c++)parties.push([heroes[a],heroes[b],heroes[c]]);
 const agent={tactics:'defensive',build:'offense',spending:'prepared'},results=[];
 for(const [id,make]of [['hammer-carrier',canon.chapterFiveStart],['wind-engine',canon.chapterFiveFinaleStart],['domain-furnace',canon.chapterSevenStart],['benefactor-body',canon.chapterSevenRefugeStart]])for(const party of parties){
  const state=make();state.activeParty=[...party];const inputSha256=hash(JSON.stringify(state));
  const b=createBattle(id,state),turns=playBattle(b,agent),row={id,party,level:level(state),inputSha256,...battleMetrics(b,turns)};
  results.push(row);console.log(`${id}/${party.join('+')}: ${row.result}, ${row.rounds} rounds, ${row.hpLost} HP lost, ${row.knockouts} knockouts`);
  if(row.result!=='victory')process.exitCode=1;
 }
 const files=['src/rules/skills.ts','src/rules/combat.ts','src/rules/combat-tactics.ts','src/headless/defensive.ts','src/headless/rally-value.ts'];
 writeFileSync(output,JSON.stringify({version:1,fixture:'Authored canonical inputs; fixed learned ranks, gear, stock and starting slots for each formation. No earned journey claimed.',source:{commit:execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:Object.fromEntries(files.map(p=>[p,hash(readFileSync(join(root,p)))])),fixturesSha256:hash(readFileSync('src/dev/canonical-saves.ts'))},agent,results},null,2)+'\n');
 console.log(output);
}finally{await rules.close();await inputs.close();}
