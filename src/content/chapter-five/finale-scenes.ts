import { SAY,type Dialogue } from '../dialogue';
import { stage } from '../maps';
import type { Shot } from '../cinematics';
const line=(who:string,text:string,shot?:Shot)=>({...SAY(who,text),shot});
const scene=(map:'airship'|'flagship',id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage(map,id).map(a=>a.id==='alban'?{...a,face:'alban-command'}:a.id==='nell'&&id!=='five-benefactor-claim'&&id!=='five-flagship-approach'?{...a,face:'nell-ill'}:a)},lines});

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

export const claim=()=>scene('flagship','five-benefactor-claim','The light above the bridge',[
 line('The flagship','The boarding marines have crossed back to their ship. They stand below the bridge with their weapons on the deck.',{focus:{x:33,y:23},cut:true}),
 line('Petra','It’s finished, Alban. Put the rod down.'),
 line('Captain Alban','You have no commission here.'),
 line('Nell','Ansel didn’t have one either.',{actors:{nell:{to:{x:31,y:24},face:'nell-back'}}}),
 line('The lantern','Its handle jerks in Nell’s grip. A bright seam opens above the bridge windows.',{effect:'claim-omen',focus:{x:32,y:14},cut:true,cue:'flare',silence:true}),
 line('The Benefactor','You have broken my anchors.'),
 line('Captain Alban','This ship serves the Emperor.'),
 line('The Benefactor','The ships were my gift. I take them back.'),
 line('Orrin','The stern’s coming apart. Alda! Hold the gangway!'),
 line('The command deck','The companions run for the western rail. Nell reaches it and folds over the lantern.',{duration:1300,focus:{x:18,y:29},track:'kit',actors:{nell:{to:{x:17,y:30},face:'nell-faint'},kit:{to:{x:16,y:30}},orrin:{to:{x:13,y:29}},celia:{to:{x:15,y:31}},petra:{to:{x:19,y:30}}}}),
 line('Kit','Nell. Give me your wrist.'),
 line('Nell','I can’t get my hand open.'),
 line('The gangway','Kit braces himself against the rail and pulls her across. Celia takes her weight on the other side.',{duration:1100,actors:{nell:{to:{x:12,y:30}},kit:{to:{x:11,y:30}},celia:{to:{x:13,y:31}},orrin:{to:{x:9,y:29}},petra:{to:{x:14,y:31}}}}),
 line('Captain Alban','Hold your positions!'),
 line('The flagship','Light closes through the bridge. Alban and the men below him vanish with the hull. Nothing remains to launch a boat from.',{effect:'claim-strike',duration:1700,focus:{x:33,y:22},cut:true,cue:'flare',silence:true,actors:{alban:{visible:false}}}),
 line('Petra','There were men on every deck.'),
 line('The Benefactor','The fragment will return.'),
 line('Alda','The rope’s cut. Get below. All of you.'),
]);

export const hunters=()=>scene('airship','five-retaliation','Something in the rigging',[
 line('Celia','Nell, look at me. Can you hear what I’m saying?',{focus:{x:30,y:27},cut:true}),
 line('Nell','The light keeps hitting. Even with my eyes shut.'),
 line('Kit','I’ve put the lantern by the stern. Is that better?'),
 line('Celia','Her pulse hasn’t changed. Alda, have the medics stay with her.'),
 line('The rigging','Something strikes the forward stay. Glass wings unfold above the deck; a tall pale figure steps onto the bow.',{focus:{x:35,y:21},cut:true,cue:'flare'}),
 line('Petra','No fleet markings. Those came out of the light.'),
 line('Orrin','They’re heading for the hatch.'),
 line('Kit','Keep them away from her. We’ll take the forward rail.'),
 line('Celia','Nell can’t fight. Check who’s ready before we go up there.'),
]);

export const departure=()=>scene('airship','five-capital-departure','Beside the berth',[
 line('The survey ship','Kit folds a blanket over Nell’s hands. She is awake, watching the lantern from her berth.',{focus:{x:30,y:27},cut:true}),
 line('Petra','The launches searched the cloud below the flagship. Alban’s men are gone.'),
 line('Orrin','Three anchors disconnected, and it reached straight through the fleet.'),
 line('Celia','It reached Nell too. Her heartbeat is following the shard’s pulse. Moving the lantern didn’t break the connection.'),
 line('Kit','Sera kept the old treatment records. I can take her a copy of your notes.'),
 line('Celia','Ask about patients exposed to an open return. Tell her exactly what happened here.'),
 line('Nell','Kit. You don’t have to sit there all night.'),
 line('Kit','I’ve a delivery for the morning. I can sit here until then.'),
 line('Alda','The capital’s lights are answering the same pulse. I can hold us at the outer mooring.'),
 line('Petra','We still have to reach the Emperor. But we know who’s reaching back through his conduit now.'),
 line('Nell','Don’t let it take another town.'),
 line('Kit','We’ll keep the routes open. Yours too.'),
 line('Alda','Outer mooring, then. We’ll decide our next run there.'),
]);
