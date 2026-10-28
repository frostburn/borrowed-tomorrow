// Opt-in matched-input probe. --capture plays Chapter Six; replay accepts
// captured battle saves from any chapter, including Chapter Seven.
// Compare another checkout without importing its dependencies into the game.
import {createServer} from 'vite';
import {parseArgs} from 'node:util';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const {values}=parseArgs({options:{root:{type:'string',default:'.'},from:{type:'string'},capture:{type:'boolean'},output:{type:'string'},tactics:{type:'string',default:'defensive'}}});
if(!values.from||!values.output)throw Error('Pass --from <earned Chapter Five save / captured probe> --output <json> [--capture] [--root <checkout>] [--tactics defensive|legacy|cooperative]');
if(!['defensive','legacy','cooperative'].includes(values.tactics))throw Error('Unknown tactics');
if(resolve(values.from)===resolve(values.output))throw Error('Preserve the input file');
const root=resolve(values.root),raw=await readFile(values.from,'utf8');
const source={sha256:createHash('sha256').update(raw).digest('hex'),commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim()};
const server=await createServer({root,configFile:false,server:{middlewareMode:true},appType:'custom'});
try{
 const {CampaignSession,defaultAgent}=await server.ssrLoadModule('/src/headless/campaign.ts');
 if(values.capture){
  const {playSix,readSixDeparture,defaultSix}=await server.ssrLoadModule('/src/headless/six.ts');
  const cases=[];
  for(const route of ['early','late']){
   const agent={...defaultAgent,...route==='late'?{build:'support',spending:'frugal'}:{}},session=new CampaignSession(readSixDeparture(raw),agent);
   await playSix(session,{...defaultSix,...route==='late'?{order:['north','desert','jungle'],optional:false,palace:'channel'}:{}});
   for(const [encounter,state]of session.battleSaves)if(['river-cache','palace-gallery','palace-channel','imperial-vessel'].includes(encounter))cases.push({id:`${route}-${encounter}`,encounter,agent,state});
   console.log(`Captured ${route} route`);
  }
  await writeFile(values.output,JSON.stringify({source,cases},null,2)+'\n');
 }else{
  const {createBattle}=await server.ssrLoadModule('/src/rules/combat.ts');
  const {decodeSave}=await server.ssrLoadModule('/src/rules/save.ts');
  const {playBattle}=await server.ssrLoadModule('/src/headless/battle.ts');
  const rows=[];
  for(const c of JSON.parse(raw).cases){
   const b=createBattle(c.encounter,decodeSave(JSON.stringify(c.state))),party=new Set(b.units.filter(u=>u.side==='party').map(u=>u.id));
   const turns=playBattle(b,{...c.agent,tactics:values.tactics});
   let damage=0,knockouts=0,rebuilds=0;
   for(const t of turns)for(const u of t.before){
    const v=t.after.find(v=>v.id===u.id);
    if(party.has(u.id)){damage+=Math.max(0,u.hp-v.hp);if(u.hp>0&&v.hp===0)knockouts++;}
    else if(u.id.startsWith('imperial-')&&u.id!=='imperial-vessel'&&u.hp===0&&v.hp>0)rebuilds++;
   }
   const row={id:c.id,result:b.result??'stalled',rounds:b.round,damage,knockouts,rebuilds};rows.push(row);console.log(JSON.stringify(row));
   if(b.result!=='victory')process.exitCode=1;
  }
  await writeFile(values.output,JSON.stringify({source,tactics:values.tactics,rows},null,2)+'\n');
 }
}finally{await server.close();}
