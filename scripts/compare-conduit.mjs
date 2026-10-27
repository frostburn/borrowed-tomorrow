import {parseArgs} from 'node:util';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {createServer} from 'vite';
const {values}=parseArgs({options:{from:{type:'string'},output:{type:'string'}}});
if(!values.from)throw Error('Pass --from <earned Chapter Two departure report>');
const from=resolve(values.from),output=resolve(values.output??'/tmp/borrowed-tomorrow-conduit.json');
if(from===output)throw Error('Preserve the earned checkpoint');
const raw=readFileSync(from,'utf8'),server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
try{
 const {CampaignSession}=await server.ssrLoadModule('/src/headless/campaign.ts');
 const {playMiddle,defaultMiddle,readDeparture}=await server.ssrLoadModule('/src/headless/middle.ts');
 const {battleMetrics}=await server.ssrLoadModule('/src/headless/support-probe.ts');
 const initial=readDeparture(raw);if(initial.chapter!=='chapter-two')throw Error('Expected a Chapter Two departure');
 const results=[];
 for(const build of ['offense','support'])for(const spending of ['prepared','frugal'])for(const conduit of ['feeds','pressure']){
  const agent={tactics:'defensive',build,spending},s=new CampaignSession(initial,agent);
  playMiddle(s,{...defaultMiddle,through:3,conduit});
  const id='heart-'+conduit,entry=s.events.find(e=>e.event==='battle'&&e.id===id);
  // Actual earned route turns; no canonical resources, forced wins or retries.
  const start=s.battleStarts.get(id),heroes=start.units.filter(u=>u.side==='party');
  const last=entry.turns.at(-1),end=structuredClone(start);end.result=entry.result;end.round=entry.rounds;
  for(const u of end.units)Object.assign(u,last.after.find(v=>v.id===u.id));
  end.bandages=last.bandages;end.supplies=last.supplies;
  const row={build,spending,conduit,initial:heroes.map(u=>({id:u.id,hp:u.hp,focus:u.focus,skills:u.skills,bonus:u.bonus,armor:u.armor})),...battleMetrics(end,entry.turns)};
  results.push(row);console.log(`${build}/${spending}/${conduit}: ${row.rounds} rounds, ${row.hpLost} HP lost, ${row.knockouts} knockouts`);
 }
 writeFileSync(output,JSON.stringify({sourceSha256:createHash('sha256').update(raw).digest('hex'),results},null,2)+'\n');console.log(output);
}finally{await server.close();}
