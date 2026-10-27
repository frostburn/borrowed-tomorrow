import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {CampaignSession,resources,defaultAgent,type AgentOptions} from './campaign';
import {defaultMiddle,playMiddle,readDeparture,type MiddleOptions} from './middle';

export async function run(){
 const {values}=parseArgs({options:{from:{type:'string'},tactics:{type:'string',default:'defensive'},build:{type:'string',default:'offense'},spending:{type:'string',default:'prepared'},output:{type:'string'},conduit:{type:'string',default:'feeds'},harbor:{type:'string',default:'dry'},through:{type:'string',default:'4'},'skip-optional':{type:'boolean',default:false},help:{type:'boolean',default:false}},strict:true});
 if(values.help){console.log('npm run simulate:middle -- --from <early-report-or-save.json> [--output <report.json>] [--through 3|4] [--conduit feeds|pressure] [--harbor dry|wet] [--skip-optional] [--tactics legacy|defensive|cooperative] [--build offense|support] [--spending baseline|frugal|prepared]');return;}
 if(!values.from)throw Error('Pass --from with the report earned by npm run simulate:early (or a Chapter Two/Three departure save).');
 if(!['feeds','pressure'].includes(values.conduit!)||!['dry','wet'].includes(values.harbor!)||!['3','4'].includes(values.through!))throw Error('Invalid route or chapter option; see --help');
 if(!['legacy','defensive','cooperative'].includes(values.tactics!)||!['offense','support'].includes(values.build!)||!['baseline','frugal','prepared'].includes(values.spending!))throw Error('Invalid agent policy; see --help');
 const agent:AgentOptions={...defaultAgent,tactics:values.tactics as AgentOptions['tactics'],build:values.build as AgentOptions['build'],spending:values.spending as AgentOptions['spending']};
 const from=resolve(values.from),output=resolve(values.output??process.env.BT_HEADLESS_REPORT??'/tmp/borrowed-tomorrow-middle.json');
 if(from===output)throw Error('Input and output must differ: preserve the earned checkpoint');
 const raw=await readFile(from,'utf8'),state=readDeparture(raw),session=new CampaignSession(state,agent);
 const options:MiddleOptions={...defaultMiddle,conduit:values.conduit as MiddleOptions['conduit'],harbor:values.harbor as MiddleOptions['harbor'],through:Number(values.through)as 3|4,optional:!values['skip-optional']};
 const report={version:1,policy:'middle-v2',agent,source:{path:from,sha256:createHash('sha256').update(raw).digest('hex')},options,initial:resources(state),status:'running',error:undefined as string|undefined,state:session.state,checkpoints:session.checkpoints,events:session.events};
 try{playMiddle(session,options);report.status='complete';}
 catch(error){report.status='failed';report.error=error instanceof Error?error.message:String(error);throw error;}
 finally{
  await writeFile(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,error:report.error,output,chapter:session.state.chapter,level:resources(session.state).level,coins:session.state.coins,bandages:session.state.bandages,battles:session.events.filter(e=>e.event==='battle').map(e=>({id:e.id,result:e.result,rounds:e.rounds})),rests:session.events.filter(e=>e.event==='rest').length},null,2));
 }
}
