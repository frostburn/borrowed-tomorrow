import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {CampaignSession,resources,defaultAgent,type AgentOptions} from './campaign';
import {defaultSix,playSix,readSixDeparture,validSixOrder,type SixOptions} from './six';

export async function run(){
 const {values}=parseArgs({options:{from:{type:'string'},order:{type:'string',default:'jungle,desert,north'},palace:{type:'string',default:'gallery'},through:{type:'string',default:'6'},tactics:{type:'string',default:'defensive'},build:{type:'string',default:'offense'},spending:{type:'string',default:'prepared'},'skip-optional':{type:'boolean',default:false},improvements:{type:'boolean',default:false},output:{type:'string'},help:{type:'boolean',default:false}},strict:true});
 if(values.help){console.log('npm run simulate:six -- --from <earned-chapter-five-report-or-save.json> [--order jungle,desert,north | desert,north,jungle | desert,north] [--palace gallery|channel] [--through regions|6] [--skip-optional] [--improvements] [--tactics legacy|defensive|cooperative] [--build offense|support] [--spending baseline|frugal|prepared] [--output <report.json>]');return;}
 if(!values.from)throw Error('Pass --from with an earned Chapter Five departure or Chapter Six mooring checkpoint.');
 const options:SixOptions={...defaultSix,order:values.order!.split(',')as SixOptions['order'],palace:values.palace as SixOptions['palace'],through:values.through as SixOptions['through'],optional:!values['skip-optional'],improvements:values.improvements};
 if(!validSixOrder(options.order)||!['gallery','channel'].includes(options.palace)||!['regions','6'].includes(options.through)||!['legacy','defensive','cooperative'].includes(values.tactics!)||!['offense','support'].includes(values.build!)||!['baseline','frugal','prepared'].includes(values.spending!))throw Error('Invalid route or policy; see --help');
 const agent:AgentOptions={...defaultAgent,tactics:values.tactics as AgentOptions['tactics'],build:values.build as AgentOptions['build'],spending:values.spending as AgentOptions['spending']};
 const from=resolve(values.from),output=resolve(values.output??process.env.BT_HEADLESS_REPORT??'/tmp/borrowed-tomorrow-six.json');
 if(from===output)throw Error('Input and output must differ: preserve the earned checkpoint');
 const raw=await readFile(from,'utf8'),session=new CampaignSession(readSixDeparture(raw),agent);
 const report={version:1,policy:'six-v1',agent,source:{path:from,sha256:createHash('sha256').update(raw).digest('hex')},options,initial:resources(session.state),status:'running',error:undefined as string|undefined,state:session.state,checkpoints:session.checkpoints,events:session.events};
 try{await playSix(session,options);report.status='complete';}
 catch(error){report.status='failed';report.error=error instanceof Error?error.message:String(error);throw error;}
 finally{
  await writeFile(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,error:report.error,output,chapter:session.state.chapter,boundary:session.state.boundary,level:resources(session.state).level,coins:session.state.coins,bandages:session.state.bandages,battles:session.events.filter(e=>e.event==='battle').map(e=>({id:e.id,result:e.result,rounds:e.rounds})),rests:session.events.filter(e=>e.event==='rest').length},null,2));
 }
}
