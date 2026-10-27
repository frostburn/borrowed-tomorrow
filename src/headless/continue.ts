import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {CampaignSession,resources,defaultAgent,type AgentOptions} from './campaign';
import {defaultMiddle,playMiddle,readDeparture,type MiddleOptions} from './middle';
import {defaultFive,playFive,readFiveDeparture,REGIONS,type FiveOptions} from './five';

export async function run(five=false){
 const {values}=parseArgs({options:{from:{type:'string'},order:{type:'string',default:'hammerplain,dawnwatch,windmere'},forge:{type:'string',default:'lift'},'first-gun':{type:'string',default:'mortar'},tactics:{type:'string',default:'defensive'},build:{type:'string',default:'offense'},spending:{type:'string',default:'prepared'},output:{type:'string'},conduit:{type:'string',default:'feeds'},harbor:{type:'string',default:'dry'},through:{type:'string',default:five?'5':'4'},'skip-optional':{type:'boolean',default:false},help:{type:'boolean',default:false}},strict:true});
 if(values.help&&five){console.log('npm run simulate:five -- --from <chapter-four-report-or-save.json> [--order hammerplain,dawnwatch,windmere] [--forge lift|race] [--first-gun mortar|repeater] [--through regions|5] [--skip-optional] [--tactics legacy|defensive|cooperative] [--build offense|support] [--spending baseline|frugal|prepared] [--output <report.json>]');return;}
 if(values.help){console.log('npm run simulate:middle -- --from <early-report-or-save.json> [--output <report.json>] [--through 3|4] [--conduit feeds|pressure] [--harbor dry|wet] [--skip-optional] [--tactics legacy|defensive|cooperative] [--build offense|support] [--spending baseline|frugal|prepared]');return;}
 if(!values.from)throw Error(five?'Pass --from with an earned Chapter Four departure or pre-finale ship checkpoint.':'Pass --from with the report earned by npm run simulate:early (or a Chapter Two/Three departure save).');
 if(!five&&(!['feeds','pressure'].includes(values.conduit!)||!['dry','wet'].includes(values.harbor!)||!['3','4'].includes(values.through!)))throw Error('Invalid route or chapter option; see --help');
 if(!['legacy','defensive','cooperative'].includes(values.tactics!)||!['offense','support'].includes(values.build!)||!['baseline','frugal','prepared'].includes(values.spending!))throw Error('Invalid agent policy; see --help');
 const agent:AgentOptions={...defaultAgent,tactics:values.tactics as AgentOptions['tactics'],build:values.build as AgentOptions['build'],spending:values.spending as AgentOptions['spending']};
 const from=resolve(values.from),output=resolve(values.output??process.env.BT_HEADLESS_REPORT??(five?'/tmp/borrowed-tomorrow-five.json':'/tmp/borrowed-tomorrow-middle.json'));
 if(from===output)throw Error('Input and output must differ: preserve the earned checkpoint');
 const raw=await readFile(from,'utf8'),state=(five?readFiveDeparture:readDeparture)(raw),session=new CampaignSession(state,agent);
 const options:MiddleOptions={...defaultMiddle,conduit:values.conduit as MiddleOptions['conduit'],harbor:values.harbor as MiddleOptions['harbor'],through:Number(values.through)as 3|4,optional:!values['skip-optional']};
 const fiveOptions:FiveOptions={...defaultFive,order:values.order!.split(',')as FiveOptions['order'],forge:values.forge as FiveOptions['forge'],firstGun:values['first-gun']as FiveOptions['firstGun'],through:values.through as FiveOptions['through'],optional:!values['skip-optional']};
 if(five&&(!['lift','race'].includes(fiveOptions.forge)||!['mortar','repeater'].includes(fiveOptions.firstGun)||!['regions','5'].includes(fiveOptions.through)||fiveOptions.order.length!==3||new Set(fiveOptions.order).size!==3||!fiveOptions.order.every(r=>REGIONS.includes(r))))throw Error('Invalid Chapter Five route options; see --help');
 const report={version:1,policy:five?'five-v1':'middle-v2',agent,source:{path:from,sha256:createHash('sha256').update(raw).digest('hex')},options:five?fiveOptions:options,initial:resources(state),status:'running',error:undefined as string|undefined,state:session.state,checkpoints:session.checkpoints,events:session.events};
 try{if(five)playFive(session,fiveOptions);else playMiddle(session,options);report.status='complete';}
 catch(error){report.status='failed';report.error=error instanceof Error?error.message:String(error);throw error;}
 finally{
  await writeFile(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,error:report.error,output,chapter:session.state.chapter,boundary:session.state.boundary,level:resources(session.state).level,coins:session.state.coins,bandages:session.state.bandages,battles:session.events.filter(e=>e.event==='battle').map(e=>({id:e.id,result:e.result,rounds:e.rounds})),rests:session.events.filter(e=>e.event==='rest').length},null,2));
 }
}
