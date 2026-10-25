import {SAY,type Dialogue} from '../dialogue';
import {stage} from '../maps';
import type {Shot} from '../cinematics';

const line=(who:string,text:string,shot?:Shot)=>({...SAY(who,text),shot});
const scene=(id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage('airship',id)},lines});

export const engineWatch=(hammerplainComplete:boolean)=>scene('five-deck-orrin','Learning the engine',[
 line('Orrin',hammerplainComplete?'Hester sent the drive drawings. This time I’m reading them before I offer advice.':'Kit, you wanted to see the pressure dial. Come round this side.',{focus:{x:29,y:25},cut:true,actors:{orrin:{face:'orrin-right'},kit:{face:'kit-left'}}}),
 line('Kit',hammerplainComplete?'Does the spare have the same warning needle?':'I’d like to know when you’re actually in trouble.'),
 line('Orrin','I’d wave.'),
 line('Kit','You waved yesterday. You wanted me to move a crate.'),
 line('Orrin','Fair point. Here. Watch this needle when the drive takes the load.'),
 line('Kit','And if it doesn’t settle?'),
 line('Orrin','Call me. You can learn the rest with the engine stopped.'),
 line('Kit','Then I’m teaching you the landing signals. You keep waving at the post boat.'),
 line('Orrin','I wondered why it never waved back.'),
]);

export const shieldRoom=(dawnwatchComplete:boolean)=>scene('five-deck-petra','Beside the shield',dawnwatchComplete?[
 line('Kit','You moved when I called, on the signal wall.',{focus:{x:29,y:25},cut:true,actors:{kit:{face:'kit-left'},petra:{face:'petra-right'}}}),
 line('Petra','You could see the spotter. I couldn’t.'),
 line('Kit','I thought you’d tell me to stay back.'),
 line('Petra','Would you have listened?'),
 line('Kit','No.'),
 line('Petra','Then keep telling me what you can see.'),
 line('Kit','A little left, next time. Your shield still catches my sleeve.'),
 line('Petra','Show me.'),
]:[
 line('Petra','Kit. Can you see past my shield from there?',{focus:{x:29,y:25},cut:true,actors:{kit:{face:'kit-left'},petra:{face:'petra-right'}}}),
 line('Kit','I had a good look at it at the crossing.'),
 line('Petra','I know. I’m trying to leave you room this time.'),
 line('Kit','I don’t want you giving me orders.'),
 line('Petra','Then tell me where you need me.'),
 line('Kit','A little left. I can’t see past the rim.'),
 line('Petra','Here?',{actors:{petra:{to:{x:27,y:24}}},duration:550}),
 line('Kit','Yes. Stay there a moment.'),
]);

export const putThingsDown=(windmereComplete:boolean)=>scene('five-deck-celia','Putting things down',[
 line('Celia',windmereComplete?'Sera says Teren made it to the second landing. He’s underlined that twice.':'Dena’s sent another ward list. I’m making a copy for the next landing.',{focus:{x:35,y:25},cut:true,actors:{celia:{face:'celia-right'},petra:{face:'petra-left'}}}),
 line('Celia','Put the shield down a moment, Petra. You’re rubbing your shoulder.'),
 line('Petra','Only if you put the pen down. You keep opening and closing that hand.'),
 line('Celia','I’ve almost finished.'),
 line('Petra','You said that when I came over.'),
 line('Celia','Did I? All right. Leave the list on the table.'),
 line('Petra','Do you play cards?'),
 line('Celia','Badly.'),
 line('Petra','Good. So do I.'),
]);
