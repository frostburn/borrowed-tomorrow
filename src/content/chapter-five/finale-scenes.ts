import { SAY,type Dialogue } from '../dialogue';
import { stage } from '../maps';
import type { Shot } from '../cinematics';
const line=(who:string,text:string,shot?:Shot)=>({...SAY(who,text),shot});
const scene=(map:'airship'|'flagship',id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage(map,id).map(a=>a.id==='alban'?{...a,face:id==='five-alban-surrender'?'alban-command':'alban-captive'}:a)},lines});

export const approach=()=>scene('airship','five-flagship-approach','Through the cordon',[
 line('Kit','Dawnwatch’s launches are at the cloud bank. Three short flashes, then we follow them.',{focus:{x:35,y:22},cut:true,actors:{kit:{to:{x:37,y:21}}}}),
 line('Alda','Their lead pilot used to fly this crossing. Hold on to something.'),
 line('Orrin','Spare drive’s taking the load. Hester’s fitters have the return valve.',{actors:{orrin:{to:{x:28,y:24}}}}),
 line('The crossing','Two launches slip beneath the cordon. Alda follows their signal into the flagship’s shadow.',{effect:'flagship-approach',duration:2200,focus:{x:32,y:9},cut:true,cue:'steam'}),
 line('Celia','The injured pilot’s breathing steadily. Windmere’s crew has him below.'),
 line('Captain Alban','Survey vessel. Cut your drive and surrender the fragment.'),
 line('Alda','He’s turning both batteries toward us. There’s no room to climb.'),
 line('Petra','Keep us under the bow. Those guns can’t lower together without exposing their housings.',{focus:{x:32,y:23},actors:{petra:{to:{x:33,y:21},face:'petra-back'}}}),
 line('The bow rail','Grappling hooks strike the rail. Marines climb onto the survey deck.'),
 line('Nell','Kit, keep the launches clear. We’re taking those guns down.'),
 line('Petra','Both batteries protect the bridge. Stop them first; watch where their barrels turn.'),
]);

export const surrender=()=>scene('flagship','five-alban-surrender','The command deck',[
 line('The flagship','Smoke drifts through the bridge windows. Below them, the boarding marines help their wounded back over the rail.',{focus:{x:33,y:23},cut:true}),
 line('Captain Alban','Aft gun, fire. Break their mooring.'),
 line('Petra','Your men are still crossing.'),
 line('Captain Alban','Then they had better move.'),
 line('The aft gun','The crew leaves the firing handles. One marine sets his saber on the deck. The others follow.'),
 line('Captain Alban','I gave you an order.'),
 line('Petra','They heard you.',{duration:1100,track:'petra',actors:{petra:{to:{x:33,y:23},face:'petra-back'}}}),
 line('Captain Alban','You have no commission here.'),
 line('Petra','Put the rod down.'),
 line('The command rail','Alban raises it. Petra catches his wrist against the rail and takes the rod from his hand.',{duration:700,cue:'strike',actors:{alban:{to:{x:35,y:22},face:'alban-captive'},petra:{to:{x:34,y:23},face:'petra-right'}}}),
 line('Nell','Ansel stood in front of you at Larkspur.',{duration:700,actors:{nell:{to:{x:31,y:24},face:'nell-back'}}}),
 line('Captain Alban','He interfered with an arrest.'),
 line('Nell','His name was Ansel. You’re going to answer for killing him.'),
 line('Petra','And for the coaches at Cinderbank. You’re coming aboard with us.'),
 line('Celia','We can hold him in the chart room. The medical crew needs this deck clear.'),
 line('Orrin','The auxiliary lift will hold the hull. We’ve time to get everyone off.'),
 line('Kit','The launches are coming alongside. I’ll check the lower berths.'),
 line('Petra','Nell, take the evacuation gangway when you’re ready. I’ll bring him over.'),
]);

export const evacuation=()=>scene('flagship','five-flagship-evacuation','The last launch',[
 line('Kit','Lower berths clear. The engineer checked the stern with me.',{focus:{x:18,y:29},cut:true}),
 line('Celia','The last stretcher’s aboard. Keep a hand under that splint.'),
 line('The gangway','Windmere’s medics pass the stretcher into a Dawnwatch launch. The foundry fitters secure the flagship’s lift controls behind them.',{duration:1400,actors:{celia:{to:{x:12,y:30}},kit:{to:{x:13,y:31}},orrin:{to:{x:16,y:29}}}}),
 line('Alda','Every berth accounted for. The survey ship’s ready.'),
 line('Captain Alban','Without this fleet, the capital has no defense.'),
 line('Petra','Step across.',{duration:1200,actors:{alban:{to:{x:14,y:30}},petra:{to:{x:15,y:31},face:'petra-left'}}}),
 line('Nell','Alda, take us back to the others.'),
]);

export const departure=()=>scene('airship','five-capital-departure','The open crossing',[
 line('Alda','The escort has opened a lane. Alban’s surviving crew are aboard the launches.',{focus:{x:32,y:21},cut:true}),
 line('Petra','He’s locked in the chart room. Two of his own marines asked to stand watch.'),
 line('Orrin','Our drive’s holding. The fitters are staying for the capital run.'),
 line('Celia','Windmere’s release order is on the table. We know how to take people off a support before we disconnect it.'),
 line('Kit','Tomas has the news. His reply’s mostly about keeping a spare engine at the siding.'),
 line('Nell','That sounds like him.'),
 line('Kit','There’s a line for you at the bottom. “Come back by the ordinary route. I’ll meet the train.”'),
 line('The flight deck','Nell rests the lantern against the rail. Beyond the open crossing, the capital’s windows catch the light.',{focus:{x:32,y:9},cut:true}),
 line('Nell','I keep thinking about that cup. Ansel turning the chip toward himself.'),
 line('Celia','You can tell us when you need to stop.'),
 line('Nell','I know. But I want to see what the Emperor is doing up there.'),
 line('Alda','Set the capital course?'),
 line('Nell','Yes. Let’s go.',{focus:{x:32,y:9},cue:'win'}),
]);
