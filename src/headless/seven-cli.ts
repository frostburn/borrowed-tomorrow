import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {CampaignSession,resources,defaultAgent,type AgentOptions} from './campaign';
import {defaultSeven,playSeven,readSevenDeparture,type SevenOptions} from './seven';

export async function run(){
 const {values}=parseArgs({options:{from:{type:'string'},through:{type:'string',default:'7'},party:{type:'string'},tactics:{type:'string',default:'defensive'},build:{type:'string',default:'offense'},spending:{type:'string',default:'prepared'},'skip-optional':{type:'boolean',default:false},'no-final-rests':{type:'boolean',default:false},improvements:{type:'boolean',default:false},output:{type:'string'},help:{type:'boolean',default:false}},strict:true});
 if(values.help){console.log('npm run simulate:seven -- --from <earned-chapter-six-report-or-save.json> [--through refuge|7] [--party nell,orrin,celia] [--skip-optional] [--no-final-rests] [--improvements] [--tactics legacy|defensive|cooperative] [--build offense|support] [--spending baseline|frugal|prepared] [--output <report.json>]');return;}
 if(!values.from)throw Error('Pass --from with an earned Chapter Six departure or Chapter Seven refuge checkpoint.');
 if(!['refuge','7'].includes(values.through!)||!['legacy','defensive','cooperative'].includes(values.tactics!)||!['offense','support'].includes(values.build!)||!['baseline','frugal','prepared'].includes(values.spending!))throw Error('Invalid route or policy; see --help');
 const options:SevenOptions={...defaultSeven,through:values.through as SevenOptions['through'],optional:!values['skip-optional'],restBetweenForms:!values['no-final-rests'],improvements:values.improvements,party:values.party?.split(',')as SevenOptions['party']};
 const agent:AgentOptions={...defaultAgent,tactics:values.tactics as AgentOptions['tactics'],build:values.build as AgentOptions['build'],spending:values.spending as AgentOptions['spending']};
 const from=resolve(values.from),output=resolve(values.output??process.env.BT_HEADLESS_REPORT??'/tmp/borrowed-tomorrow-seven.json');
 if(from===output)throw Error('Input and output must differ: preserve the earned checkpoint');
 const raw=await readFile(from,'utf8'),session=new CampaignSession(readSevenDeparture(raw),agent);
 const report={version:1,policy:'seven-v1',agent,source:{path:from,sha256:createHash('sha256').update(raw).digest('hex')},options,initial:resources(session.state),status:'running',error:undefined as string|undefined,state:session.state,checkpoints:session.checkpoints,events:session.events};
 try{playSeven(session,options);report.status='complete';}
 catch(error){report.status='failed';report.error=error instanceof Error?error.message:String(error);throw error;}
 finally{
  await writeFile(output,JSON.stringify({...report,battleSaves:Object.fromEntries(session.battleSaves)},null,2)+'\n');
  console.log(JSON.stringify({status:report.status,error:report.error,output,chapter:session.state.chapter,complete:!!session.state.flags.chapterSevenComplete,level:resources(session.state).level,coins:session.state.coins,bandages:session.state.bandages,battles:session.events.filter(e=>e.event==='battle').map(e=>({id:e.id,result:e.result,rounds:e.rounds})),rests:session.events.filter(e=>e.event==='rest').length},null,2));
 }
}
